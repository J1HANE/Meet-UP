# Meeting Service PostgreSQL Setup

## Option 1: Run PostgreSQL with Docker

From this folder:

```bash
docker compose -f docker-compose.postgres.yml up -d
```

The meeting service is already configured to use:

- database: `meetup_meeting_service`
- username: `meetup`
- password: `meetup_password`
- port: `5432`

Flyway will create the tables automatically on application startup.

## Option 2: Create the database manually in pgAdmin

Open Query Tool in pgAdmin and run the SQL from:

[`pgadmin-setup.sql`](/Users/mac/Documents/School/S8/JEE/Meet-UP/meetup-backend/meeting-service/pgadmin-setup.sql)

## Environment variables

If you want different credentials, export these before starting the app:

```bash
export MEETING_DB_URL=jdbc:postgresql://localhost:5432/meetup_meeting_service
export MEETING_DB_USERNAME=meetup
export MEETING_DB_PASSWORD=meetup_password
export JWT_SECRET=change-me
export STREAM_API_KEY=your-stream-key
export STREAM_API_SECRET=your-stream-secret
```

## Start the service

```bash
./mvnw spring-boot:run
```
