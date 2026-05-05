package com.meetup.notificationservice.channel;

import com.meetup.types.notifications.NotificationChannel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationStrategyFactory {

    private final NotificationStrategyRegistry registry;

    public NotificationStrategy getStrategy(String channelName) {
        try {
            NotificationChannel channel = NotificationChannel.from(channelName);
            return registry.get(channel);
        } catch (IllegalArgumentException e) {
            throw new UnsupportedOperationException(
                    "Unsupported notification channel: " + channelName, e);
        }
    }
}
