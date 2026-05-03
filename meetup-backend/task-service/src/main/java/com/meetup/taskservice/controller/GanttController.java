package com.meetup.taskservice.controller;

import com.meetup.taskservice.dto.gantt.GanttResponseDto;
import com.meetup.taskservice.service.GanttService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/tasks/gantt")
@RequiredArgsConstructor
public class GanttController {

    private final GanttService ganttService;

    @GetMapping
    public ResponseEntity<GanttResponseDto> getGantt() {
        return ResponseEntity.ok(ganttService.getGanttData());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<GanttResponseDto> getGanttByCategory(@PathVariable UUID categoryId) {
        return ResponseEntity.ok(ganttService.getGanttDataByCategory(categoryId));
    }
}
