# Person 2 - Meeting Service Work Plan

## Ton role

Tu es responsable du service `meeting-service`.

Ton objectif est de livrer tout ce qui concerne la gestion des reunions, sans dependances fortes sur les autres services.

Tu dois etre proprietaire de:

- la creation des reunions
- la consultation des reunions
- la mise a jour des reunions
- l'integration Daily.co pour les rooms et les meeting tokens
- l'ecriture et la lecture des meetings dans Firebase
- la preparation des infos de chat Firebase pour chaque meeting
- la gestion des participants
- le transcript
- les decisions prises pendant une reunion
- la production des donnees necessaires au summary
- l'envoi des action items vers `task-service` plus tard

## Ce que tu dois faire concretement

### Scope V1

Pour une premiere version stable, concentre-toi sur:

- CRUD basique des meetings
- creation et stockage des rooms Daily
- stockage de l'historique des meetings dans Firebase
- endpoint pour recuperer les infos de join d'un meeting
- definition du channel de chat Firebase par meeting
- gestion des participants
- ajout et lecture du transcript
- ajout et lecture des decisions
- endpoint de summary simple

Ne commence pas tout de suite par:

- websocket
- live streaming
- IA complexe
- synchronisation temps reel
- notifications

Le but est d'avoir une base propre que le frontend pourra consommer vite.

## Ce que Daily.co et Firebase doivent faire

### Daily.co

Daily.co doit gerer:

- la creation des video rooms
- la room URL
- les participant tokens
- les permissions de join
- plus tard, eventuellement la gestion plus fine des permissions participant

Ton `meeting-service` ne doit pas refaire cela lui-meme.
Il doit seulement:

- appeler l'API Daily depuis le backend
- stocker les infos Daily utiles dans la base
- exposer au frontend les donnees de join dont il a besoin

### Firebase Realtime Database

Firebase doit gerer:

- les meetings
- le chat temps reel
- les channels de chat par meeting
- le stockage des messages
- la diffusion temps reel des nouveaux messages
- l'historique des reunions
- les droits d'acces de base
- eventuellement les profils utilisateur si votre equipe centralise tout dessus

Ton `meeting-service` ne doit pas stocker les messages de chat dans sa propre base.
Il doit surtout:

- ecrire les meetings et metadata dans Firebase
- definir l'identifiant du channel de chat associe au meeting
- exposer ce channel au frontend
- coordonner les droits d'acces metier au chat

## Nouvelle responsabilite de ton service

Avec cette architecture, `meeting-service` devient le point d'orchestration metier pour:

- le cycle de vie d'un meeting
- la room video Daily associee
- le channel Firebase associe
- l'ecriture du meeting dans Firebase
- la validation que l'utilisateur a le droit de rejoindre

En pratique:

- le frontend ne doit pas appeler l'API REST de Daily directement avec des secrets
- le frontend peut ecouter la liste des meetings en temps reel depuis Firebase
- le frontend utilise Firebase SDK pour le chat
- le frontend obtient depuis ton backend les bonnes infos pour rejoindre le call et le bon channel de chat

## Structure que tu dois posseder

Tu es proprietaire de tout ce qui est dans:

```text
backend/meeting-service/
  pom.xml
  Dockerfile
  src/
    main/
      java/
        com/
          meetup/
            meeting/
              MeetingServiceApplication.java
              controller/
              service/
              repository/
              dto/
              integration/
                daily/
                firebase/
              model/
              mapper/
              exception/
      resources/
        application.yml
        application-docker.yml
```

Tu peux aussi ajouter logiquement:

- `client/` si tu preferes separer les clients HTTP externes
- `config/` pour la config Daily/Firebase
- `webhook/` plus tard si vous ajoutez des webhooks Daily

Note importante:

- si Firebase est votre datastore principal, `repository/` peut etre un adaptateur Firebase Admin SDK
- tu n'es pas oblige de partir sur JPA pour ce service

## APIs que tu dois exposer

Voici les endpoints que tu devrais implementer en priorite.

En plus du CRUD meeting, tu dois maintenant ajouter les endpoints utiles pour Daily/Firebase.

### 1. Meetings

#### `GET /api/meetings`

Usage:

- lister les reunions
- filtrer plus tard par `tweenId`, `createdBy`, `status`
- ou servir de facade backend si vous ne lisez pas tout directement depuis Firebase cote frontend

Reponse minimale:

