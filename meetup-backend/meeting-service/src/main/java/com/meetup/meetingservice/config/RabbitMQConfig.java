package com.meetup.meetingservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String MEETING_EVENTS_EXCHANGE = "meeting-events-exchange";
    public static final String MEETING_STARTED_ROUTING_KEY = "meeting.started";
    public static final String MEETING_ENDED_ROUTING_KEY = "meeting.ended";
    public static final String SUBMEETING_SPAWNED_ROUTING_KEY = "submeeting.spawned";

    @Bean
    public MessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public AmqpTemplate template(ConnectionFactory connectionFactory) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter());
        return rabbitTemplate;
    }

    @Bean
    public TopicExchange meetingEventsExchange() {
        return new TopicExchange(MEETING_EVENTS_EXCHANGE);
    }
}
