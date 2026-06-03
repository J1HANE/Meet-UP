#!/usr/bin/env powershell
# Script de test d'intégration complet pour Meet-UP
# Ce script exécute tous les tests Maven et génère un rapport

param(
    [switch]$SkipUnitTests,
    [switch]$SkipIntegrationTests,
    [switch]$StartInfrastructure,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$totalTestsRun = 0
$totalTestsPassed = 0
$totalTestsFailed = 0
$testResults = @()
$startTime = Get-Date

# Couleurs pour la console
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

function Write-Header($text) {
    Write-Host "`n========================================" -ForegroundColor $Cyan
    Write-Host $text -ForegroundColor $Cyan
    Write-Host "========================================" -ForegroundColor $Cyan
}

function Write-Success($text) {
    Write-Host "✅ $text" -ForegroundColor $Green
}

function Write-Error($text) {
    Write-Host "❌ $text" -ForegroundColor $Red
}

function Write-Warning($text) {
    Write-Host "⚠️  $text" -ForegroundColor $Yellow
}

function Run-ServiceTests($serviceName, $servicePath, $testClasses = $null) {
    Write-Header "Testing: $serviceName"
    
    $serviceStartTime = Get-Date
    $originalLocation = Get-Location
    
    try {
        Set-Location $servicePath
        
        # Construire la commande Maven
        $mvnCommand = ".\mvnw.cmd test -q"
        if ($testClasses) {
            $mvnCommand += " -Dtest=`"$testClasses`""
        }
        
        Write-Host "Executing: $mvnCommand" -ForegroundColor $Cyan
        
        # Capturer la sortie
        $output = Invoke-Expression $mvnCommand 2>&1
        $exitCode = $LASTEXITCODE
        
        if ($Verbose) {
            $output | ForEach-Object { Write-Host $_ }
        }
        
        # Parser les résultats
        $testSummary = $output | Select-String -Pattern "Tests run:.*Failures:.*Errors:.*Skipped:.*" | Select-Object -Last 1
        
        if ($testSummary) {
            $matches = [regex]::Match($testSummary, "Tests run: (\d+), Failures: (\d+), Errors: (\d+), Skipped: (\d+)")
            if ($matches.Success) {
                $run = [int]$matches.Groups[1].Value
                $failures = [int]$matches.Groups[2].Value
                $errors = [int]$matches.Groups[3].Value
                $skipped = [int]$matches.Groups[4].Value
                $passed = $run - $failures - $errors
                
                $global:totalTestsRun += $run
                $global:totalTestsPassed += $passed
                $global:totalTestsFailed += ($failures + $errors)
                
                $result = [PSCustomObject]@{
                    Service = $serviceName
                    TestsRun = $run
                    Passed = $passed
                    Failed = $failures
                    Errors = $errors
                    Skipped = $skipped
                    Duration = ((Get-Date) - $serviceStartTime).ToString("mm\:ss")
                    Status = if (($failures + $errors) -eq 0) { "PASS" } else { "FAIL" }
                }
                
                $global:testResults += $result
                
                if (($failures + $errors) -eq 0) {
                    Write-Success "$serviceName: $passed/$run tests passed"
                } else {
                    Write-Error "$serviceName: $($failures + $errors) tests failed out of $run"
                }
            }
        } else {
            # Pas de tests trouvés ou erreur de parsing
            if ($exitCode -eq 0) {
                Write-Success "$serviceName: Build successful (no test summary found)"
            } else {
                Write-Error "$serviceName: Build failed with exit code $exitCode"
                $global:testResults += [PSCustomObject]@{
                    Service = $serviceName
                    TestsRun = 0
                    Passed = 0
                    Failed = 0
                    Errors = 1
                    Skipped = 0
                    Duration = ((Get-Date) - $serviceStartTime).ToString("mm\:ss")
                    Status = "ERROR"
                }
            }
        }
        
        return $exitCode
    }
    catch {
        Write-Error "$serviceName: Exception occurred - $($_.Exception.Message)"
        $global:testResults += [PSCustomObject]@{
            Service = $serviceName
            TestsRun = 0
            Passed = 0
            Failed = 0
            Errors = 1
            Skipped = 0
            Duration = ((Get-Date) - $serviceStartTime).ToString("mm\:ss")
            Status = "EXCEPTION"
        }
        return 1
    }
    finally {
        Set-Location $originalLocation
    }
}

# ==================== MAIN ====================

Write-Header "MEET-UP INTEGRATION TEST SUITE"
Write-Host "Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "Working directory: $(Get-Location)"

# Vérifier les prérequis
Write-Header "Prerequisites Check"

# Vérifier Java
$javaVersion = java -version 2>&1 | Select-String -Pattern '"[\d.]+"' | ForEach-Object { $_.Matches.Value }
if ($javaVersion) {
    Write-Success "Java version: $javaVersion"
} else {
    Write-Error "Java not found! Please install Java 17+"
    exit 1
}

# Vérifier Docker (optionnel)
$dockerAvailable = $null -ne (Get-Command docker -ErrorAction SilentlyContinue)
if ($dockerAvailable) {
    Write-Success "Docker available"
} else {
    Write-Warning "Docker not available - integration tests requiring infrastructure will be skipped"
}

# Démarrer l'infrastructure si demandé
if ($StartInfrastructure -and $dockerAvailable) {
    Write-Header "Starting Infrastructure"
    docker compose up -d mongodb redis rabbitmq postgres neo4j
    Write-Host "Waiting for infrastructure to be ready..."
    Start-Sleep -Seconds 10
}

# Tests par service
$basePath = ".\meetup-backend"

if (-not $SkipUnitTests) {
    Write-Header "PHASE 1: UNIT TESTS"
    
    # Auth Service - Tests unitaires uniquement
    Run-ServiceTests -serviceName "Auth Service" `
        -servicePath "$basePath\auth-service" `
        -testClasses "AuthControllerTest,UserTweenListenerTest"
    
    # Context Service - Tous les tests
    Run-ServiceTests -serviceName "Context Service" `
        -servicePath "$basePath\context-service"
    
    # API Gateway
    Run-ServiceTests -serviceName "API Gateway" `
        -servicePath "$basePath\api-gateway" `
        -testClasses "JwtAuthFilterTest,ApiGatewayApplicationTests"
}

if (-not $SkipIntegrationTests) {
    Write-Header "PHASE 2: INTEGRATION TESTS"
    
    # Meeting Service
    Run-ServiceTests -serviceName "Meeting Service" `
        -servicePath "$basePath\meeting-service"
    
    # Task Service
    Run-ServiceTests -serviceName "Task Service" `
        -servicePath "$basePath\task-service"
    
    # AI Service (nécessite Redis)
    Run-ServiceTests -serviceName "AI Service" `
        -servicePath "$basePath\ai-service" `
        -testClasses "MeetingIntelligenceTest"
    
    # Tweening Service (nécessite Neo4j + RabbitMQ)
    Run-ServiceTests -serviceName "Tweening Service" `
        -servicePath "$basePath\tweening-service" `
        -testClasses "GroupLifecycleIntegrationTest"
    
    # Notification Service
    Run-ServiceTests -serviceName "Notification Service" `
        -servicePath "$basePath\notification-service"
}

# ==================== RAPPORT ====================

$endTime = Get-Date
$totalDuration = $endTime - $startTime

Write-Header "TEST SUMMARY REPORT"

# Tableau de résultats
$testResults | Format-Table -Property Service, TestsRun, Passed, Failed, Errors, Skipped, Duration, Status -AutoSize

# Statistiques globales
Write-Host "`nOverall Statistics:" -ForegroundColor $Cyan
Write-Host "  Total Tests Run:    $totalTestsRun" -ForegroundColor White
Write-Host "  Tests Passed:       $totalTestsPassed" -ForegroundColor $Green
Write-Host "  Tests Failed:       $totalTestsFailed" -ForegroundColor $(if ($totalTestsFailed -gt 0) { $Red } else { $Green })
Write-Host "  Success Rate:       $([math]::Round(($totalTestsPassed / $totalTestsRun) * 100, 2))%" -ForegroundColor White
Write-Host "  Total Duration:     $($totalDuration.ToString("mm\:ss"))" -ForegroundColor White

# Services qui ont échoué
$failedServices = $testResults | Where-Object { $_.Status -ne "PASS" }
if ($failedServices) {
    Write-Header "FAILED SERVICES"
    $failedServices | ForEach-Object {
        Write-Error "$($_.Service): $($_.Failed) failed, $($_.Errors) errors"
    }
}

# Export du rapport JSON
$report = [PSCustomObject]@{
    Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    Duration = $totalDuration.ToString()
    Summary = [PSCustomObject]@{
        TotalTests = $totalTestsRun
        Passed = $totalTestsPassed
        Failed = $totalTestsFailed
        SuccessRate = [math]::Round(($totalTestsPassed / $totalTestsRun) * 100, 2)
    }
    Results = $testResults
}

$reportPath = ".\test-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$report | ConvertTo-Json -Depth 3 | Out-File $reportPath
Write-Host "`nDetailed report saved to: $reportPath" -ForegroundColor $Cyan

# Status final
Write-Header "FINAL STATUS"
if ($totalTestsFailed -eq 0 -and $totalTestsRun -gt 0) {
    Write-Success "ALL TESTS PASSED!"
    exit 0
} else {
    Write-Error "SOME TESTS FAILED"
    exit 1
}
