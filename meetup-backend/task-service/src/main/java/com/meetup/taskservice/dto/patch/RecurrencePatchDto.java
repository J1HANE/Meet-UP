package com.meetup.taskservice.dto.patch;

import com.meetup.taskservice.domain.enums.RecurrenceInterval;

public record RecurrencePatchDto(RecurrenceInterval interval) {}