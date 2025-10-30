$ErrorActionPreference = 'Stop'

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Get-AvailablePort {
    param (
        [Parameter(Mandatory = $true)]
        [int] $StartingPort,
        [int] $MaxAttempts = 20
    )

    for ($offset = 0; $offset -lt $MaxAttempts; $offset++) {
        $port = $StartingPort + $offset
        $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
        try {
            $listener.Start()
            $listener.Stop()
            return $port
        }
        catch {
            if ($listener) {
                try { $listener.Stop() } catch { }
            }
        }
    }

    throw "Unable to find an available port starting from $StartingPort after $MaxAttempts attempts."
}

function Invoke-NpmBuild {
    param (
        [Parameter(Mandatory = $true)]
        [string] $SubDirectory
    )

    $targetPath = Join-Path $rootDir $SubDirectory
    Write-Host "Switching to $targetPath for build"

    Push-Location $targetPath
    try {
        npm install
        npm run build
    }
    finally {
        Pop-Location
    }
}

function Start-ViteDev {
    param (
        [Parameter(Mandatory = $true)]
        [string] $SubDirectory,
        [Parameter(Mandatory = $true)]
        [int] $PreferredPort
    )

    $targetPath = Join-Path $rootDir $SubDirectory
    $port = Get-AvailablePort -StartingPort $PreferredPort

    if ($port -ne $PreferredPort) {
        Write-Host "Requested port $PreferredPort is busy for $SubDirectory. Using $port instead."
    }

    $arguments = @('run', 'dev', '--', '--port', $port)

    $process = Start-Process -FilePath 'npm' `
        -ArgumentList $arguments `
        -WorkingDirectory $targetPath `
        -NoNewWindow `
        -PassThru

    Write-Host "Started $SubDirectory dev server on http://localhost:$port (PID $($process.Id))"

    return [PSCustomObject]@{
        Name = $SubDirectory
        Port = $port
        Pid  = $process.Id
        Url  = "http://localhost:$port"
    }
}

function Start-BackendDev {
    param (
        [Parameter(Mandatory = $true)]
        [string] $SubDirectory,
        [Parameter(Mandatory = $true)]
        [int] $PreferredPort
    )

    $targetPath = Join-Path $rootDir $SubDirectory
    $port = Get-AvailablePort -StartingPort $PreferredPort

    if ($port -ne $PreferredPort) {
        Write-Host "Requested port $PreferredPort is busy for $SubDirectory. Using $port instead."
    }

    $command = '$env:RUNTIME_MODE="local"; $env:PORT={0}; npm run dev' -f $port

    $process = Start-Process -FilePath 'powershell.exe' `
        -ArgumentList '-NoLogo', '-NoProfile', '-Command', $command `
        -WorkingDirectory $targetPath `
        -NoNewWindow `
        -PassThru

    Write-Host "Started $SubDirectory dev server on http://localhost:$port (PID $($process.Id))"

    return [PSCustomObject]@{
        Name = $SubDirectory
        Port = $port
        Pid  = $process.Id
        Url  = "http://localhost:$port"
    }
}

Invoke-NpmBuild -SubDirectory 'frontend'
Invoke-NpmBuild -SubDirectory 'admin'
Invoke-NpmBuild -SubDirectory 'backend'

$startedServices = @()
$startedServices += Start-ViteDev -SubDirectory 'frontend' -PreferredPort 5173
$startedServices += Start-ViteDev -SubDirectory 'admin' -PreferredPort 5174
$startedServices += Start-BackendDev -SubDirectory 'backend' -PreferredPort 9000

Write-Host ''
Write-Host 'Development servers started:'
foreach ($service in $startedServices) {
    Write-Host "- $($service.Name): $($service.Url) (PID $($service.Pid))"
}
Write-Host ''
Write-Host 'Build complete. Please deploy with Aliyun OSS & FC CLI when ready:'
Write-Host '1. ossutil cp -r frontend/dist oss://<bucket>/site/'
Write-Host '2. ossutil cp -r admin/dist oss://<bucket>/admin/'
Write-Host '3. Run "fun deploy" or "fcctl" to deploy backend/dist'
