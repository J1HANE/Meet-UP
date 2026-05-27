package com.meetup.contextservice.utils;

import org.slf4j.Logger;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

public class Utils {
    public static List<Map<String, Object>> getMaps(String meetingId, String url, RestTemplate restTemplate, ParameterizedTypeReference<List<Map<String, Object>>> responseType, Logger log) {
        List<Map<String, Object>> tasks = restTemplate.exchange(
                url, HttpMethod.GET, null, responseType
        ).getBody();

        if (tasks != null && !tasks.isEmpty()) {
            log.info("Successfully fetched {} groups for meeting: {}", tasks.size(), meetingId);
            return tasks;
        }
        return null;
    }
}
