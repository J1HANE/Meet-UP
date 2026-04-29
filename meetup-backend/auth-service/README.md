# Meet-Up Auth Service

Authentication and authorization service for the Meet-Up collaboration platform.

## Features

- **User Registration** - Create new user accounts with email, password, and display name
- **User Login** - Authenticate users and issue JWT tokens
- **Token Refresh** - Refresh expired access tokens using refresh tokens
- **Logout** - Revoke refresh tokens
- **Current User** - Get authenticated user information

## Tech Stack

- Java 17
- Spring Boot 3.2.5
- Spring Security 6
- Spring Data JPA
- PostgreSQL
- JWT (jjwt 0.12.5)
- Lombok
- Maven

## API Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/register` | POST | No | Register a new user |
| `/api/auth/login` | POST | No | Login and get tokens |
| `/api/auth/refresh` | POST | No | Refresh access token |
| `/api/auth/logout` | POST | Yes | Logout and revoke token |
| `/api/auth/me` | GET | Yes | Get current user info |

## JWT Token Claims

The access token includes the following claims:

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "displayName": "Jane Doe",
  "roles": ["member"],
  "tweenIds": ["uuid-1", "uuid-2"],
  "type": "access"
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/meetup_auth` |
| `DATABASE_USERNAME` | Database username | `postgres` |
| `DATABASE_PASSWORD` | Database password | `postgres` |
| `JWT_SECRET` | Secret key for JWT signing | `meetupAuthSecretKeyForDevelopmentOnly2024` |
| `JWT_ACCESS_TOKEN_EXPIRATION` | Access token expiration in seconds | `900` (15 minutes) |
| `JWT_REFRESH_TOKEN_EXPIRATION` | Refresh token expiration in seconds | `604800` (7 days) |

## Running the Service

### Prerequisites

- Java 17
- PostgreSQL database

### Local Development

1. Start PostgreSQL and create database:
```sql
CREATE DATABASE meetup_auth;
```

2. Run the service:
```bash
./mvnw spring-boot:run
```

### Docker (Optional)

```bash
# Build image
docker build -t meetup-auth-service .

# Run container
docker run -p 8081:8081 \
  -e DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/meetup_auth \
  -e DATABASE_USERNAME=postgres \
  -e DATABASE_PASSWORD=postgres \
  meetup-auth-service
```

## Error Handling

All errors follow a standard format:

```json
{
  "code": "USER_NOT_FOUND",
  "message": "User not found with id: 550e8400-e29b-41d4-a716-446655440000",
  "details": {},
  "timestamp": "2024-04-29T10:00:00Z",
  "path": "/api/auth/me"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `USER_ALREADY_EXISTS` | 409 | Email is already registered |
| `USER_NOT_FOUND` | 404 | User not found |
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `TOKEN_REFRESH_FAILED` | 403 | Refresh token invalid or expired |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `ACCESS_DENIED` | 403 | Insufficient permissions |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique email address |
| password | VARCHAR(255) | Encrypted password (BCrypt) |
| display_name | VARCHAR(100) | User display name |
| active | BOOLEAN | Account status |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| last_login_at | TIMESTAMP | Last login timestamp |

### User Roles (Collection Table)

| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | Foreign key to users |
| role | VARCHAR(50) | Role name (e.g., "member", "admin") |

### User Tweens (Collection Table)

| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | Foreign key to users |
| tween_id | UUID | Associated tween/group ID |

### Refresh Tokens Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| token | VARCHAR(500) | Refresh token string |
| user_id | UUID | Associated user ID |
| expiry_date | TIMESTAMP | Token expiration |
| revoked | BOOLEAN | Token revocation status |

## Project Structure

```
auth-service/
├── src/main/java/com/meetup/authservice/
│   ├── AuthServiceApplication.java
│   ├── config/
│   │   └── SecurityConfig.java
│   ├── controller/
│   │   └── AuthController.java
│   ├── dto/
│   │   ├── AuthResponse.java
│   │   ├── ErrorResponse.java
│   │   ├── LoginRequest.java
│   │   ├── RefreshRequest.java
│   │   ├── RegisterRequest.java
│   │   └── UserResponse.java
│   ├── exception/
│   │   ├── AuthException.java
│   │   ├── GlobalExceptionHandler.java
│   │   ├── InvalidCredentialsException.java
│   │   ├── TokenRefreshException.java
│   │   ├── UserAlreadyExistsException.java
│   │   └── UserNotFoundException.java
│   ├── model/
│   │   ├── RefreshToken.java
│   │   └── User.java
│   ├── repository/
│   │   ├── RefreshTokenRepository.java
│   │   └── UserRepository.java
│   ├── security/
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── JwtUtil.java
│   │   ├── UserDetailsImpl.java
│   │   └── UserDetailsServiceImpl.java
│   └── service/
│       ├── AuthService.java
│       └── AuthServiceImpl.java
├── src/main/resources/
│   └── application.yml
├── Dockerfile
├── pom.xml
└── README.md
```

## OpenAPI Contract

The full API specification is available at:
- `/backend/contracts/auth.openapi.yaml`

## Security Notes

- Passwords are encrypted using BCrypt with strength 10
- JWT tokens are signed with HMAC-SHA256
- Refresh tokens are stored in the database and can be revoked
- Access tokens expire after 15 minutes by default
- Refresh tokens expire after 7 days by default

## Future Enhancements

- [ ] Email verification
- [ ] Password reset flow
- [ ] Account lockout after failed attempts
- [ ] OAuth2 integration (Google, GitHub)
- [ ] Two-factor authentication (2FA)
- [ ] Rate limiting per IP
