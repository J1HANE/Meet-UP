package com.meetup.tweeningservice.repository;

public interface WorkloadProjection {
    String getPersonId();
    String getName();
    Long getActiveTaskCount();
}
