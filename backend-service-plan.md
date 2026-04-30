# Backend Service Plan

## Goal

Build the first backend scope of Meet-UP with Spring Boot around 4 domains:

- `Auth`
- `Meeting`
- `Tweening`
- `Task`

The team goals are:

- fair workload split
- low merge-conflict risk
- minimal waiting between teammates
- clear contracts before implementation

## Recommended Backend Approach

For your current stage, the best fit is a **Spring Boot modular monolith** instead of separate deployable microservices.

Why this is the safest choice now:

- you still keep strong domain boundaries
- each person can own one package/domain
- integration is much easier than 4 separate deployables
- less DevOps/setup overhead
- much better for a student/team project starting backend from zero

So when we say "services" below, think:

- separate business domains
- separate packages
- separate ownership
- shared Spring Boot application

## Suggested Spring Boot Folder Structure

```text
backend/
  pom.xml
  src/
    main/
      java/
        com/
          meetup/
            backend/
              MeetUpBackendApplication.java
              common/
                config/
                exception/
                payload/
                security/
                utils/
              auth/
                controller/
                service/
                repository/
                dto/
                model/
              meeting/
                controller/
                service/
                repository/
                dto/
                model/
              tweening/
                controller/
                service/
                repository/
                dto/
                model/
                allocation/
              task/
                controller/
                service/
                repository/
                dto/
                model/
      resources/
        application.yml
    test/
      java/
        com/
          meetup/
            backend/
  contracts/
    auth.openapi.yaml
    meeting.openapi.yaml
    tweening.openapi.yaml
    task.openapi.yaml
```

## Why This Structure Works

- `common/` contains only truly shared code
- each domain has its own controller/service/repository/model/dto packages
- each teammate can mostly stay inside one package
- contracts are visible in one place under `backend/contracts`
- the project stays simple enough to start fast

## Shared Code Rules

To avoid turning `common/` into a mess:

- `common/` may contain only:
  - security config
  - exception handling
  - API response wrappers
  - shared enums or utility classes used by everyone
- business logic must stay inside its domain package
- one domain should not directly edit another domain's internals
- cross-domain calls should go through service interfaces or well-defined DTOs

## Domain Ownership Recommendation

There are 4 of you, so the cleanest split is:

- Person 1 owns `auth`
- Person 2 owns `meeting`
- Person 3 owns `task`
- Person 4 owns `tweening`

This is fair because:

- `auth` is smaller in surface but sensitive
- `meeting` is behavior-heavy
- `task` is central and steady
- `tweening` carries the fairness and group logic

## Detailed Split Per Person

### Person 1 - Auth Owner

Main responsibility:

- login and registration flow
- token strategy
- current user endpoint
- security filters / auth config
- roles and access basics

Owns mainly:

- `backend/src/main/java/com/meetup/backend/auth/**`
- auth-related parts of `common/security/**`
- `backend/contracts/auth.openapi.yaml`

Expected deliverables:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- initial Spring Security setup
- user model and auth DTOs

Important rule:

- Person 1 should define token claims early so the others can keep moving

### Person 2 - Meeting Owner

Main responsibility:

- create and manage meetings
- manage participants
- transcript storage
- decisions log
- summary trigger points

Owns mainly:

- `backend/src/main/java/com/meetup/backend/meeting/**`
- `backend/contracts/meeting.openapi.yaml`

Expected deliverables:

- `GET /api/meetings`
- `POST /api/meetings`
- `GET /api/meetings/{meetingId}`
- `PATCH /api/meetings/{meetingId}`
- `POST /api/meetings/{meetingId}/participants`
- `POST /api/meetings/{meetingId}/transcript`
- `GET /api/meetings/{meetingId}/transcript`
- `POST /api/meetings/{meetingId}/decisions`
- `GET /api/meetings/{meetingId}/summary`

Important rule:

- keep meeting CRUD and transcript flow simple first, then add advanced logic later

### Person 3 - Task Owner

Main responsibility:

- task CRUD
- assignment
- status updates
- filtering by meeting, tween, assignee
- creating tasks from meeting outputs

Owns mainly:

- `backend/src/main/java/com/meetup/backend/task/**`
- `backend/contracts/task.openapi.yaml`

