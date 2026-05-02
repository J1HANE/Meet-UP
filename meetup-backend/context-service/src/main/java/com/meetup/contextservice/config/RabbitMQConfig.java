package com.meetup.contextservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${app.rabbitmq.exchanges.meeting}")
    private String meetingExchange;

    @Value("${app.rabbitmq.exchanges.task}")
    private String taskExchange;

    @Value("${app.rabbitmq.exchanges.group}")
    private String groupExchange;

    @Value("${app.rabbitmq.queues.context-ingestion}")
    private String contextIngestionQueue;

    @Bean
    public Queue contextIngestionQueue() {
        return new Queue(contextIngestionQueue, true);
    }

    @Bean
    public TopicExchange meetingExchange() {
        return new TopicExchange(meetingExchange);
    }

    @Bean
    public TopicExchange taskExchange() {
        return new TopicExchange(taskExchange);
    }

    @Bean
    public TopicExchange groupExchange() {
        return new TopicExchange(groupExchange);
    }

    // Bindings
    @Bean
    public Binding meetingStartedBinding(Queue contextIngestionQueue, TopicExchange meetingExchange) {
        return BindingBuilder.bind(contextIngestionQueue).to(meetingExchange).with("meeting.started");
    }

    @Bean
    public Binding transcriptChunkBinding(Queue contextIngestionQueue, TopicExchange meetingExchange) {
        return BindingBuilder.bind(contextIngestionQueue).to(meetingExchange).with("transcript.chunk");
    }

    @Bean
    public Binding taskCreatedBinding(Queue contextIngestionQueue, TopicExchange taskExchange) {
        return BindingBuilder.bind(contextIngestionQueue).to(taskExchange).with("task.created");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        DefaultJackson2JavaTypeMapper typeMapper = new DefaultJackson2JavaTypeMapper();
        typeMapper.setTrustedPackages("*");
        converter.setJavaTypeMapper(typeMapper);
        return converter;
    }
}
