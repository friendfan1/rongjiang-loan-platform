# 部署到 GitHub Pages

## 仓库地址

https://github.com/friendfan1/rongjiang-loan-platform

## 推送代码

```powershell
cd "E:\榕江县小微企业贷款产品"

# 日常更新后推送（绕过本地代理）
git -c http.proxy= -c https.proxy= push github master

# 或使用脚本
.\scripts\deploy_github.ps1
```

## 开启 GitHub Pages（首次）

1. 打开 https://github.com/friendfan1/rongjiang-loan-platform/settings/pages
2. **Build and deployment** → Source 选 **Deploy from a branch**
3. Branch 选 `master`，文件夹选 `/ (root)`
4. 点击 **Save**

## 访问地址

https://friendfan1.github.io/rongjiang-loan-platform/

（首次开启 Pages 后约 1～3 分钟生效）

## 更新产品数据

```powershell
python scripts/import_xlsx.py 新产品.xlsx
git add data/products.json
git commit -m "更新信贷产品数据"
git -c http.proxy= -c https.proxy= push github master
```

## 说明

- Gitee Pages 已停服，代码可继续备份在 Gitee：`git push gitee master`
- 若 push 失败且提示连接 127.0.0.1，说明 Clash 代理未开，用上面的 `-c http.proxy=` 方式推送

## Nginx 部署注意

1. **必须上传完整目录**：`index.html`、`assets/`、`data/products.json` 缺一不可
2. **不要双击打开 HTML**，必须通过 `http://` 访问
3. 子目录部署时，访问地址建议带尾斜杠，例如 `http://域名/rongjiang-loan/`
4. 若仍加载失败，在 `assets/js/config.js` 中指定：
   ```javascript
   dataUrl: "/rongjiang-loan/data/products.json",
   ```
5. 生成数据：`python scripts/import_xlsx.py`
