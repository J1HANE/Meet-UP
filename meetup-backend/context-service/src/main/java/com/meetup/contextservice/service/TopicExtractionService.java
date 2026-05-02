package com.meetup.contextservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TopicExtractionService {

    /**
     * Extracts keywords from a list of transcript texts using a simplified TF-IDF-like approach.
     * In a real system, you'd compare against a global corpus. 
     * Here we treat the current meeting as the document.
     */
    public List<String> extractTopics(List<String> texts) {
        if (texts == null || texts.isEmpty()) return Collections.emptyList();

        String combinedText = String.join(" ", texts).toLowerCase();
        String[] words = combinedText.split("\\s+");

        Map<String, Integer> wordCounts = new HashMap<>();
        Set<String> stopWords = new HashSet<>(Arrays.asList(
            "the", "and", "a", "to", "of", "in", "is", "i", "that", "it", "for", "you", "we", "on", "with"
        ));

        for (String word : words) {
            word = word.replaceAll("[^a-zA-Z]", "");
            if (word.length() > 3 && !stopWords.contains(word)) {
                wordCounts.put(word, wordCounts.getOrDefault(word, 0) + 1);
            }
        }

        return wordCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
}
