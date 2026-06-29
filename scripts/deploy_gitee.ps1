param(
    [Parameter(Mandatory = $true)]
    [string] $GiteeUser,

    [string] $RepoName = "rongjiang-loan-platform"
)

$ErrorActionPreference = "Stop"
$RepoUrl = "https://gitee.com/$GiteeUser/$RepoName.git"
$Root = Split-Path -Parent $PSScriptRoot

Set-Location $Root

if (-not (git remote get-url gitee 2>$null)) {
    git remote add gitee $RepoUrl
    Write-Host "已添加远程仓库: $RepoUrl"
} else {
    git remote set-url gitee $RepoUrl
    Write-Host "已更新远程仓库: $RepoUrl"
}

Write-Host ""
Write-Host "请先在 Gitee 创建空仓库: $RepoName"
Write-Host "仓库地址: https://gitee.com/$GiteeUser/$RepoName"
Write-Host ""
Write-Host "正在推送 master 分支..."
git push -u gitee master

Write-Host ""
Write-Host "推送完成。请打开 Gitee 仓库 -> 服务 -> Gitee Pages"
Write-Host "选择 master 分支、根目录 /，点击「启动」。"
Write-Host "访问地址: https://$GiteeUser.gitee.io/$RepoName/"
