package com.meetup.tweeningservice.domain.node;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

import java.util.List;

@Node("Task")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskNode {

    @Id
    private String id;

    private String title;

    private String status;

    private String priority;

    private List<String> tags;
}
