package com.meetup.authservice.listener;

import com.meetup.authservice.event.MemberJoinedEvent;
import com.meetup.authservice.event.MemberLeftEvent;
import com.meetup.authservice.model.User;
import com.meetup.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
@RabbitListener(queues = "auth-group-events-queue")
public class UserTweenListener {

    private final UserRepository userRepository;

    @RabbitHandler
    public void handleMemberJoined(MemberJoinedEvent event) {
        log.info("Received member.joined event: {}", event);
        try {
            UUID userId = UUID.fromString(event.personId());
            UUID groupId = UUID.fromString(event.groupId());

            userRepository.findById(userId).ifPresent(user -> {
                if (!user.getTweenIds().contains(groupId)) {
                    user.getTweenIds().add(groupId);
                    userRepository.save(user);
                    log.info("Updated user {} with new tweenId {}", userId, groupId);
                }
            });
        } catch (Exception e) {
            log.error("Error processing member.joined event", e);
        }
    }

    @RabbitHandler
    public void handleMemberLeft(MemberLeftEvent event) {
        log.info("Received member.left event: {}", event);
        try {
            UUID userId = UUID.fromString(event.personId());
            UUID groupId = UUID.fromString(event.groupId());

            userRepository.findById(userId).ifPresent(user -> {
                if (user.getTweenIds().remove(groupId)) {
                    userRepository.save(user);
                    log.info("Removed tweenId {} from user {}", groupId, userId);
                }
            });
        } catch (Exception e) {
            log.error("Error processing member.left event", e);
        }
    }
}
