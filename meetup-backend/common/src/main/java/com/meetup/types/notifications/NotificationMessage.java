package com.meetup.types.notifications;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationMessage {

    private String messageId;
    private String event;            // "user.registered"

    private Recipient recipient;
    private Set<NotificationChannel> channels;
    private NotificationPriority priority;

    private Map<String, Object> data;

    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Recipient {
        private String userId;
        private String groupId;
        private String email;
        private String phone;
        private String deviceToken;
    }
}
