# 部署到 Gitee Pages

## 一键推送（需已配置 Gitee 账号）

```powershell
# 在 Gitee 创建空仓库后，替换为你的仓库地址
$GITEE_REPO = "https://gitee.com/你的用户名/rongjiang-loan-platform.git"

git remote add gitee $GITEE_REPO   # 首次执行；若已存在请跳过
git push -u gitee master
```

## 开启 Gitee Pages

1. 打开 Gitee 仓库 → **服务** → **Gitee Pages**
2. 部署分支选 `master`，目录选 `/`（根目录）
3. 点击 **启动** 或 **更新**
4. 访问地址：`https://你的用户名.gitee.io/仓库名/`

## 更新网站数据

```powershell
python scripts/import_xlsx.py 新产品.xlsx
git add data/products.json
git commit -m "更新信贷产品数据"
git push gitee master
# 再到 Gitee Pages 点「更新」或等待自动部署
```