```json
[
  {
    "id": "uuid",
    "title": "Sprint Planning",
    "tweenId": "uuid",
    "scheduledAt": "2026-04-28T10:00:00Z",
    "status": "scheduled"
  }
]
```

#### `POST /api/meetings`

Usage:

- creer une reunion
- creer ou preparer la room Daily associee
- sauvegarder le meeting dans Firebase
- generer la reference du channel de chat

Request:

```json
{
  "title": "Sprint Planning",
  "tweenId": "uuid",
  "scheduledAt": "2026-04-28T10:00:00Z",
  "createdBy": "uuid",
  "maxParticipants": 10,
  "createVideoRoom": true
}
```

Response:

```json
{
  "id": "uuid",
  "title": "Sprint Planning",
  "tweenId": "uuid",
  "scheduledAt": "2026-04-28T10:00:00Z",
  "status": "scheduled",
  "dailyRoomName": "meeting-uuid",
  "dailyRoomUrl": "https://your-domain.daily.co/meeting-uuid",
  "chatChannelId": "meeting-uuid",
  "firebaseMeetingPath": "meetings/uuid"
}
```

#### `GET /api/meetings/{meetingId}`

Usage:

- afficher le detail d'une reunion
- servir la page meeting cote frontend
- exposer les metadata Daily/Firebase non sensibles

#### `PATCH /api/meetings/{meetingId}`

Usage:

- modifier le titre
- modifier la date
- modifier le statut

Request exemple:

```json
{
  "title": "Sprint Planning Updated",
  "scheduledAt": "2026-04-28T11:00:00Z",
  "status": "ongoing"
}
```

### 1.b Join and Call Info

#### `POST /api/meetings/{meetingId}/join`

Usage:

- valider que l'utilisateur peut rejoindre
- generer un token Daily court
- retourner au frontend toutes les infos de join utiles

Request:

```json
{
  "userId": "uuid",
  "userName": "Alex"
}
```

Response:

```json
{
  "meetingId": "uuid",
  "daily": {
    "roomName": "meeting-uuid",
    "roomUrl": "https://your-domain.daily.co/meeting-uuid",
    "token": "daily-meeting-token"
  },
  "chat": {
    "provider": "firebase-rtdb",
    "channelId": "meeting-uuid",
    "messagesPath": "meetingChannels/meeting-uuid/messages",
    "presencePath": "meetingChannels/meeting-uuid/presence"
  }
}
```

#### `GET /api/meetings/{meetingId}/call-info`

Usage:

- recuperer les infos techniques d'un meeting sans remint un token si ce n'est pas necessaire
- utile pour refresh UI

## APIs externes que tu vas utiliser

### 1. Daily REST API

Ton backend va utiliser principalement:

- `POST /rooms`
- `POST /meeting-tokens`

Usage Daily recommande pour ton cas:

- creer une room au moment de la creation du meeting
- creer un meeting token au moment du join
- toujours limiter le token a `room_name`
- toujours mettre une expiration `exp`

### 2. Firebase Realtime Database

Le frontend va utiliser le SDK Firebase pour:

- ecouter les meetings en temps reel
- ecouter les nouveaux messages en temps reel
- ecrire les messages
- lire l'historique du channel

Ton backend ne doit pas devenir un proxy de chat.

Par contre ton plan metier doit definir:

- quel noeud Firebase represente un meeting
- quel channel appartient a quel meeting
- quel utilisateur peut acceder au channel
- quels metadata de channel tu renvoies au frontend

### 2. Participants

#### `POST /api/meetings/{meetingId}/participants`

Usage:

- ajouter un ou plusieurs participants

Request:

```json
{
  "participants": [
    {
      "userId": "uuid-1",
      "role": "member"
    },
    {
      "userId": "uuid-2",
      "role": "host"
    }
  ]
}
```

#### `GET /api/meetings/{meetingId}/participants`

Usage:

- recuperer la liste des participants
- l'utiliser plus tard pour presence ou permissions Daily

### 3. Transcript

#### `POST /api/meetings/{meetingId}/transcript`

Usage:

- enregistrer des segments de transcript

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

#### `GET /api/meetings/{meetingId}/transcript`

Usage:

- afficher le transcript d'une reunion

Reponse minimale:

