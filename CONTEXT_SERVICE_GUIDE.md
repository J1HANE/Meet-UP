# Context Service Testing and MongoDB Visualization Guide

## Overview
The context-service stores meeting contexts in MongoDB, including transcripts, decisions, tasks, and topics.

## Starting the Infrastructure

### Start MongoDB and Redis
```bash
docker-compose up -d mongodb redis
```

Or start all services:
```bash
docker-compose up -d
```

### Verify MongoDB is Running
```bash
docker ps
# Should show meetup-mongodb container
```

## MongoDB Visualization Tools

### Option 1: MongoDB Compass (Recommended)

#### Installation
1. Download MongoDB Compass from https://www.mongodb.com/try/download/compass
2. Install and run the application

#### Connection
1. Open MongoDB Compass
2. Enter connection string: `mongodb://localhost:27017`
3. Click "Connect"

#### Viewing Meeting Contexts
1. Navigate to `meetup_context` database
2. Click on `meeting_contexts` collection
3. You'll see all meeting context documents with:
   - meetingId
   - participantIds
   - tweenGroupIds
   - transcript (array of chunks)
   - decisions (array of decisions)
   - tasksRef (array of task IDs)
   - topics (array of topics)
   - summary
   - status (LIVE/COMPLETE)
   - createdAt, updatedAt

### Option 2: MongoDB Shell

#### Connect
```bash
docker exec -it meetup-mongodb mongosh
```

#### View all contexts
```javascript
use meetup_context
db.meeting_contexts.find().pretty()
```

#### Find specific meeting
```javascript
db.meeting_contexts.findOne({ meetingId: UUID("your-meeting-id") })
```

#### Count contexts
```javascript
db.meeting_contexts.countDocuments()
```

### Option 3: VS Code Extension

1. Install "MongoDB for VS Code" extension
2. Click on MongoDB icon in left sidebar
3. Add connection: `mongodb://localhost:27017`
4. Browse databases and collections

## Testing Context Service

### Prerequisites
- Start MongoDB and Redis
- Start context-service: `cd context-service && ./mvnw spring-boot:run`
- Have a valid JWT token from auth-service

### API Endpoints

#### 1. Create Meeting Context
```bash
curl -X POST http://localhost:8084/api/context \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: your-user-id" \
  -H "X-User-Email: your-email@example.com" \
  -H "X-User-Roles: member" \
  -H "X-User-TweenIds: tween-group-id-1,tween-group-id-2" \
  -d '{
    "meetingId": "550e8400-e29b-41d4-a716-446655440000",
    "participantIds": ["550e8400-e29b-41d4-a716-446655440001"],
    "tweenGroupIds": ["550e8400-e29b-41d4-a716-446655440002"],
    "status": "LIVE"
  }'
```

#### 2. Get Meeting Context
```bash
curl -X GET http://localhost:8084/api/context/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "X-User-Id: your-user-id" \
  -H "X-User-Email: your-email@example.com" \
  -H "X-User-Roles: member" \
  -H "X-User-TweenIds: tween-group-id-1"
```

#### 3. Add Transcript Chunk
```bash
curl -X POST http://localhost:8084/api/context/550e8400-e29b-41d4-a716-446655440000/transcript \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: your-user-id" \
  -H "X-User-Email: your-email@example.com" \
  -H "X-User-Roles: member" \
  -H "X-User-TweenIds: tween-group-id-1" \
  -d '{
    "speakerId": "speaker-1",
    "text": "Hello everyone, let's start the meeting",
    "timestamp": "2024-01-15T10:00:00"
  }'
```

#### 4. Add Decision
```bash
curl -X POST http://localhost:8084/api/context/550e8400-e29b-41d4-a716-446655440000/decisions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: your-user-id" \
  -H "X-User-Email: your-email@example.com" \
  -H "X-User-Roles: member" \
  -H "X-User-TweenIds: tween-group-id-1" \
  -d '{
    "text": "We will proceed with the proposed solution",
    "attributedSpeakerId": "speaker-1"
  }'
```

#### 5. Update Summary
```bash
curl -X PATCH http://localhost:8084/api/context/550e8400-e29b-41d4-a716-446655440000/summary \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: your-user-id" \
  -H "X-User-Email: your-email@example.com" \
  -H "X-User-Roles: member" \
  -H "X-User-TweenIds: tween-group-id-1" \
  -d '{
    "summary": "The team decided to implement the new feature using React and Spring Boot."
  }'
```

