package com.meetup.notificationservice.channel.impl;


import com.meetup.notificationservice.channel.NotificationStrategy;
import com.meetup.types.notifications.NotificationChannel;
import com.meetup.types.notifications.NotificationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationStrategy implements NotificationStrategy {

    private final JavaMailSender mailSender;

    @Override
    public NotificationChannel getChannel() {
        return NotificationChannel.EMAIL;
    }

    @Override
    public void send(NotificationMessage message) {
        String to = message.getRecipient().getEmail();

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(to);
        mail.setSubject(buildSubject(message.getEvent()));
        mail.setText(buildBody(message));

        mailSender.send(mail);
        log.info("Email sent to {} for event {}", to, message.getEvent());
    }

    private String buildSubject(String event) {
        // You'll want a proper template engine here later (Thymeleaf, Freemarker)
        return "Notification: " + event;
    }

    private String buildBody(NotificationMessage message) {
        return "Event: " + message.getEvent() + "\nDetails: " + message.getData().toString();
    }
}