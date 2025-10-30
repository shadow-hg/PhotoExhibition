$ErrorActionPreference = 'Stop'

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Invoke-NpmBuild {
    param (
        [Parameter(Mandatory = $true)]
        [string] $SubDirectory
    )

    $targetPath = Join-Path $rootDir $SubDirectory
    Write-Host "📁 切换到 $targetPath"

    Push-Location $targetPath
    try {
        npm install
        npm run build
    }
    finally {
        Pop-Location
    }
}

Invoke-NpmBuild -SubDirectory 'frontend'
Invoke-NpmBuild -SubDirectory 'admin'
Invoke-NpmBuild -SubDirectory 'backend'

Write-Host '✅ 构建完成。请使用阿里云 OSS & FC CLI 发布：'
Write-Host '1. ossutil cp -r frontend/dist oss://<bucket>/site/'
Write-Host '2. ossutil cp -r admin/dist oss://<bucket>/admin/'
Write-Host '3. fun deploy 或 fcctl 部署 backend/dist'
