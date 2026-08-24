# DEPLOY · 部署与更新手册

> 目标:把「小付,今天吃什么?」变成一个**网址**,微信里点开就能用,能存数据、能加到主屏。
> 本手册对应 [ROADMAP.md](ROADMAP.md) 的 **P8** 阶段。方向性选择见 [ADR-022](DECISIONS.md)。

---

## ⚠️ 路径变更(会话 #7):Gitee Pages 已下线

原计划托管到 **Gitee Pages**,但实操时发现仓库「服务」菜单里**根本没有 Gitee Pages 选项**。查证:**Gitee 免费 Pages 已于 2024-05 整体下线,Pages Pro 也停了个人购买入口** —— 与账号无关,这条路对所有个人用户都没了。

改走 **腾讯云 EdgeOne Makers**(原名 EdgeOne Pages,2026-06 改名,功能不变)—— 完全免费 + 国内 CDN + 支持直连我们已有的 Gitee 仓库。原兜底 COS 降为二线。详见 [ADR-022](DECISIONS.md)。

---

## 选定方案

| 决策 | 选择 | 理由 |
|---|---|---|
| **代码仓库(EdgeOne 源)** | **GitHub `WangDuoYuOnebillion/EatWhat`** | EdgeOne 连 Gitee 时**生产分支下拉框读不到 `gh-pages`(暂无数据)**,GitHub 集成才正常;方案 C 不变,`gh-pages` 分支只含两个部署文件 |
| 代码仓库(镜像) | Gitee `wangchen1995/eat-what` | 已推,留作国内镜像/备份;两个远程都推同样的 `main` + `gh-pages` |
| ~~托管平台~~ | ~~Gitee Pages~~ | ❌ 已下线,弃用 |
| **托管平台(主线)** | **腾讯云 EdgeOne Makers**(原 EdgeOne Pages) | 完全免费、国内 CDN、连 GitHub 仓库(push 即自动重部署,没有 Gitee Pages 那种"手动点更新") |
| 托管平台(兜底) | 腾讯云 COS 静态网站 | EdgeOne 万一卡住时切它,月费几分钱 |
| 域名 | **用 EdgeOne 分配的默认预览域名** | 默认域名可直接访问、**不需要备案**;自定义域名在中国大陆加速区才要备案,先不折腾 |

**要上线的文件只有两个,且必须在同一目录(已在 `gh-pages` 分支根目录备好):**

```
index.html
apple-touch-icon.png   ← 缺了它,加到主屏就是网页缩略图而不是图标
```

---

## 进度:哪些做完了,还差哪步

| 步 | 事项 | 状态 |
|---|---|---|
| 1 | Gitee/GitHub 注册 + 实名 | ✅ 已完成 |
| 2 | 建仓库(Gitee `eat-what` + GitHub `EatWhat`) | ✅ 已建 |
| 3 | 两个远程都推 `main` + `gh-pages` | ✅ 已推送(远端哈希与本地一致) |
| 4 | 注册腾讯云 + 实名 | 🔴 **待你做** |
| 5 | EdgeOne Makers **连 GitHub** 部署 | 🔴 **待你做**(控制台操作,我点不了) |
| 6 | 手机真机验收 | 🔴 待 #5 出地址后测 |

---

## 🔴 你要做的:EdgeOne Makers 部署(主线)

> 注意:EdgeOne **Pages 已更名为 Makers**(2026-06 品牌升级),功能不变。下面按新名字走。
> **控制台入口(别进文档站):** https://console.cloud.tencent.com/edgeone
> `cloud.tencent.com/document/...` 是文档,不是控制台。

### 1. 注册 + 实名
- 用微信/QQ 登录腾讯云,完成**实名认证**(个人实名即可)。