```json
{
  "meetingId": "uuid",
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

### 4. Decisions

#### `POST /api/meetings/{meetingId}/decisions`

Usage:

- sauvegarder les decisions prises pendant la reunion

Request:

```json
{
  "decisions": [
    "Auth module will use OAuth2 with PKCE flow",
    "Frontend adapters will be connected after backend readiness"
  ]
}
```

#### `GET /api/meetings/{meetingId}/decisions`

Usage:

- lire les decisions d'une reunion

### 5. Summary

#### `GET /api/meetings/{meetingId}/summary`

Usage:

- fournir au frontend un resume simple
- servir de base plus tard pour les action items

Reponse minimale suggeree:

```json
{
  "meetingId": "uuid",
  "title": "Sprint Planning",
  "summary": "The team reviewed migration progress and agreed on the next backend steps.",
  "decisions": [
    "Auth module will use OAuth2 with PKCE flow"
  ],
  "actionItems": [
    {
      "title": "Finalize auth migration",
      "suggestedAssigneeId": "uuid"
    }
  ]
}
```

### 6. Chat Metadata

#### `GET /api/meetings/{meetingId}/chat-info`

Usage:

- retourner les infos Firebase necessaires au frontend pour se brancher au bon channel

Response suggeree:

```json
{
  "provider": "firebase-rtdb",
  "channelId": "meeting-uuid",
  "messagesPath": "meetingChannels/meeting-uuid/messages",
  "presencePath": "meetingChannels/meeting-uuid/presence"
}
```

## APIs que tu peux utiliser

Tu exposes ton service, mais tu peux aussi consommer d'autres APIs.

### 1. `auth-service`

Tu peux utiliser:

- `GET /api/auth/me`

Pourquoi:

- recuperer l'utilisateur courant
- verifier qui cree la reunion
- stocker `createdBy`

Tu dependras surtout du token passe par `api-gateway`.

Concretement, dans V1:

- tu ne dois pas reimplementer la logique auth
- tu dois lire le contexte utilisateur deja injecte

Si votre equipe securise Firebase correctement:

- soit l'utilisateur est aussi authentifie cote Firebase
- soit un autre service fournit un Firebase custom token

Dans tous les cas, ce n'est pas ton service qui doit gerer toute l'auth Firebase long terme, sauf si l'equipe te le delegue explicitement.

### 1.b `api-gateway`

Tu peux utiliser ce que le gateway injecte deja:

- `userId`
- `displayName`
- `roles`
- `tweenIds`

Tu dois t'appuyer dessus pour:

- controler le join meeting
- personnaliser le token Daily

### 2. `task-service`

Tu peux utiliser plus tard:

- `POST /api/tasks/from-meeting-summary`

Pourquoi:

- transformer un summary en action items
- creer des taches apres validation metier

Important:

- ne bloque pas ton V1 sur cette integration
- tu peux d'abord retourner les action items dans `/summary`

### 3. `tweening-service`

Tu peux utiliser:

- `GET /api/tweens/{tweenId}`
- eventuellement la verification des membres d'un tween

Pourquoi:

- verifier qu'une reunion appartient a un tween valide
- verifier qu'un participant est coherent avec le groupe

Mais pour avancer vite:

- ne rends pas ton CRUD dependant de validations complexes au debut

### 4. Daily API

Tu vas l'utiliser cote backend pour:

- creer une room
- creer un token de participant

Important:

- l'API key Daily doit rester serveur seulement
- ne jamais l'envoyer au frontend

### 5. Firebase Realtime Database

Tu vas l'utiliser depuis le backend pour:

- sauvegarder les meetings
- sauvegarder les participants
- sauvegarder les metadata de channel

Tu ne l'utiliseras pas forcement depuis le backend pour ecrire chaque message de chat.

Mais tu dois definir avec le frontend:

- le chemin des meetings
- le chemin des messages
- le chemin de presence
- le format JSON des messages
- les regles de securite attendues

## Ce que tu peux developper sans attendre les autres

Tu peux avancer en autonomie sur:

- model `Meeting`
- model `MeetingParticipant`
- model `TranscriptSegment`
- model `MeetingDecision`
- integration Daily room creation
- integration Firebase Admin SDK pour meetings
- endpoint de join avec Daily token
- metadata de channel Firebase
- DTOs request/response
- controller
- service layer
- repository layer
- validation
- gestion d'erreurs
- tests unitaires

Tu n'as pas besoin d'attendre:

- que `task-service` soit fini
- que `tweening-service` soit fini
- que la vraie logique d'auth soit complete

Tu peux commencer avec:

- des UUIDs passes dans les payloads
- un mock de user context
- un mock Daily client
- un mock Firebase repository
- des metadata Firebase statiques
- des integrations desactivees ou simulees

## Modeles recommandes

### `Meeting`

Champs recommandes:

- `id`
- `title`
- `tweenId`
- `createdBy`
- `scheduledAt`
- `startedAt`
- `endedAt`
- `status`
- `dailyRoomName`
- `dailyRoomUrl`
- `dailyRoomCreated`
- `chatChannelId`
- `firebaseMeetingPath`
- `createdAt`
- `updatedAt`

### `MeetingParticipant`

Champs recommandes:

- `id`
- `meetingId`
- `userId`
- `role`
- `joinedAt`

### `TranscriptSegment`

Champs recommandes:

- `id`
- `meetingId`
- `speakerId`
- `speakerName`
- `text`
- `timestamp`

### `MeetingDecision`

Champs recommandes:

- `id`
- `meetingId`
- `content`
- `createdAt`

### `MeetingChatMeta`

Champs recommandes:

- `meetingId`
- `channelId`
- `messagesPath`
- `presencePath`
- `provider`

## Enums recommandes

### `MeetingStatus`

Valeurs suggerees:

- `SCHEDULED`
- `ONGOING`
- `COMPLETED`
- `CANCELLED`

### `ParticipantRole`

Valeurs suggerees:

- `HOST`
- `MEMBER`
- `OBSERVER`

## JSON structure suggeree dans Firebase Realtime Database

Si Firebase est aussi votre source principale pour les meetings, une structure plus complete est preferable:

```text
users/
  {userId}/
    displayName: "Alex"
    email: "alex@example.com"
    role: "member"

