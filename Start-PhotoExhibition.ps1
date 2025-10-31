#Requires -Version 5.1

param(
    [int]$BackendPort = 9000,
    [int]$FrontendPort = 6666
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Assert-PortAvailable {
    param(
        [Parameter(Mandatory)]
        [int]$Port,
        [Parameter(Mandatory)]
        [string]$ServiceName
    )

    try {
        $connections = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction Stop
    } catch [System.Management.Automation.CommandNotFoundException] {
        throw "未找到 Get-NetTCPConnection 命令。请在支持该命令的 Windows 环境中运行脚本，或手动检查端口占用情况。"
    } catch {
        $connections = @()
    }

    if ($connections.Count -gt 0) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        $processDescriptions = foreach ($pid in $pids) {
            try {
                $process = Get-Process -Id $pid -ErrorAction Stop
                "${($process.ProcessName)} (PID $pid)"
            } catch {
                "PID $pid"
            }
        }
        $processList = [string]::Join(', ', $processDescriptions)
        throw "无法启动 $ServiceName：端口 $Port 已被占用（$processList）。请结束相关进程后重试。"
    }
}

Write-Host "正在检查端口占用情况..." -ForegroundColor Cyan
Assert-PortAvailable -Port $BackendPort -ServiceName '后端 API 服务'
Assert-PortAvailable -Port $FrontendPort -ServiceName '前端 Web 服务'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptRoot 'backend'
$frontendDir = Join-Path $scriptRoot 'frontend'

if (-not (Test-Path $backendDir)) {
    throw "未找到后台目录：$backendDir"
}
if (-not (Test-Path $frontendDir)) {
    throw "未找到前端目录：$frontendDir"
}

$psExecutable = if ($PSVersionTable.PSEdition -eq 'Core') { 'pwsh' } else { 'powershell' }

Write-Host "启动后端服务（端口 $BackendPort）..." -ForegroundColor Green
$backendCommand = "& { Set-Location -LiteralPath `"$backendDir`"; `$env:PORT='$BackendPort'; npm run dev }"
Start-Process -FilePath $psExecutable -ArgumentList '-NoExit', '-Command', $backendCommand -WorkingDirectory $backendDir

Write-Host "启动前端服务（端口 $FrontendPort）..." -ForegroundColor Green
$frontendCommand = "& { Set-Location -LiteralPath `"$frontendDir`"; npm run dev -- --port $FrontendPort }"
Start-Process -FilePath $psExecutable -ArgumentList '-NoExit', '-Command', $frontendCommand -WorkingDirectory $frontendDir

Write-Host "全部服务已在独立终端中启动。" -ForegroundColor Cyan
Write-Host "后端：http://localhost:$BackendPort" -ForegroundColor Yellow
Write-Host "前端：http://localhost:$FrontendPort" -ForegroundColor Yellow