### 2. 进 Makers → 场景选择大厅 → 导入 Git 仓库
- 进 [边缘安全加速平台 EO 控制台](https://console.cloud.tencent.com/edgeone) → 左侧找到 **Makers**。
- 首次进入会出现**「场景选择大厅」**,四个入口:**导入 Git 仓库** / 从模板开始 / 直接上传 / Agent 模板 —— 选 **「导入 Git 仓库」**。
- **授权 GitHub**(不是 Gitee!),然后选中 `WangDuoYuOnebillion/EatWhat`。

> **为什么用 GitHub 不用 Gitee:** 实操时 EdgeOne 连 Gitee,生产分支下拉框搜 `gh-pages` 显示**「暂无数据」**(EdgeOne 对 Gitee 的分支识别不行)。改推 GitHub 后分支能正常读到。Gitee 那个仓库留作国内镜像。

### 3. 构建配置(纯静态,别填错)

| 字段 | 填什么 |
|---|---|
| 生产分支 / Branch | **`gh-pages`** ← 关键,不是 main |
| 框架预设 / Framework | **无 / None / 静态** |
| 构建命令 / Build command | **留空**(或随便填 `echo skip`) |
| 输出目录 / Output directory | **`./`**(就是根目录) |

> 为什么选 `gh-pages`:那个分支根目录恰好只有 `index.html` + 图标,输出目录填 `./` 就直接上线这两个文件,不会把 CLAUDE.md 之类的内部文档带上去。

### 4. 选加速区域
- 选 **中国大陆**(朋友都在国内,访问最快)。
- 我们**只用默认域名**,所以"自定义域名要备案"这条不影响你。

### 5. 部署 → 拿地址
- 点部署,等 1–2 分钟。成功后 EdgeOne 给一个**默认预览域名**(形如 `xxx.edgeone.app` 之类),可直接在浏览器打开。**把这个地址发我**,我记进文档。

> **备选:懒得连 Git?** 新建项目时选**「直接上传」**,把 `index.html` + `apple-touch-icon.png` 两个文件拖进去即可 —— 更快,但以后更新要手动再传一次(连 Git 的话 `git push` 就自动重部署)。

---

## 🔴 部署后:手机真机验收(P8 关闭条件)

**用手机,不要用电脑。** 地址换成 EdgeOne 给你的那个。

- 手机 **Safari** 打开地址 → 应用应正常加载。
- 把链接发到**微信**给自己 → 在微信里直接点开 → 应能用(这才是"发给别人"的真实场景)。
  - 万一微信提示"非官方网页"或打不开,先确认电脑浏览器能开;是微信侧拦截的话,换个聊天窗重发、或走 COS 兜底。
- 勾几样食材 → **完全关掉浏览器** → 重开 → 数据还在。
- 页面顶部**不应**出现「这个环境不让保存数据」红条。
- Safari 里「分享 → 添加到主屏幕」→ 主屏上应是**那只棕色小碗图标**,不是网页缩略图。

---

## 腾讯云 COS 兜底(EdgeOne 也走不通时才用)

什么时候切:EdgeOne 实名/部署卡死,或它给的默认域名在微信里被拦。

**1. 开通**
- 登录 https://console.cloud.tencent.com/cos → 创建存储桶(Bucket)。
- 地域挑个国内的(如 `广州 ap-guangzhou`)。访问权限选 **公有读私有写**。

**2. 开静态网站**
- 进桶 →「基础配置 → 静态网站」→ 开启。索引文档填 `index.html`。开启后它给一个**静态网站访问节点**域名。

**3. 上传两个文件**
- 把 `index.html` 和 `apple-touch-icon.png` 传到桶的**根目录**。

**4. 访问**
- 用第 2 步那个**静态网站节点域名**打开(不是默认对象访问域名,那个会触发下载而不是渲染)。验收同上。

> COS 没有"手动更新"步骤,重新上传即最新。

---

## 以后怎么更新(改完代码 → 上线)

**日常都在 `main` 分支改**(所有文档、`check.js`、`index.html` 都在这)。改完要上线时,把两个部署文件同步到 `gh-pages`:

> 两个远程:`github`(EdgeOne 盯着它,推它才会触发重部署)+ `origin`(Gitee,国内镜像)。下面把两个都推。

```bash
# 1. 在 main 上改代码、提交(pre-commit 会自动跑 check.js)
git add -A && git commit -m "feat: 改了啥"
git push github main && git push origin main

# 2. 切到部署分支,把最新的两个文件覆盖过去
git checkout gh-pages
git checkout main -- index.html apple-touch-icon.png
git commit -am "deploy: 同步 index.html + 图标"

# 3. 推送(github 那条会触发 EdgeOne 重部署)+ 切回 main
git push github gh-pages && git push origin gh-pages
git checkout main
```

- **EdgeOne 连了 GitHub**:第 3 步 `git push github gh-pages` 后**自动重新部署**,几分钟后线上就是新的,无需手动操作 ✅
- **用的是 EdgeOne 直接上传 / 或 COS**:改完后到控制台**重新上传**这两个文件。
- 只有 `index.html` / `apple-touch-icon.png` 变了才需要同步 `gh-pages`;只改文档不用碰 —— 这是方案 C 的好处。
- 嫌两条命令麻烦,只推 `github` 也能上线;推 `origin` 只是顺手维护国内镜像。

---

## 常见问题

**Q:EdgeOne 连仓库后,生产分支下拉框读不到 `gh-pages`(暂无数据)?**
这正是我们从 Gitee 换到 GitHub 的原因 —— EdgeOne 对 Gitee 的分支识别不行。**授权 GitHub、选 `WangDuoYuOnebillion/EatWhat`**,分支就能读到。仍不行就用「直接上传」两个文件兜底。

**Q:构建失败 / 部署后 404?**
八成是构建配置填错。纯静态站:构建命令**留空**、输出目录 **`./`**、分支 **`gh-pages`**。别选 React/Vue 之类框架预设。

**Q:微信里打开白屏 / 打不开?**
先确认电脑浏览器能开。能开就多半是微信侧缓存/拦截,换聊天窗重发、或链接后加 `?v=2`。仍不行切 COS 兜底。

**Q:加到主屏还是网页缩略图,没有小碗图标?**
确认访问 `你的地址/apple-touch-icon.png` 能看到图片(200),且它和 `index.html` 同目录。iOS 会缓存旧图标,删掉主屏图标重加一次。

**Q:数据存不住?**
EdgeOne / COS 都是 https,localStorage 正常可用,不该出现红条。若出现多半是浏览器隐私模式,换正常模式。

**Q:能不能只发一个 `index.html` 文件给别人,不折腾托管?**
在 iPhone 上基本走不通:微信不预览 `.html`,得手动"存到文件 App → 挑浏览器打开",普通人走不完。这正是本阶段做托管的原因。
