package com.meetup.notificationservice.channel;


import com.meetup.types.notifications.NotificationChannel;
import com.meetup.types.notifications.NotificationMessage;

public interface NotificationStrategy {


    NotificationChannel getChannel();

    // Send the notification — throw on failure so RabbitMQ can redeliver
    void send(NotificationMessage message);
}
