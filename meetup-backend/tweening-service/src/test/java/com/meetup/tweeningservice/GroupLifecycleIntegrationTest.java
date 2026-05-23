package com.meetup.tweeningservice;

import com.meetup.tweeningservice.domain.node.GroupNode;
import com.meetup.tweeningservice.domain.node.MeetingNode;
import com.meetup.tweeningservice.domain.node.PersonNode;
import com.meetup.tweeningservice.event.in.TaskCompletedEvent;
import com.meetup.tweeningservice.event.in.TaskCreatedEvent;
import com.meetup.tweeningservice.repository.GroupRepository;
import com.meetup.tweeningservice.repository.MeetingRepository;
import com.meetup.tweeningservice.repository.PersonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
public class GroupLifecycleIntegrationTest extends IntegrationTestBase {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private MeetingRepository meetingRepository;

    @BeforeEach
    void setUp() {
        groupRepository.deleteAll();
        personRepository.deleteAll();
        meetingRepository.deleteAll();
    }

    @Test
    void testFullGroupLifecycle() throws Exception {
        String taskId = UUID.randomUUID().toString();
        String meetingId = UUID.randomUUID().toString();
        String aliceId = UUID.randomUUID().toString();
        String bobId = UUID.randomUUID().toString();

        // 1. Setup Data
        meetingRepository.save(MeetingNode.builder().id(meetingId).title("Kickoff").build());
        personRepository.save(PersonNode.builder().id(aliceId).name("Alice").build());
        personRepository.save(PersonNode.builder().id(bobId).name("Bob").build());

        // 2. Simulate Task Creation (RabbitMQ)
        TaskCreatedEvent createdEvent = new TaskCreatedEvent(taskId, "Design DB", aliceId, java.util.List.of("db", "design"), "HIGH", "TODO", LocalDateTime.now());
        rabbitTemplate.convertAndSend("task-events-exchange", "task.created", createdEvent);

        // Verify Latent group created asynchronously
        await().atMost(15, TimeUnit.SECONDS).untilAsserted(() -> {
            GroupNode group = groupRepository.findByTaskId(taskId).orElse(null);
            assertThat(group).isNotNull();
            assertThat(group.getState()).isEqualTo("LATENT");
        });

        // 3. Form Group (REST API)
        mockMvc.perform(post("/api/groups/form")
                .param("taskId", taskId)
                .param("meetingId", meetingId)
                .param("ownerId", aliceId))
                .andExpect(status().isOk());

        GroupNode group = groupRepository.findByTaskId(taskId).orElseThrow();
        assertThat(group.getState()).isEqualTo("FORMING");

        // 4. Join Group (REST API)
        mockMvc.perform(post("/api/groups/" + group.getId() + "/join")
                .param("personId", bobId)
                .param("role", "MEMBER"))
                .andExpect(status().isOk());

        group = groupRepository.findByTaskId(taskId).orElseThrow();
        assertThat(group.getState()).isEqualTo("ACTIVE");

        // 5. Simulate Task Completion (RabbitMQ)
        TaskCompletedEvent completedEvent = new TaskCompletedEvent(taskId, LocalDateTime.now());
        rabbitTemplate.convertAndSend("task-events-exchange", "task.completed", completedEvent);

        // Verify dissolved and collaboration generated
        await().atMost(15, TimeUnit.SECONDS).untilAsserted(() -> {
            GroupNode dissolvedGroup = groupRepository.findByTaskId(taskId).orElseThrow();
            assertThat(dissolvedGroup.getState()).isEqualTo("DISSOLVED");
        });

        PersonNode alice = personRepository.findById(aliceId).orElseThrow();
        assertThat(alice.hasCollaboratedWith(bobId)).isTrue();
    }

    @Test
    void testNewEventsAndEndpoints() throws Exception {
        String userId = UUID.randomUUID().toString();
        String meetingId = UUID.randomUUID().toString();
        String taskId = UUID.randomUUID().toString();

        // 1. Test user.registered event
        com.meetup.tweeningservice.event.in.UserRegisteredEvent regEvent = 
                new com.meetup.tweeningservice.event.in.UserRegisteredEvent(userId, "Charlie", "charlie@example.com", "DEVELOPER");
        rabbitTemplate.convertAndSend("auth-events-exchange", "user.registered", regEvent);

        await().atMost(15, TimeUnit.SECONDS).untilAsserted(() -> {
            PersonNode p = personRepository.findById(userId).orElse(null);
            assertThat(p).isNotNull();
            assertThat(p.getName()).isEqualTo("Charlie");
            assertThat(p.getRole()).isEqualTo("DEVELOPER");
        });

        // 2. Test user.updated event
        com.meetup.tweeningservice.event.in.UserUpdatedEvent updEvent = 
                new com.meetup.tweeningservice.event.in.UserUpdatedEvent(userId, "Charlie Updated", "charlie@example.com", "LEAD");
        rabbitTemplate.convertAndSend("auth-events-exchange", "user.updated", updEvent);

        await().atMost(15, TimeUnit.SECONDS).untilAsserted(() -> {
            PersonNode p = personRepository.findById(userId).orElse(null);
            assertThat(p).isNotNull();
            assertThat(p.getName()).isEqualTo("Charlie Updated");
            assertThat(p.getRole()).isEqualTo("LEAD");
        });

        // 3. Test meeting.started event
        com.meetup.tweeningservice.event.in.MeetingStartedEvent meetEvent = 
                new com.meetup.tweeningservice.event.in.MeetingStartedEvent(meetingId, "Design Meeting", "SYNC", LocalDateTime.now(), null);
        rabbitTemplate.convertAndSend("meeting-events-exchange", "meeting.started", meetEvent);

        await().atMost(15, TimeUnit.SECONDS).untilAsserted(() -> {
            MeetingNode m = meetingRepository.findById(meetingId).orElse(null);
            assertThat(m).isNotNull();
            assertThat(m.getTitle()).isEqualTo("Design Meeting");
        });

        // 4. Test task.created event
        TaskCreatedEvent createdEvent = new TaskCreatedEvent(taskId, "Task Spec", userId, java.util.List.of("design"), "MEDIUM", "TODO", LocalDateTime.now());
        rabbitTemplate.convertAndSend("task-events-exchange", "task.created", createdEvent);

        await().atMost(15, TimeUnit.SECONDS).untilAsserted(() -> {
            GroupNode g = groupRepository.findByTaskId(taskId).orElse(null);
            assertThat(g).isNotNull();
            assertThat(g.getState()).isEqualTo("LATENT");
        });

        GroupNode group = groupRepository.findByTaskId(taskId).orElseThrow();

        // 5. Test REST endpoint: /api/groups/{groupId}/context
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/groups/" + group.getId() + "/context"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.id").value(group.getId()))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.state").value("LATENT"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.taskId").value(taskId));

        // 6. Test REST endpoint: /api/groups/workload
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/groups/workload"))
                .andExpect(status().isOk());
    }
}
