package com.meetup.notificationservice.channel.impl;

import com.meetup.notificationservice.channel.NotificationStrategy;
import com.meetup.types.notifications.NotificationChannel;
import com.meetup.types.notifications.NotificationMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class SmsNotificationStrategy implements NotificationStrategy {

    @Override
    public NotificationChannel getChannel() {
        return NotificationChannel.SMS;
    }

    @Override
    public void send(NotificationMessage message) {
        String phone = message.getRecipient().getPhone();
        String body  = "Event: " + message.getEvent();

        // Plug in Twilio SDK here:
        // Message.creator(new PhoneNumber(phone), new PhoneNumber(FROM), body).create();

        log.info("SMS sent to {} for event {}", phone, message.getEvent());
    }
}