Expected deliverables:

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/{taskId}`
- `PATCH /api/tasks/{taskId}`
- `POST /api/tasks/{taskId}/assign`
- `POST /api/tasks/{taskId}/status`
- `GET /api/tasks/by-tween/{tweenId}`
- `GET /api/tasks/by-meeting/{meetingId}`
- `POST /api/tasks/from-meeting-summary`

Important rule:

- task assignment logic should consume tweening recommendations, not duplicate them

### Person 4 - Tweening Owner

Main responsibility:

- tween/group management
- members
- workload view
- fairness logic
- recommendation engine for task allocation
- optional fork/merge group behavior

Owns mainly:

- `backend/src/main/java/com/meetup/backend/tweening/**`
- `backend/contracts/tweening.openapi.yaml`

Expected deliverables:

- `GET /api/tweens`
- `POST /api/tweens`
- `GET /api/tweens/{tweenId}`
- `PATCH /api/tweens/{tweenId}`
- `POST /api/tweens/{tweenId}/members`
- `DELETE /api/tweens/{tweenId}/members/{userId}`
- `GET /api/tweens/{tweenId}/workload`
- `GET /api/tweens/{tweenId}/recommendations/task-assignee`
- `POST /api/tweens/{tweenId}/fork`
- `POST /api/tweens/{tweenId}/merge`

Important rule:

- keep fairness V1 simple and measurable

## Suggested Fairness Logic for Tweening V1

Start simple with a score based on:

- number of active tasks
- number of high-priority tasks
- overdue tasks penalty
- optional skill/tag match bonus
- optional estimated hours already assigned

Example idea:

```text
score = lower workload + better skill match - overdue penalty
```

The important thing is not the perfect algorithm now. The important thing is:

- deterministic result
- understandable rules
- easy future improvement

## API Contracts to Freeze Early

Before deep implementation, agree on these shared rules:

- all IDs are `UUID`
- dates use ISO 8601
- request/response bodies are JSON
- all protected endpoints use bearer token
- error payload format is shared

### Standard Error Shape

```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found",
    "details": {}
  }
}
```

### Auth Token Claims to Agree On Early

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "roles": ["member"],
  "tweenIds": ["uuid-1", "uuid-2"]
}
```

## Minimal Contracts Per Domain

### Auth Contract

#### `POST /api/auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

Response:

```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "Jane Doe",
    "roles": ["member"]
  }
}
```

#### `GET /api/auth/me`

Response:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "Jane Doe",
  "roles": ["member"],
  "tweenIds": ["uuid-1"]
}
```

### Meeting Contract

#### `POST /api/meetings`

Request:

```json
{
  "title": "Sprint Planning",
  "tweenId": "uuid",
  "scheduledAt": "2026-04-28T10:00:00Z",
  "createdBy": "uuid"
}
```

Response:

```json
{
  "id": "uuid",
  "title": "Sprint Planning",
  "tweenId": "uuid",
  "scheduledAt": "2026-04-28T10:00:00Z",
  "status": "scheduled"
}
```

#### `POST /api/meetings/{meetingId}/transcript`

Request:

```json
{
  "segments": [
    {
      "speakerId": "uuid",
      "speakerName": "Alex",
      "text": "We should finalize auth this week.",
      "timestamp": "2026-04-28T10:04:00Z"
    }
  ]
}
```

### Task Contract

#### `POST /api/tasks`

Request:

```json
{
  "title": "Finalize auth migration",
  "description": "Implement OAuth2 PKCE flow",
  "tweenId": "uuid",
  "meetingId": "uuid",
  "createdBy": "uuid",
  "priority": "high"
}
```

Response:

```json
{
  "id": "uuid",
  "title": "Finalize auth migration",
  "status": "todo",
  "assigneeId": null,
  "tweenId": "uuid",
  "meetingId": "uuid",
  "priority": "high"
}
```

#### `POST /api/tasks/{taskId}/assign`

Request:

```json
{
  "assigneeId": "uuid",
  "assignedBy": "uuid",
  "reason": "best workload balance"
}
```

### Tweening Contract

#### `GET /api/tweens/{tweenId}/recommendations/task-assignee`

Query params:

```text
taskType=backend
priority=high
estimatedHours=6
```

Response:

```json
{
  "recommendedUserId": "uuid",
  "score": 0.87,
  "reasoning": [
    "lowest active workload",
    "has matching skill tag: backend",
    "no overdue high-priority tasks"
  ],
  "alternatives": [
    {
      "userId": "uuid-2",
      "score": 0.74
    }
  ]
}
```

## Cross-Domain Interactions

To avoid tight coupling:

### Auth -> Everyone

- provides user identity through token
- provides `/api/auth/me`
- should expose only the claims others really need

### Meeting -> Task

- can send action items generated from summary/decisions

Suggested payload:

```json
{
  "meetingId": "uuid",
  "tweenId": "uuid",
  "actionItems": [
    {
      "title": "Complete API auth migration",
      "description": "OAuth2 PKCE implementation",
      "suggestedAssigneeId": "uuid"
    }
  ]
}
```

### Task -> Tweening

- asks for recommendation when fair assignment is needed

### Tweening -> Task

- may read active tasks to compute workload

## Practical Merge-Conflict Prevention Rules

- one owner per domain
- small PRs
- no one edits another domain package casually
- contracts must be discussed before change
- shared classes in `common/` need extra care
- DB schema ownership should also follow domain ownership

## Suggested Startup Sequence

### Day 1

- agree on DTOs and error format
- agree on package names
- agree on auth claims
- write the 4 OpenAPI draft contracts

### Day 2

- Person 1 sets up auth basics
- Person 2 starts meeting CRUD
- Person 3 starts task CRUD
- Person 4 starts tween CRUD and workload logic

### Day 3

- integrate task with tweening recommendation
- integrate protected endpoints with auth
- add validation annotations and base exception handling

### Day 4+

- integrate meeting output with task creation
- improve fairness algorithm
- connect frontend route needs to backend endpoints

## Final Recommendation

If you want speed and stability:

- use one Spring Boot backend
- organize by domain package
- assign one owner per domain
- freeze contracts early
- keep fairness logic inside `tweening`
- do not over-engineer the deployment architecture yet

This gives you:

- clear ownership
- real parallel work
- fewer merge conflicts
- easier integration with the current frontend
