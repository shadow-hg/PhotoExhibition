$ErrorActionPreference = 'Stop'

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Invoke-NpmBuild {
    param (
        [Parameter(Mandatory = $true)]
        [string] $SubDirectory
    )

    $targetPath = Join-Path $rootDir $SubDirectory
    Write-Host "Switching to $targetPath"

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

Write-Host 'Build complete. Please deploy with Aliyun OSS & FC CLI:'
Write-Host '1. ossutil cp -r frontend/dist oss://<bucket>/site/'
Write-Host '2. ossutil cp -r admin/dist oss://<bucket>/admin/'
Write-Host '3. Run "fun deploy" or "fcctl" to deploy backend/dist'
