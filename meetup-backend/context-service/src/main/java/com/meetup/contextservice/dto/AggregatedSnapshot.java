package com.meetup.contextservice.dto;

import java.util.List;
import java.util.Map;

public record AggregatedSnapshot(
        List<Map<String, Object>> tasks,
        List<Map<String, Object>> groups
) {}
