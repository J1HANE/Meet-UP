package com.meetup.tweeningservice.controller;

import com.meetup.tweeningservice.domain.node.GroupNode;
import com.meetup.tweeningservice.domain.node.PersonNode;
import com.meetup.tweeningservice.service.GroupService;
import com.meetup.tweeningservice.service.MembershipResolverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final MembershipResolverService membershipResolverService;

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
}
