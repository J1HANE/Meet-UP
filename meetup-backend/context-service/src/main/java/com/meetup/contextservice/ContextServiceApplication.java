package com.meetup.contextservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class ContextServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ContextServiceApplication.class, args);
    }
}
