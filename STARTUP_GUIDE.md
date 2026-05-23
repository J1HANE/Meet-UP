# Meet-UP Startup and Testing Guide

## Starting the Application

### 1. Start Infrastructure Services

First, start the required infrastructure services (MongoDB, Redis, RabbitMQ, PostgreSQL):

```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Redis on port 6379
- RabbitMQ on port 5672 (AMQP) and 15672 (Management UI)
- PostgreSQL on port 5433

### 2. Start Auth Service

In a new terminal:

```bash
cd meetup-backend/auth-service
.\mvnw.cmd spring-boot:run
```

The auth service will start on port 8081.

### 3. Start Context Service

In another new terminal:

```bash
cd meetup-backend/context-service
.\mvnw.cmd spring-boot:run
```

The context service will start on port 8084.

### 4. Start Frontend

In another new terminal:

```bash
cd frontend
bun dev
# or
npm run dev
```

The frontend will start on port 5173 (or another port if 5173 is in use).

## Frontend Testing Checklist

### Authentication Flow

1. **User Registration**
   - Navigate to `/register`
   - Fill in email, password, and display name
   - Submit the form
   - Verify redirect to login page or email verification page
   - Check that user is created in database

2. **User Login**
   - Navigate to `/login`
   - Enter credentials
   - Submit the form
   - Verify redirect to dashboard
   - Check that access token is stored in localStorage

3. **Logout**
   - Click logout button
   - Verify redirect to login page
   - Check that tokens are cleared from localStorage

4. **Token Refresh**
   - Wait for access token to expire (or manually expire it)
   - Try to access a protected route
   - Verify automatic token refresh happens
   - Verify request is retried successfully

### User Profile Management

5. **View Profile**
   - Navigate to `/profile`
   - Verify user information is displayed correctly
   - Check email, display name, roles, and other fields

6. **Update Profile**
   - Navigate to profile settings
   - Update display name, bio, or other fields
   - Save changes
   - Verify updates are reflected in UI and database

7. **Change Password**
   - Navigate to security settings
   - Enter current password and new password
   - Submit the form
   - Verify password change success
   - Try logging in with new password

### 2FA Testing

8. **Setup 2FA**
   - Navigate to security settings
   - Click "Enable 2FA"
   - Scan QR code with authenticator app
   - Enter verification code
   - Verify 2FA is enabled

9. **Login with 2FA**
   - Logout
   - Login with credentials
   - Enter 2FA code
   - Verify successful login

10. **Disable 2FA**
    - Navigate to security settings
    - Click "Disable 2FA"
    - Enter verification code
    - Verify 2FA is disabled

### Meeting Context Testing

11. **Create Meeting Context**
    - Navigate to meetings page
    - Click "Create New Meeting"
    - Fill in meeting details
    - Submit the form
    - Verify meeting is created and appears in list

12. **Add Transcript Chunks**
    - Open a meeting
    - Add transcript entries (simulating real-time transcription)
    - Verify transcript chunks are saved and displayed

13. **Add Decisions**
    - In a meeting, click "Add Decision"
    - Enter decision text and speaker
    - Submit
    - Verify decision is saved and appears in decisions list

14. **Update Meeting Status**
    - Change meeting status from LIVE to COMPLETED
    - Verify status is updated

15. **View Meeting Briefing**
    - Click "View Briefing" for a meeting
    - Verify briefing shows summary, topics, and key decisions

16. **Search Meetings**
    - Use search functionality
    - Search by topic, status, or group
    - Verify search results are accurate

### Error Handling

17. **Invalid Credentials**
    - Try to login with wrong password
    - Verify error message is displayed
    - Verify no redirect happens

18. **Duplicate Registration**
    - Try to register with existing email
    - Verify error message is displayed

19. **Unauthorized Access**
    - Try to access protected route without authentication
    - Verify redirect to login page

20. **Admin Access**
    - Login as admin user
    - Try to access admin routes
    - Verify admin functionality works

## MongoDB Viewing Instructions

### Option 1: MongoDB Compass (GUI)

1. Download and install MongoDB Compass from: https://www.mongodb.com/try/download/compass

2. Open MongoDB Compass

3. Connect to MongoDB:
   - Connection string: `mongodb://localhost:27017`
   - Click "Connect"

4. Navigate to databases:
   - Click on the database name (likely `meetup_context` or similar)
   - Click on the `meeting_contexts` collection

5. View documents:
   - You'll see all meeting context documents
   - Each document contains:
     - `_id`: MongoDB internal ID
     - `meetingId`: UUID of the meeting
     - `participantIds`: List of participant UUIDs
     - `tweenGroupIds`: List of tween group UUIDs
     - `transcript`: Array of transcript chunks
     - `decisions`: Array of decisions
     - `tasksRef`: Array of task references
     - `topics`: Array of topic strings
     - `summary`: Meeting summary text
     - `status`: Meeting status enum (LIVE, COMPLETED, etc.)
     - `createdAt`: Creation timestamp
     - `updatedAt`: Last update timestamp

