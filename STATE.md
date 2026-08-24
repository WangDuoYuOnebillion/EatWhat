# STATE · 当前状态卡

> **这是跨会话交接的唯一权威。** 每次会话开头读它,结尾重写它。
> 如果它和别的文档冲突,以它为准,并顺手把别的文档订正掉。

**最后更新:** 2026-08-24 · 会话 #7(已上线 Cloudflare Pages)

---

## 一句话:现在在哪

应用是**「小付,今天吃什么?」v1.0**,纯手机端单文件 Web App。
**P8 部署阶段:✅ 已上线到 Cloudflare Pages —— https://eatwhat-cui.pages.dev。差最后一步:用户 + 家人在真机/微信里验收(海外线路国内能不能稳定打开)。**

会话 #7 产出:
- `apple-touch-icon.png`(180×180 棕碗图标)+ `<head>` 里的 `apple-touch-icon` / `icon` 链接
- `gh-pages` orphan 分支(方案 C:只含 `index.html` + 图标),已推 GitHub + Gitee
- **正式上线:Cloudflare Pages,https://eatwhat-cui.pages.dev**(免费/永久/免备案,从 GitHub `gh-pages` 自动部署)
- `DEPLOY.md` + [ADR-022](DECISIONS.md)(记满了三次平台改道的全过程)

**远端仓库(两个,都已推 `main` + `gh-pages`,远端哈希与本地一致):**
- **GitHub `WangDuoYuOnebillion/EatWhat`** ← remote 名 `github`,main `a7f7a7a` / gh-pages `a4bfae9`。**Cloudflare Pages 的部署源**,`git push github gh-pages` 触发自动重部署。
- Gitee `wangchen1995/eat-what` ← remote 名 `origin`,国内镜像/备份。

**⚠️ 托管平台一路踩坑,最终落到 Cloudflare(全过程见 [ADR-022](DECISIONS.md) 三段修订):**
1. **Gitee 免费 Pages 已于 2024-05 下线** → 改 EdgeOne。
2. **EdgeOne 连 Gitee 读不到 `gh-pages` 分支** → 代码加推 GitHub,EdgeOne 改连 GitHub。
3. **EdgeOne 免费默认域名只有 3 小时 + token,长期用要绑备案域名** → 正式托管改 **Cloudflare Pages**(免费永久免备案,已上线)。EdgeOne / COS 保留为"日后买域名+备案换国内 CDN"的备选。

**P8 还差最后一步:真机 + 微信验收(在用户侧)。**
桌面已验:`eatwhat-cui.pages.dev` 首页/网格/底栏正常,**无存储红条**(https 下 localStorage OK)。剩下必须真机测:

1. 🔴 手机 Safari 打开 → 微信发自己 → **发 1–2 个家人**(海外线路国内微信能否稳定打开=这条路唯一未知数)
2. 🔴 勾食材→关掉浏览器→重开数据在 → 加主屏是棕碗图标

---

## 🔴 下个会话开工前:先问真机验收结果

- **家人都能在微信里顺利打开 `eatwhat-cui.pages.dev`?**
  → P8 关闭,Cloudflare 就是最终方案。进 **P2 手机真机走查**(计时音、输入法、安全区、长按菜单…)。
- **有人打不开 / 很慢?**
  → 海外线路不行,启动**买域名 + ICP 备案 + 回连 EdgeOne**(EdgeOne 项目已在腾讯云建好,连的是 GitHub `gh-pages`,到时只差在 EdgeOne 里绑一个备案好的自定义域名)。买域名当天 + 备案约 1–2 周,见 [DEPLOY.md](DEPLOY.md)。
- **更新线上的方法**(记牢):改完 `index.html`/图标 → 同步到 `gh-pages` → `git push github gh-pages`,Cloudflare 自动重部署。流程见 [DEPLOY.md](DEPLOY.md)。

---

## ⚠️ 阶段编号 ≠ 执行顺序

阶段号只增不改。**"下一步做什么"看 [ROADMAP.md](ROADMAP.md) 的「执行顺序」表,不看编号大小。**

当前顺序:P0 ✅ → P5.1 ✅ → P1 ✅ → P4 ✅ → **P8 🟢(已上线,待真机验收关闭)** → P2 → P6 → P3 → P5 → P9 → P7

---

## 阶段进度

```
P0   调研→构建→文档      ████████████ 100%  ✅ 会话 #1–#4
P5.1 改名+iOS+修搜索      ████████████ 100%  ✅ 会话 #6
P1   纯手机化改造         ████████████ 100%  ✅ 会话 #6
P4   校验脚本落盘         ████████████ 100%  ✅ 会话 #6
P8   部署到免费托管       ███████████░  95%  🟢 已上线 Cloudflare,差真机+微信验收
P2   手机真机走查         ░░░░░░░░░░░░   0%  (依赖 P8 真正上线)
P6   加到主屏 / PWA       ░░░░░░░░░░░░   0%
P3   手机原生手感         ░░░░░░░░░░░░   0%
P5   菜谱库 153→200       ░░░░░░░░░░░░   0%
P9   微信小程序           ░░░░░░░░░░░░   0%  ⚠️ 大工程,且与红线 1 冲突
P7   v1.1 全量回归        ░░░░░░░░░░░░   0%
```

