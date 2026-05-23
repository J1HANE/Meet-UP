package com.meetup.tweeningservice.service;

import com.meetup.tweeningservice.domain.node.GroupNode;
import com.meetup.tweeningservice.domain.node.PersonNode;
import com.meetup.tweeningservice.domain.node.MeetingNode;
import com.meetup.tweeningservice.domain.node.TaskNode;
import com.meetup.tweeningservice.domain.relationship.*;
import com.meetup.tweeningservice.event.out.*;
import com.meetup.tweeningservice.repository.GroupRepository;
import com.meetup.tweeningservice.repository.MeetingRepository;
import com.meetup.tweeningservice.repository.PersonRepository;
import com.meetup.tweeningservice.repository.TaskRepository;
import com.meetup.tweeningservice.repository.WorkloadProjection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupService {

    private final GroupRepository groupRepository;
    private final PersonRepository personRepository;
    private final TaskRepository taskRepository;
    private final MeetingRepository meetingRepository;
    private final RabbitMQEventPublisher eventPublisher;
    private final org.springframework.data.neo4j.core.Neo4jClient neo4jClient;

    @Transactional("transactionManager")
    public GroupNode createLatentGroup(String taskId) {
        log.info("Creating latent group for task {}", taskId);
        GroupNode group = GroupNode.builder()
                .id(UUID.randomUUID().toString())
                .taskId(taskId)
                .state("LATENT")
                .createdAt(LocalDateTime.now())
                .build();

        // Link task if exists or create a dummy one
        com.meetup.tweeningservice.domain.node.TaskNode taskNode = taskRepository.findById(taskId).orElseGet(() -> {
            log.warn("Task {} not found, creating dummy TaskNode for testing", taskId);
            return taskRepository.save(com.meetup.tweeningservice.domain.node.TaskNode.builder().id(taskId).title("Test Task " + taskId).build());
        });
        group.setTask(WorksOn.builder().task(taskNode).assignedAt(LocalDateTime.now()).build());

        return groupRepository.save(group);
    }

    @Transactional("transactionManager")
    public GroupNode formGroup(String taskId, String meetingId, String ownerId) {
        log.info("Forming group for task {} in meeting {} by owner {}", taskId, meetingId, ownerId);

        GroupNode group = groupRepository.findByTaskId(taskId)
                .orElseGet(() -> createLatentGroup(taskId));

        group.setState("FORMING");

        GroupNode finalGroup = group;
        com.meetup.tweeningservice.domain.node.MeetingNode meetingNode = meetingRepository.findById(meetingId).orElseGet(() -> {
            log.warn("Meeting {} not found, creating dummy MeetingNode for testing", meetingId);
            return meetingRepository.save(com.meetup.tweeningservice.domain.node.MeetingNode.builder().id(meetingId).title("Test Meeting " + meetingId).build());
        });
        finalGroup.setMeeting(FormedIn.builder().meeting(meetingNode).spawnedAt(LocalDateTime.now()).build());

        PersonNode owner = personRepository.findById(ownerId).orElseGet(() -> {
            log.warn("Owner {} not found, creating dummy PersonNode for testing", ownerId);
            return personRepository.save(PersonNode.builder().id(ownerId).name("Test User " + ownerId).build());
        });

        // Make owner a lead
        group.getLeads().add(Leads.builder()
                .person(owner)
                .fromDate(LocalDateTime.now())
                .build());

        group = groupRepository.save(group);

        eventPublisher.publishGroupFormed(new GroupFormedEvent(
                group.getId(), taskId, meetingId, ownerId, LocalDateTime.now()
        ));

        return group;
    }

    @Transactional("transactionManager")
    public void joinGroup(String groupId, String personId, String role) {
        GroupNode group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        PersonNode person = personRepository.findById(personId)
                .orElseThrow(() -> new RuntimeException("Person not found"));

        MemberOf memberOf = MemberOf.builder()
                .person(person)
                .joinedAt(LocalDateTime.now())
                .roleInGroup(role)
                .build();

        if (group.getMembers() == null) group.setMembers(new ArrayList<>());
        group.getMembers().add(memberOf);

        if ("FORMING".equals(group.getState())) {
            int totalSize = (group.getMembers() != null ? group.getMembers().size() : 0) +
                            (group.getLeads() != null ? group.getLeads().size() : 0);
            if (totalSize >= 2) {
                group.setState("ACTIVE");
            }
        }

        groupRepository.save(group);

        eventPublisher.publishMemberJoined(new MemberJoinedEvent(
                groupId, personId, role, LocalDateTime.now()
        ));
    }

    @Transactional("transactionManager")
    public void leaveGroup(String groupId, String personId) {
        GroupNode group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        group.getMembers().stream()
                .filter(m -> m.getPerson().getId().equals(personId) && m.getLeftAt() == null)
                .forEach(m -> m.setLeftAt(LocalDateTime.now()));

        groupRepository.save(group);

        eventPublisher.publishMemberLeft(new MemberLeftEvent(
                groupId, personId, LocalDateTime.now()
        ));
    }

    @Transactional("transactionManager")
    public void transferLead(String groupId, String oldLeadId, String newLeadId) {
        GroupNode group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        group.getLeads().stream()
                .filter(l -> l.getPerson().getId().equals(oldLeadId) && l.getToDate() == null)
                .forEach(l -> l.setToDate(LocalDateTime.now()));

        PersonNode newLead = personRepository.findById(newLeadId)
                .orElseThrow(() -> new RuntimeException("New lead not found"));

        group.getLeads().add(Leads.builder()
                .person(newLead)
                .fromDate(LocalDateTime.now())
                .build());

        group.setState("EVOLVING");
        groupRepository.save(group);

        eventPublisher.publishGroupEvolved(new GroupEvolvedEvent(
                groupId, "TRANSFER_LEAD", LocalDateTime.now()
        ));
    }

    @Transactional("transactionManager")
    public void splitGroup(String groupId, String newGroupName) {
        GroupNode originalGroup = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        GroupNode newGroup = GroupNode.builder()
                .id(UUID.randomUUID().toString())
                .name(newGroupName)
                .taskId(originalGroup.getTaskId())
                .state("FORMING")
                .createdAt(LocalDateTime.now())
                .build();

        newGroup.getSiblings().add(SiblingGroup.builder()
                .sibling(originalGroup)
                .splitAt(LocalDateTime.now())
                .build());

        originalGroup.setState("EVOLVING");

        groupRepository.save(newGroup);
        groupRepository.save(originalGroup);

        eventPublisher.publishGroupEvolved(new GroupEvolvedEvent(
                groupId, "SPLIT", LocalDateTime.now()
        ));
    }

    @Transactional("transactionManager")
    public void mergeGroups(String targetGroupId, String sourceGroupId) {
        GroupNode targetGroup = groupRepository.findById(targetGroupId)
                .orElseThrow(() -> new RuntimeException("Target group not found"));
        GroupNode sourceGroup = groupRepository.findById(sourceGroupId)
                .orElseThrow(() -> new RuntimeException("Source group not found"));

        sourceGroup.getMembers().forEach(sourceMember -> {
            if (sourceMember.getLeftAt() == null) {
                targetGroup.getMembers().add(MemberOf.builder()
                        .person(sourceMember.getPerson())
                        .joinedAt(LocalDateTime.now())
                        .roleInGroup(sourceMember.getRoleInGroup())
                        .build());
            }
        });

        sourceGroup.setState("DISSOLVED");
        sourceGroup.setDissolvedAt(LocalDateTime.now());
        targetGroup.setState("EVOLVING");

        groupRepository.save(targetGroup);
        groupRepository.save(sourceGroup);

        eventPublisher.publishGroupEvolved(new GroupEvolvedEvent(
                targetGroupId, "MERGE", LocalDateTime.now()
        ));
    }

    @Transactional("transactionManager")
    public void dissolveGroupForTask(String taskId) {
        groupRepository.findByTaskId(taskId).ifPresent(group -> dissolveGroup(group.getId()));
    }

    @Transactional("transactionManager")
    public void dissolveGroup(String groupId) {
        GroupNode group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        group.setState("DISSOLVED");
        group.setDissolvedAt(LocalDateTime.now());
        groupRepository.save(group);

        updateCollaborations(group);

        eventPublisher.publishGroupDissolved(new GroupDissolvedEvent(
                groupId, group.getTaskId(), LocalDateTime.now()
        ));
    }

    private void updateCollaborations(GroupNode group) {
        List<PersonNode> participants = new ArrayList<>();
        if (group.getMembers() != null) {
            participants.addAll(group.getMembers().stream().map(MemberOf::getPerson).toList());
        }
        if (group.getLeads() != null) {
            participants.addAll(group.getLeads().stream().map(Leads::getPerson).toList());
        }
        
        List<PersonNode> uniqueParticipants = participants.stream()
                .distinct()
                .toList();

        double durationHours = 1.0;
        if (group.getCreatedAt() != null && group.getDissolvedAt() != null) {
            durationHours = Math.max(0.1, Duration.between(group.getCreatedAt(), group.getDissolvedAt()).toMinutes() / 60.0);
        }

        for (int i = 0; i < uniqueParticipants.size(); i++) {
            PersonNode p1 = uniqueParticipants.get(i);
            for (int j = i + 1; j < uniqueParticipants.size(); j++) {
                PersonNode p2 = uniqueParticipants.get(j);

                p1.addOrUpdateCollaboration(CollaboratedWith.builder()
                        .person(p2)
                        .weight(durationHours)
                        .lastCollaboration(LocalDateTime.now())
                        .build());

                p2.addOrUpdateCollaboration(CollaboratedWith.builder()
                        .person(p1)
                        .weight(durationHours)
                        .lastCollaboration(LocalDateTime.now())
                        .build());
            }
            personRepository.save(p1);
        }
    }

    @Transactional("transactionManager")
    public List<GroupNode> getAllGroups() {
        return groupRepository.findAll();
    }

    @Transactional("transactionManager")
    public GroupNode getGroupById(String groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
    }

    @Transactional("transactionManager")
    public PersonNode saveOrUpdatePerson(String id, String name, String email, String role) {
        log.info("Saving/updating PersonNode: {}", id);
        PersonNode person = personRepository.findById(id).orElseGet(() -> PersonNode.builder().id(id).build());
        person.setName(name);
        person.setEmail(email);
        person.setRole(role);
        return personRepository.save(person);
    }

    @Transactional("transactionManager")
    public com.meetup.tweeningservice.domain.node.TaskNode saveOrUpdateTask(String id, String title, List<String> tags, String priority, String status) {
        log.info("Saving/updating TaskNode: {}", id);
        com.meetup.tweeningservice.domain.node.TaskNode task = taskRepository.findById(id).orElseGet(() -> com.meetup.tweeningservice.domain.node.TaskNode.builder().id(id).build());
        task.setTitle(title);
        task.setTags(tags);
        task.setPriority(priority);
        task.setStatus(status);
        return taskRepository.save(task);
    }

    @Transactional("transactionManager")
    public void updateTask(String id, String title, List<String> tags, String priority, String status) {
        saveOrUpdateTask(id, title, tags, priority, status);
        if ("COMPLETED".equalsIgnoreCase(status) || "DISSOLVED".equalsIgnoreCase(status)) {
            dissolveGroupForTask(id);
        }
    }

    @Transactional("transactionManager")
    public MeetingNode saveOrUpdateMeeting(String id, String title, String type, LocalDateTime startedAt, String parentMeetingId) {
        log.info("Saving/updating MeetingNode: {}", id);
        MeetingNode meeting = meetingRepository.findById(id).orElseGet(() -> MeetingNode.builder().id(id).build());
        meeting.setTitle(title);
        meeting.setType(type);
        meeting.setStartedAt(startedAt);
        meeting.setParentMeetingId(parentMeetingId);
        return meetingRepository.save(meeting);
    }

    @Transactional("transactionManager")
    public void endMeeting(String id, LocalDateTime endedAt) {
        log.info("Ending MeetingNode: {}", id);
        meetingRepository.findById(id).ifPresent(meeting -> {
            meeting.setEndedAt(endedAt);
            meetingRepository.save(meeting);
        });
    }

    @Transactional("transactionManager")
    public List<GroupNode> getGroupsByMeetingId(String meetingId) {
        log.info("Fetching groups formed in meeting {}", meetingId);
        return groupRepository.findByMeetingId(meetingId);
    }

    @Transactional("transactionManager")
    public List<Map<String, Object>> getActiveWorkloads() {
        log.info("Fetching active workloads for all persons via Neo4jClient");
        String cypher = "MATCH (p:Person) " +
                        "OPTIONAL MATCH (p)-[:MEMBER_OF|LEADS]->(g:Group)-[:WORKS_ON]->(t:Task) " +
                        "WHERE g.state IN ['FORMING', 'ACTIVE'] AND (t.status IS NULL OR t.status <> 'COMPLETED') " +
                        "RETURN p.id AS personId, p.name AS name, count(t) AS activeTaskCount";
        return new ArrayList<>(neo4jClient.query(cypher).fetch().all());
    }

    @Transactional("transactionManager")
    public Map<String, Object> getContextData(String groupId) {
        GroupNode group = getGroupById(groupId);
        Map<String, Object> data = new HashMap<>();
        data.put("id", group.getId());
        data.put("name", group.getName());
        data.put("state", group.getState());
        data.put("taskId", group.getTaskId());
        data.put("createdAt", group.getCreatedAt() != null ? group.getCreatedAt().toString() : null);
        data.put("dissolvedAt", group.getDissolvedAt() != null ? group.getDissolvedAt().toString() : null);
        
        List<Map<String, Object>> memberList = new ArrayList<>();
        if (group.getMembers() != null) {
            for (MemberOf m : group.getMembers()) {
                Map<String, Object> mData = new HashMap<>();
                mData.put("personId", m.getPerson().getId());
                mData.put("name", m.getPerson().getName());
                mData.put("email", m.getPerson().getEmail());
                mData.put("role", m.getPerson().getRole());
                mData.put("joinedAt", m.getJoinedAt() != null ? m.getJoinedAt().toString() : null);
                mData.put("leftAt", m.getLeftAt() != null ? m.getLeftAt().toString() : null);
                mData.put("roleInGroup", m.getRoleInGroup());
                memberList.add(mData);
            }
        }
        data.put("members", memberList);

        List<Map<String, Object>> leadList = new ArrayList<>();
        if (group.getLeads() != null) {
            for (Leads l : group.getLeads()) {
                Map<String, Object> lData = new HashMap<>();
                lData.put("personId", l.getPerson().getId());
                lData.put("name", l.getPerson().getName());
                lData.put("email", l.getPerson().getEmail());
                lData.put("role", l.getPerson().getRole());
                lData.put("fromDate", l.getFromDate() != null ? l.getFromDate().toString() : null);
                lData.put("toDate", l.getToDate() != null ? l.getToDate().toString() : null);
                leadList.add(lData);
            }
        }
        data.put("leads", leadList);

        if (group.getTask() != null && group.getTask().getTask() != null) {
            Map<String, Object> tData = new HashMap<>();
            tData.put("id", group.getTask().getTask().getId());
            tData.put("title", group.getTask().getTask().getTitle());
            tData.put("priority", group.getTask().getTask().getPriority());
            tData.put("status", group.getTask().getTask().getStatus());
            tData.put("tags", group.getTask().getTask().getTags());
            data.put("task", tData);
        }

        if (group.getMeeting() != null && group.getMeeting().getMeeting() != null) {
            Map<String, Object> mtData = new HashMap<>();
            mtData.put("id", group.getMeeting().getMeeting().getId());
            mtData.put("title", group.getMeeting().getMeeting().getTitle());
            mtData.put("type", group.getMeeting().getMeeting().getType());
            mtData.put("startedAt", group.getMeeting().getMeeting().getStartedAt() != null ? group.getMeeting().getMeeting().getStartedAt().toString() : null);
            data.put("meeting", mtData);
        }

        return data;
    }
}
