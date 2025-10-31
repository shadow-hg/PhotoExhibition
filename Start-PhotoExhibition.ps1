#Requires -Version 5.1
[CmdletBinding()]
param(
    [int]$BackendPort,
    [int]$FrontendPort,
    [string]$BackendHost,
    [string]$FrontendHost,
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$NoBrowser,
    [switch]$ForceInstall
)

$ErrorActionPreference = 'Stop'

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Note {
    param([string]$Message)
    Write-Host "[NOTE] $Message" -ForegroundColor DarkGray
}

function Write-Success {
    param([string]$Message)
    Write-Host "[ OK ] $Message" -ForegroundColor Green
}

function Write-ErrorLine {
    param([string]$Message)
    Write-Host "[ERR ] $Message" -ForegroundColor Red
}

function ConvertTo-ArgumentString {
    param([string[]]$Arguments)
    if (-not $Arguments -or $Arguments.Count -eq 0) {
        return ''
    }

    return ($Arguments | ForEach-Object {
        if ($_ -match '[\s"`]') {
            '"' + ($_ -replace '"', '\"') + '"'
        }
        else {
            $_
        }
    }) -join ' '
}

function Test-PortInUse {
    param(
        [Parameter(Mandatory = $true)]
        [int]$Port
    )

    try {
        $connections = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction Stop
        if ($connections) {
            return $true
        }
    }
    catch {
        $pattern = "[:\.]$Port\s"
        $netstat = netstat -ano | Select-String -Pattern $pattern
        if ($netstat) {
            return $true
        }
    }

    return $false
}

function Get-AvailablePort {
    param(
        [Parameter(Mandatory = $true)]
        [int]$StartPort
    )

    $port = $StartPort
    while ($port -le 65535) {
        if (-not (Test-PortInUse -Port $port)) {
            return $port
        }
        $port++
    }

    throw "No available port found starting from $StartPort."
}

function Invoke-NpmInstall {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Directory,
        [Parameter(Mandatory = $true)][string]$Executable
    )

    Write-Info "Running npm install in $Name (this may take a moment on first run)..."
    Push-Location $Directory
    try {
        & $Executable install
        $exitCode = $LASTEXITCODE
    }
    finally {
        Pop-Location
    }

    if ($exitCode -ne 0) {
        throw "npm install failed in $Name (exit code $exitCode)."
    }

    Write-Success "$Name dependencies are ready."
}

function Start-NpmDevServer {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Directory,
        [Parameter(Mandatory = $true)][string]$Executable,
        [string[]]$ScriptArguments = @(),
        [hashtable]$Environment = @{}
    )

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $Executable
    $psi.WorkingDirectory = $Directory
    $psi.RedirectStandardError = $true
    $psi.RedirectStandardOutput = $true
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true

    $arguments = "run dev"
    if ($ScriptArguments -and $ScriptArguments.Count -gt 0) {
        $arguments += " -- " + (ConvertTo-ArgumentString -Arguments $ScriptArguments)
    }
    $psi.Arguments = $arguments

    foreach ($key in $Environment.Keys) {
        $psi.EnvironmentVariables[$key] = [string]$Environment[$key]
    }

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $psi
    $process.EnableRaisingEvents = $true

    $outputHandler = [System.Diagnostics.DataReceivedEventHandler]{
        param($sender, $eventArgs)
        if ($eventArgs.Data) {
            Write-Host ("[{0}] {1}" -f $Name, $eventArgs.Data) -ForegroundColor Gray
        }
    }

    $errorHandler = [System.Diagnostics.DataReceivedEventHandler]{
        param($sender, $eventArgs)
        if ($eventArgs.Data) {
            Write-Host ("[{0}] {1}" -f $Name, $eventArgs.Data) -ForegroundColor DarkYellow
        }
    }

    $exitHandler = [System.EventHandler]{
        param($sender, $eventArgs)
        $code = $sender.ExitCode
        if ($code -eq 0) {
            Write-Host ("[{0}] exited normally." -f $Name) -ForegroundColor DarkGray
        }
        else {
            Write-Host ("[{0}] exited unexpectedly (code {1})." -f $Name, $code) -ForegroundColor Red
        }
    }

    if (-not $process.Start()) {
        throw "Failed to start $Name service."
    }

    $process.add_OutputDataReceived($outputHandler)
    $process.add_ErrorDataReceived($errorHandler)
    $process.add_Exited($exitHandler)
    $process.BeginOutputReadLine()
    $process.BeginErrorReadLine()

    return [PSCustomObject]@{
        Name          = $Name
        Process       = $process
        OutputHandler = $outputHandler
        ErrorHandler  = $errorHandler
        ExitHandler   = $exitHandler
    }
}

