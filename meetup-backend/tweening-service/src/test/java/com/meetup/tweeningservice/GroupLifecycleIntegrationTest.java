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
        TaskCreatedEvent createdEvent = new TaskCreatedEvent(taskId, "Design DB", "Desc", LocalDateTime.now());
        rabbitTemplate.convertAndSend("task-events-exchange", "task.created", createdEvent);

        // Verify Latent group created asynchronously
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
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
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
            GroupNode dissolvedGroup = groupRepository.findByTaskId(taskId).orElseThrow();
            assertThat(dissolvedGroup.getState()).isEqualTo("DISSOLVED");
        });

        PersonNode alice = personRepository.findById(aliceId).orElseThrow();
        assertThat(alice.hasCollaboratedWith(bobId)).isTrue();
    }
}
