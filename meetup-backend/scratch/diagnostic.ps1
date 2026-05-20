$CONTEXT_URL = "http://localhost:8084/api/context"
$meetingId = "00000000-0000-0000-0000-000000000000"
$userId = [guid]::NewGuid().ToString()

Write-Host "Diagnostic: Testing Access to Seeded Meeting..."

# 1. Test with matching tweenId
Write-Host "Test 1: Valid access (matching tweenId)..."
$headers1 = @{
    "X-User-Id" = $userId
    "X-User-Email" = "diag@example.com"
    "X-User-Roles" = "member"
    "X-User-TweenIds" = "11111111-1111-1111-1111-111111111111"
}
try {
    $resp1 = Invoke-RestMethod -Uri "$CONTEXT_URL/briefing?meetingId=$meetingId" -Method Get -Headers $headers1
    Write-Host "SUCCESS: Got response: $($resp1 | ConvertTo-Json -Compress)"
} catch {
    Write-Host "FAILED: $($_.Exception.Message)"
    if ($_.ErrorDetails) { Write-Host "Details: $($_.ErrorDetails.Message)" }
}

# 2. Test with non-matching tweenId
Write-Host "`nTest 2: Denied access (different tweenId)..."
$headers2 = @{
    "X-User-Id" = $userId
    "X-User-Email" = "diag@example.com"
    "X-User-Roles" = "member"
    "X-User-TweenIds" = [guid]::NewGuid().ToString()
}
try {
    $resp2 = Invoke-RestMethod -Uri "$CONTEXT_URL/briefing?meetingId=$meetingId" -Method Get -Headers $headers2
    Write-Host "UNEXPECTED SUCCESS: Got response"
} catch {
    Write-Host "EXPECTED FAILURE: $($_.Exception.Message)"
}

# 3. Test with no headers (should be 403)
Write-Host "`nTest 3: No headers (unauthenticated)..."
try {
    $resp3 = Invoke-RestMethod -Uri "$CONTEXT_URL/briefing?meetingId=$meetingId" -Method Get
    Write-Host "UNEXPECTED SUCCESS: Got response"
} catch {
    Write-Host "EXPECTED FAILURE (403): $($_.Exception.Message)"
}