$scriptRoot = Split-Path -Parent $PSCommandPath
$backendDir = Join-Path $scriptRoot 'backend'
$frontendDir = Join-Path $scriptRoot 'frontend'
$configPath = Join-Path $scriptRoot 'config\settings.json'

if (-not (Test-Path $configPath)) {
    throw "Config file not found at $configPath."
}

if ($SkipBackend -and $SkipFrontend) {
    Write-ErrorLine "Both backend and frontend are skipped; nothing to launch."
    return
}

$npmInfo = Get-Command npm -ErrorAction Stop
$npmExecutable = $npmInfo.Path
Write-Info "Found npm executable at $npmExecutable."

$originalConfigRaw = Get-Content -Path $configPath -Raw
$originalSettings = $originalConfigRaw | ConvertFrom-Json
$settings = $originalConfigRaw | ConvertFrom-Json

if (-not $BackendHost) {
    $BackendHost = $settings.backend.host
}
if (-not $FrontendHost) {
    $FrontendHost = $settings.frontend.devHost
}
if (-not $BackendPort) {
    $BackendPort = [int]$settings.backend.port
}
if (-not $FrontendPort) {
    $FrontendPort = [int]$settings.frontend.devPort
}

if (-not $SkipBackend) {
    if (Test-PortInUse -Port $BackendPort) {
        $newPort = Get-AvailablePort -StartPort $BackendPort
        if ($newPort -ne $BackendPort) {
    Write-Note "Backend port $BackendPort is busy, switching to $newPort."
            $BackendPort = $newPort
        }
    }
}

if (-not $SkipFrontend) {
    if (Test-PortInUse -Port $FrontendPort) {
        $newPort = Get-AvailablePort -StartPort $FrontendPort
        if ($newPort -ne $FrontendPort) {
    Write-Note "Frontend port $FrontendPort is busy, switching to $newPort."
            $FrontendPort = $newPort
        }
    }
}

$backendUrl = "http://$BackendHost`:$BackendPort"
$frontendUrl = "http://$FrontendHost`:$FrontendPort"

$settingsUpdated = $false
if ($settings.backend.host -ne $BackendHost -or
    $settings.backend.port -ne $BackendPort -or
    $settings.backend.publicBaseUrl -ne $backendUrl) {
    $settings.backend.host = $BackendHost
    $settings.backend.port = $BackendPort
    $settings.backend.publicBaseUrl = $backendUrl
    $settingsUpdated = $true
}

if ($settings.frontend.devHost -ne $FrontendHost -or
    $settings.frontend.devPort -ne $FrontendPort -or
    $settings.frontend.publicBaseUrl -ne $frontendUrl) {
    $settings.frontend.devHost = $FrontendHost
    $settings.frontend.devPort = $FrontendPort
    $settings.frontend.publicBaseUrl = $frontendUrl
    $settingsUpdated = $true
}

if ($settingsUpdated) {
    Write-Note "Updating config/settings.json to reflect launch parameters."
    $json = $settings | ConvertTo-Json -Depth 5
    [System.IO.File]::WriteAllText($configPath, $json + [Environment]::NewLine, [System.Text.Encoding]::UTF8)
}

