package com.meetup.aiservice.model;

import lombok.Data;

@Data
public class SummariseRequest {
    private String meetingId;
    /** Optional: if true, bypasses Cache B and forces a fresh LLM call */
    private boolean forceRefresh = false;
}
