# DEPLOY · 部署与更新手册

> 目标:把「小付,今天吃什么?」变成一个**网址**,微信里点开就能用,能存数据、能加到主屏。
> 本手册对应 [ROADMAP.md](ROADMAP.md) 的 **P8** 阶段。方向性选择与全过程见 [ADR-022](DECISIONS.md)。

---

## ✅ 已上线

## 👉 https://eatwhat-cui.pages.dev

**托管:Cloudflare Pages** · 从 GitHub `WangDuoYuOnebillion/EatWhat` 的 `gh-pages` 分支自动部署 · 免费 / 永久 / 免备案。

桌面已验:首页、食材网格、底栏正常,无存储红条(https 下 localStorage 正常)。
**唯一待验:** 海外线路在国内微信能否稳定打开 —— 见下面「真机验收」。

---

## 选定方案

| 决策 | 选择 | 理由 |
|---|---|---|
| 代码仓库(部署源) | **GitHub `WangDuoYuOnebillion/EatWhat`** | Cloudflare 盯它的 `gh-pages` 分支;方案 C 不变,该分支只含两个部署文件 |
| 代码仓库(镜像) | Gitee `wangchen1995/eat-what` | 国内镜像/备份;两个远程都推 `main` + `gh-pages` |
| **托管平台(正式)** | **Cloudflare Pages** | 免费、永久、无 token、免备案,连 GitHub push 即自动重部署 |
| 备选一(要国内 CDN 时) | 腾讯云 EdgeOne Makers + **买域名 + 备案** | 国内访问/微信最稳,但要花钱 + 等备案 1–2 周。项目已建好,只差绑备案域名 |
| 备选二 | 腾讯云 COS 静态网站 | 另一条国内路,同样需备案域名才持久 |
| 域名 | **Cloudflare 默认 `eatwhat-cui.pages.dev`** | 永久有效、免备案。以后要好记域名可在 Cloudflare 绑自定义域名(它免备案) |

**要上线的文件只有两个,且必须在同一目录(已在 `gh-pages` 分支根目录备好):**

```
index.html
apple-touch-icon.png   ← 缺了它,加到主屏就是网页缩略图而不是图标
```

---

## 平台踩坑简史(为什么绕了三圈)

完整推理见 [ADR-022](DECISIONS.md) 的三段修订。一句话版:

1. **Gitee 免费 Pages 已于 2024-05 下线** → 弃。
2. **EdgeOne 连 Gitee 读不到 `gh-pages` 分支(暂无数据)** → 代码加推 GitHub,EdgeOne 改连 GitHub。
3. **EdgeOne 免费默认域名只有 3 小时 + `?eo_token=`,长期用要绑备案域名** → 正式托管改 **Cloudflare Pages**(免费永久免备案)。

**结论:** 国内法规下,大陆服务器的公开持久网址必须备案;免费又免备案的持久托管只剩海外。所以先用海外的 Cloudflare 零成本上线,家人实测不通再花钱走备案。

---

## Cloudflare Pages 是怎么建的(可复现)

会话 #7 用 Claude for Chrome 在用户浏览器里操作:

1. dash.cloudflare.com → 左侧 **Compute → Workers & Pages** → **Create application**
2. 顶部 **Pages** 流程(底部「Looking to deploy Pages? Get started」)→ **Import an existing Git repository**
3. **Connect GitHub**(sudo 二次验证的密码由用户自己输)→ 选 `WangDuoYuOnebillion/EatWhat`
4. 配置:
   - Project name `eatwhat`(实际域名被占,自动成 `eatwhat-cui.pages.dev`)
   - **Production branch = `gh-pages`**
   - **Framework preset = None**
   - **Build command = 留空**
   - **Build output directory = `/`(根)**
5. **Save and Deploy** → 约 15 秒完成 → 出 `eatwhat-cui.pages.dev`

---

## 🔴 手机真机验收(P8 关闭条件)

**用手机,不要用电脑。** 地址:`https://eatwhat-cui.pages.dev`

1. 手机 **Safari** 打开地址 → 应正常加载。
2. 把链接发到**微信**给自己 → 直接点开能用。
3. **发给 1–2 个家人** → 他们那边也能打开 —— **这是海外托管唯一的未知数,最重要。**
4. 勾几样食材 → **完全关掉浏览器** → 重开 → 数据还在。
5. Safari「分享 → 添加到主屏幕」→ 主屏是**那只棕色小碗图标**,不是网页缩略图。

