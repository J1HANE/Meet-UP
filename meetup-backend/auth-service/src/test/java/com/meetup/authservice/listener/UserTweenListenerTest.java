package com.meetup.authservice.listener;

import com.meetup.authservice.event.MemberJoinedEvent;
import com.meetup.authservice.event.MemberLeftEvent;
import com.meetup.authservice.model.User;
import com.meetup.authservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserTweenListenerTest {

    private UserTweenListener listener;

    @Mock
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        listener = new UserTweenListener(userRepository);
    }

    @Test
    void handleMemberJoined_AddsTweenIdToUser() {
        UUID userId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .tweenIds(new ArrayList<>())
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        MemberJoinedEvent event = new MemberJoinedEvent(groupId.toString(), userId.toString(), "member", LocalDateTime.now());
        listener.handleMemberJoined(event);

        assertTrue(user.getTweenIds().contains(groupId));
        verify(userRepository).save(user);
    }

    @Test
    void handleMemberLeft_RemovesTweenIdFromUser() {
        UUID userId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        List<UUID> tweenIds = new ArrayList<>();
        tweenIds.add(groupId);
        
        User user = User.builder()
                .id(userId)
                .tweenIds(tweenIds)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        MemberLeftEvent event = new MemberLeftEvent(groupId.toString(), userId.toString(), LocalDateTime.now());
        listener.handleMemberLeft(event);

        assertFalse(user.getTweenIds().contains(groupId));
        verify(userRepository).save(user);
    }
}
