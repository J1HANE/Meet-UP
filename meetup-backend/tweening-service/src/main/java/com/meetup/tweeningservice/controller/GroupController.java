package com.meetup.tweeningservice.controller;

import com.meetup.tweeningservice.domain.node.GroupNode;
import com.meetup.tweeningservice.domain.node.PersonNode;
import com.meetup.tweeningservice.service.GroupService;
import com.meetup.tweeningservice.service.MembershipResolverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final MembershipResolverService membershipResolverService;

    @GetMapping
    public ResponseEntity<List<GroupNode>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupNode> getGroupById(@PathVariable String groupId) {
        return ResponseEntity.ok(groupService.getGroupById(groupId));
    }

    @PostMapping("/form")
    public ResponseEntity<GroupNode> formGroup(@RequestParam String taskId, 
                                               @RequestParam String meetingId, 
                                               @RequestParam String ownerId) {
        return ResponseEntity.ok(groupService.formGroup(taskId, meetingId, ownerId));
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<Void> joinGroup(@PathVariable String groupId, 
                                          @RequestParam String personId, 
                                          @RequestParam String role) {
        groupService.joinGroup(groupId, personId, role);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<Void> leaveGroup(@PathVariable String groupId, 
                                           @RequestParam String personId) {
        groupService.leaveGroup(groupId, personId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{groupId}/transfer")
    public ResponseEntity<Void> transferLead(@PathVariable String groupId, 
                                             @RequestParam String oldLeadId, 
                                             @RequestParam String newLeadId) {
        groupService.transferLead(groupId, oldLeadId, newLeadId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{groupId}/split")
    public ResponseEntity<Void> splitGroup(@PathVariable String groupId, 
                                           @RequestParam String newGroupName) {
        groupService.splitGroup(groupId, newGroupName);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{targetGroupId}/merge")
    public ResponseEntity<Void> mergeGroups(@PathVariable String targetGroupId, 
                                            @RequestParam String sourceGroupId) {
        groupService.mergeGroups(targetGroupId, sourceGroupId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{groupId}/dissolve")
    public ResponseEntity<Void> dissolveGroup(@PathVariable String groupId) {
        groupService.dissolveGroup(groupId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<PersonNode>> suggestMembers(@RequestParam String taskId, 
                                                           @RequestParam String creatorId) {
        return ResponseEntity.ok(membershipResolverService.suggestMembersForTask(taskId, creatorId));
    }

    @GetMapping("/people")
    public ResponseEntity<List<PersonNode>> getAllPeople() {
        return ResponseEntity.ok(groupService.getAllPeople());
    }

    @GetMapping("/workload")
    public ResponseEntity<List<Map<String, Object>>> getActiveWorkloads() {
        return ResponseEntity.ok(groupService.getActiveWorkloads());
    }

    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<List<GroupNode>> getGroupsByMeetingId(@PathVariable String meetingId) {
        return ResponseEntity.ok(groupService.getGroupsByMeetingId(meetingId));
    }

    @GetMapping("/{groupId}/context")
    public ResponseEntity<Map<String, Object>> getContextData(@PathVariable String groupId) {
        return ResponseEntity.ok(groupService.getContextData(groupId));
    }
}
