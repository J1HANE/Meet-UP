package com.meetup.tweeningservice.service;

import com.meetup.tweeningservice.domain.node.GroupNode;
import com.meetup.tweeningservice.domain.node.PersonNode;
import com.meetup.tweeningservice.domain.relationship.*;
import com.meetup.tweeningservice.event.out.*;
import com.meetup.tweeningservice.repository.GroupRepository;
import com.meetup.tweeningservice.repository.MeetingRepository;
import com.meetup.tweeningservice.repository.PersonRepository;
import com.meetup.tweeningservice.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

    @Transactional("transactionManager")
    public GroupNode createLatentGroup(String taskId) {
        log.info("Creating latent group for task {}", taskId);
        GroupNode group = GroupNode.builder()
                .id(UUID.randomUUID().toString())
                .taskId(taskId)
                .state("LATENT")
                .createdAt(LocalDateTime.now())
                .build();

        // Link task if exists
        taskRepository.findById(taskId).ifPresent(task ->
                group.setTask(WorksOn.builder().task(task).assignedAt(LocalDateTime.now()).build())
        );

        return groupRepository.save(group);
    }

    @Transactional("transactionManager")
    public GroupNode formGroup(String taskId, String meetingId, String ownerId) {
        log.info("Forming group for task {} in meeting {} by owner {}", taskId, meetingId, ownerId);

        GroupNode group = groupRepository.findByTaskId(taskId)
                .orElseGet(() -> createLatentGroup(taskId));

        group.setState("FORMING");

        GroupNode finalGroup = group;
        meetingRepository.findById(meetingId).ifPresent(meeting ->
                finalGroup.setMeeting(FormedIn.builder().meeting(meeting).spawnedAt(LocalDateTime.now()).build())
        );

        PersonNode owner = personRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

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
}
