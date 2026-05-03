# Tweening Service

The **Tweening Service** is a core microservice in the Meet-UP backend ecosystem. Its primary responsibility is to manage the intricate lifecycle of **Groups** that dynamically form, operate, and eventually dissolve around specific **Tasks**. It models these relationships mathematically using a Graph Database (Neo4j) to track human interactions, collaboration history, and team structures.

##  Core Features

- **Dynamic Group Lifecycle Management**: Tracks group states from `LATENT` (when a task is first created) to `FORMING` (when an owner is assigned), `ACTIVE` (when members join), and finally `DISSOLVED` (when the task completes).
- **Graph-Based Collaboration Tracking**: Uses Neo4j to model interactions. When a group dissolves, the service automatically calculates and creates `CollaboratedWith` edges between all members and leads, assigning a weight based on the time they spent working together.
- **Event-Driven Architecture**: Fully integrated with RabbitMQ to react to system events (like tasks being created or completed) and publish its own events (like groups forming or members joining) to notify other microservices.

##  Technology Stack

- **Framework**: Spring Boot 3 / Java 21
- **Database**: Neo4j (Spring Data Neo4j)
- **Message Broker**: RabbitMQ (Spring AMQP)
- **Testing**: JUnit 5, Spring Boot Test, Awaitility

---

##  Group Lifecycle & State Machine

The Tweening Service implements a strict state machine for Groups:

1. **`LATENT`**: A task has been created in the system, but no one has taken ownership of it yet. A placeholder group is created.
2. **`FORMING`**: A user initiates the formation of a group for the task (usually originating from a Meeting). This user is assigned as the group's `Lead`.
3. **`ACTIVE`**: Other users join the group as `Members`. A group automatically transitions from `FORMING` to `ACTIVE` once it has at least 2 participants (Leads + Members).
4. **`DISSOLVED`**: The associated task is marked as completed. The group is archived, and collaboration edges (`CollaboratedWith`) are calculated and saved in the graph between all participants.

---

##  Messaging (RabbitMQ)

### Inbound Events (Consumed)
Listens on queue: `tweening-task-events-queue` (Routing Keys: `task.created`, `task.completed`)

| Event | Action Triggered |
| :--- | :--- |
| `TaskCreatedEvent` | Creates a new Group in the `LATENT` state tied to the newly created task. |
| `TaskCompletedEvent` | Dissolves the active group, calculates time-weighted collaboration edges between members, and transitions the state to `DISSOLVED`. |

### Outbound Events (Published)
Publishes to exchange: `tweening-events-exchange`

| Event | Routing Key | Description |
| :--- | :--- | :--- |
| `GroupFormedEvent` | `group.formed` | Emitted when a group transitions to `FORMING` and a lead is assigned. |
| `MemberJoinedEvent`| `group.member.joined` | Emitted when a new user successfully joins an existing group. |
| `GroupDissolvedEvent`| `group.dissolved` | Emitted when a group successfully completes its lifecycle. |

---

##  REST API Endpoints

The service exposes the following endpoints for synchronous operations:

### `POST /api/groups/form`
Forms a group from a latent task, setting the creator as the lead.
- **Query Parameters**: 
  - `taskId` (String)
  - `meetingId` (String)
  - `ownerId` (String)
- **Returns**: The updated `GroupNode` in the `FORMING` state.

### `POST /api/groups/{groupId}/join`
Adds a user to a forming or active group. Transitions the group to `ACTIVE` if the participant threshold is met.
- **Path Variable**: `groupId`
- **Query Parameters**:
  - `personId` (String)
  - `role` (String)
- **Returns**: `200 OK`

### `GET /api/groups/{id}`
Retrieves a group's graph representation by its internal ID.
- **Path Variable**: `id`
- **Returns**: `GroupNode`

### `GET /api/groups/task/{taskId}`
Retrieves a group's graph representation by its associated Task ID.
- **Path Variable**: `taskId`
- **Returns**: `GroupNode`

---

##  Database Schema (Neo4j Graph)

### Nodes
- **`Group`**: The central entity (`state`, `taskId`).
- **`Person`**: Represents users (`name`).
- **`Meeting`**: Context where groups are formed (`title`).

### Relationships (Edges)
- **`[:LEADS]`**: Connects a `Person` to a `Group` (with a `fromDate` timestamp).
- **`[:MEMBER_OF]`**: Connects a `Person` to a `Group` (with `joinedAt` timestamp and `roleInGroup`).
- **`[:FORMED_IN]`**: Connects a `Group` to a `Meeting` (with `spawnedAt` timestamp).
- **`[:COLLABORATED_WITH]`**: Connects two `Person` nodes. Generated dynamically upon group dissolution. Contains a `weight` property representing hours spent collaborating.
- **`[:WORKS_ON]`**: Connects a `Group` directly to a `Task` Node (if managed structurally in the graph).
- **`[:SIBLING_GROUP]`**: Connects related `Group` nodes.

---

##  Testing

The service includes a fully automated integration test suite (`GroupLifecycleIntegrationTest.java`) that requires a local `docker-compose` environment containing:
- **Neo4j** (`localhost:7687`, auth: `neo4j/password`)
- **RabbitMQ** (`localhost:5672`, guest/guest)

Run the suite using:
```bash
./mvnw test -Dtest=GroupLifecycleIntegrationTest
```
