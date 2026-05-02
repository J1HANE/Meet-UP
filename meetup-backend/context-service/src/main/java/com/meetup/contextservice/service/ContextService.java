package com.meetup.contextservice.service;

import com.meetup.contextservice.model.MeetingContext;
import com.meetup.contextservice.repository.MeetingContextRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ContextService {

    private final MeetingContextRepository contextRepository;

    @Cacheable(value = "briefings", key = "#meetingId")
    public MeetingContext getBriefing(UUID meetingId) {
        log.info("Generating briefing for meeting: {}", meetingId);
        // 1. Find the current meeting context to get participants/groups
        return contextRepository.findByMeetingId(meetingId)
                .map(currentContext -> {
                    // 2. Query prior sessions for the same participants or groups
                    List<MeetingContext> priorContexts = contextRepository.findByParticipantIdsIn(currentContext.getParticipantIds());
                    // In a real scenario, you'd filter out the current one and maybe sort by date
                    return currentContext; // Simplification for MVP: returning current
                })
                .orElseThrow(() -> new RuntimeException("Meeting context not found"));
    }

    public List<MeetingContext.Decision> getDecisions(UUID groupId) {
        log.info("Fetching decisions for group: {}", groupId);
        return contextRepository.findByTweenGroupIdsIn(List.of(groupId))
                .stream()
                .flatMap(context -> context.getDecisions().stream())
                .collect(Collectors.toList());
    }

    public void updateSummary(UUID meetingId, String summary) {
        log.info("Updating summary for meeting: {}", meetingId);
        contextRepository.findByMeetingId(meetingId).ifPresent(context -> {
            context.setSummary(summary);
            context.setUpdatedAt(LocalDateTime.now());
            contextRepository.save(context);
        });
    }
}