$restorationAction = {
    param($path, $content, $wasUpdated)
    if ($wasUpdated) {
        Write-Note "Restoring original settings.json."
        [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
    }
}

function Ensure-Dependencies {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Directory,
        [Parameter(Mandatory = $true)][string]$Executable,
        [switch]$AlwaysInstall
    )

    $nodeModules = Join-Path $Directory 'node_modules'
    if ($AlwaysInstall -or -not (Test-Path $nodeModules)) {
        Invoke-NpmInstall -Name $Name -Directory $Directory -Executable $Executable
    }
    else {
        Write-Info "$Name already has node_modules, skipping npm install."
    }
}

try {
    Ensure-Dependencies -Name 'backend service' -Directory $backendDir -Executable $npmExecutable -AlwaysInstall:$ForceInstall
    Ensure-Dependencies -Name 'frontend app' -Directory $frontendDir -Executable $npmExecutable -AlwaysInstall:$ForceInstall

    $services = @()

    if (-not $SkipBackend) {
        Write-Info "Starting backend dev server at $backendUrl..."
        $backendService = Start-NpmDevServer -Name 'backend' -Directory $backendDir -Executable $npmExecutable -Environment @{
            PORT = $BackendPort
            HOST = $BackendHost
            NODE_ENV = 'development'
        }
        $services += $backendService
    }
    else {
        Write-Note "Backend launch skipped by request."
    }

    if (-not $SkipFrontend) {
        Write-Info "Starting frontend dev server at $frontendUrl..."
        $frontendArgs = @('--host', $FrontendHost, '--port', [string]$FrontendPort)
        $frontendService = Start-NpmDevServer -Name 'frontend' -Directory $frontendDir -Executable $npmExecutable -ScriptArguments $frontendArgs -Environment @{
            NODE_ENV = 'development'
        }
        $services += $frontendService
    }
    else {
        Write-Note "Frontend launch skipped by request."
    }

    if ($services.Count -eq 0) {
        Write-Note "No services were started."
        return
    }

    Write-Success "Services are up. Press Ctrl+C to stop them."
    if (-not $NoBrowser -and -not $SkipFrontend) {
        Write-Note "Opening the dev site in your browser (disable with -NoBrowser)."
        Start-Sleep -Seconds 2
        Start-Process $frontendUrl | Out-Null
    }

    $global:__photoexStopRequested = $false
    $cancelHandler = Register-EngineEvent -SourceIdentifier ConsoleCancelEvent -Action {
        param($sender, $eventArgs)
        $eventArgs.Cancel = $true
        $global:__photoexStopRequested = $true
        Write-Host "`nCtrl+C detected, shutting services down..." -ForegroundColor Yellow
    }

    try {
        while ($true) {
            if ($global:__photoexStopRequested) {
                break
            }

            $running = $services | Where-Object { -not $_.Process.HasExited }
            if (-not $running -or $running.Count -eq 0) {
                break
            }

            Start-Sleep -Milliseconds 300
        }
    }
    finally {
        if ($cancelHandler) {
            Unregister-Event -SourceIdentifier $cancelHandler.SourceIdentifier -ErrorAction SilentlyContinue
        }
    }
}
finally {
    Write-Note "Stopping child processes..."
    if ($services) {
        foreach ($service in $services) {
            if ($service.Process -and -not $service.Process.HasExited) {
                try {
                    $service.Process.Kill()
                    $service.Process.WaitForExit()
                }
                catch {
                    Write-Note "Failed to stop $($service.Name): $($_.Exception.Message)"
                }
            }

            if ($service.Process) {
                try { $service.Process.remove_OutputDataReceived($service.OutputHandler) } catch { }
                try { $service.Process.remove_ErrorDataReceived($service.ErrorHandler) } catch { }
                try { $service.Process.remove_Exited($service.ExitHandler) } catch { }
                $service.Process.Dispose()
            }
        }
    }

    $restorationAction.Invoke($configPath, $originalConfigRaw, $settingsUpdated) | Out-Null
}

Write-Success "All done."
