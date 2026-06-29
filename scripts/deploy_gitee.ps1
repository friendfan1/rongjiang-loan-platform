param(
    [Parameter(Mandatory = $true)]
    [string] $GiteeUser,

    [string] $RepoName = "rongjiang-loan-platform"
)

$ErrorActionPreference = "Stop"
$RepoUrl = "https://gitee.com/$GiteeUser/$RepoName.git"
$PagesUrl = "https://$GiteeUser.gitee.io/$RepoName/"
$Root = Split-Path -Parent $PSScriptRoot

Set-Location $Root

$remotes = git remote
if ($remotes -contains "gitee") {
    git remote set-url gitee $RepoUrl
    Write-Host "[OK] Remote updated: $RepoUrl"
} else {
    git remote add gitee $RepoUrl
    Write-Host "[OK] Remote added: $RepoUrl"
}

Write-Host ""
Write-Host "Make sure an empty repo exists on Gitee:"
Write-Host "  https://gitee.com/$GiteeUser/$RepoName"
Write-Host ""
$globalProxy = git config --global --get http.proxy
if ($globalProxy -match "127\.0\.0\.1") {
    Write-Host "[WARN] Git proxy is set to $globalProxy but local proxy may be offline."
    Write-Host "       This script will push to Gitee without proxy."
    Write-Host ""
}

Write-Host "Pushing branch master..."
git -c http.proxy= -c https.proxy= push -u gitee master
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Push failed. Check network, Gitee login, and that the repo exists."
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "[NOTE] Gitee Pages is discontinued. Code is backed up on Gitee."
Write-Host "       For public website, use GitHub Pages or EdgeOne Pages."
Write-Host "       See DEPLOY.md for details."
Write-Host ""
Write-Host "[OK] Push finished."
Write-Host "Gitee repo: https://gitee.com/$GiteeUser/$RepoName"