#### 6. Update Meeting Status
```bash
curl -X PATCH http://localhost:8084/api/context/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: your-user-id" \
  -H "X-User-Email: your-email@example.com" \
  -H "X-User-Roles: member" \
  -H "X-User-TweenIds: tween-group-id-1" \
  -d '{
    "status": "COMPLETE"
  }'
```

#### 7. Search Contexts
```bash
curl -X GET "http://localhost:8084/api/context/search?query=React&limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "X-User-Id: your-user-id" \
  -H "X-User-Email: your-email@example.com" \
  -H "X-User-Roles: member" \
  -H "X-User-TweenIds: tween-group-id-1"
```

#### 8. Get Briefing
```bash
curl -X GET "http://localhost:8084/api/context/briefing?meetingId=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "X-User-Id: your-user-id" \
  -H "X-User-Email: your-email@example.com" \
  -H "X-User-Roles: member" \
  -H "X-User-TweenIds: tween-group-id-1"
```

#### 9. Delete Meeting Context
```bash
curl -X DELETE http://localhost:8084/api/context/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "X-User-Id: your-user-id" \
  -H "X-User-Email: your-email@example.com" \
  -H "X-User-Roles: member" \
  -H "X-User-TweenIds: tween-group-id-1"
```

## Testing with Frontend

The frontend has API integration in `frontend/src/lib/api.ts`:

```typescript
// Create meeting context
await api.createMeetingContext(user, {
  meetingId: "uuid",
  participantIds: ["uuid"],
  tweenGroupIds: ["uuid"],
  status: "LIVE"
});

// Add transcript chunk
await api.addTranscriptChunk(user, meetingId, {
  speakerId: "speaker-1",
  text: "Hello",
  timestamp: new Date().toISOString()
});

// Add decision
await api.addDecision(user, meetingId, {
  text: "Decision text",
  attributedSpeakerId: "speaker-1"
});
```

## MongoDB Document Structure

Example meeting context document:

```json
{
  "_id": {
    "$oid": "65a1b2c3d4e5f6789012345"
  },
  "meetingId": "550e8400-e29b-41d4-a716-446655440000",
  "participantIds": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ],
  "tweenGroupIds": [
    "550e8400-e29b-41d4-a716-446655440003"
  ],
  "transcript": [
    {
      "speakerId": "speaker-1",
      "text": "Hello everyone",
      "timestamp": "2024-01-15T10:00:00"
    }
  ],
  "decisions": [
    {
      "text": "We will use React",
      "attributedSpeakerId": "speaker-1",
      "meetingId": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2024-01-15T10:05:00"
    }
  ],
  "tasksRef": [
    "550e8400-e29b-41d4-a716-446655440004"
  ],
  "topics": [
    "React",
    "Spring Boot",
    "Architecture"
  ],
  "summary": "The team decided to use React and Spring Boot",
  "status": "COMPLETE",
  "createdAt": "2024-01-15T10:00:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

## Common Issues

### Connection Refused
- Ensure MongoDB is running: `docker ps`
- Check port 27017 is not in use
- Verify docker-compose is up

### Authentication Errors
- Context-service uses gateway header authentication
- Ensure headers are set correctly: `X-User-Id`, `X-User-Email`, `X-User-Roles`, `X-User-TweenIds`
- The API Gateway should set these headers in production

### Empty Results
- Check that tweenGroupIds match between request and user
- Verify meetingId is correct
- Use MongoDB Compass to verify data exists

## Monitoring

### Check Context Service Logs
```bash
cd context-service
./mvnw spring-boot:run
# Logs will show MongoDB operations and API requests
```

### MongoDB Logs
```bash
docker logs meetup-mongodb
```

### Redis Logs
```bash
docker logs meetup-redis
```

## Performance Tips

1. **Indexing**: MongoDB automatically creates indexes on _id
2. **Caching**: Redis is configured for caching (check TopicExtractionService)
3. **Pagination**: Use limit and offset parameters for search
4. **Query Optimization**: Use specific fields in queries rather than fetching all documents

## Next Steps

1. Set up MongoDB Compass for easy visualization
2. Test the API endpoints using curl or Postman
3. Integrate with the frontend using the api.ts methods
4. Monitor MongoDB storage usage and performance
5. Set up MongoDB backups for production
