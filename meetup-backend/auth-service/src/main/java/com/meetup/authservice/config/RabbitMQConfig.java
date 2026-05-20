package com.meetup.authservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String GROUP_EVENTS_EXCHANGE = "group-events-exchange";
    public static final String AUTH_GROUP_EVENTS_QUEUE = "auth-group-events-queue";

    @Bean
    public TopicExchange groupEventsExchange() {
        return new TopicExchange(GROUP_EVENTS_EXCHANGE);
    }

    @Bean
    public Queue groupEventsQueue() {
        return new Queue(AUTH_GROUP_EVENTS_QUEUE, true);
    }

    @Bean
    public Binding memberJoinedBinding(Queue groupEventsQueue, TopicExchange groupEventsExchange) {
        return BindingBuilder.bind(groupEventsQueue).to(groupEventsExchange).with("member.joined");
    }

    @Bean
    public Binding memberLeftBinding(Queue groupEventsQueue, TopicExchange groupEventsExchange) {
        return BindingBuilder.bind(groupEventsQueue).to(groupEventsExchange).with("member.left");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
