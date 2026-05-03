package com.meetup.tweeningservice.service;

import com.meetup.tweeningservice.domain.node.GroupNode;
import com.meetup.tweeningservice.domain.node.MeetingNode;
import com.meetup.tweeningservice.domain.node.PersonNode;
import com.meetup.tweeningservice.domain.node.TaskNode;
import com.meetup.tweeningservice.domain.relationship.Leads;
import com.meetup.tweeningservice.domain.relationship.MemberOf;
import com.meetup.tweeningservice.event.out.GroupFormedEvent;
import com.meetup.tweeningservice.event.out.MemberJoinedEvent;
import com.meetup.tweeningservice.event.out.RabbitMQEventPublisher;
import com.meetup.tweeningservice.repository.GroupRepository;
import com.meetup.tweeningservice.repository.MeetingRepository;
import com.meetup.tweeningservice.repository.PersonRepository;
import com.meetup.tweeningservice.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GroupServiceTest {

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private PersonRepository personRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private MeetingRepository meetingRepository;

    @Mock
    private RabbitMQEventPublisher eventPublisher;

    @InjectMocks
    private GroupService groupService;

    @Test
    void createLatentGroup_shouldCreateGroupAndLinkTask() {
        String taskId = "task1";
        TaskNode task = new TaskNode();
        task.setId(taskId);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(groupRepository.save(any(GroupNode.class))).thenAnswer(i -> i.getArgument(0));

        GroupNode result = groupService.createLatentGroup(taskId);

        assertNotNull(result);
        assertEquals("LATENT", result.getState());
        assertEquals(taskId, result.getTaskId());
        assertNotNull(result.getTask());
        assertEquals(taskId, result.getTask().getTask().getId());

        verify(groupRepository).save(any(GroupNode.class));
    }

    @Test
    void formGroup_shouldFormGroupAndPublishEvent() {
        String taskId = "task1";
        String meetingId = "meeting1";
        String ownerId = "owner1";

        GroupNode group = GroupNode.builder().id("group1").taskId(taskId).state("LATENT").leads(new ArrayList<>()).build();
        MeetingNode meeting = new MeetingNode();
        meeting.setId(meetingId);
        PersonNode owner = new PersonNode();
        owner.setId(ownerId);

        when(groupRepository.findByTaskId(taskId)).thenReturn(Optional.of(group));
        when(meetingRepository.findById(meetingId)).thenReturn(Optional.of(meeting));
        when(personRepository.findById(ownerId)).thenReturn(Optional.of(owner));
        when(groupRepository.save(any(GroupNode.class))).thenAnswer(i -> i.getArgument(0));

        GroupNode result = groupService.formGroup(taskId, meetingId, ownerId);

        assertEquals("FORMING", result.getState());
        assertNotNull(result.getMeeting());
        assertEquals(1, result.getLeads().size());
        assertEquals(ownerId, result.getLeads().get(0).getPerson().getId());

        verify(eventPublisher).publishGroupFormed(any(GroupFormedEvent.class));
    }

    @Test
    void joinGroup_shouldAddMemberAndMakeActiveIfFormingWithEnoughMembers() {
        String groupId = "group1";
        String personId = "person1";
        
        GroupNode group = GroupNode.builder().id(groupId).state("FORMING").members(new ArrayList<>()).build();
        PersonNode person = new PersonNode();
        person.setId(personId);

        // Add one existing member to trigger the ACTIVE state transition
        MemberOf existingMember = MemberOf.builder().person(new PersonNode()).build();
        group.getMembers().add(existingMember);

        when(groupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(personRepository.findById(personId)).thenReturn(Optional.of(person));
        when(groupRepository.save(any(GroupNode.class))).thenAnswer(i -> i.getArgument(0));

        groupService.joinGroup(groupId, personId, "MEMBER");

        assertEquals(2, group.getMembers().size());
        assertEquals("ACTIVE", group.getState());

        verify(eventPublisher).publishMemberJoined(any(MemberJoinedEvent.class));
    }
}
