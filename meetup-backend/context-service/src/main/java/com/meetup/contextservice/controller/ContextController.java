package com.meetup.contextservice.controller;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.meetup.contextservice.dto.AggregatedSnapshot;
import com.meetup.contextservice.dto.CreateDecisionRequest;
import com.meetup.contextservice.dto.CreateMeetingContextRequest;
import com.meetup.contextservice.model.MeetingContext;
import com.meetup.contextservice.service.ContextService;
import lombok.RequiredArgsConstructor;
import com.meetup.contextservice.config.AuthenticatedUser;
import org.springframework.security.core.Authentication;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/context")
@RequiredArgsConstructor
@Tag(name = "Context Service", description = "API pour la gestion des contextes de réunion")
public class ContextController {

    private final ContextService contextService;

    @PostMapping
    @Operation(summary = "Créer un contexte de réunion", description = "Crée un nouveau contexte de réunion avec les participants et les informations de base")
    public ResponseEntity<MeetingContext> createMeetingContext(
            @Parameter(description = "Détails du contexte de réunion à créer") @RequestBody CreateMeetingContextRequest request,
            Authentication authentication) {
        // For testing without authentication, use empty tweenIds
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.createMeetingContext(request, userTweenIds));
    }

    @GetMapping("/{meetingId}")
    @Operation(summary = "Récupérer un contexte de réunion", description = "Récupère le contexte complet d'une réunion par son ID")
    public ResponseEntity<MeetingContext> getMeetingContext(
            @Parameter(description = "ID de la réunion") @PathVariable UUID meetingId,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.getMeetingContext(meetingId, userTweenIds));
    }

    @DeleteMapping("/{meetingId}")
    @Operation(summary = "Supprimer un contexte de réunion", description = "Supprime le contexte d'une réunion par son ID")
    public ResponseEntity<Void> deleteMeetingContext(
            @Parameter(description = "ID de la réunion") @PathVariable UUID meetingId,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        contextService.deleteMeetingContext(meetingId, userTweenIds);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/briefing")
    @Operation(summary = "Obtenir un briefing de réunion", description = "Génère un briefing résumé pour une réunion à venir")
    public ResponseEntity<MeetingContext> getBriefing(
            @Parameter(description = "ID de la réunion") @RequestParam UUID meetingId,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.getBriefing(meetingId, userTweenIds));
    }

    @GetMapping("/decisions")
    @Operation(summary = "Récupérer les décisions d'un groupe", description = "Récupère toutes les décisions prises dans un groupe")
    public ResponseEntity<List<MeetingContext.Decision>> getDecisions(
            @Parameter(description = "ID du groupe") @RequestParam UUID groupId,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.getDecisions(groupId, userTweenIds));
    }

    @PatchMapping("/{meetingId}/summary")
    @Operation(summary = "Mettre à jour le résumé", description = "Met à jour le résumé d'une réunion")
    public ResponseEntity<Void> updateSummary(
            @Parameter(description = "ID de la réunion") @PathVariable UUID meetingId,
            @Parameter(description = "Contenu du résumé") @RequestBody Map<String, String> body,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        contextService.updateSummary(meetingId, body.get("summary"), userTweenIds);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{meetingId}/transcript")
    @Operation(summary = "Ajouter un extrait de transcription", description = "Ajoute un extrait de transcription à une réunion")
    public ResponseEntity<MeetingContext> addTranscriptChunk(
            @Parameter(description = "ID de la réunion") @PathVariable UUID meetingId,
            @Parameter(description = "Extrait de transcription") @RequestBody MeetingContext.TranscriptChunk chunk,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.addTranscriptChunk(meetingId, chunk, userTweenIds));
    }

    @PostMapping("/{meetingId}/decisions")
    @Operation(summary = "Ajouter une décision", description = "Ajoute une décision prise lors d'une réunion")
    public ResponseEntity<MeetingContext> addDecision(
            @Parameter(description = "ID de la réunion") @PathVariable UUID meetingId,
            @Parameter(description = "Détails de la décision") @RequestBody CreateDecisionRequest request,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.addDecision(meetingId, request, userTweenIds));
    }

    @PostMapping("/{meetingId}/tasks")
    @Operation(summary = "Ajouter une référence de tâche", description = "Associe une tâche à une réunion")
    public ResponseEntity<MeetingContext> addTaskReference(
            @Parameter(description = "ID de la réunion") @PathVariable UUID meetingId,
            @Parameter(description = "ID de la tâche") @RequestBody Map<String, UUID> body,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.addTaskReference(meetingId, body.get("taskId"), userTweenIds));
    }

    @PatchMapping("/{meetingId}/status")
    @Operation(summary = "Mettre à jour le statut", description = "Met à jour le statut d'une réunion")
    public ResponseEntity<MeetingContext> updateMeetingStatus(
            @Parameter(description = "ID de la réunion") @PathVariable UUID meetingId,
            @Parameter(description = "Nouveau statut") @RequestBody Map<String, String> body,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.updateMeetingStatus(meetingId, body.get("status"), userTweenIds));
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher des contextes", description = "Recherche des contextes de réunion par mot-clé, groupe ou statut")
    public ResponseEntity<List<MeetingContext>> searchContexts(
            @Parameter(description = "Mot-clé de recherche") @RequestParam String query,
            @Parameter(description = "Filtrer par groupe") @RequestParam(required = false) UUID groupId,
            @Parameter(description = "Filtrer par statut") @RequestParam(required = false) String status,
            @Parameter(description = "Limite de résultats") @RequestParam(required = false, defaultValue = "10") int limit,
            @Parameter(description = "Offset pour pagination") @RequestParam(required = false, defaultValue = "0") int offset,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.searchContexts(query, groupId, status, limit, offset, userTweenIds));
    }

    @GetMapping("/{meetingId}/snapshot")
    @Operation(summary = "Obtenir un snapshot agrégé", description = "Récupère un snapshot agrégé des données d'une réunion")
    public ResponseEntity<AggregatedSnapshot> getAggregatedSnapshot(@Parameter(description = "ID de la réunion") @PathVariable String meetingId) {
        return ResponseEntity.ok(contextService.getAggregatedSnapshot(meetingId));
    }
}
