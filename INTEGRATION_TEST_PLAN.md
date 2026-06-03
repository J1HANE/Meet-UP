# Plan de Test d'Intégration Complet - Meet-UP

## Architecture des Services

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               FRONTEND (5173)                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY (8085)                                 │
│                    (JWT Validation, Routing, Headers)                        │
└─────────────────────────────────────────────────────────────────────────────┘
       │              │              │              │              │
       ▼              ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  AUTH    │  │ CONTEXT │  │  TASK    │  │ MEETING  │  │ TWEENING │
│ (8081)   │  │ (8084)  │  │ (8091)   │  │ (8083)   │  │ (8086)   │
│PostgreSQL│  │MongoDB  │  │PostgreSQL│  │PostgreSQL│  │ Neo4j    │
│          │  │+ Redis  │  │          │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
       │              │              │              │              │
       └──────────────┴──────────────┴──────────────┴──────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RABBITMQ (5672/15672)                              │
│              (Event Bus entre tous les services)                            │
└─────────────────────────────────────────────────────────────────────────────┘
       ▲              ▲              ▲
       │              │              │
┌──────────┐  ┌──────────┐  ┌──────────┐
│   AI     │  │   NOTIF  │  │  SCRATCH │
│ (8087)   │  │          │  │          │
│  Redis   │  │  Email   │  │          │
└──────────┘  └──────────┘  └──────────┘
```

## Points d'Intégration Critiques à Tester

### 1. Flux d'Authentification (Auth → Gateway → Context)
- [ ] Login → Token JWT → Validation Gateway → Forwarding Headers
- [ ] Refresh Token → Regénération Access Token
- [ ] 2FA Enable/Disable/Verify
- [ ] Événements utilisateur vers Tweening Service (RabbitMQ)

### 2. Flux de Réunions (Meeting → Context → Tweening)
- [ ] Création réunion → Création contexte
- [ ] Démarrage réunion → Événement meeting.started
- [ ] Ajout transcript → Enrichissement contexte
- [ ] Ajout décision → Propagation

### 3. Flux de Tâches (Task → Tweening → Context)
- [ ] Création tâche → Création groupe latent
- [ ] Assignation → Notification
- [ ] Complétion → Dissolution groupe
- [ ] Tâches liées au contexte

### 4. Communication Événementielle (RabbitMQ)
- [ ] Échanges et queues configurés
- [ ] Auth events → Tweening (user.registered, user.updated)
- [ ] Task events → Tweening (task.created, task.completed)
- [ ] Meeting events → Tweening (meeting.started)
- [ ] Member events → Auth (member.joined, member.left)

## Scripts de Test d'Intégration

### Option A: Tests avec Docker Compose (Infrastructure Complète)

```powershell
# 1. Démarrer l'infrastructure
docker compose up -d

# 2. Attendre que tout soit healthy
docker compose ps

# 3. Démarrer tous les services en parallèle
# Terminal 1: Auth Service
cd meetup-backend/auth-service
.\mvnw.cmd spring-boot:run

# Terminal 2: Context Service  
cd meetup-backend/context-service
.\mvnw.cmd spring-boot:run

# Terminal 3: Task Service
cd meetup-backend/task-service
.\mvnw.cmd spring-boot:run

# Terminal 4: Meeting Service
cd meetup-backend/meeting-service
.\mvnw.cmd spring-boot:run

# Terminal 5: Tweening Service
cd meetup-backend/tweening-service
.\mvnw.cmd spring-boot:run

# Terminal 6: API Gateway
cd meetup-backend/api-gateway
.\mvnw.cmd spring-boot:run

# Terminal 7: Frontend
cd frontend
bun run dev
```

### Option B: Tests Unitaires et d'Intégration (Sans Infrastructure Externe)

```powershell
# Exécuter tous les tests Maven
./run-all-tests.ps1
```

### Option C: Tests d'Intégration par Service

```powershell
# Auth Service Tests
cd meetup-backend/auth-service
.\mvnw.cmd test -Dtest="AuthControllerTest,UserTweenListenerTest"

