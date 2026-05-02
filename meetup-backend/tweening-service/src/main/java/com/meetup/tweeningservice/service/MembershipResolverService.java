package com.meetup.tweeningservice.service;

import com.meetup.tweeningservice.domain.node.PersonNode;
import com.meetup.tweeningservice.repository.PersonRepository;
import com.meetup.tweeningservice.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipResolverService {

    private final PersonRepository personRepository;
    private final TaskRepository taskRepository;

    public List<PersonNode> suggestMembersForTask(String taskId, String creatorId) {
        log.info("Suggesting members for task {} created by {}", taskId, creatorId);

        // 1. Fetch collaborators based on previous connections and recency
        List<PersonNode> collaborators = personRepository.findCollaboratorsByRecency(creatorId);

        // 2. Fetch people based on similar task topic tags
        List<PersonNode> tagMatches = new ArrayList<>();
        taskRepository.findById(taskId).ifPresent(task -> {
            if ((task.getTags() != null) && !task.getTags().isEmpty()) {
                tagMatches.addAll(personRepository.findPeopleBySimilarTaskTags(task.getTags()));
            }
        });

        // 3. Rank suggestions (simple ranking logic without LLM as per spec)
        // Score = (Present in collaborators * 2) + (Present in tagMatches * 1)
        Map<String, PersonNode> uniquePeople = new HashMap<>();
        Map<String, Integer> scores = new HashMap<>();

        for (PersonNode p : collaborators) {
            uniquePeople.put(p.getId(), p);
            scores.put(p.getId(), scores.getOrDefault(p.getId(), 0) + 2);
        }

        for (PersonNode p : tagMatches) {
            uniquePeople.put(p.getId(), p);
            // Don't suggest the creator themselves based on tags
            if (!p.getId().equals(creatorId)) {
                scores.put(p.getId(), scores.getOrDefault(p.getId(), 0) + 1);
            }
        }

        return scores.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .map(entry -> uniquePeople.get(entry.getKey()))
                .collect(Collectors.toList());
    }
}
