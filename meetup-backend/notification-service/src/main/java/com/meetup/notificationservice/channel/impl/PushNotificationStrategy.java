package com.meetup.notificationservice.channel.impl;


import com.meetup.notificationservice.channel.NotificationStrategy;
import com.meetup.types.notifications.NotificationChannel;
import com.meetup.types.notifications.NotificationMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class PushNotificationStrategy implements NotificationStrategy {

    @Override
    public NotificationChannel getChannel() {
        return NotificationChannel.PUSH;
    }

    @Override
    public void send(NotificationMessage message) {
        String deviceToken = message.getRecipient().getDeviceToken();

        // Plug in FCM here:
        // FirebaseMessaging.getInstance().send(Message.builder()
        //     .setToken(deviceToken)
        //     .setNotification(Notification.builder().setTitle(...).build())
        //     .build());

        log.info("Push sent to device {} for event {}", deviceToken, message.getEvent());
    }
}