meetings/
  {meetingId}/
    title: "Sprint Planning"
    tweenId: "uuid"
    createdBy: "uuid"
    scheduledAt: 1714300000
    status: "scheduled"
    daily/
      roomName: "meeting-uuid"
      roomUrl: "https://your-domain.daily.co/meeting-uuid"
    chat/
      channelId: "meeting-uuid"
      messagesPath: "meetingChannels/meeting-uuid/messages"
      presencePath: "meetingChannels/meeting-uuid/presence"
    participants/
      {userId}/
        role: "HOST"
        joinedAt: 1714300001
    decisions/
      {decisionId}/
        content: "Auth module will use OAuth2 with PKCE flow"
        createdAt: 1714300500
    transcript/
      {segmentId}/
        speakerId: "uuid"
        speakerName: "Alex"
        text: "We should finalize auth this week."
        timestamp: 1714300400

meetingChannels/
  {meetingId}/
    meta/
      meetingId: "uuid"
      tweenId: "uuid"
      createdAt: 1714300000
    members/
      {userId}: true
    presence/
      {userId}/
        online: true
        displayName: "Alex"
        lastSeen: 1714300123
    messages/
      {messageId}/
        senderId: "uuid"
        senderName: "Alex"
        text: "Hello team"
        sentAt: 1714300123
```

Cette structure te permet de couvrir:

- l'historique des meetings
- `messages` pour le chat
- `presence` pour l'etat en ligne
- `members` pour les checks rapides
- les participants
- les decisions
- le transcript

## Exemples d'implementation que tu peux suivre

### Exemple backend Spring Boot pour creer une room Daily

```java
public DailyRoomResponse createDailyRoom(String meetingId) {
    Map<String, Object> payload = Map.of(
        "name", "meeting-" + meetingId,
        "privacy", "private",
        "properties", Map.of(
            "enable_people_ui", true
        )
    );

    return dailyClient.createRoom(payload);
}
```

### Exemple backend Spring Boot pour creer un token Daily

```java
public DailyMeetingTokenResponse createJoinToken(Meeting meeting, UserContext user) {
    long exp = Instant.now().plus(Duration.ofHours(2)).getEpochSecond();

    Map<String, Object> payload = Map.of(
        "properties", Map.of(
            "room_name", meeting.getDailyRoomName(),
            "user_name", user.displayName(),
            "user_id", user.userId(),
            "exp", exp
        )
    );

    return dailyClient.createMeetingToken(payload);
}
```

### Exemple de reponse de ton endpoint `/join`

```json
{
  "meetingId": "uuid",
  "daily": {
    "roomUrl": "https://your-domain.daily.co/meeting-uuid",
    "token": "token-value"
  },
  "chat": {
    "provider": "firebase-rtdb",
    "messagesPath": "meetingChannels/uuid/messages",
    "presencePath": "meetingChannels/uuid/presence"
  }
}
```

### Exemple backend pour sauvegarder un meeting dans Firebase

```java
public void saveMeeting(Meeting meeting) {
    DatabaseReference ref = firebaseDatabase.getReference("meetings").child(meeting.getId());

    Map<String, Object> payload = Map.of(
        "title", meeting.getTitle(),
        "tweenId", meeting.getTweenId(),
        "createdBy", meeting.getCreatedBy(),
        "scheduledAt", meeting.getScheduledAt().toInstant().toEpochMilli(),
        "status", meeting.getStatus().name(),
        "daily", Map.of(
            "roomName", meeting.getDailyRoomName(),
            "roomUrl", meeting.getDailyRoomUrl()
        ),
        "chat", Map.of(
            "channelId", meeting.getChatChannelId(),
            "messagesPath", "meetingChannels/" + meeting.getId() + "/messages",
            "presencePath", "meetingChannels/" + meeting.getId() + "/presence"
        )
    );

    ref.setValueAsync(payload);
}
```

### Exemple frontend Firebase pour ecouter les messages

```ts
import { getDatabase, ref, onValue } from "firebase/database";