---

## 本次会话(#7)做了什么

**严格一会话一阶段**(还了会话 #6 的流程债)。只做 P8。

| # | 内容 | 记在哪 |
|---|---|---|
| ① | 生成 `apple-touch-icon.png`(SVG→Chrome 3× 渲染→Pillow 缩放,全离线) | WORKLOG #016 |
| ② | `<head>` 加 apple-touch-icon / favicon 链接(iOS 只认真实 PNG,不认 data:) | ADR-022 |
| ③ | 建本地 `gh-pages` orphan 分支(方案 C) | ADR-022 / DEPLOY.md |
| ④ | 写 `DEPLOY.md`(Gitee 主线 + COS 兜底 + 更新流程 + FAQ) | DEPLOY.md |
| ⑤ | 回填:ADR-022、订正 ADR-021、更新 README | DECISIONS / README |

**开工前问掉的三个决策(用户答的):**

| 问题 | 选择 |
|---|---|
| 仓库公开性 | **C · 同仓库单独部署分支 `gh-pages`** |
| 域名 | 默认 `用户名.gitee.io/仓库名` |
| 兜底平台 | 腾讯云 COS 静态网站 |

---

## 待决问题

| # | 问题 | 卡住谁 | 我的倾向 |
|---|---|---|---|
| 1 | **Cloudflare(海外)在国内微信能否稳定打开** —— P8 能否关闭就看这个 | **用户 + 家人真机实测** | 先信这条免费路;家人打不开再走备案+EdgeOne |
| 2 | **要不要 service worker(离线缓存)** —— 应用零网络请求,离线价值不大 | P6 | 可做可不做,成本低。部署到 https 后原路线冲突已消(见 ADR-022) |
| 3 | **小程序走哪条路** —— 原生重写 vs `web-view` 套 H5 | P9 | 大概率原生:`web-view` 需已备案域名,个人主体走不通 |
| 4 | **小程序与单文件红线冲突** —— 需抽出共用数据+算法模块 | P9 | 开工前必须新增 ADR,不要绕过去 |
| ~~5~~ | ~~仓库公开性 / 托管平台兜底~~ | ~~P8~~ | ✅ **已定**(会话 #7):方案 C + Gitee 主线 + COS 兜底 |

---

## 已知限制(现状,不是待办)

- **真机从未验过。** 所有测试都在 headless / 桌面浏览器里跑(含线上 `eatwhat-cui.pages.dev` 桌面验证:正常加载、无存储红条)。设备是 **iPhone 13**(系统版本待确认)。真机 + 微信这一步待用户测,P2 消掉这一条。
- **Cloudflare 海外线路对国内微信的稳定性未知。** 桌面能开不代表家人手机微信能开。这是选免费海外托管的已知风险,验收里专门测「发家人」这一条。
- **`file://` 下大概率存不住数据。** 已有页面顶部红条兜底,不会静默丢。**部署到 https 后此问题消失**(本次已在本地 http 验证无红条、存得住)。
- **加到主屏图标已就位但真机没验。** `apple-touch-icon.png` 已生成并链接,`<link>` 本地解析正常;真机「添加到主屏」的实际效果待用户测。
- ~~**`gh-pages` 分支只在本地,没有远端。**~~ ✅ 会话 #7 已推送到 **GitHub `WangDuoYuOnebillion/EatWhat`(部署源)** 和 Gitee `wangchen1995/eat-what`(镜像),`main` + `gh-pages` 都在。
- **Wake Lock 在 iOS Safari 不支持**,做菜模式屏幕仍会自动锁屏。已 try/catch 静默降级,平台限制。
- **营养自洽只查"内部一致"**,查不出标称值整体偏高/偏低。3 条 ±18–19% 的 warning 属设计带内。
- 热量是估算值,误差约 ±15%。这是**设计上的诚实**,不是缺陷。

---

## 给未来的自己:三条最贵的教训

1. **`element.click()` 不能用来验证"点得到"。** 它绕过浏览器命中测试。验可点性只能用 `document.elementFromPoint()`。本次会话的存储测试就是先 `elementFromPoint` 确认可点,再在该坐标派发真实事件序列。详见 WORKLOG #010 / #016。

2. **先证伪测量工具,再信它的结论。** headless Chrome 视口下限钳在 500px、`--virtual-time-budget` 下 CSS 过渡不推进,都误导过判断。详见 WORKLOG #006。

3. **断言失败时,先怀疑断言本身,再怀疑代码。** 判据:**能说清失败的物理机制,就是真 bug;只能说"数字对不上",先查断言。**
