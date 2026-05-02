package com.meetup.tweeningservice.domain.node;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

import java.time.LocalDateTime;

@Node("Meeting")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingNode {

    @Id
    private String id;

    private String title;

    private String type;

    private LocalDateTime startedAt;
}
