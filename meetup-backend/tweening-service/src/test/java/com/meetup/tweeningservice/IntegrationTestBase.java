package com.meetup.tweeningservice;

import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public abstract class IntegrationTestBase {
    // Testcontainers removed. 
    // The tests will now use the Neo4j and RabbitMQ instances 
    // currently running on your machine via docker-compose!
}