# Context Service Tests  
cd meetup-backend/context-service
.\mvnw.cmd test

# Gateway Tests
cd meetup-backend/api-gateway
.\mvnw.cmd test -Dtest="JwtAuthFilterTest,ApiGatewayApplicationTests"

# Tweening Service Tests (nécessite Neo4j + RabbitMQ)
cd meetup-backend/tweening-service
.\mvnw.cmd test -Dtest="GroupLifecycleIntegrationTest"

# AI Service Tests
cd meetup-backend/ai-service
.\mvnw.cmd test -Dtest="MeetingIntelligenceTest"
```

## Scénarios de Test E2E

### Scénario 1: Création d'un utilisateur et première réunion
```
1. POST /api/auth/register → 201 Created
2. POST /api/auth/login → 200 + Tokens
3. POST /api/context (avec token) → 201 Meeting Context
4. POST /api/context/{id}/transcript → 200 Chunk ajouté
5. POST /api/context/{id}/decisions → 200 Décision ajoutée
6. GET /api/context/{id}/briefing → 200 Briefing généré
7. PATCH /api/context/{id}/status → 200 Status updated
```

### Scénario 2: Création de tâche et formation de groupe
```
1. POST /api/auth/login → Token
2. POST /api/tasks (Task Service) → Task créée
3. [RabbitMQ] TaskCreatedEvent → Tweening Service
4. GET /api/groups/{taskId} → Groupe latent créé
5. POST /api/groups/{id}/form → Groupe formé
6. POST /api/groups/{id}/join → Membre ajouté
7. [RabbitMQ] MemberJoinedEvent → Auth Service (update tweenIds)
8. POST /api/tasks/{id}/complete → Task complétée
9. [RabbitMQ] TaskCompletedEvent → Tweening (groupe dissous)
```

### Scénario 3: Flow complet avec IA
```
1. Setup: Utilisateur + Réunion + Tâches + Contexte
2. POST /api/v1/insights/full (AI Service) → Intelligence générée
3. Vérification: Context enrichi, insights disponibles
```

## Validation des Intégrations

### 1. Validation RabbitMQ
```powershell
# Vérifier les connexions
curl -u guest:guest http://localhost:15672/api/connections

# Vérifier les queues
curl -u guest:guest http://localhost:15672/api/queues

# Vérifier les échanges
curl -u guest:guest http://localhost:15672/api/exchanges
```

### 2. Validation Base de Données
```powershell
# PostgreSQL (Auth)
psql -h localhost -p 5433 -U postgres -d meetup_auth -c "\dt"

# MongoDB (Context)
docker exec meetup-mongodb mongosh --eval "db.getMongo().getDBNames()"

# Neo4j (Tweening)
curl -u neo4j:password http://localhost:7474/db/data/

# Redis
docker exec meetup-redis redis-cli ping
```

### 3. Validation Service Discovery
```powershell
# Health checks
curl http://localhost:8081/actuator/health  # Auth
curl http://localhost:8084/actuator/health  # Context
curl http://localhost:8085/actuator/health  # Gateway
curl http://localhost:8091/actuator/health  # Task
curl http://localhost:8083/actuator/health  # Meeting
curl http://localhost:8086/actuator/health  # Tweening
curl http://localhost:8087/actuator/health  # AI
```

## Collection Postman pour Tests d'Intégration

Voir: `TESTING_GUIDE.md` section 6 pour la collection complète.

Points clés:
- Tests de chaînage (Login → Utiliser token → Créer contexte)
- Tests d'erreur (Token invalide, permissions)
- Tests de concurrence (RabbitMQ events)

## Rapport de Test

Génération:
```powershell
# Rapport Maven pour tous les services
.\generate-test-report.ps1
```

Le rapport inclut:
- Nombre de tests exécutés par service
- Taux de réussite/échec
- Temps d'exécution
- Couverture d'intégration entre services
