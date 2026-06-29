# 部署说明（Gitee Pages 已停服）

## 重要说明

**Gitee Pages 已暂停/下线**（官方提示：「因服务维护调整，Gitee Pages 暂停提供服务」），仓库「服务」菜单中不再显示入口，这不是你操作的问题。

代码已成功推送到 Gitee，可用于备份与协作：
https://gitee.com/friendfan/rongjiang-loan-platform

下面提供**仍可用的免费/低成本**部署方式。

---

## 方案一：GitHub Pages（推荐，完全免费）

### 1. 在 GitHub 创建空仓库

名称建议：`rongjiang-loan-platform`（与 Gitee 同名）

### 2. 推送代码

```powershell
cd "E:\榕江县小微企业贷款产品"
.\scripts\deploy_github.ps1 -GithubUser "你的GitHub用户名"
```

### 3. 开启 Pages

GitHub 仓库 → **Settings** → **Pages** → Source 选 **Deploy from a branch** → Branch 选 `master` / `/ (root)` → Save

### 4. 访问地址

```
https://你的用户名.github.io/rongjiang-loan-platform/
```

---

## 方案二：腾讯云 EdgeOne Pages（国内访问快，免费额度）

适合榕江县本地用户访问，国内速度优于 GitHub Pages。

1. 打开 https://console.cloud.tencent.com/edgeone/pages
2. 新建项目 → 关联 **GitHub** 仓库（需先完成方案一推送到 GitHub）
3. 构建配置：
   - 框架：静态站点 / 其他
   - 输出目录：`/`（根目录，无需构建）
4. 部署完成后获得 `*.edgeone.app` 域名，可绑定自有域名

---

## 方案三：阿里云 OSS 静态托管（低成本，约几元/月）

适合长期使用、需要稳定国内访问且可能有自定义域名备案的场景。

1. 开通 OSS 桶，开启「静态网站托管」
2. 上传项目全部文件（含 `index.html`、`assets/`、`data/`）
3. 绑定域名（国内域名需备案）

---

## 方案四：本机/内网临时演示

```powershell
cd "E:\榕江县小微企业贷款产品"
python -m http.server 8765
```

浏览器访问：http://localhost:8765

---

## 更新产品数据后重新部署

```powershell
python scripts/import_xlsx.py 新产品.xlsx
git add data/products.json
git commit -m "更新信贷产品数据"
git push gitee master
git -c http.proxy= -c https.proxy= push github master   # 若使用 GitHub Pages
```

EdgeOne Pages 关联 GitHub 后会自动重新部署。
