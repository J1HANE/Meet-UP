package com.meetup.tweeningservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String GROUP_EVENTS_EXCHANGE = "group-events-exchange";
    public static final String TASK_EVENTS_EXCHANGE = "task-events-exchange";
    public static final String TASK_EVENTS_QUEUE = "tweening-task-events-queue";

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
    public Binding taskCompletedBinding(Queue taskEventsQueue, TopicExchange taskEventsExchange) {
        return BindingBuilder.bind(taskEventsQueue).to(taskEventsExchange).with("task.completed");
    }

    // --- Messaging Configuration ---
    @Bean
    public MessageConverter jsonMessageConverter() {
        org.springframework.amqp.support.converter.Jackson2JsonMessageConverter converter = 
                new org.springframework.amqp.support.converter.Jackson2JsonMessageConverter();
        org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper typeMapper = 
                new org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper();
        typeMapper.setTrustedPackages("*");
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
