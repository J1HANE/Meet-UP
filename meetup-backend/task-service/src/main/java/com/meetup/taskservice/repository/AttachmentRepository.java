package com.meetup.taskservice.repository;

import com.meetup.taskservice.domain.entity.Attachment;
import org.springframework.data.repository.CrudRepository;

import java.util.UUID;

public interface AttachmentRepository extends CrudRepository<Attachment, UUID> {
}