- **家人都能顺利打开** → P8 收工,Cloudflare 就是最终方案。
- **有人打不开 / 很慢** → 海外线路不友好,走下面「备选一:买域名 + 备案 + EdgeOne」。

---

## 以后怎么更新(改完代码 → 上线)

**日常都在 `main` 分支改。** 要上线时,把两个部署文件同步到 `gh-pages` 并推 GitHub(Cloudflare 盯的是它):

```bash
# 1. 在 main 上改代码、提交(pre-commit 会自动跑 check.js)
git add -A && git commit -m "feat: 改了啥"
git push github main && git push origin main

# 2. 切到部署分支,把最新的两个文件覆盖过去
git checkout gh-pages
git checkout main -- index.html apple-touch-icon.png
git commit -am "deploy: 同步 index.html + 图标"

# 3. 推送(github 那条触发 Cloudflare 重部署)+ 切回 main
git push github gh-pages && git push origin gh-pages
git checkout main
```

- **Cloudflare 连了 GitHub**:第 3 步 `git push github gh-pages` 后**自动重新部署**,1–2 分钟后线上更新,无需手动操作 ✅
- 只有 `index.html` / `apple-touch-icon.png` 变了才需要同步 `gh-pages`;只改文档不用碰 —— 这是方案 C 的好处。
- 嫌两条命令麻烦,只推 `github` 也能上线;推 `origin` 只是顺手维护国内镜像。

---

## 备选一:买域名 + 备案 + EdgeOne(海外线路不通时)

EdgeOne Makers 项目会话 #7 已在腾讯云建好(连 GitHub `gh-pages`,控制台 `console.cloud.tencent.com/edgeone`),构建能成功。**唯一缺的是一个备案好的自定义域名** —— EdgeOne 免费默认域名只有 3 小时,不能长期用。

步骤:
1. 买个便宜域名(`.cn` 约 ¥25–35/年,`.com` 约 ¥55–75/年)→ 域名实名认证(当天)。
2. 用腾讯云账号做 **ICP 备案**:身份证 + 手机 + App 人脸核验;可能还需名下有一个满足条件的云资源(如轻量服务器,买 3 个月)才发备案服务号。管局审核 **约 3–20 个工作日,常见 1–2 周**。
3. 备案通过 → 在 EdgeOne 项目里**绑定这个自定义域名** → 用它访问。国内 CDN,微信最稳。

> 时间账详见对话记录:买域名当天,备案首次约 1–2 周。备案通过前该域名在大陆打不开。

---

## 备选二:腾讯云 COS 静态网站

同样需要备案域名才持久,过程比 EdgeOne 更手动,一般不如备选一。留档:

1. https://console.cloud.tencent.com/cos → 创建存储桶,地域挑国内(如 `广州 ap-guangzhou`),权限 **公有读私有写**。
2. 桶「基础配置 → 静态网站」→ 开启,索引文档 `index.html`。
3. 把 `index.html` + `apple-touch-icon.png` 传到桶**根目录**。
4. 用静态网站节点域名访问;长期公开同样要绑备案域名。COS 无"手动更新"步骤,重传即最新。

---

## 常见问题

**Q:Cloudflare 里改配置在哪?**
dash.cloudflare.com → Compute → Workers & Pages → 点 `eatwhat` 项目 → Settings(改分支/构建)、Custom domains(绑自定义域名,Cloudflare 绑域名免备案)。

**Q:微信里打开白屏 / 打不开?**
先确认电脑浏览器能开。能开就多半是海外线路波动或微信侧缓存 —— 换聊天窗重发、链接后加 `?v=2`、或过一会儿再试。持续打不开就走「备选一」备案国内 CDN。

**Q:加到主屏还是网页缩略图,没有小碗图标?**
访问 `https://eatwhat-cui.pages.dev/apple-touch-icon.png` 应能看到图片(200)。iOS 会缓存旧图标,删掉主屏图标重加一次。

**Q:数据存不住?**
Cloudflare 是 https,localStorage 正常。若出现红条多半是浏览器隐私模式,换正常模式。

**Q:能不能只发一个 `index.html` 文件给别人,不折腾托管?**
在 iPhone 上基本走不通:微信不预览 `.html`,得手动"存到文件 App → 挑浏览器打开",普通人走不完。这正是本阶段做托管的原因。
