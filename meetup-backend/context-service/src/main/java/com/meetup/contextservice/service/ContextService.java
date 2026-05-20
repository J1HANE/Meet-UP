package com.meetup.contextservice.service;

import com.meetup.contextservice.model.MeetingContext;
import com.meetup.contextservice.repository.MeetingContextRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.cache.annotation.Cacheable;

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
    public MeetingContext getBriefing(UUID meetingId, List<UUID> userTweenIds) {
        log.info("Generating briefing for meeting: {}", meetingId);
        MeetingContext context = contextRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting context not found"));

        validateAccess(context, userTweenIds);

        // Logic for briefing generation could go here
        return context;
    }

    public List<MeetingContext.Decision> getDecisions(UUID groupId, List<UUID> userTweenIds) {
        log.info("Fetching decisions for group: {}", groupId);
        
        if (!userTweenIds.contains(groupId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to group decisions");
        }

        return contextRepository.findByTweenGroupIdsIn(List.of(groupId))
                .stream()
                .flatMap(context -> context.getDecisions().stream())
                .collect(Collectors.toList());
    }

    public void updateSummary(UUID meetingId, String summary, List<UUID> userTweenIds) {
        log.info("Updating summary for meeting: {}", meetingId);
        contextRepository.findByMeetingId(meetingId).ifPresent(context -> {
            validateAccess(context, userTweenIds);
            context.setSummary(summary);
            context.setUpdatedAt(LocalDateTime.now());
            contextRepository.save(context);
        });
    }

    private void validateAccess(MeetingContext context, List<UUID> userTweenIds) {
        log.info("Validating access for meeting: {} with userTweenIds: {}", context.getMeetingId(), userTweenIds);
        log.info("Context tweenGroupIds: {}", context.getTweenGroupIds());
        
        boolean hasAccess = context.getTweenGroupIds().stream()
                .anyMatch(userTweenIds::contains);
        
        if (!hasAccess) {
            log.warn("Access denied for userTweenIds: {}", userTweenIds);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to meeting context");
        }
    }
}
