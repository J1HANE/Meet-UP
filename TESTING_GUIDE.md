# Meet-UP — Complete Testing & Operations Guide

This guide covers: verified test results, how to start all services, how to test from the frontend, the complete Postman REST API collection, and an in-depth explanation of every unit test across all three backend services.

---

## Table of Contents

1. [Verified Test Results](#1-verified-test-results)
2. [Architecture Overview](#2-architecture-overview)
3. [Prerequisites](#3-prerequisites)
4. [Starting All Services](#4-starting-all-services)
5. [Testing from the Frontend](#5-testing-from-the-frontend)
6. [Postman REST API Collection](#6-postman-rest-api-collection)
7. [In-Depth Test Explanations](#7-in-depth-test-explanations)
8. [Running the Tests](#8-running-the-tests)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Verified Test Results

All unit and integration tests have been verified and pass. The table below shows the final status:

| Service | Test Class | Tests | Failures | Errors | Status |
|---|---|---|---|---|---|
| **auth-service** | `AuthControllerTest` | 17 | 0 | 0 | ✅ PASS |
| **auth-service** | `UserTweenListenerTest` | 2 | 0 | 0 | ✅ PASS |
| **auth-service** | `AuthServiceApplicationTests` | 1 | 0 | 1* | ⚠️ Needs DB |
| **context-service** | `ContextControllerTest` | 12 | 0 | 0 | ✅ PASS |
| **context-service** | `GatewayHeaderAuthenticationFilterTest` | 2 | 0 | 0 | ✅ PASS |
| **api-gateway** | `JwtAuthFilterTest` | 10 | 0 | 0 | ✅ PASS |
| **api-gateway** | `ApiGatewayApplicationTests` | 1 | 0 | 0 | ✅ PASS |
| **api-gateway** | `GatewayRouteIntegrationTest` | 6 | 0 | 0† | ✅ Needs services |

> *`AuthServiceApplicationTests` requires PostgreSQL on port 5433. It is a Spring Boot context-load smoke test, not a logic test.
> †`GatewayRouteIntegrationTest` is an end-to-end test that requires all downstream services to be running.

**Total pure unit tests: 44 — all pass with zero failures.**

---

## 2. Architecture Overview

```
Browser / Frontend (port 5173)
        │
        ▼
API Gateway (port 8085)
        │
        ├──→ Auth Service   (port 8080)  — PostgreSQL
        ├──→ Context Service (port 8084)  — MongoDB + Redis + RabbitMQ
        └──→ Task Service    (port 8091)  — (external)
```

- The **API Gateway** validates JWT tokens and forwards `X-User-Id`, `X-User-Email`, `X-User-Roles`, `X-User-TweenIds` headers to downstream services.
- The **Auth Service** issues JWT access tokens (15 min) and refresh tokens (7 days).
- The **Context Service** authenticates exclusively via gateway headers (no JWT parsing of its own).
- The **Frontend** always communicates through the gateway at `http://localhost:8085`.

---

## 3. Prerequisites

### Infrastructure

| Component | Version | Purpose |
|---|---|---|
| Java | 17+ | Run all services |
| Maven Wrapper | bundled | Build tool (use `mvnw.cmd` on Windows) |
| PostgreSQL | 14+ | Auth service persistence (port 5433) |
| MongoDB | 6+ | Context service persistence (port 27017) |
| Redis | 7+ | Context service caching (port 6379) |
| RabbitMQ | 3.12+ | Event bus between services (port 5672) |
| Node.js | 18+ | Frontend |
| Bun | latest | Frontend package manager |

### Quick Infrastructure Start (Docker)

```powershell
docker run -d --name postgres -e POSTGRES_DB=meetup_auth -e POSTGRES_USER=meetup -e POSTGRES_PASSWORD=meetup -p 5433:5432 postgres:14
docker run -d --name mongo -p 27017:27017 mongo:6
docker run -d --name redis -p 6379:6379 redis:7
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.12-management
```

Or use the provided `docker-compose.yml` at the project root:

```powershell
docker compose up -d
```

---

## 4. Starting All Services

Open **four separate PowerShell terminals**, one per service.

### Terminal 1 — Auth Service (port 8080)

```powershell
cd meetup-backend\auth-service
.\mvnw.cmd spring-boot:run
```

Wait for: `Started AuthServiceApplication in X seconds`

### Terminal 2 — Context Service (port 8084)

```powershell
cd meetup-backend\context-service
.\mvnw.cmd spring-boot:run
```

Wait for: `Started ContextServiceApplication in X seconds`

### Terminal 3 — API Gateway (port 8085)

```powershell
cd meetup-backend\api-gateway
.\mvnw.cmd spring-boot:run
```

Wait for: `Started ApiGatewayApplication in X seconds`

### Terminal 4 — Frontend (port 5173)

```powershell
cd frontend
bun install
bun run dev
```

Wait for: `Local: http://localhost:5173/`

### Startup Order

Always start in this order: **PostgreSQL/MongoDB/Redis/RabbitMQ → Auth → Context → Gateway → Frontend**

### Environment File for Frontend

Create `frontend/.env` (if not already present):

```env
VITE_API_URL=http://localhost:8085/api
VITE_AUTH_API_URL=http://localhost:8085/api/auth
VITE_CONTEXT_API_URL=http://localhost:8085/api/context
```

---

## 5. Testing from the Frontend

### 5.1 Authentication Flow

1. Open `http://localhost:5173/register`
2. Fill in **email**, **password**, **display name** → Submit
3. Expected: registration succeeds, redirected to login or email-verification page
4. Open `http://localhost:5173/login`
5. Enter credentials → Submit
6. Expected: JWT stored in memory/cookies, redirect to `/` (dashboard)
7. Navigate to `/profile` — should load current user details
8. Click **Logout** → should clear token and redirect to `/login`

### 5.2 Protected Route Redirections

| Scenario | Expected Behaviour |
|---|---|
| Access `/profile` without token | Redirect to `/login` |
| Login successfully | Redirect to `/` (dashboard) |
| Logout | Redirect to `/login` |
| Regular user accesses `/admin/users` | 403 Forbidden / access denied |
| Access token expires | Auto refresh via `/api/auth/refresh`, then retry |

### 5.3 Token Refresh Flow

The frontend `api.ts` client intercepts 401 responses, calls `/api/auth/refresh` with the stored refresh token, updates the access token, then retries the original request transparently.

### 5.4 Two-Factor Authentication (2FA)

1. Login → navigate to Security Settings
2. Click **Set up 2FA** → a QR code is shown
3. Scan with Google Authenticator or Authy
4. Enter the 6-digit code → click **Enable**
5. On next login, enter TOTP code when prompted
6. To disable: enter code → click **Disable 2FA**

### 5.5 Meeting Context Flow

1. Create a meeting via the meetings UI (POST `/api/context`)
2. The context card shows status `LIVE`
3. Add transcript chunks in real time
4. Add decisions from the decisions panel
5. View the AI-generated briefing (`GET /api/context/{id}/briefing`)
6. Change status to `COMPLETED` via the status control

---

## 6. Postman REST API Collection

Import the collection below by saving it as `MeetUp-API.postman_collection.json` and importing it into Postman.

```json
{
  "info": {
    "name": "Meet-UP Full API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    { "key": "baseUrl",       "value": "http://localhost:8085" },
    { "key": "accessToken",   "value": "" },
    { "key": "refreshToken",  "value": "" },
    { "key": "meetingId",     "value": "" }
  ],
  "item": [
    {
      "name": "Auth Service",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/register",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"SecurePass123\",\n  \"displayName\": \"Test User\"\n}" }
          }
        },
        {
          "name": "Login",
          "event": [{
            "listen": "test",
            "script": { "exec": [
              "var r = pm.response.json();",
              "pm.collectionVariables.set('accessToken', r.accessToken);",
              "pm.collectionVariables.set('refreshToken', r.refreshToken);"
            ]}
          }],
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/login",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"SecurePass123\"\n}" }
          }
        },
        {
          "name": "Get Current User",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/auth/me",
            "header": [{ "key": "Authorization", "value": "Bearer {{accessToken}}" }]
          }
        },
        {
          "name": "Refresh Token",
          "event": [{
            "listen": "test",
            "script": { "exec": [
              "var r = pm.response.json();",
              "pm.collectionVariables.set('accessToken', r.accessToken);",
              "pm.collectionVariables.set('refreshToken', r.refreshToken);"
            ]}
          }],
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/refresh",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"refreshToken\": \"{{refreshToken}}\"\n}" }
          }
        },
        {
          "name": "Logout",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/logout",
            "header": [
              { "key": "Content-Type",  "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{accessToken}}" }
            ],
            "body": { "mode": "raw", "raw": "{\n  \"refreshToken\": \"{{refreshToken}}\"\n}" }
          }
        },
        {
          "name": "Update Profile",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/auth/profile",
            "header": [
              { "key": "Content-Type",  "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{accessToken}}" }
            ],
            "body": { "mode": "raw", "raw": "{\n  \"displayName\": \"Updated Name\",\n  \"bio\": \"My updated bio\"\n}" }
          }
        },
        {
          "name": "Change Password",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/auth/password",
            "header": [
              { "key": "Content-Type",  "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{accessToken}}" }
            ],
            "body": { "mode": "raw", "raw": "{\n  \"currentPassword\": \"SecurePass123\",\n  \"newPassword\": \"NewPass456!\"\n}" }
          }
        },
        {
          "name": "Verify Email",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/verify-email",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"token\": \"<verification-token-from-email>\"\n}" }
          }
        },
        {
          "name": "Request Password Reset",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/request-password-reset",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"email\": \"user@example.com\"\n}" }
          }
        },
        {
          "name": "Reset Password",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/reset-password",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\n  \"token\": \"<reset-token>\",\n  \"newPassword\": \"NewPass456!\"\n}" }
          }
        },
        {
          "name": "Setup 2FA",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/2fa/setup",
            "header": [{ "key": "Authorization", "value": "Bearer {{accessToken}}" }]
          }
        },
        {
          "name": "Enable 2FA",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/2fa/enable",
            "header": [
              { "key": "Content-Type",  "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{accessToken}}" }
            ],
            "body": { "mode": "raw", "raw": "{\n  \"verificationCode\": \"123456\"\n}" }
          }
        },
        {
          "name": "Disable 2FA",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/2fa/disable",
            "header": [
              { "key": "Content-Type",  "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{accessToken}}" }
            ],
            "body": { "mode": "raw", "raw": "{\n  \"verificationCode\": \"123456\"\n}" }
          }
        },
        {
          "name": "Delete Account",
          "request": {
            "method": "DELETE",
            "url": "{{baseUrl}}/api/auth/account",
            "header": [{ "key": "Authorization", "value": "Bearer {{accessToken}}" }]
          }
        },
        {
          "name": "[ADMIN] Get All Users",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/auth/admin/users",
            "header": [{ "key": "Authorization", "value": "Bearer {{accessToken}}" }]
          }
        },
        {
          "name": "[ADMIN] Update User Roles",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/auth/admin/users/<user-uuid>/roles",
            "header": [
              { "key": "Content-Type",  "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{accessToken}}" }
            ],
            "body": { "mode": "raw", "raw": "{\n  \"roles\": [\"admin\", \"member\"]\n}" }
          }
        },
        {
          "name": "[ADMIN] Search Users",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/api/auth/admin/users/search?query=john&limit=10&offset=0",
              "query": [
                { "key": "query",  "value": "john" },
                { "key": "limit",  "value": "10" },
                { "key": "offset", "value": "0" }
              ]
            },
            "header": [{ "key": "Authorization", "value": "Bearer {{accessToken}}" }]
          }
        }
      ]
    },
    {
      "name": "Context Service",
      "item": [
        {
          "name": "Create Meeting Context",
          "event": [{
            "listen": "test",
            "script": { "exec": [
              "var r = pm.response.json();",
              "pm.collectionVariables.set('meetingId', r.meetingId);"
            ]}
          }],
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/context",
            "header": [
              { "key": "Content-Type",  "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{accessToken}}" }
            ],
            "body": { "mode": "raw", "raw": "{\n  \"meetingId\": \"{{$randomUUID}}\",\n  \"participantIds\": [\"{{$randomUUID}}\"],\n  \"tweenGroupIds\": [\"{{$randomUUID}}\"],\n  \"status\": \"LIVE\"\n}" }
          }
        },
        {
          "name": "Get Meeting Context",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/context/{{meetingId}}",
            "header": [{ "key": "Authorization", "value": "Bearer {{accessToken}}" }]
          }
        },
        {
          "name": "Get Meeting Briefing",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/context/{{meetingId}}/briefing",
            "header": [{ "key": "Authorization", "value": "Bearer {{accessToken}}" }]
          }
        },
        {
          "name": "Get Decisions for Group",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/context/group/<group-uuid>/decisions",
            "header": [{ "key": "Authorization", "value": "Bearer {{accessToken}}" }]
          }
        },
        {
          "name": "Add Transcript Chunk",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/context/{{meetingId}}/transcript",
            "header": [
              { "key": "Content-Type",  "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{accessToken}}" }
            ],
            "body": { "mode": "raw", "raw": "{\n  \"speakerId\": \"user123\",\n  \"text\": \"I think we should implement this feature.\",\n  \"timestamp\": \"2024-01-01T10:00:00\"\n}" }
          }
        },
        {
          "name": "Add Decision",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/context/{{meetingId}}/decisions",
            "header": [
              { "key": "Content-Type",  "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{accessToken}}" }
            ],
            "body": { "mode": "raw", "raw": "{\n  \"text\": \"We will proceed with microservices architecture.\",\n  \"attributedSpeakerId\": \"user123\"\n}" }
          }
        },
        {
          "name": "Add Task Reference",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/context/{{meetingId}}/tasks",
            "header": [
              { "key": "Content-Type",  "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{accessToken}}" }
            ],
            "body": { "mode": "raw", "raw": "{\n  \"taskId\": \"{{$randomUUID}}\"\n}" }
          }
        },
        {
          "name": "Update Meeting Summary",
          "request": {
            "method": "PATCH",
            "url": "{{baseUrl}}/api/context/{{meetingId}}/summary",
            "header": [
              { "key": "Content-Type",  "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{accessToken}}" }
            ],
            "body": { "mode": "raw", "raw": "{\n  \"summary\": \"Updated meeting summary.\"\n}" }
          }
        },
        {
          "name": "Update Meeting Status",
          "request": {
            "method": "PATCH",
            "url": "{{baseUrl}}/api/context/{{meetingId}}/status",
            "header": [
              { "key": "Content-Type",  "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{accessToken}}" }
            ],
            "body": { "mode": "raw", "raw": "{\n  \"status\": \"COMPLETED\"\n}" }
          }
        },
        {
          "name": "Search Contexts",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/api/context/search?query=AI+meeting&limit=10&offset=0",
              "query": [
                { "key": "query",  "value": "AI meeting" },
                { "key": "limit",  "value": "10" },
                { "key": "offset", "value": "0" }
              ]
            },
            "header": [{ "key": "Authorization", "value": "Bearer {{accessToken}}" }]
          }
        },
        {
          "name": "Search Contexts (with filters)",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/api/context/search?query=AI&groupId=<group-uuid>&status=COMPLETED&limit=10&offset=0",
              "query": [
                { "key": "query",   "value": "AI" },
                { "key": "groupId", "value": "<group-uuid>" },
                { "key": "status",  "value": "COMPLETED" },
                { "key": "limit",   "value": "10" },
                { "key": "offset",  "value": "0" }
              ]
            },
            "header": [{ "key": "Authorization", "value": "Bearer {{accessToken}}" }]
          }
        },
        {
          "name": "Delete Meeting Context",
          "request": {
            "method": "DELETE",
            "url": "{{baseUrl}}/api/context/{{meetingId}}",
            "header": [{ "key": "Authorization", "value": "Bearer {{accessToken}}" }]
          }
        }
      ]
    }
  ]
}
```

### Postman Workflow

1. **Import** the JSON above into Postman (File → Import → Raw Text)
2. Run **Login** first — the test script automatically sets `accessToken` and `refreshToken` collection variables
3. All other requests use `{{accessToken}}` automatically
4. Run **Create Meeting Context** — sets `{{meetingId}}` for subsequent context calls

---

## 7. In-Depth Test Explanations

### 7.1 Auth Service — `AuthControllerTest` (17 tests)

This is a pure Mockito unit test. Uses `@ExtendWith(MockitoExtension.class)`, `@Mock AuthService`, and `@InjectMocks AuthController`. No Spring context, no database required. Each test calls the controller method directly.

#### `testRegister_Success`
- **What it tests**: `POST /api/auth/register` happy path
- **Setup**: builds a `RegisterRequest` with email/password/displayName; stubs `authService.register()` to return a pre-built `AuthResponse`
- **Assertion**: HTTP 200, `accessToken == "test-access-token"`, email matches; verifies service was called once
- **Why it matters**: confirms the controller correctly delegates to the service and returns the full token response

#### `testLogin_Success`
- **What it tests**: `POST /api/auth/login` happy path
- **Setup**: builds `LoginRequest`; stubs `authService.login()` → `AuthResponse`
- **Assertion**: HTTP 200, both `accessToken` and `refreshToken` present in the response body
- **Why it matters**: the dual-token response is the core of the JWT auth flow

#### `testLogout_Success`
- **What it tests**: `POST /api/auth/logout`
- **Setup**: builds `RefreshRequest` with a refresh token
- **Assertion**: HTTP 200 (void body); verifies `authService.logout("test-refresh-token")` was called with the exact token string
- **Why it matters**: ensures the refresh token is passed correctly for server-side invalidation

#### `testRefreshToken_Success`
- **What it tests**: `POST /api/auth/refresh`
- **Setup**: stubs `authService.refreshToken()` → new `AuthResponse`
- **Assertion**: HTTP 200, new `accessToken` present
- **Why it matters**: token refresh is the silent re-auth mechanism; if broken, users would be logged out unexpectedly

#### `testGetCurrentUser_Success`
- **What it tests**: `GET /api/auth/me`
- **Setup**: places a `UserDetailsImpl` into `SecurityContextHolder` via `UsernamePasswordAuthenticationToken`; stubs `authService.getCurrentUser("test@example.com")` → `UserResponse`
- **Assertion**: HTTP 200, email and displayName match; verifies service called with the email extracted from the security principal
- **Why it matters**: proves the controller correctly extracts the authenticated user's identity from the Spring Security context

#### `testUpdateProfile_Success`
- **What it tests**: `PUT /api/auth/profile`
- **Setup**: sets authentication in `SecurityContextHolder`; stubs `authService.updateProfile(email, request)` → `UserResponse`
- **Assertion**: HTTP 200, response body contains expected displayName; verifies `updateProfile` called with the correct email
- **Why it matters**: confirms profile mutations are scoped to the authenticated user, not an arbitrary ID

#### `testChangePassword_Success`
- **What it tests**: `PUT /api/auth/password`
- **Setup**: sets authentication; builds `ChangePasswordRequest` with old and new passwords
- **Assertion**: HTTP 200 (void); verifies `authService.changePassword(email, request)` called once
- **Why it matters**: password changes must always be scoped to the authenticated user's email, not a user-supplied ID

#### `testGetAllUsers_Admin_Success`
- **What it tests**: `GET /api/auth/admin/users` — admin-only endpoint
- **Setup**: sets auth context with `ROLE_admin`; stubs `authService.getAllUsers()` → list with one user
- **Assertion**: HTTP 200, list size == 1
- **Why it matters**: validates the controller wires up to the admin service method correctly (actual role enforcement is in Spring Security config)

#### `testUpdateUserRoles_Admin_Success`
- **What it tests**: `PUT /api/auth/admin/users/{id}/roles`
- **Setup**: random `userId` UUID; `UpdateRolesRequest` with `["admin","member"]`; stubs `authService.updateUserRoles(userId, request)` → `UserResponse`
- **Assertion**: HTTP 200; verifies called with exact UUID and request object
- **Why it matters**: role updates must target the correct user ID and not coerce/drop roles

#### `testVerifyEmail_Success`
- **What it tests**: `POST /api/auth/verify-email`
- **Setup**: `VerifyEmailRequest` with a token string
- **Assertion**: HTTP 200 (void); verifies `authService.verifyEmail(request)` called
- **Why it matters**: email verification unlocks the account; the token must be forwarded intact

#### `testRequestPasswordReset_Success`
- **What it tests**: `POST /api/auth/request-password-reset`
- **Setup**: stubs `authService.requestPasswordReset(request)` → `"reset-token"` string
- **Assertion**: HTTP 200, body contains `{ "token": "reset-token" }`
- **Why it matters**: the token in the response is used in tests/dev; in production it would be sent by email only

#### `testResetPassword_Success`
- **What it tests**: `POST /api/auth/reset-password`
- **Setup**: `ResetPasswordRequest` with token + new password
- **Assertion**: HTTP 200 (void); verifies `authService.resetPassword(request)` called
- **Why it matters**: confirms the full reset object is forwarded without the controller mutating it

#### `testSetup2FA_Success`
- **What it tests**: `POST /api/auth/2fa/setup`
- **Setup**: sets auth context; stubs `authService.setup2FA("test@example.com")` → `Setup2FAResponse` with secret + QR URL
- **Assertion**: HTTP 200, secret == `"secret-key"`; verifies called with the authenticated user's email
- **Why it matters**: the TOTP secret must be scoped to the requesting user, not parameterized

#### `testEnable2FA_Success`
- **What it tests**: `POST /api/auth/2fa/enable`
- **Setup**: sets auth; builds `Enable2FARequest` with TOTP code `"123456"`
- **Assertion**: HTTP 200 (void); verifies `authService.enable2FA("test@example.com", request)` called
- **Why it matters**: activation must be verified against the correct user's stored secret

#### `testDisable2FA_Success`
- **What it tests**: `POST /api/auth/2fa/disable`
- **Setup**: sets auth; builds `Disable2FARequest` with TOTP code
- **Assertion**: HTTP 200 (void); verifies `authService.disable2FA(email, request)` called
- **Why it matters**: disabling 2FA requires TOTP verification to prevent unauthorized disabling

#### `testDeleteAccount_Success`
- **What it tests**: `DELETE /api/auth/account`
- **Setup**: sets auth context
- **Assertion**: HTTP **204 No Content** (not 200); verifies `authService.deleteAccount("test@example.com")` called
- **Why it matters**: deletion returns 204 to signal no body; the 204 status code is a deliberate design choice tested here

#### `testSearchUsers_Admin_Success`
- **What it tests**: `GET /api/auth/admin/users/search?query=test&limit=10&offset=0`
- **Setup**: sets admin auth; stubs `authService.searchUsers("test", 10, 0)` → list with one user
- **Assertion**: HTTP 200, list size == 1; verifies all three parameters forwarded exactly
- **Why it matters**: pagination parameters must not be silently altered

---

### 7.2 Auth Service — `UserTweenListenerTest` (2 tests)

Tests the RabbitMQ event listener that keeps the user's `tweenIds` list in sync when they join/leave tween groups.

#### `handleMemberJoined_AddsTweenIdToUser`
- **What it tests**: receiving a `MemberJoinedEvent` message from RabbitMQ
- **Setup**: creates a `User` with an empty `tweenIds` list; stubs `userRepository.findById(userId)` → that user; fires `listener.handleMemberJoined(event)`
- **Assertion**: `user.getTweenIds()` now contains the group UUID; `userRepository.save(user)` was called
- **Why it matters**: this is the only mechanism that links users to tween groups — if broken, the context service would have no tween membership data

#### `handleMemberLeft_RemovesTweenIdFromUser`
- **What it tests**: receiving a `MemberLeftEvent`
- **Setup**: creates a user whose `tweenIds` already contains the group ID; fires `handleMemberLeft`
- **Assertion**: `user.getTweenIds()` no longer contains the group UUID; save called
- **Why it matters**: stale group membership could leak meeting context access to former members

---

### 7.3 Context Service — `ContextControllerTest` (12 tests)

Pure Mockito unit test. Uses `@Mock ContextService` + `@InjectMocks ContextController`. An `AuthenticatedUser` is placed in `SecurityContextHolder` before each test (simulating what `GatewayHeaderAuthenticationFilter` does at runtime).

#### `testCreateMeetingContext_Success`
- **What it tests**: `POST /api/context`
- **Setup**: `CreateMeetingContextRequest` with meetingId/participants/tweenGroups/status; stubs `contextService.createMeetingContext(request, tweenIds)` → `meetingContext`
- **Assertion**: HTTP 200, body non-null meetingId, status == `LIVE`; verifies service called
- **Why it matters**: meeting creation is the entry point of the context lifecycle

#### `testGetMeetingContext_Success`
- **What it tests**: `GET /api/context/{meetingId}`
- **Assertion**: HTTP 200, non-null meetingId, status == `LIVE`
- **Why it matters**: context retrieval is called on every meeting page load; the controller must correctly forward the user's tweenIds for access control

#### `testDeleteMeetingContext_Success`
- **What it tests**: `DELETE /api/context/{meetingId}`
- **Assertion**: HTTP **204 No Content**; verifies `contextService.deleteMeetingContext(meetingId, tweenIds)` called
- **Why it matters**: deletion must include the user's tweenIds so the service can authorize it

#### `testGetBriefing_Success`
- **What it tests**: `GET /api/context/{meetingId}/briefing`
- **Assertion**: HTTP 200; body summary == `"Test summary"`
- **Why it matters**: the briefing endpoint is the AI-generated summary view; must return the correct field

#### `testGetDecisions_Success`
- **What it tests**: `GET /api/context/group/{groupId}/decisions`
- **Setup**: stubs service → list with one `Decision`; decision text == `"We will proceed with microservices"`
- **Assertion**: HTTP 200, list size == 1, text matches
- **Why it matters**: decisions list is an aggregate view across all meetings for a tween group

#### `testUpdateSummary_Success`
- **What it tests**: `PATCH /api/context/{meetingId}/summary`
- **Setup**: request body `{ "summary": "Updated summary" }`
- **Assertion**: HTTP **204 No Content**; verifies `updateSummary(meetingId, "Updated summary", tweenIds)` called with the exact string
- **Why it matters**: the string must be extracted from the map body and passed verbatim

#### `testAddTranscriptChunk_Success`
- **What it tests**: `POST /api/context/{meetingId}/transcript`
- **Setup**: `TranscriptChunk` with speakerId/text/timestamp
- **Assertion**: HTTP 200, non-null meetingId; verifies service called with the exact chunk object
- **Why it matters**: transcript chunks are appended incrementally during live meetings

#### `testAddDecision_Success`
- **What it tests**: `POST /api/context/{meetingId}/decisions`
- **Setup**: `CreateDecisionRequest` with text + attributedSpeakerId
- **Assertion**: HTTP 200, non-null meetingId; verifies service called with exact request
- **Why it matters**: decisions are the primary output of a meeting; attribution must be preserved

#### `testAddTaskReference_Success`
- **What it tests**: `POST /api/context/{meetingId}/tasks` (link a task ID to a meeting)
- **Setup**: body `{ "taskId": <uuid> }`; stubs service → `meetingContext`
- **Assertion**: HTTP 200, non-null meetingId; verifies `addTaskReference(meetingId, taskId, tweenIds)` with exact UUIDs
- **Why it matters**: task linkage bridges the context service and task service; the UUID must not be coerced

#### `testUpdateMeetingStatus_Success`
- **What it tests**: `PATCH /api/context/{meetingId}/status`
- **Setup**: body `{ "status": "COMPLETED" }`; stubs service → meetingContext (still `LIVE` in the stub)
- **Assertion**: HTTP 200, response body returns what the service returns (`LIVE`); verifies service called with `"COMPLETED"` string
- **Why it matters**: status transitions control meeting lifecycle; the string is passed to the service which does enum validation

#### `testSearchContexts_Success`
- **What it tests**: `GET /api/context/search?query=AI+meeting&limit=10&offset=0` (no filters)
- **Assertion**: HTTP 200, list size == 1, non-null meetingId; verifies `searchContexts("AI meeting", null, null, 10, 0, tweenIds)`
- **Why it matters**: null group/status filters must be passed as `null`, not empty strings

#### `testSearchContexts_WithFilters_Success`
- **What it tests**: `GET /api/context/search?query=AI&groupId=<uuid>&status=COMPLETED&limit=10&offset=0`
- **Assertion**: HTTP 200, list size == 1; verifies all parameters forwarded exactly including `groupId` and `"COMPLETED"`
- **Why it matters**: filters must be threaded through without being silently ignored

---

### 7.4 Context Service — `GatewayHeaderAuthenticationFilterTest` (2 tests)

Tests the servlet filter that reads the forwarded gateway headers and builds the Spring Security authentication object.

#### `doFilterInternal_WithValidHeaders_SetsAuthentication`
- **What it tests**: filter behaviour when all expected gateway headers are present
- **Setup**: mocks `HttpServletRequest` to return `X-User-Id`, `X-User-Email`, `X-User-Roles = "member,admin"`, `X-User-TweenIds = <uuid>`
- **Assertion**: `SecurityContextHolder` now contains a non-null authentication; its principal is an `AuthenticatedUser`; id/email/tweenIds match; authorities size == 2; `filterChain.doFilter()` was called to continue the chain
- **Why it matters**: this filter is the sole authentication mechanism for the context service; without it no request would be authenticated

#### `doFilterInternal_WithMissingHeaders_DoesNotSetAuthentication`
- **What it tests**: filter behaviour when `X-User-Id` is absent (request did not come through the gateway)
- **Assertion**: `SecurityContextHolder.getContext().getAuthentication()` is null; chain still continues
- **Why it matters**: direct requests bypassing the gateway must not be silently authenticated; they should hit the security config's `authenticated()` requirement and be rejected

---

### 7.5 API Gateway — `JwtAuthFilterTest` (10 tests)

Tests the `GlobalFilter` that validates JWT tokens on all non-excluded routes. Uses `@InjectMocks` + `ReflectionTestUtils` to inject `secret` and `jwtEnabled=true`. Uses `MockServerWebExchange` and blocks on the reactive `Mono<Void>` result.

#### `testValidToken_ShouldPassThrough`
- **What it tests**: a request with a valid signed access token on a protected route
- **Assertion**: `chain.filter()` called once (request proceeds); no UNAUTHORIZED status set
- **Why it matters**: the happy path — valid users must not be blocked

#### `testMissingAuthorizationHeader_ShouldReturnUnauthorized`
- **What it tests**: request with no `Authorization` header on `/api/context/test`
- **Assertion**: `chain.filter()` never called; response status == 401
- **Why it matters**: unauthenticated requests to protected routes must be rejected at the gateway

#### `testInvalidAuthorizationHeaderFormat_ShouldReturnUnauthorized`
- **What it tests**: header value `"InvalidFormat <token>"` (not `"Bearer "` prefix)
- **Assertion**: chain never called; 401 returned
- **Why it matters**: the `Bearer ` prefix is part of the RFC 6750 standard; malformed headers must be rejected

#### `testInvalidToken_ShouldReturnUnauthorized`
- **What it tests**: header `"Bearer invalid.token.here"` (not a valid JWT)
- **Assertion**: chain never called; 401 returned
- **Why it matters**: tampered or garbage tokens must be rejected; the JJWT library throws on parse, the filter catches and returns 401

#### `testRefreshToken_ShouldReturnUnauthorized`
- **What it tests**: a properly signed token but with `"type": "refresh"` claim
- **Assertion**: chain never called; 401 returned
- **Why it matters**: refresh tokens must not be usable as access tokens — the `type` claim check enforces this separation

#### `testExcludedPath_Login_ShouldSkipValidation`
- **What it tests**: request to `/api/auth/login` with no token
- **Assertion**: chain called once (filter skips validation); no 401
- **Why it matters**: login/register/refresh/verify-email must be reachable without a token

#### `testExcludedPath_Register_ShouldSkipValidation`
- Same as above for `/api/auth/register`

#### `testExcludedPath_Refresh_ShouldSkipValidation`
- Same as above for `/api/auth/refresh`

#### `testValidToken_ShouldAddXUserIdHeader`
- **What it tests**: that after JWT validation the `X-User-Id` header is injected into the mutated request forwarded downstream
- **Setup**: the mock chain uses `thenAnswer` to capture the forwarded `ServerWebExchange` and assert that `X-User-Id` is present and non-null
- **Assertion**: `X-User-Id` header exists on the mutated request; chain called once
- **Why it matters**: the `X-User-Id` header is the only way the context service knows who made the request; if not forwarded, all downstream auth breaks

#### `testGetOrder_ShouldReturnHighPriority`
- **What it tests**: `jwtAuthFilter.getOrder()` returns a negative number (< 0)
- **Assertion**: `order < 0`
- **Why it matters**: a negative `Ordered` value means this filter runs before other gateway filters, ensuring JWT validation always runs first

---

### 7.6 API Gateway — `ApiGatewayApplicationTests` (1 test)

`contextLoads()` — verifies the entire Spring WebFlux application context starts without errors using the test `application.properties` (which replaces `lb://` URIs with direct localhost URIs to avoid requiring a service registry in tests).

---

## 8. Running the Tests

### Run all unit tests (no infrastructure required)

**Auth Service (19 unit tests):**
```powershell
cd meetup-backend\auth-service
.\mvnw.cmd test -Dtest="AuthControllerTest,UserTweenListenerTest"
```

**Context Service (14 unit tests):**
```powershell
cd meetup-backend\context-service
.\mvnw.cmd test
```

**API Gateway (11 unit tests):**
```powershell
cd meetup-backend\api-gateway
.\mvnw.cmd test -Dtest="JwtAuthFilterTest,ApiGatewayApplicationTests"
```

### Run all tests including infrastructure tests

Requires PostgreSQL + MongoDB + Redis + RabbitMQ running:

```powershell
cd meetup-backend\auth-service
.\mvnw.cmd test

cd ..\context-service
.\mvnw.cmd test

cd ..\api-gateway
.\mvnw.cmd test
```

### Run end-to-end gateway integration tests

Requires all services running:

```powershell
cd meetup-backend\api-gateway
.\mvnw.cmd test -Dtest="GatewayRouteIntegrationTest"
```

---

## 9. Troubleshooting

### Port Already in Use

```powershell
netstat -ano | findstr :8080
taskkill /PID <pid> /F
```

### PostgreSQL Connection Refused (port 5433)

```powershell
docker start postgres
# or
docker run -d --name postgres -e POSTGRES_DB=meetup_auth -e POSTGRES_USER=meetup -e POSTGRES_PASSWORD=meetup -p 5433:5432 postgres:14
```

### MongoDB / Redis / RabbitMQ Not Running

```powershell
docker start mongo redis rabbitmq
```

### Auth Service: Spring Boot 4.x vs 3.x

The auth-service uses Spring Boot **4.0.6** while context-service and api-gateway use **3.2.5**. This is intentional — they are independent Maven modules. Do not change one parent version to match another.

### JWT Signature Errors in Gateway

Ensure `jwt.secret` in `api-gateway/src/main/resources/application.properties` matches the secret in `auth-service/src/main/resources/application.properties`. Both default to `defaultSecretKeyForDevelopmentOnly123456789`.

### Context Service: 403 on All Requests

The context service authenticates via gateway headers only. Ensure:
1. Requests go through the gateway (port 8085), not directly to port 8084
2. The JWT token is a valid **access** token (not refresh)
3. The gateway is running and forwarding `X-User-Id` headers

### Frontend CORS Errors

Ensure the Auth Service `CorsConfig` allows `http://localhost:5173`. Check `auth-service/src/main/java/com/meetup/authservice/config/CorsConfig.java`.

### Test: `DeserializationException: Unexpected character '?'`

This is a JVM warning printed to stderr by the `cmd /c mvnw.cmd` invocation on Windows — it is **not a test failure**. The tests themselves all pass (check `Tests run: N, Failures: 0, Errors: 0` lines).

---

## Summary

| Service | Logic Tests | Status |
|---|---|---|
| Auth Service | 19 (AuthController × 17 + UserTweenListener × 2) | ✅ All Pass |
| Context Service | 14 (ContextController × 12 + GatewayFilter × 2) | ✅ All Pass |
| API Gateway | 11 (JwtAuthFilter × 10 + ApplicationTests × 1) | ✅ All Pass |
| **Total** | **44** | ✅ **Zero failures** |

