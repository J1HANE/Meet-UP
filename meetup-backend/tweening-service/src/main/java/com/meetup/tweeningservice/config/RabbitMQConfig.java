package com.meetup.tweeningservice.config;

import com.meetup.tweeningservice.event.in.MeetingEndedEvent;
import com.meetup.tweeningservice.event.in.MeetingStartedEvent;
import com.meetup.tweeningservice.event.in.SubmeetingSpawnedEvent;
import com.meetup.tweeningservice.event.in.TaskCompletedEvent;
import com.meetup.tweeningservice.event.in.TaskCreatedEvent;
import com.meetup.tweeningservice.event.in.TaskUpdatedEvent;
import com.meetup.tweeningservice.event.in.UserRegisteredEvent;
import com.meetup.tweeningservice.event.in.UserUpdatedEvent;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class RabbitMQConfig {

    public static final String GROUP_EVENTS_EXCHANGE = "group-events-exchange";
    
    public static final String TASK_EVENTS_EXCHANGE = "task-events-exchange";
    public static final String TASK_EVENTS_QUEUE = "tweening-task-events-queue";

    public static final String AUTH_EVENTS_EXCHANGE = "auth-events-exchange";
    public static final String AUTH_EVENTS_QUEUE = "tweening-auth-events-queue";

    public static final String MEETING_EVENTS_EXCHANGE = "meeting-events-exchange";
    public static final String MEETING_EVENTS_QUEUE = "tweening-meeting-events-queue";

    // --- Outbound: Group Events ---
    @Bean
    public TopicExchange groupEventsExchange() {
        return new TopicExchange(GROUP_EVENTS_EXCHANGE);
    }

    // --- Inbound: Task Events ---
    @Bean
    public TopicExchange taskEventsExchange() {
        return new TopicExchange(TASK_EVENTS_EXCHANGE);
    }

    @Bean
    public Queue taskEventsQueue() {
        return new Queue(TASK_EVENTS_QUEUE, true); // durable
    }

    @Bean
    public Binding taskCreatedBinding(Queue taskEventsQueue, TopicExchange taskEventsExchange) {
        return BindingBuilder.bind(taskEventsQueue).to(taskEventsExchange).with("task.created");
    }

    @Bean
    public Binding taskUpdatedBinding(Queue taskEventsQueue, TopicExchange taskEventsExchange) {
        return BindingBuilder.bind(taskEventsQueue).to(taskEventsExchange).with("task.updated");
    }

    @Bean
    public Binding taskCompletedBinding(Queue taskEventsQueue, TopicExchange taskEventsExchange) {
        return BindingBuilder.bind(taskEventsQueue).to(taskEventsExchange).with("task.completed");
    }

    // --- Inbound: Auth Events ---
    @Bean
    public TopicExchange authEventsExchange() {
        return new TopicExchange(AUTH_EVENTS_EXCHANGE);
    }

    @Bean
    public Queue authEventsQueue() {
        return new Queue(AUTH_EVENTS_QUEUE, true);
    }

    @Bean
    public Binding userRegisteredBinding(Queue authEventsQueue, TopicExchange authEventsExchange) {
        return BindingBuilder.bind(authEventsQueue).to(authEventsExchange).with("user.registered");
    }

    @Bean
    public Binding userUpdatedBinding(Queue authEventsQueue, TopicExchange authEventsExchange) {
        return BindingBuilder.bind(authEventsQueue).to(authEventsExchange).with("user.updated");
    }

    // --- Inbound: Meeting Events ---
    @Bean
    public TopicExchange meetingEventsExchange() {
        return new TopicExchange(MEETING_EVENTS_EXCHANGE);
    }

    @Bean
    public Queue meetingEventsQueue() {
        return new Queue(MEETING_EVENTS_QUEUE, true);
    }

    @Bean
    public Binding meetingStartedBinding(Queue meetingEventsQueue, TopicExchange meetingEventsExchange) {
        return BindingBuilder.bind(meetingEventsQueue).to(meetingEventsExchange).with("meeting.started");
    }

    @Bean
    public Binding meetingEndedBinding(Queue meetingEventsQueue, TopicExchange meetingEventsExchange) {
        return BindingBuilder.bind(meetingEventsQueue).to(meetingEventsExchange).with("meeting.ended");
    }

    @Bean
    public Binding submeetingSpawnedBinding(Queue meetingEventsQueue, TopicExchange meetingEventsExchange) {
        return BindingBuilder.bind(meetingEventsQueue).to(meetingEventsExchange).with("submeeting.spawned");
    }

    // --- Messaging Configuration ---
    @Bean
    public MessageConverter jsonMessageConverter() {
        org.springframework.amqp.support.converter.Jackson2JsonMessageConverter converter = 
                new org.springframework.amqp.support.converter.Jackson2JsonMessageConverter();
        org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper typeMapper = 
                new org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper();
        typeMapper.setTrustedPackages("*");
        typeMapper.setIdClassMapping(Map.of(
                "com.meetup.authservice.event.UserRegisteredEvent", UserRegisteredEvent.class,
                "com.meetup.authservice.event.UserUpdatedEvent", UserUpdatedEvent.class,
                "com.meetup.meetingservice.event.MeetingStartedEvent", MeetingStartedEvent.class,
                "com.meetup.meetingservice.event.MeetingEndedEvent", MeetingEndedEvent.class,
                "com.meetup.meetingservice.event.SubmeetingSpawnedEvent", SubmeetingSpawnedEvent.class,
                "com.meetup.taskservice.domain.event.TaskCreatedEvent", TaskCreatedEvent.class,
                "com.meetup.taskservice.domain.event.TaskUpdatedEvent", TaskUpdatedEvent.class,
                "com.meetup.taskservice.domain.event.TaskCompletedEvent", TaskCompletedEvent.class
        ));
        converter.setJavaTypeMapper(typeMapper);
        return converter;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }

    @Bean
    public org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(ConnectionFactory connectionFactory) {
        org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory factory = new org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter());
        return factory;
    }
}