const db = getDatabase();
const messagesRef = ref(db, `meetingChannels/${meetingId}/messages`);

onValue(messagesRef, (snapshot) => {
  const data = snapshot.val();
  console.log(data);
});
```

### Exemple frontend Firebase pour envoyer un message

```ts
import { getDatabase, push, ref, set } from "firebase/database";

const db = getDatabase();
const messagesRef = ref(db, `meetingChannels/${meetingId}/messages`);
const newMessageRef = push(messagesRef);

await set(newMessageRef, {
  senderId: userId,
  senderName: displayName,
  text: message,
  sentAt: Date.now()
});
```

## Strategie d'integration recommandee

### Daily flow

Flow conseille:

1. le frontend demande `POST /api/meetings`
2. ton backend cree le meeting
3. ton backend cree la room Daily
4. ton backend stocke le meeting et les infos Daily dans Firebase
5. les autres clients peuvent voir le meeting en temps reel via Firebase
6. le frontend appelle `POST /api/meetings/{meetingId}/join`
7. ton backend mint un token Daily court
8. le frontend rejoint l'appel Daily avec `roomUrl` + `token`

### Firebase chat flow

Flow conseille:

1. le frontend recupere `chat-info` ou `join` response
2. le frontend se connecte au bon chemin Firebase
3. le frontend lit les meetings ou messages via listeners temps reel
4. le frontend envoie les messages directement dans Firebase
5. le backend garde la logique Daily + orchestration metier + metadata de meeting

## Etape 1 - Cadrage

## Plan de travail concret

### Etape 1 - Cadrage

Tu definis:

- les DTOs
- les entities
- les enums
- les codes d'erreur
- les routes finales
- le contrat Daily room
- le contrat Daily join token
- le contrat `chat-info`
- le contrat Firebase pour `meetings/`
- le contrat Firebase pour `meetingChannels/`

Livrable:

- spec stable du service `meeting`

### Etape 2 - CRUD de base

Tu implementes:

- `POST /api/meetings`
- `GET /api/meetings`
- `GET /api/meetings/{meetingId}`
- `PATCH /api/meetings/{meetingId}`

Et dans cette etape, tu peux deja:

- enregistrer `dailyRoomName`
- enregistrer `dailyRoomUrl`
- enregistrer `chatChannelId`
- enregistrer le meeting dans Firebase

Livrable:

- service utilisable par le frontend pour la page meeting

### Etape 3 - Participants

Tu implementes:

- `POST /api/meetings/{meetingId}/participants`
- `GET /api/meetings/{meetingId}/participants`

Livrable:

- liaison reunion <-> participants

### Etape 4 - Transcript

Tu implementes:

- `POST /api/meetings/{meetingId}/transcript`
- `GET /api/meetings/{meetingId}/transcript`

Livrable:

- transcript consultable dans l'interface

### Etape 5 - Decisions

Tu implementes:

- `POST /api/meetings/{meetingId}/decisions`
- `GET /api/meetings/{meetingId}/decisions`

Livrable:

- decisions historisees

### Etape 6 - Summary

Tu implementes:

- `GET /api/meetings/{meetingId}/summary`

Dans V1, ce summary peut etre:

- construit simplement depuis les decisions
- construit depuis les premiers segments du transcript
- ou temporairement mocke si necessaire

Livrable:

- endpoint pret pour brancher le frontend

### Etape 7 - Integration avec task-service

Tu prevois:

- le payload d'action items
- l'appel vers `task-service`

Mais tu peux la faire apres le reste.

### Etape 8 - Daily join

Tu implementes:

- `POST /api/meetings/{meetingId}/join`
- creation d'un token Daily court

Livrable:

- frontend capable de rejoindre l'appel video

### Etape 9 - Firebase chat metadata

Tu implementes:

- `GET /api/meetings/{meetingId}/chat-info`

Livrable:

- frontend capable de se connecter au bon channel Firebase

## Ordre recommande pour ne pas te bloquer

Travaille dans cet ordre:

1. entities + enums + DTOs
2. repository/adaptateur Firebase
3. service CRUD de meeting
4. integration Daily room creation
5. endpoint `/join`
6. participants
7. chat metadata Firebase
8. transcript
9. decisions
10. summary
11. integration task-service

Cet ordre te permet de livrer vite quelque chose d'utilisable.

## Regles de collaboration

### Ce que tu ne dois pas faire

- ne code pas la logique auth
- ne code pas la logique de fairness de tweening
- ne cree pas de taches directement dans ta DB
- ne mets pas l'API key Daily dans le frontend
- ne dupliques pas inutilement les meetings dans une autre DB si Firebase est votre source principale
- ne stocke pas les messages de chat dans la DB du meeting-service
- ne depasse pas le scope meeting pour "aider" sur d'autres services

### Ce que tu dois demander a Person 1

- format du token
- user context disponible apres le gateway
- conventions d'erreur communes
- decision sur comment securiser Firebase cote utilisateur si necessaire

### Ce que tu dois demander a Person 3

- format attendu pour les action items
- endpoint exact pour creation depuis un summary

### Ce que tu dois demander a Person 4

- contraintes minimales autour du `tweenId`
- verification eventuelle des membres du groupe

### Ce que tu dois aligner avec le frontend

- format de reponse de `/join`
- format de reponse de `/chat-info`
- chemin Firebase exact
- structure JSON des messages
- comportement si Daily room n'existe pas encore

## Tests que tu dois prevoir

### Tests unitaires

- creation d'une reunion valide
- refus de creation si titre vide
- mise a jour de statut
- creation de room Daily lors d'un nouveau meeting
- sauvegarde du meeting dans Firebase
- creation de token Daily au join
- ajout de participants
- ajout de transcript
- ajout de decisions

### Tests d'integration

- `POST /api/meetings` retourne `201`
- `GET /api/meetings/{meetingId}` retourne `200`
- `PATCH /api/meetings/{meetingId}` modifie bien les champs attendus
- `POST /api/meetings/{meetingId}/join` retourne un token Daily
- `GET /api/meetings/{meetingId}/chat-info` retourne les bons paths Firebase
- le meeting est bien visible dans le bon noeud Firebase
- `POST /participants` ajoute bien la liste
- `POST /transcript` ajoute bien les segments
- `POST /decisions` persiste bien les decisions

## Definition of Done

Ton service est "done" pour la V1 si:

- les endpoints principaux repondent
- Daily join fonctionne
- les metadata Firebase sont stables
- l'ecriture du meeting dans Firebase fonctionne
- les DTOs sont stables
- les erreurs sont propres
- les tests critiques passent
- le frontend peut lister et afficher une reunion
- le frontend peut rejoindre un call Daily
- le frontend peut ouvrir le bon channel Firebase
- le frontend peut lire transcript, decisions et summary

## Plan de branch / PR

Branches suggerees:

- `feature/meeting-entities`
- `feature/meeting-crud`
- `feature/meeting-participants`
- `feature/meeting-transcript`
- `feature/meeting-decisions`
- `feature/meeting-summary`
- `feature/meeting-daily-integration`
- `feature/meeting-chat-metadata`

Fais:

- de petites PRs
- une PR par bloc fonctionnel
- pas une seule grosse PR en fin de semaine

## Resume tres court

Ton plan ideal est:

1. faire un `meeting-service` propre et autonome
2. exposer le CRUD meeting
3. integrer Daily pour room + join token
4. exposer les metadata Firebase chat
5. ajouter participants, transcript, decisions
6. finir par summary
7. brancher ensuite task-service

Ton but n'est pas de faire toute la collaboration temps reel maintenant.
Ton but est de livrer une base backend solide et exploitable vite.
