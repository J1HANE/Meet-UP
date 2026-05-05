package com.meetup.notificationservice.config;


import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;

@Configuration
public class RabbitMQConfig {

    // Exchange name — all publishers route to this
    public static final String EXCHANGE = "notifications.exchange";

    // Queue names
    public static final String EMAIL_QUEUE = "notifications.email";
    public static final String SMS_QUEUE   = "notifications.sms";
    public static final String PUSH_QUEUE  = "notifications.push";
    public static final String DLQ         = "notifications.dlq";

    // Routing keys publishers use
    public static final String EMAIL_ROUTING_KEY = "notifications.email";
    public static final String SMS_ROUTING_KEY   = "notifications.sms";
    public static final String PUSH_ROUTING_KEY  = "notifications.push";

    @Bean
    public TopicExchange notificationsExchange() {
        return new TopicExchange(EXCHANGE);
    }

    // --- Queues ---

    @Bean
    public Queue emailQueue() {
        // durable=true means it survives RabbitMQ restarts
        return QueueBuilder.durable(EMAIL_QUEUE)
                .withArgument("x-dead-letter-exchange", "")
                .withArgument("x-dead-letter-routing-key", DLQ)
                .build();
    }

    @Bean
    public Queue smsQueue() {
        return QueueBuilder.durable(SMS_QUEUE)
                .withArgument("x-dead-letter-exchange", "")
                .withArgument("x-dead-letter-routing-key", DLQ)
                .build();
    }

    @Bean
    public Queue pushQueue() {
        return QueueBuilder.durable(PUSH_QUEUE)
                .withArgument("x-dead-letter-exchange", "")
                .withArgument("x-dead-letter-routing-key", DLQ)
                .build();
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ).build();
    }

    // --- Bindings (queue → exchange via routing key) ---

    @Bean
    public Binding emailBinding(Queue emailQueue, TopicExchange notificationsExchange) {
        return BindingBuilder.bind(emailQueue).to(notificationsExchange).with(EMAIL_ROUTING_KEY);
    }

    @Bean
    public Binding smsBinding(Queue smsQueue, TopicExchange notificationsExchange) {
        return BindingBuilder.bind(smsQueue).to(notificationsExchange).with(SMS_ROUTING_KEY);
    }

    @Bean
    public Binding pushBinding(Queue pushQueue, TopicExchange notificationsExchange) {
        return BindingBuilder.bind(pushQueue).to(notificationsExchange).with(PUSH_ROUTING_KEY);
    }


    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }


    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
