# Tweening Service - Manual Testing Guide

This guide provides step-by-step instructions to manually test the Tweening Service flow using RabbitMQ, your REST APIs, and Neo4j.

## Prerequisites

1. Ensure the infrastructure is running:
   ```powershell
   docker compose up -d
   ```
2. Ensure your Tweening Service Spring Boot application is running:
   ```powershell
   .\mvnw spring-boot:run
   ```

## Scenario 1: Simulate Task Creation (RabbitMQ)

When a task is created, a `TaskCreatedEvent` is published to RabbitMQ. Your service should listen to this and create a `LATENT` group in Neo4j.

1. Open RabbitMQ Management UI: [http://localhost:15672](http://localhost:15672) (guest / guest)
2. Go to the **Queues** tab and click on `tweening-task-events-queue`.
3. Scroll down to **Publish message**.
4. Set the **Payload** to:
   ```json
   {
     "@class": "com.meetup.tweeningservice.event.in.TaskCreatedEvent",
     "taskId": "task-uuid-1",
     "title": "Design Database Schema",
     "description": "Create the initial database layout",
     "createdAt": "2026-05-01T10:00:00"
   }
   ```
5. Ensure `content_type` is set to `application/json` in the properties if needed.
6. Click **Publish message**.
7. **Verify in Neo4j:** Open [http://localhost:7474](http://localhost:7474), log in, and run:
   ```cypher
   MATCH (g:GroupNode {taskId: "task-uuid-1"}) RETURN g
   ```
   You should see a new Group node with state `LATENT`.

## Scenario 2: Form a Group (REST API)

Once a group is latent, a user can form it during a meeting.

1. First, create dummy Meeting and Person nodes in Neo4j (since your service expects them to exist):
   ```cypher
   CREATE (m:MeetingNode {id: "meeting-uuid-1", title: "Kickoff"})
   CREATE (p:PersonNode {id: "person-uuid-1", name: "Alice"})
   CREATE (p2:PersonNode {id: "person-uuid-2", name: "Bob"})
   ```
2. Form the group via the REST API using PowerShell (or Postman):
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:8083/api/groups/form?taskId=task-uuid-1&meetingId=meeting-uuid-1&ownerId=person-uuid-1" -Method Post
   ```
3. **Verify in Neo4j:** 
   ```cypher
   MATCH (g:GroupNode {taskId: "task-uuid-1"})-[r]->(other) RETURN g, r, other
   ```
   The group state should now be `FORMING`, and there should be a `LEADS` relationship to Alice and a `FORMED_IN` relationship to the meeting.

## Scenario 3: Join the Group (REST API)

Bob joins the group.

1. Call the API:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:8083/api/groups/groupIdHere/join?personId=person-uuid-2&role=MEMBER" -Method Post
   ```
   *(Replace `groupIdHere` with the generated UUID of the group from Neo4j)*
2. **Verify in Neo4j:**
   ```cypher
   MATCH (g:GroupNode {taskId: "task-uuid-1"})-[r:MEMBER_OF]-(p:PersonNode) RETURN g, r, p
   ```
   The group should now transition to `ACTIVE` state if there are at least 2 members.

## Scenario 4: Task Completion (RabbitMQ)

When the task is completed, it should dissolve the group and update collaboration metrics.

1. Go back to RabbitMQ Management UI -> `tweening-task-events-queue`.
2. Publish message payload:
   ```json
   {
     "@class": "com.meetup.tweeningservice.event.in.TaskCompletedEvent",
     "taskId": "task-uuid-1",
     "completedAt": "2026-05-02T10:00:00"
   }
   ```
3. **Verify in Neo4j:**
   ```cypher
   MATCH (g:GroupNode {taskId: "task-uuid-1"}) RETURN g.state, g.dissolvedAt
   ```
   The state should be `DISSOLVED`.
   ```cypher
   MATCH (p1:PersonNode)-[r:COLLABORATED_WITH]-(p2:PersonNode) RETURN p1, r, p2
   ```
   You should see collaboration links created between Alice and Bob!