6. Filter documents:
   - Use the filter bar to query specific meetings
   - Example: `{ "meetingId": "your-uuid-here" }`

7. Edit documents:
   - Click on a document to view it
   - You can edit fields directly
   - Click "Update" to save changes

### Option 2: MongoDB Shell (Command Line)

1. Open a terminal and connect to MongoDB:

```bash
docker exec meetup-mongodb mongosh mongodb://localhost:27017
```

2. List databases:

```javascript
show dbs
```

3. Switch to the context service database:

```javascript
use meetup_context
```

4. List collections:

```javascript
show collections
```

5. View all documents in meeting_contexts collection:

```javascript
db.meeting_contexts.find()
```

6. View a specific document by meetingId:

```javascript
db.meeting_contexts.findOne({ "meetingId": UUID("your-uuid-here") })
```

7. Count documents:

```javascript
db.meeting_contexts.countDocuments()
```

8. View recent documents:

```javascript
db.meeting_contexts.find().sort({ "createdAt": -1 }).limit(10)
```

9. Filter by status:

```javascript
db.meeting_contexts.find({ "status": "LIVE" })
```

### Option 3: MongoDB Express (Web UI)

1. Install MongoDB Express:

```bash
npm install -g mongo-express
```

2. Start MongoDB Express:

```bash
mongo-express --url mongodb://localhost:27017
```

3. Open browser to: http://localhost:8081

4. Navigate through the web UI to view collections and documents

## Verifying Context Service Works

### Manual Verification Steps

1. **Create a test meeting context via API:**
```bash
curl -X POST http://localhost:8084/api/context \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user-id" \
  -H "X-User-Email: test@example.com" \
  -H "X-User-Roles: member" \
  -H "X-User-TweenIds: test-tween-id" \
  -d '{
    "meetingId": "550e8400-e29b-41d4-a716-446655440000",
    "participantIds": ["550e8400-e29b-41d4-a716-446655440001"],
    "tweenGroupIds": ["550e8400-e29b-41d4-a716-446655440002"],
    "status": "LIVE"
  }'
```

2. **Check MongoDB Compass** to verify the document was created

3. **Retrieve the meeting context:**
```bash
curl -X GET "http://localhost:8084/api/context/550e8400-e29b-41d4-a716-446655440000" \
  -H "X-User-Id: test-user-id" \
  -H "X-User-Email: test@example.com" \
  -H "X-User-Roles: member" \
  -H "X-User-TweenIds: test-tween-id"
```

4. **Add a transcript chunk:**
```bash
curl -X POST "http://localhost:8084/api/context/550e8400-e29b-41d4-a716-446655440000/transcript" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user-id" \
  -H "X-User-Email: test@example.com" \
  -H "X-User-Roles: member" \
  -H "X-User-TweenIds: test-tween-id" \
  -d '{
    "speakerId": "550e8400-e29b-41d4-a716-446655440001",
    "text": "This is a test transcript entry",
    "timestamp": "2024-01-01T00:00:00"
  }'
```

5. **Check MongoDB Compass** to verify the transcript was added

6. **Add a decision:**
```bash
curl -X POST "http://localhost:8084/api/context/550e8400-e29b-41d4-a716-446655440000/decisions" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user-id" \
  -H "X-User-Email: test@example.com" \
  -H "X-User-Roles: member" \
  -H "X-User-TweenIds: test-tween-id" \
  -d '{
    "text": "We decided to proceed with this approach",
    "attributedSpeakerId": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

7. **Check MongoDB Compass** to verify the decision was added

## Troubleshooting

### Services won't start

- Check if ports are already in use
- Verify Docker containers are running: `docker ps`
- Check logs: `docker logs <container_name>`

### Frontend can't connect to backend

- Verify backend services are running
- Check environment variables in `.env` file
- Verify CORS configuration allows frontend origin

### MongoDB connection issues

- Verify MongoDB container is running: `docker ps | grep mongo`
- Check MongoDB logs: `docker logs meetup-mongodb`
- Verify port 27017 is accessible

### RabbitMQ connection issues

- Verify RabbitMQ container is running: `docker ps | grep rabbitmq`
- Access RabbitMQ Management UI: http://localhost:15672 (guest/guest)
- Check for connection errors in service logs

## Summary

1. Start infrastructure with `docker-compose up -d`
2. Start auth-service on port 8081
3. Start context-service on port 8082
4. Start frontend on port 5173
5. Test authentication, profile management, 2FA, and meeting contexts
6. Use MongoDB Compass or mongosh to view and verify MongoDB documents
7. Use the manual API verification steps to ensure context service is working correctly
