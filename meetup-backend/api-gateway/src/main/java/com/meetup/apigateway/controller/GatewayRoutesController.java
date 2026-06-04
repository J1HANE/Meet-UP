package com.meetup.apigateway.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "API Gateway Routes", description = "Routes de l'API Gateway vers les services en aval")
public class GatewayRoutesController {

    @GetMapping("/auth/**")
    @Operation(summary = "Auth Service Routes", description = "Routes vers l'Auth Service (port 8081)")
    public Map<String, String> authRoutes() {
        Map<String, String> routes = new HashMap<>();
        routes.put("POST /api/auth/register", "Enregistrement d'un nouvel utilisateur");
        routes.put("POST /api/auth/login", "Connexion utilisateur");
        routes.put("POST /api/auth/refresh", "Rafraîchissement du token JWT");
        routes.put("POST /api/auth/verify-email", "Vérification de l'email");
        routes.put("POST /api/auth/request-password-reset", "Demande de réinitialisation du mot de passe");
        routes.put("POST /api/auth/reset-password", "Réinitialisation du mot de passe");
        routes.put("GET /api/auth/profile", "Récupération du profil utilisateur");
        routes.put("PUT /api/auth/profile", "Mise à jour du profil utilisateur");
        routes.put("POST /api/auth/2fa/enable", "Activation de la 2FA");
        routes.put("POST /api/auth/2fa/verify", "Vérification du code 2FA");
        routes.put("POST /api/auth/2fa/disable", "Désactivation de la 2FA");
        return routes;
    }

    @GetMapping("/context/**")
    @Operation(summary = "Context Service Routes", description = "Routes vers le Context Service (port 8084)")
    public Map<String, String> contextRoutes() {
        Map<String, String> routes = new HashMap<>();
        routes.put("POST /api/context", "Création d'un contexte de réunion");
        routes.put("GET /api/context/{meetingId}", "Récupération d'un contexte de réunion");
        routes.put("DELETE /api/context/{meetingId}", "Suppression d'un contexte de réunion");
        routes.put("GET /api/context/briefing", "Obtenir un briefing de réunion");
        routes.put("GET /api/context/decisions", "Récupérer les décisions d'un groupe");
        routes.put("PATCH /api/context/{meetingId}/summary", "Mettre à jour le résumé");
        routes.put("POST /api/context/{meetingId}/transcript", "Ajouter un extrait de transcription");
        routes.put("POST /api/context/{meetingId}/decisions", "Ajouter une décision");
        routes.put("POST /api/context/{meetingId}/tasks", "Ajouter une référence de tâche");
        routes.put("PATCH /api/context/{meetingId}/status", "Mettre à jour le statut");
        routes.put("GET /api/context/search", "Rechercher des contextes");
        routes.put("GET /api/context/{meetingId}/snapshot", "Obtenir un snapshot agrégé");
        return routes;
    }

    @GetMapping("/tasks/**")
    @Operation(summary = "Task Service Routes", description = "Routes vers le Task Service (port 8091)")
    public Map<String, String> taskRoutes() {
        Map<String, String> routes = new HashMap<>();
        routes.put("POST /api/tasks", "Création d'une tâche");
        routes.put("GET /api/tasks", "Liste des tâches");
        routes.put("GET /api/tasks/{id}", "Récupération d'une tâche");
        routes.put("PUT /api/tasks/{id}", "Mise à jour d'une tâche");
        routes.put("DELETE /api/tasks/{id}", "Suppression d'une tâche");
        routes.put("PATCH /api/tasks/{id}/status", "Mise à jour du statut");
        routes.put("POST /api/tasks/{id}/assign", "Assignation d'une tâche");
        return routes;
    }

    @GetMapping("/meetings/**")
    @Operation(summary = "Meeting Service Routes", description = "Routes vers le Meeting Service (port 8083)")
    public Map<String, String> meetingRoutes() {
        Map<String, String> routes = new HashMap<>();
        routes.put("POST /api/meetings", "Création d'une réunion");
        routes.put("GET /api/meetings", "Liste des réunions");
        routes.put("GET /api/meetings/{id}", "Récupération d'une réunion");
        routes.put("PUT /api/meetings/{id}", "Mise à jour d'une réunion");
        routes.put("DELETE /api/meetings/{id}", "Suppression d'une réunion");
        routes.put("POST /api/meetings/{id}/participants", "Ajout d'un participant");
        routes.put("DELETE /api/meetings/{id}/participants/{userId}", "Suppression d'un participant");
        routes.put("POST /api/meetings/{id}/start", "Démarrage d'une réunion");
        routes.put("POST /api/meetings/{id}/end", "Fin d'une réunion");
        return routes;
    }

    @GetMapping("/notifications/**")
    @Operation(summary = "Notification Service Routes", description = "Routes vers le Notification Service")
    public Map<String, String> notificationRoutes() {
        Map<String, String> routes = new HashMap<>();
        routes.put("POST /api/notifications", "Création d'une notification");
        routes.put("GET /api/notifications", "Liste des notifications");
        routes.put("GET /api/notifications/{id}", "Récupération d'une notification");
        routes.put("PATCH /api/notifications/{id}/read", "Marquer comme lu");
        routes.put("DELETE /api/notifications/{id}", "Suppression d'une notification");
        return routes;
    }

    @GetMapping("/ai/**")
    @Operation(summary = "AI Service Routes", description = "Routes vers le AI Service")
    public Map<String, String> aiRoutes() {
        Map<String, String> routes = new HashMap<>();
        routes.put("POST /api/ai/transcribe", "Transcription audio");
        routes.put("POST /api/ai/summarize", "Résumé de texte");
        routes.put("POST /api/ai/extract-tasks", "Extraction de tâches");
        routes.put("POST /api/ai/extract-decisions", "Extraction de décisions");
        return routes;
    }
}
