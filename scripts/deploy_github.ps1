param(
    [string] $GithubUser = "friendfan1",

    [string] $RepoName = "rongjiang-loan-platform"
)

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/$GithubUser/$RepoName.git"
$PagesUrl = "https://$GithubUser.github.io/$RepoName/"
$Root = Split-Path -Parent $PSScriptRoot

Set-Location $Root

$remotes = git remote
if ($remotes -contains "github") {
    git remote set-url github $RepoUrl
    Write-Host "[OK] Remote updated: $RepoUrl"
} else {
    git remote add github $RepoUrl
    Write-Host "[OK] Remote added: $RepoUrl"
}

$globalProxy = git config --global --get http.proxy
if ($globalProxy -match "127\.0\.0\.1") {
    Write-Host "[WARN] Git proxy is set to $globalProxy"
    Write-Host "       Push will bypass proxy for this command."
    Write-Host ""
}

Write-Host "Make sure an empty repo exists on GitHub:"
Write-Host "  https://github.com/$GithubUser/$RepoName"
Write-Host ""
Write-Host "Pushing branch master..."
git -c http.proxy= -c https.proxy= push -u github master
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Push failed. Create the GitHub repo first, then retry."
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "[OK] Push finished."
Write-Host "Next: GitHub repo -> Settings -> Pages"
Write-Host "  Source: Deploy from branch -> master -> / (root) -> Save"
Write-Host "Site URL (after Pages enabled): $PagesUrl"
