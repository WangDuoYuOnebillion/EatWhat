# STATE · 当前状态卡

> **这是跨会话交接的唯一权威。** 每次会话开头读它,结尾重写它。
> 如果它和别的文档冲突,以它为准,并顺手把别的文档订正掉。

**最后更新:** 2026-08-24 · 会话 #7(含推送到 Gitee)

---

## 一句话:现在在哪

应用是**「小付,今天吃什么?」v1.0**,纯手机端单文件 Web App。
**P8 部署阶段:代码侧全部就绪、已推 Gitee;差最后一步 —— 用户去腾讯云 EdgeOne Pages 点部署。**
(原定 Gitee Pages 中途发现已下线,改道 EdgeOne Pages,详见下。)

会话 #7 产出:
- `apple-touch-icon.png`(180×180 棕碗图标)+ `<head>` 里的 `apple-touch-icon` / `icon` 链接
- `DEPLOY.md`(EdgeOne Pages 主线 + 腾讯云 COS 兜底 + 更新流程)
- `gh-pages` orphan 分支(方案 C:只含 `index.html` + 图标),已推送到 Gitee
- [ADR-022](DECISIONS.md)(含平台改道的修订记录)

**远端仓库(两个,都已推 `main` + `gh-pages`,远端哈希与本地一致):**
- **GitHub `WangDuoYuOnebillion/EatWhat`(EdgeOne 的部署源)** ← remote 名 `github`,main `a7f7a7a` / gh-pages `a4bfae9`
- Gitee `wangchen1995/eat-what`(国内镜像/备份) ← remote 名 `origin`

**⚠️ 两处改道,都记在 [ADR-022 修订](DECISIONS.md):**
1. **Gitee 免费 Pages 已于 2024-05 下线** → 托管改走**腾讯云 EdgeOne Makers**(原 EdgeOne Pages,2026-06 改名;免费 + 国内 CDN),COS 保留兜底。
2. **EdgeOne 连 Gitee 时生产分支下拉读不到 `gh-pages`(暂无数据)** → 代码加推一份到 **GitHub**,EdgeOne 改连 GitHub(它对 GitHub 支持最好)。

**P8 还没关闭。** 就差两步,**都在用户侧**(控制台操作,我登不进去):

1. 🔴 **注册腾讯云 + 实名 → EdgeOne Makers 连 GitHub 部署**。(EdgeOne Pages 已改名 Makers;**连 Gitee 时生产分支下拉读不到 `gh-pages`「暂无数据」,故改用 GitHub**,代码已推 GitHub。)控制台 `console.cloud.tencent.com/edgeone` → Makers → 场景选择大厅→导入 Git 仓库→**授权 GitHub**→选 `WangDuoYuOnebillion/EatWhat`→**生产分支 `gh-pages`、框架预设"其他/静态"、构建命令留空、输出目录 `./`**、加速区随意(只用默认域名,不涉备案)。完整步骤见 [DEPLOY.md](DEPLOY.md)。
2. 🔴 **真机验收** —— #1 手机访问 / #2 微信打开 / #3 真机重开存住 / #5 真机加主屏图标 / #6 走一遍更新流程。

本地能验的(#3 存储 / #4 无红条 / #5 图标就位 / #7 check.js 零 error)会话 #7 已全过。

---

## 🔴 下个会话开工前:先确认用户 EdgeOne 部署了没

- **用户已用 EdgeOne Pages 部署好、有能访问的默认域名?**
  → 拿到线上地址(形如 `xxx.edgeone.app`),记进 DEPLOY.md,陪用户跑真机验收 #1/#2/#3/#5/#6。全过 → 关闭 P8 → 进 **P2 手机真机走查**。
- **部署卡住了?**(找不到 Gitee 授权 / 构建 404 / 微信打不开)
  → 对照 [DEPLOY.md](DEPLOY.md) 的 FAQ;构建配置最容易错(必须留空构建命令、输出 `./`、分支 `gh-pages`)。实在不行切腾讯云 COS 兜底(DEPLOY.md 末节)。
- **注意:** P2 本身也需要"已上线 + 真机",所以上线是后续 P2/P6 的共同前置。

---

## ⚠️ 阶段编号 ≠ 执行顺序

阶段号只增不改。**"下一步做什么"看 [ROADMAP.md](ROADMAP.md) 的「执行顺序」表,不看编号大小。**

当前顺序:P0 ✅ → P5.1 ✅ → P1 ✅ → P4 ✅ → **P8 🟡(我这部分完成,待用户部署)** → P2 → P6 → P3 → P5 → P9 → P7

---

## 阶段进度

```
P0   调研→构建→文档      ████████████ 100%  ✅ 会话 #1–#4
P5.1 改名+iOS+修搜索      ████████████ 100%  ✅ 会话 #6
P1   纯手机化改造         ████████████ 100%  ✅ 会话 #6
P4   校验脚本落盘         ████████████ 100%  ✅ 会话 #6
P8   部署到免费托管       ██████████░░  85%  🟡 仓库已推,差用户开 Pages + 真机验收
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
| 1 | **用户去不去部署** —— P8 收尾、P2、P6 全卡在这一步 | **下个会话必确认** | 陪用户走 DEPLOY.md;不做则后续推不动 |
| 2 | **要不要 service worker(离线缓存)** —— 应用零网络请求,离线价值不大 | P6 | 可做可不做,成本低。部署到 https 后原路线冲突已消(见 ADR-022) |
| 3 | **小程序走哪条路** —— 原生重写 vs `web-view` 套 H5 | P9 | 大概率原生:`web-view` 需已备案域名,个人主体走不通 |
| 4 | **小程序与单文件红线冲突** —— 需抽出共用数据+算法模块 | P9 | 开工前必须新增 ADR,不要绕过去 |
| ~~5~~ | ~~仓库公开性 / 托管平台兜底~~ | ~~P8~~ | ✅ **已定**(会话 #7):方案 C + Gitee 主线 + COS 兜底 |

---

## 已知限制(现状,不是待办)

- **真机从未验过。** 所有测试都在 headless / 本地浏览器里跑。设备是 **iPhone 13**(系统版本待确认)。P2 消掉这一条。
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
