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
        mail.setSubject(buildSubject(message));
        mail.setText(buildBody(message));

        mailSender.send(mail);
        log.info("Email sent to {} for event {}", to, message.getEvent());
    }

    private String buildSubject(NotificationMessage message) {
        if ("participant.added".equals(message.getEvent())) {
            return "You've been invited to join a meeting";
        }
        return "Notification: " + message.getEvent();
    }

    private String buildBody(NotificationMessage message) {
        if ("participant.added".equals(message.getEvent())) {
            return buildMeetingInvitationBody(message);
        }
        return "Event: " + message.getEvent() + "\nDetails: " + message.getData().toString();
    }

    private String buildMeetingInvitationBody(NotificationMessage message) {
        StringBuilder body = new StringBuilder();
        body.append("You've been invited to join a meeting!\n\n");
        
        if (message.getData() != null) {
            if (message.getData().containsKey("meetingTitle")) {
                body.append("Meeting: ").append(message.getData().get("meetingTitle")).append("\n");
            }
            if (message.getData().containsKey("hostName")) {
                body.append("Hosted by: ").append(message.getData().get("hostName")).append("\n");
            }
            if (message.getData().containsKey("scheduledAt")) {
                body.append("Scheduled at: ").append(message.getData().get("scheduledAt")).append("\n");
            }
            if (message.getData().containsKey("meetingLink")) {
                body.append("\nJoin the meeting at: ").append(message.getData().get("meetingLink")).append("\n");
            }
        }
        
        body.append("\nWe hope to see you there!");
        return body.toString();
    }
}