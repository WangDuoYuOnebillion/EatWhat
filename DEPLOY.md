# DEPLOY · 部署与更新手册

> 目标:把「小付,今天吃什么?」变成一个**网址**,微信里点开就能用,能存数据、能加到主屏。
> 本手册对应 [ROADMAP.md](ROADMAP.md) 的 **P8** 阶段。方向性选择见 [ADR-022](DECISIONS.md)。

---

## 选定方案(会话 #7 定的)

| 决策 | 选择 | 理由 |
|---|---|---|
| 仓库公开性 | **C · 同仓库单独部署分支 `gh-pages`** | 一个仓库搞定;`gh-pages` 分支**只含 `index.html` + `apple-touch-icon.png`**,内部文档(CLAUDE/STATE/WORKLOG…)只留在 `main`,不外露 |
| 域名 | **默认 `用户名.gitee.io/仓库名`** | 自定义域名要备案,先不折腾 |
| 主线平台 | **Gitee Pages** | 国内访问好、免费 |
| 兜底平台 | **腾讯云 COS 静态网站** | Gitee 万一走不通(实名/政策)时切它,月费几分钱 |

**要上线的文件只有两个,且必须在同一目录:**

```
index.html
apple-touch-icon.png   ← 缺了它,加到主屏就是网页缩略图而不是图标
```

`gh-pages` 分支已建好(orphan 分支,只含上面两个文件),**且已推送到远端**。

**本仓库(会话 #7 已建 + 已推送):**
- 仓库:https://gitee.com/wangchen1995/eat-what
- 部署后地址(开 Pages 后生成):`https://wangchen1995.gitee.io/eat-what`

---

## 进度:哪些做完了,还差哪步

| 步 | 事项 | 状态 |
|---|---|---|
| 1 | 注册 + 实名 | ✅ 用户已完成(仓库已能建) |
| 2 | 建公开仓库 `eat-what` | ✅ 已建 |
| 3 | 推送 `main` + `gh-pages` | ✅ **已推送**(两分支远端哈希与本地一致) |
| 4 | 开启 Gitee Pages(选 `gh-pages` 分支) | 🔴 **待你做** —— 要登录后台点按钮 |
| 5 | 手机真机验收 | 🔴 待 #4 完成后测 |

### 🔴 第 4 步:开启 Gitee Pages(只有你能点)

- 进仓库 https://gitee.com/wangchen1995/eat-what → 顶部菜单「服务」→「Gitee Pages」。
- **部署分支选 `gh-pages`**,目录选 `/`(根)。
- 点「启动」/「部署」。等几秒,页面给出访问地址:`https://wangchen1995.gitee.io/eat-what`。

> 若第一次进「服务」菜单里没有「Gitee Pages」,通常是实名还没完全生效或页面没刷新,等一下再看。

### 🔴 第 5 步:验收(用手机,不要用电脑)

- 手机 **Safari** 打开 `https://wangchen1995.gitee.io/eat-what` → 应用应正常加载。
- 把链接发到**微信**给自己 → 在微信里直接点开 → 应能用(这才是"发给别人"的真实场景)。
- 勾几样食材 → **完全关掉浏览器** → 重开 → 数据还在。
- 页面顶部**不应**出现「这个环境不让保存数据」红条。
- Safari 里「分享 → 添加到主屏幕」→ 主屏上应是**那只棕色小碗图标**,不是网页缩略图。

> ⚠️ Gitee Pages **免费版每次更新代码后,要回到「Gitee Pages」页面手动点一次「更新」**,否则线上还是旧版。这不是 bug,是免费版的限制。

---

### 二、腾讯云 COS 兜底(Gitee 走不通时才用)

什么时候切:Gitee 实名卡住、或 Pages 服务又调整政策打不开。

**1. 开通**
- 登录 https://console.cloud.tencent.com/cos → 创建存储桶(Bucket)。
- 地域随便挑个国内的(如 `广州 ap-guangzhou`)。
- 访问权限选 **公有读私有写**。

**2. 开静态网站**
- 进桶 →「基础配置 → 静态网站」→ 开启。
- 索引文档填 `index.html`。开启后它给你一个**静态网站访问节点**域名。

**3. 上传两个文件**
- 把 `index.html` 和 `apple-touch-icon.png` 传到桶的**根目录**(拖进去即可)。

**4. 访问**
- 用第 2 步那个**静态网站节点域名**打开(不是默认的对象访问域名,默认那个会触发下载而不是渲染)。
- 验收同上(微信打开、存数据、加主屏图标)。

> COS 未绑自定义域名时,直接用节点域名在**微信里**打开一般没问题;若遇到拦截,再考虑绑一个已备案域名。COS 没有"手动更新"这一步,传了就是最新。

---

## 以后怎么更新(改完代码 → 上线)

**日常都在 `main` 分支改**(所有文档、`check.js`、`index.html` 都在这)。改完要上线时,把两个部署文件同步到 `gh-pages`:

```bash
# 1. 在 main 上改代码、提交(pre-commit 会自动跑 check.js)
git add -A && git commit -m "feat: 改了啥"

# 2. 切到部署分支,把最新的两个文件覆盖过去
git checkout gh-pages
git checkout main -- index.html apple-touch-icon.png
git commit -am "deploy: 同步 index.html + 图标"

# 3. 推送 + 切回 main
git push origin gh-pages
git checkout main

# 4. Gitee 用户:回 Gitee Pages 页面点一次「更新」
#    COS 用户:重新上传这两个文件即可
```

> 只有 `index.html` / `apple-touch-icon.png` 变了才需要同步 `gh-pages`。
> 只改文档(STATE/WORKLOG…)不用碰 `gh-pages`——这正是方案 C 的好处。

---

## 常见问题

**Q:微信里打开白屏 / 打不开?**
Gitee 偶尔会对未登录来源的 Pages 做限制。先确认电脑浏览器能开;能开就多半是微信侧缓存,换个聊天窗口重发链接、或链接后加 `?v=2` 试试。实在不行切腾讯云 COS。

**Q:加到主屏还是网页缩略图,没有小碗图标?**
确认 `apple-touch-icon.png` 和 `index.html` **在同一目录**、且访问 `你的地址/apple-touch-icon.png` 能看到图片(200)。iOS 有时会缓存旧图标,删掉主屏图标重新加一次。

**Q:数据存不住?**
本手册的托管都是 https,localStorage 正常可用,不该出现。若真出现红条,多半是浏览器隐私模式,换正常模式即可。

**Q:能不能只发一个 `index.html` 文件给别人,不折腾托管?**
在 iPhone 上基本走不通:微信不预览 `.html`,得手动"存到文件 App → 挑浏览器打开",普通人走不完。这正是本阶段做托管的原因。
