package com.meetup.notificationservice.channel;

import com.meetup.types.notifications.NotificationChannel;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class NotificationStrategyRegistry {

    // channel → strategy, built at startup
    private final Map<NotificationChannel, NotificationStrategy> registry;

    // Spring injects ALL beans that implement NotificationStrategy
    public NotificationStrategyRegistry(List<NotificationStrategy> strategies) {
        this.registry = strategies.stream()
                .collect(Collectors.toMap(
                        NotificationStrategy::getChannel,
                        Function.identity()
                ));
    }

    public NotificationStrategy get(NotificationChannel channel) {
        NotificationStrategy strategy = registry.get(channel);
        if (strategy == null) {
            throw new IllegalArgumentException("No strategy registered for channel: " + channel);
        }
        return strategy;
    }

    public boolean supports(NotificationChannel channel) {
        return registry.containsKey(channel);
    }
}
