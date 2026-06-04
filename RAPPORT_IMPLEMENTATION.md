# Rapport d'Implémentation - Projet Meet-UP

**Auteur:** Développeur principal  
**Date:** 4 juin 2026  
**Projet:** Meet-UP - Plateforme de collaboration en ligne

---

## Table des matières

1. [Vue d'ensemble du projet](#vue-densemble-du-projet)
2. [Auth Service](#auth-service)
3. [Context Service](#context-service)
4. [API Gateway](#api-gateway)
5. [Intégration et Architecture](#intégration-et-architecture)
6. [Technologies Utilisées](#technologies-utilisées)
7. [Conclusion](#conclusion)

---

## Vue d'ensemble du projet

Le projet Meet-UP est une plateforme de collaboration en ligne architecturée selon une approche microservices. L'implémentation réalisée couvre trois composants principaux :

- **Auth Service** : Service d'authentification et d'autorisation
- **Context Service** : Service de gestion des contextes de réunion
- **API Gateway** : Passerelle API avec validation JWT et routage de services

Ces services communiquent entre eux via des appels HTTP REST et des événements RabbitMQ pour une architecture événementielle.

---

## Auth Service

### Description

L'Auth Service est le microservice responsable de l'authentification des utilisateurs, de la gestion des comptes utilisateurs et de l'émission de tokens JWT. Il sert de point d'entrée centralisé pour l'identité dans l'ensemble du système.

### Stack Technique

- **Java 17**
- **Spring Boot 3.2.5**
- **Spring Security 6**
- **Spring Data JPA**
- **PostgreSQL** (base de données)
- **JWT (jjwt 0.12.5)** - HMAC-SHA256
- **RabbitMQ** - pour les événements
- **Lombok**
- **Maven**
- **SpringDoc OpenAPI 2.3.0** - Documentation Swagger

### Modèle de Données

#### User (Utilisateur)

Le modèle `User` contient les champs suivants :

- **id** : UUID (clé primaire)
- **email** : String (unique)
- **password** : String (hashé avec BCrypt)
- **displayName** : String
- **roles** : List<String> (ex: "member", "admin")
- **tweenIds** : List<UUID> (groupes d'appartenance)
- **topics** : List<String> (sujets d'intérêt)
- **active** : Boolean
- **createdAt** : LocalDateTime
- **updatedAt** : LocalDateTime
- **lastLoginAt** : LocalDateTime
- **bio** : String
- **location** : String
- **recoveryEmail** : String
- **avatarUrl** : String
- **phone** : String
- **meetingReminders** : Boolean (préférence)
- **taskDigest** : Boolean (préférence)
- **profileVisibility** : Boolean (préférence)
- **twoFactorEnabled** : Boolean
- **twoFactorSecret** : String
- **emailVerified** : Boolean
- **emailVerifiedAt** : LocalDateTime

#### Tables secondaires

- **user_roles** : Association utilisateur-rôles
- **user_tweens** : Association utilisateur-groupes
- **user_topics** : Association utilisateur-sujets
- **refresh_tokens** : Tokens de rafraîchissement
- **email_verification_tokens** : Tokens de vérification email
- **password_reset_tokens** : Tokens de réinitialisation mot de passe

### Endpoints API

#### Authentification

| Endpoint | Méthode | Description | Auth Requise |
|----------|---------|-------------|--------------|
| `/api/auth/register` | POST | Enregistrement d'un nouvel utilisateur | Non |
| `/api/auth/login` | POST | Connexion et génération de tokens JWT | Non |
| `/api/auth/logout` | POST | Révocation du refresh token | Oui |
| `/api/auth/refresh` | POST | Rafraîchissement du access token | Non |

#### Gestion de Profil

| Endpoint | Méthode | Description | Auth Requise |
|----------|---------|-------------|--------------|
| `/api/auth/me` | GET | Récupérer les infos de l'utilisateur connecté | Oui |
| `/api/auth/me` | PATCH | Mettre à jour le profil utilisateur | Oui |
| `/api/auth/me` | DELETE | Supprimer le compte utilisateur | Oui |
| `/api/auth/users` | GET | Lister tous les utilisateurs (admin) | Oui (admin) |
| `/api/auth/users/{userId}/roles` | PATCH | Mettre à jour les rôles d'un utilisateur (admin) | Oui (admin) |
| `/api/auth/users/search` | GET | Rechercher des utilisateurs (admin) | Oui (admin) |

#### Sécurité

| Endpoint | Méthode | Description | Auth Requise |
|----------|---------|-------------|--------------|
| `/api/auth/change-password` | POST | Changer le mot de passe | Oui |
| `/api/auth/2fa/setup` | POST | Configuration 2FA | Oui |
| `/api/auth/2fa/enable` | POST | Activer 2FA | Oui |
| `/api/auth/2fa/disable` | POST | Désactiver 2FA | Oui |

#### Email

| Endpoint | Méthode | Description | Auth Requise |
|----------|---------|-------------|--------------|
| `/api/auth/send-verification-email` | POST | Envoyer email de vérification | Oui |
| `/api/auth/verify-email` | POST | Vérifier l'email | Non |
| `/api/auth/request-password-reset` | POST | Demander réinitialisation mot de passe | Non |
| `/api/auth/reset-password` | POST | Réinitialiser le mot de passe | Non |

#### JWKS (Public Key Distribution)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/.well-known/jwks.json` | GET | Endpoint JWKS pour distribution de clé publique |
| `/.well-known/jwt-config` | GET | Configuration JWT |

### Configuration de Sécurité

- **Password Encoding** : BCrypt avec strength 10
- **JWT Algorithm** : HMAC-SHA256
- **Access Token Expiration** : 15 minutes (configurable)
- **Refresh Token Expiration** : 7 jours (configurable)
- **Session Policy** : Stateless (JWT-based)

### Événements RabbitMQ

L'Auth Service publie les événements suivants sur RabbitMQ :

- **user.registered** : Lorsqu'un nouvel utilisateur s'inscrit
  - Données : `{ userId, name, email, role }`
- **user.updated** : Lorsqu'un profil utilisateur est mis à jour
  - Données : `{ userId, name, email, updatedRole }`
- **member.joined** : Lorsqu'un membre rejoint un groupe
- **member.left** : Lorsqu'un membre quitte un groupe

**Exchanges configurés :**
- `group-events-exchange` : Événements de groupe
- `auth-events-exchange` : Événements d'authentification

### DTOs Implémentés

- `AuthResponse` : Réponse d'authentification (tokens)
- `LoginRequest` : Requête de connexion
- `RegisterRequest` : Requête d'inscription
- `RefreshRequest` : Requête de rafraîchissement
- `UserResponse` : Réponse utilisateur
- `UpdateProfileRequest` : Mise à jour profil
- `UpdateRolesRequest` : Mise à jour rôles
- `ChangePasswordRequest` : Changement mot de passe
- `Enable2FARequest` / `Disable2FARequest` : Gestion 2FA
- `Setup2FAResponse` : Réponse configuration 2FA
- `VerifyEmailRequest` : Vérification email
- `RequestPasswordResetRequest` / `ResetPasswordRequest` : Réinitialisation mot de passe
- `ErrorResponse` : Format d'erreur standardisé

### Gestion des Exceptions

Exceptions personnalisées implémentées :

- `AuthException` : Exception de base pour l'authentification
- `UserAlreadyExistsException` : Utilisateur déjà existant (409)
- `UserNotFoundException` : Utilisateur non trouvé (404)
- `InvalidCredentialsException` : Identifiants invalides (401)
- `TokenRefreshException` : Échec rafraîchissement token (403)

### Fichiers Principaux

- `AuthController.java` : Contrôleur REST
- `AuthServiceImpl.java` : Implémentation service métier
- `SecurityConfig.java` : Configuration Spring Security
- `JwtAuthenticationFilter.java` : Filtre JWT
- `JwtUtil.java` : Utilitaires JWT
- `UserDetailsServiceImpl.java` : Service détails utilisateur
- `RabbitMQConfig.java` : Configuration RabbitMQ
- `RabbitMQEventPublisher.java` : Publication événements
- `UserTweenListener.java` : Écouteur événements tween
- `OpenApiConfig.java` : Configuration Swagger/OpenAPI

### Documentation Swagger

L'Auth Service dispose d'une documentation interactive Swagger/OpenAPI accessible via :

- **Swagger UI** : `http://localhost:8081/swagger-ui.html`
- **OpenAPI JSON** : `http://localhost:8081/v3/api-docs`

La documentation inclut :
- Tous les endpoints avec leurs méthodes HTTP
- Schémas des DTOs (Request/Response)
- Configuration de l'authentification JWT (Bearer token)
- Exemples de requêtes/réponses

---

## Context Service

### Description

Le Context Service est responsable de la gestion des contextes de réunion, incluant les transcriptions, les décisions, les tâches associées et les sujets abordés. Il stocke ces données dans MongoDB et communique avec d'autres services via des clients REST.

### Stack Technique

- **Java 17**
- **Spring Boot 3.2.5**
- **Spring Data MongoDB**
- **MongoDB** (base de données NoSQL)
- **Redis** (cache)
- **RabbitMQ** (événements)
- **Lombok**
- **Maven**
- **SpringDoc OpenAPI 2.3.0** - Documentation Swagger

### Modèle de Données

#### MeetingContext

Le modèle `MeetingContext` contient :

- **id** : String (MongoDB internal ID)
- **meetingId** : UUID (identifiant de la réunion)
- **participantIds** : List<UUID> (participants)
- **tweenGroupIds** : List<UUID> (groupes tween)
- **transcript** : List<TranscriptChunk> (transcription)
- **decisions** : List<Decision> (décisions prises)
- **tasksRef** : List<UUID> (références aux tâches)
- **topics** : List<String> (sujets abordés)
- **summary** : String (résumé de la réunion)
- **status** : MeetingStatus (LIVE ou COMPLETE)
- **createdAt** : LocalDateTime
- **updatedAt** : LocalDateTime
- **tasks** : List<Map<String, Object>> (données tâches cachées)

#### TranscriptChunk

- **speakerId** : String
- **text** : String
- **timestamp** : LocalDateTime

#### Decision

- **text** : String
- **attributedSpeakerId** : String
- **meetingId** : UUID
- **timestamp** : LocalDateTime

#### MeetingStatus (Enum)

- **LIVE** : Réunion en cours
- **COMPLETE** : Réunion terminée

### Endpoints API

#### Gestion des Contextes

| Endpoint | Méthode | Description | Auth Requise |
|----------|---------|-------------|--------------|
| `/api/context` | POST | Créer un contexte de réunion | Oui |
| `/api/context/{meetingId}` | GET | Récupérer un contexte de réunion | Oui |
| `/api/context/{meetingId}` | DELETE | Supprimer un contexte de réunion | Oui |
| `/api/context/briefing` | GET | Générer un briefing de réunion | Oui |
| `/api/context/search` | GET | Rechercher des contextes | Oui |

#### Manipulation du Contenu

| Endpoint | Méthode | Description | Auth Requise |
|----------|---------|-------------|--------------|
| `/api/context/{meetingId}/transcript` | POST | Ajouter un chunk de transcription | Oui |
| `/api/context/{meetingId}/decisions` | POST | Ajouter une décision | Oui |
| `/api/context/{meetingId}/tasks` | POST | Ajouter une référence de tâche | Oui |
| `/api/context/{meetingId}/summary` | PATCH | Mettre à jour le résumé | Oui |
| `/api/context/{meetingId}/status` | PATCH | Mettre à jour le statut | Oui |

#### Décisions

| Endpoint | Méthode | Description | Auth Requise |
|----------|---------|-------------|--------------|
| `/api/context/decisions` | GET | Récupérer les décisions d'un groupe | Oui |

#### Snapshot Agrégé

| Endpoint | Méthode | Description | Auth Requise |
|----------|---------|-------------|--------------|
| `/api/context/{meetingId}/snapshot` | GET | Récupérer un snapshot agrégé | Oui |

### Clients REST

Le Context Service communique avec d'autres services via :

- **TaskServiceClient** : Communication avec le Task Service
  - Récupération des tâches par meetingId
- **SnapshotAggregatorClient** : Communication avec un agrégateur de snapshots
- **TweeningServiceClient** : Communication avec le Tweening Service

### Authentification

Le Context Service utilise une authentification basée sur les headers propagés par l'API Gateway :

- **X-User-Id** : Identifiant utilisateur
- **X-User-Email** : Email utilisateur
- **X-User-Roles** : Rôles utilisateur (séparés par virgule)
- **X-User-TweenIds** : IDs des groupes tween (séparés par virgule)

Le filtre `GatewayHeaderAuthenticationFilter` extrait ces headers et crée un `AuthenticatedUser` dans le contexte de sécurité Spring.

### Contrôle d'Accès

Le service implémente un contrôle d'accès basé sur les groupes tween :

- Un utilisateur ne peut accéder qu'aux contextes des groupes auxquels il appartient
- La validation est effectuée via la méthode `validateAccess()`
- Pour les tests, la validation est ignorée si `userTweenIds` est vide

### Caching

- Utilisation de Spring Cache avec Redis
- Méthode `getBriefing()` annotée avec `@Cacheable`
- Clé de cache basée sur le `meetingId`

### Service Métier

Le `ContextService` implémente les fonctionnalités suivantes :

- **createMeetingContext** : Création avec validation d'accès
- **getMeetingContext** : Récupération avec fetching des tâches associées
- **deleteMeetingContext** : Suppression avec validation
- **getBriefing** : Génération automatique de résumé si absent
- **getDecisions** : Récupération des décisions par groupe
- **updateSummary** : Mise à jour du résumé
- **addTranscriptChunk** : Ajout de transcription avec timestamp auto
- **addDecision** : Ajout de décision avec timestamp auto
- **addTaskReference** : Ajout de référence de tâche
- **updateMeetingStatus** : Mise à jour du statut (LIVE/COMPLETE)
- **searchContexts** : Recherche full-text basique (summary + transcript)
- **getAggregatedSnapshot** : Récupération snapshot agrégé

### DTOs Implémentés

- `CreateMeetingContextRequest` : Création contexte
- `CreateDecisionRequest` : Création décision
- `AggregatedSnapshot` : Snapshot agrégé
- `TaskSnapshot` : Snapshot de tâche

### Configuration

- **MongoDB** : Base de données principale
- **Redis** : Cache pour les briefings
- **RabbitMQ** : Événements de contexte
- **Task Service URL** : Configurable (service discovery)

### Fichiers Principaux

- `ContextController.java` : Contrôleur REST
- `ContextService.java` : Service métier
- `MeetingContext.java` : Modèle de données
- `MeetingContextRepository.java` : Repository MongoDB
- `GatewayHeaderAuthenticationFilter.java` : Filtre d'authentification gateway
- `AuthenticatedUser.java` : Principal personnalisé
- `TaskServiceClient.java` : Client Task Service
- `SnapshotAggregatorClient.java` : Client agrégateur
- `TopicExtractionService.java` : Service d'extraction de sujets
- `RabbitMQConfig.java` : Configuration RabbitMQ
- `ContextIngestionListener.java` : Écouteur événements contexte
- `OpenApiConfig.java` : Configuration Swagger/OpenAPI

### Documentation Swagger

Le Context Service dispose d'une documentation interactive Swagger/OpenAPI accessible via :

- **Swagger UI** : `http://localhost:8084/swagger-ui.html`
- **OpenAPI JSON** : `http://localhost:8084/v3/api-docs`

La documentation inclut :
- Tous les endpoints avec leurs méthodes HTTP
- Schémas des DTOs (Request/Response)
- Configuration de l'authentification JWT (Bearer token + headers gateway)
- Exemples de requêtes/réponses

---

## API Gateway

### Description

L'API Gateway sert de point d'entrée unique pour toutes les requêtes client. Elle implémente la validation JWT, le routage vers les microservices appropriés, la propagation des headers utilisateur, et des patterns de résilience (circuit breaker, retry).

### Stack Technique

- **Java 17**
- **Spring Boot 3.2.5**
- **Spring Cloud Gateway**
- **Spring Security WebFlux**
- **JWT (jjwt 0.12.5)**
- **Resilience4j** (Circuit Breaker)
- **Lombok**
- **Maven**
- **SpringDoc OpenAPI 2.3.0** - Documentation Swagger

### Configuration de Routage

L'API Gateway route les requêtes vers les services suivants :

| Route ID | URI | Path Pattern | Port |
|----------|-----|--------------|------|
| auth-service | http://localhost:8081 | /api/auth/** | 8081 |
| context-service | http://localhost:8084 | /api/context/** | 8084 |
| task-service | http://localhost:8091 | /api/tasks/** | 8091 |
| meeting-service | http://localhost:8083 | /api/meetings/** | 8083 |

**Note :** En environnement Docker, les URIs utilisent le service discovery (`lb://service-name`).

### Validation JWT

Le filtre `JwtAuthFilter` implémente la validation JWT :

- **Algorithme** : HMAC-SHA256
- **Secret** : Configurable via `jwt.secret`
- **Activation** : Configurable via `gateway.jwt.enabled`
- **Paths exclus** : Login, register, refresh, verify-email, password-reset, actuator

#### Processus de Validation

1. Extraction du token depuis le header `Authorization: Bearer <token>`
2. Validation de la signature avec la clé secrète partagée
3. Vérification du type de token (doit être "access")
4. Extraction des claims (userId, email, roles, tweenIds)
5. Propagation des headers vers les services downstream :
   - `X-User-Id`
   - `X-User-Email`
   - `X-User-Roles`
   - `X-User-TweenIds`
   - `Authorization` (header original conservé)

### Configuration CORS

La gateway configure CORS pour autoriser les requêtes depuis :

- `http://localhost:*`
- `http://127.0.0.1:*`
- `https://localhost:*`
- `https://127.0.0.1:*`

Méthodes autorisées : GET, POST, PUT, PATCH, DELETE, OPTIONS

### Configuration de Sécurité

- **CSRF** : Désactivé (stateless)
- **Security Context** : NoOpServerSecurityContextRepository
- **Autorisation** : Permet tous les échanges (la validation JWT est gérée par le filtre personnalisé)

### Circuit Breaker (Resilience4j)

Configuration du circuit breaker :

- **failure-rate-threshold** : 50%
- **wait-duration-in-open-state** : 1s
- **sliding-window-size** : 10
- **permitted-number-of-calls-in-half-open-state** : 5
- **slow-call-rate-threshold** : 50%
- **slow-call-duration-threshold** : 2s

Instances configurées pour :
- auth-service
- context-service
- task-service

### Configuration de Retry

- **max-attempts** : 3
- **initial-backoff** : 100ms
- **max-backoff** : 1000ms
- **multiplier** : 2.0

### Timeouts

- **connect timeout** : 5000ms
- **read timeout** : 10000ms
- **write timeout** : 10000ms

### Actuator

Endpoints exposés :
- `/actuator/health`
- `/actuator/info`
- `/actuator/metrics`
- `/actuator/gateway`

### Filtres Implémentés

- **JwtAuthFilter** : Validation JWT et propagation headers
- **LoggingFilter** : Logging des requêtes/réponses
- **RateLimitFilter** : Limitation de taux (optionnel)

### Configuration

- **Response Cache** : Désactivé par défaut (`gateway.cache.enabled=false`)
- **DedupeResponseHeader** : Évite les doublons de headers CORS

### Fichiers Principaux

- `JwtAuthFilter.java` : Filtre de validation JWT
- `SecurityConfig.java` : Configuration Spring Security WebFlux
- `GatewayConfig.java` : Configuration Gateway (timeouts, WebClient)
- `CircuitBreakerConfig.java` : Configuration Resilience4j
- `RetryConfig.java` : Configuration retry
- `RateLimitConfig.java` : Configuration rate limiting
- `GlobalErrorHandler.java` : Gestion globale des erreurs
- `LoggingFilter.java` : Filtre de logging
- `OpenApiConfig.java` : Configuration Swagger/OpenAPI

### Documentation Swagger

L'API Gateway dispose d'une documentation interactive Swagger/OpenAPI accessible via :

- **Swagger UI** : `http://localhost:8085/swagger-ui.html`
- **OpenAPI JSON** : `http://localhost:8085/v3/api-docs`

La documentation inclut :
- Configuration des routes vers les microservices
- Configuration de l'authentification JWT (Bearer token)
- Description du routage et de la propagation des headers
- Configuration du Circuit Breaker et Retry

---

## Intégration et Architecture

### Communication Inter-Services

#### HTTP REST

- **API Gateway → Auth Service** : Authentification, gestion utilisateurs
- **API Gateway → Context Service** : Gestion contextes de réunion
- **API Gateway → Task Service** : Gestion des tâches
- **API Gateway → Meeting Service** : Gestion des réunions
- **Context Service → Task Service** : Récupération des tâches par meetingId
- **Context Service → Snapshot Aggregator** : Récupération snapshots agrégés

#### RabbitMQ (Event-Driven)

**Exchanges :**
- `group-events-exchange` : Événements de groupe (member.joined, member.left)
- `auth-events-exchange` : Événements d'authentification

**Événements publiés par Auth Service :**
- `user.registered` : Nouvel utilisateur inscrit
- `user.updated` : Profil utilisateur mis à jour
- `member.joined` : Membre rejoint un groupe
- `member.left` : Membre quitte un groupe

**Écouteurs :**
- `UserTweenListener` (Auth Service) : Écoute les événements de groupe

### Flux d'Authentification

1. Client → API Gateway : Requête avec credentials
2. API Gateway : Route vers Auth Service (path excluded from JWT)
3. Auth Service : Valide credentials, génère JWT
4. Auth Service → Client : Retourne access token + refresh token
5. Client → API Gateway : Requête avec `Authorization: Bearer <token>`
6. API Gateway : Valide JWT, extrait claims, propage headers
7. API Gateway → Service downstream : Requête avec headers utilisateur
8. Service downstream : Valide accès via headers, traite requête

### Docker Compose

Configuration Docker pour l'orchestration :

- **Network** : `meet-up` (réseau dédié)
- **Services** :
  - mongodb
  - redis
  - postgres
  - rabbitmq
  - auth-service
  - context-service
  - task-service
  - meeting-service
  - api-gateway
- **Health Checks** : Configurés pour tous les services
- **Volumes** : `jwt_keys` pour les clés JWT
- **Environment Variables** : Configuration centralisée

### Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| JWT_SECRET | Secret JWT partagé | defaultSecretKey... |
| GATEWAY_JWT_ENABLED | Activation JWT gateway | true |
| TASK_SERVICE_URL | URL Task Service | http://task-service:8091 |
| DATABASE_URL | URL PostgreSQL | jdbc:postgresql://... |
| DATABASE_USERNAME | Username DB | postgres |
| DATABASE_PASSWORD | Password DB | postgres |

---

## Technologies Utilisées

### Backend

- **Java 17** : Langage principal
- **Spring Boot 3.2.5** : Framework d'application
- **Spring Security 6** : Sécurité
- **Spring Data JPA** : ORM pour PostgreSQL
- **Spring Data MongoDB** : ORM pour MongoDB
- **Spring Cloud Gateway** : API Gateway
- **RabbitMQ** : Message broker
- **Resilience4j** : Circuit breaker et retry

### Bases de Données

- **PostgreSQL** : Stockage utilisateurs (Auth Service)
- **MongoDB** : Stockage contextes de réunion (Context Service)
- **Redis** : Cache (Context Service)

### Sécurité

- **JWT (jjwt 0.12.5)** : Tokens d'authentification
- **BCrypt** : Hashage des mots de passe
- **HMAC-SHA256** : Signature JWT

### Outils de Développement

- **Maven** : Gestion des dépendances
- **Lombok** : Réduction de code boilerplate
- **Docker** : Conteneurisation
- **Docker Compose** : Orchestration

### Monitoring

- **Spring Boot Actuator** : Health checks, metrics
- **Resilience4j** : Monitoring circuit breaker

---

## Conclusion

L'implémentation réalisée couvre les trois composants principaux demandés :

### Auth Service

- Système d'authentification complet avec JWT
- Gestion des utilisateurs et des rôles
- Support 2FA (Two-Factor Authentication)
- Vérification email et réinitialisation mot de passe
- Publication d'événements RabbitMQ pour l'intégration
- Endpoint JWKS pour distribution de clés

### Context Service

- Gestion des contextes de réunion avec MongoDB
- Stockage des transcriptions, décisions et tâches
- Authentification basée sur les headers gateway
- Contrôle d'accès par groupes tween
- Caching avec Redis
- Communication avec Task Service et Snapshot Aggregator
- Recherche full-text basique
- Génération automatique de briefings

### API Gateway

- Point d'entrée unique pour le système
- Validation JWT centralisée
- Propagation des headers utilisateur
- Routage vers les microservices
- Configuration CORS
- Circuit Breaker (Resilience4j)
- Retry automatique
- Configuration flexible (activation/désactivation JWT)

### Points Forts

- **Architecture microservices** : Découpage clair des responsabilités
- **Sécurité** : JWT avec validation centralisée, BCrypt pour les mots de passe
- **Résilience** : Circuit breaker et retry configurés
- **Extensibilité** : Événements RabbitMQ pour intégration future
- **Flexibilité** : Configuration externalisée, activation/désactivation de fonctionnalités
- **Observabilité** : Actuator pour monitoring et health checks

### Améliorations Possibles

- Implémentation de RSA pour JWT (au lieu de HMAC)
- Activation du cache de réponse au niveau de la gateway
- Implémentation de rate limiting
- Ajout de métriques détaillées et monitoring avancé
- Tests d'intégration plus complets
- Documentation OpenAPI/Swagger pour chaque service

Cette implémentation fournit une base solide et extensible pour la plateforme Meet-UP, avec une séparation claire des responsabilités et une architecture moderne basée sur les microservices.
