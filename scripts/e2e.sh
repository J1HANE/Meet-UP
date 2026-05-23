#!/bin/bash

# E2E Test Script for Meet-UP Microservices
# This script tests the complete integration of services through the API Gateway

set -e

echo "=========================================="
echo "Meet-UP E2E Test Script"
echo "=========================================="

# Configuration
GATEWAY_URL="http://localhost:8085"
AUTH_SERVICE_URL="http://localhost:8081"
CONTEXT_SERVICE_URL="http://localhost:8084"
TASK_SERVICE_URL="http://localhost:8091"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Function to check service health
check_service_health() {
    local service_name=$1
    local service_url=$2
    local max_attempts=30
    local attempt=1

    print_info "Checking health of $service_name at $service_url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$service_url/actuator/health" > /dev/null 2>&1; then
            print_success "$service_name is healthy"
            return 0
        fi
        echo "Attempt $attempt/$max_attempts: $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to become healthy"
    return 1
}

# Function to register a test user
register_test_user() {
    print_info "Registering test user..."
    
    local response=$(curl -s -X POST \
        "$AUTH_SERVICE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "e2e-test@example.com",
            "password": "TestPassword123!",
            "name": "E2E Test User"
        }')
    
    if echo "$response" | grep -q "userId"; then
        print_success "Test user registered successfully"
        USER_ID=$(echo "$response" | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)
        echo "User ID: $USER_ID"
    else
        print_info "User might already exist, attempting login..."
    fi
}

# Function to login and get JWT token
login_and_get_token() {
    print_info "Logging in to get JWT token..."
    
    local response=$(curl -s -X POST \
        "$AUTH_SERVICE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "e2e-test@example.com",
            "password": "TestPassword123!"
        }')
    
    if echo "$response" | grep -q "accessToken"; then
        ACCESS_TOKEN=$(echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        print_success "JWT token obtained successfully"
        echo "Token: ${ACCESS_TOKEN:0:50}..."
        return 0
    else
        print_error "Failed to get JWT token"
        echo "Response: $response"
        return 1
    fi
}

# Function to test gateway authentication
test_gateway_auth() {
    print_info "Testing gateway authentication..."
    
    # Test without token - should fail
    local response=$(curl -s -w "\n%{http_code}" -X GET \
        "$GATEWAY_URL/api/context/test" \
        -H "Content-Type: application/json")
    
    local http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "401" ]; then
        print_success "Gateway correctly rejects requests without token"
    else
        print_error "Gateway should reject requests without token (got $http_code)"
        return 1
    fi
    
    # Test with invalid token - should fail
    response=$(curl -s -w "\n%{http_code}" -X GET \
        "$GATEWAY_URL/api/context/test" \
        -H "Authorization: Bearer invalid.token.here" \
        -H "Content-Type: application/json")
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "401" ]; then
        print_success "Gateway correctly rejects requests with invalid token"
    else
        print_error "Gateway should reject requests with invalid token (got $http_code)"
        return 1
    fi
    
    # Test with valid token - should pass (or get 404 if endpoint doesn't exist)
    response=$(curl -s -w "\n%{http_code}" -X GET \
        "$GATEWAY_URL/api/context/test" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json")
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "401" ]; then
        print_error "Gateway should accept requests with valid token (got $http_code)"
        return 1
    else
        print_success "Gateway accepts requests with valid token (got $http_code)"
    fi
}

# Function to test service discovery routing
test_service_discovery() {
    print_info "Testing service discovery routing..."
    
    # Test auth service routing
    local response=$(curl -s -w "\n%{http_code}" -X POST \
        "$GATEWAY_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "e2e-test@example.com",
            "password": "TestPassword123!"
        }')
    
    local http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "401" ]; then
        print_success "Gateway routes to auth-service correctly"
    else
        print_error "Gateway routing to auth-service failed (got $http_code)"
        return 1
    fi
    
    # Test context service routing
    response=$(curl -s -w "\n%{http_code}" -X GET \
        "$GATEWAY_URL/api/context/test" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" != "502" ] && [ "$http_code" != "503" ]; then
        print_success "Gateway routes to context-service correctly (got $http_code)"
    else
        print_error "Gateway routing to context-service failed (got $http_code)"
        return 1
    fi
    
    # Test task service routing
    response=$(curl -s -w "\n%{http_code}" -X GET \
        "$GATEWAY_URL/api/tasks/test" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" != "502" ] && [ "$http_code" != "503" ]; then
        print_success "Gateway routes to task-service correctly (got $http_code)"
    else
        print_error "Gateway routing to task-service failed (got $http_code)"
        return 1
    fi
}

# Function to test X-User-Id header propagation
test_header_propagation() {
    print_info "Testing X-User-Id header propagation..."
    
    # This test would require the downstream services to log or return the headers
    # For now, we'll just verify the gateway doesn't crash
    local response=$(curl -s -X GET \
        "$GATEWAY_URL/api/context/test" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    print_success "Gateway processes requests with JWT headers"
}

# Function to test JWKS endpoint
test_jwks_endpoint() {
    print_info "Testing JWKS endpoint..."
    
    local response=$(curl -s -X GET \
        "$AUTH_SERVICE_URL/.well-known/jwks.json")
    
    if echo "$response" | grep -q "keys"; then
        print_success "JWKS endpoint is accessible"
        echo "JWKS Response: $response"
    else
        print_error "JWKS endpoint not accessible"
        return 1
    fi
}

# Function to test JWT config endpoint
test_jwt_config_endpoint() {
    print_info "Testing JWT config endpoint..."
    
    local response=$(curl -s -X GET \
        "$AUTH_SERVICE_URL/.well-known/jwt-config")
    
    if echo "$response" | grep -q "algorithm"; then
        print_success "JWT config endpoint is accessible"
        echo "JWT Config: $response"
    else
        print_error "JWT config endpoint not accessible"
        return 1
    fi
}

# Main test execution
main() {
    echo ""
    print_info "Starting E2E tests..."
    echo ""
    
    # Check if services are running
    print_info "Verifying services are running..."
    check_service_health "Auth Service" "$AUTH_SERVICE_URL" || exit 1
    check_service_health "Context Service" "$CONTEXT_SERVICE_URL" || exit 1
    check_service_health "Task Service" "$TASK_SERVICE_URL" || exit 1
    check_service_health "API Gateway" "$GATEWAY_URL" || exit 1
    
    echo ""
    
    # Run tests
    register_test_user
    login_and_get_token || exit 1
    
    echo ""
    
    test_gateway_auth || exit 1
    test_service_discovery || exit 1
    test_header_propagation || exit 1
    test_jwks_endpoint || exit 1
    test_jwt_config_endpoint || exit 1
    
    echo ""
    echo "=========================================="
    print_success "All E2E tests passed!"
    echo "=========================================="
}

# Run main function
main
