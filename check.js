#!/usr/bin/env node
/* ==========================================================================
 * check.js · 「小付，今天吃什么？」数据校验
 * --------------------------------------------------------------------------
 * 为什么需要它:
 *   PRD §10 有两条硬约束 —— ① 每个「常用」食材至少是 4 道菜的主料
 *   ② 不存在"勾了却出不来菜"的食材。这两条决定了产品的核心承诺
 *   (勾任何常见食材都能得到有意义的结果),但它们没法靠肉眼守住:
 *   加一道菜、改一个食材 id,退化是静默的。
 *
 *   项目是零依赖零构建的单文件应用(ADR-001 / ADR-011),没有编译期检查。
 *   这个脚本就是唯一的质量护栏。
 *
 * 用法:
 *   node check.js                  校验 ./index.html
 *   node check.js path/to.html     校验指定文件
 *   node check.js --selftest       自检:注入 7 类错误,验证每类都能被报出
 *
 * 退出码:有 error → 1,只有 warning 或全清 → 0
 * ========================================================================== */

'use strict';
const fs = require('fs');
const path = require('path');

/* ---------- 允许的用量单位白名单 ---------- */
const UNITS = ['g', 'ml', '个', '根', '片', '瓣', '颗', '勺', '把', '适量'];

/* ---------- 阈值 ---------- */
const NUTR_ERR = 0.20;   // 标称热量与 PFC 折算热量的偏差上限(超过 = error)
const NUTR_WARN = 0.15;  // 提醒线
const HOT_MAIN_MIN = 4;  // 常用食材至少要当几道菜的主料
const MIN_STEPS = 3;     // 每道菜最少步骤数
const KCAL_LO = 30, KCAL_HI = 800;

/* ==========================================================================
 * 从 index.html 里抽出数据层并求值
 * ========================================================================== */
function extract(file) {
  const html = fs.readFileSync(file, 'utf8');
  const m = html.match(/<script>([\s\S]*)<\/script>/);
  if (!m) throw new Error('找不到 <script> 块:' + file);
  const code = m[1];

  const start = code.indexOf('var TOOLS =');
  if (start < 0) throw new Error('找不到数据层起点 "var TOOLS ="');

  // 数据层止于「第 3 层 · 状态与持久化」那段分隔注释
  const marker = code.indexOf('第 3 层');
  if (marker < 0) throw new Error('找不到数据层终点标记 "第 3 层"');
  const end = code.lastIndexOf('/*', marker);

  const dataCode = code.slice(start, end);
  const fn = new Function(dataCode + '\nreturn {TOOLS,CATS,DCATS,ING,IMAP,PACK,SUBS,RECIPES};');
  return fn();
}

/* ==========================================================================
 * 校验主体(纯函数,便于 --selftest 复用)
 * ========================================================================== */
function validate(D) {
  const { TOOLS, CATS, DCATS, ING, RECIPES } = D;
  const errors = [], warns = [];
  const E = (m) => errors.push(m);
  const W = (m) => warns.push(m);

  const toolIds = new Set(TOOLS.map(t => t.id));
  const catIds = new Set(CATS.map(c => c.id));
  const imap = {};
  ING.forEach(g => { imap[g.id] = g; });

  /* ---------- 1. 食材自身 ---------- */
  const seenIng = new Set();
  ING.forEach(g => {
    if (seenIng.has(g.id)) E(`[id唯一] 食材 id 重复: ${g.id}`);
    seenIng.add(g.id);
    if (!g.n) E(`[字段] 食材缺 name: ${g.id}`);
    if (!g.e) E(`[字段] 食材缺 emoji: ${g.id}`);
    if (!catIds.has(g.cat)) E(`[引用] 食材分类未知: ${g.id} → ${g.cat}`);
    if (g.an && !['pork', 'meat', 'fish'].includes(g.an)) E(`[字段] 食材 an 值非法: ${g.id} → ${g.an}`);
    if (g.cat !== 'season' && !g.sd) W(`[字段] 食材缺默认保质天数 sd: ${g.n}`);
  });

  /* ---------- 2. 菜谱 ---------- */
  const seenRec = new Set();
  const mainUse = {}, anyUse = {};
  const REQUIRED = ['n', 'e', 'cat', 'cu', 't', 'd', 'sp', 'tl', 'tg', 'm', 's', 'se', 'nu', 'st'];

  RECIPES.forEach(r => {
    const tag = r.n || r.id;

    if (seenRec.has(r.id)) E(`[id唯一] 菜谱 id 重复: ${r.id}`);
    seenRec.add(r.id);
    REQUIRED.forEach(k => { if (r[k] === undefined) E(`[字段] 菜谱缺字段 ${k}: ${tag}`); });
    if (!DCATS[r.cat]) E(`[引用] 菜品分类未知: ${tag} → ${r.cat}`);
    if (!r.m || !r.m.length) E(`[字段] 菜谱无主料: ${tag}`);
    if (r.d < 1 || r.d > 5) E(`[范围] 难度越界: ${tag} → ${r.d}`);
    if (r.sp < 0 || r.sp > 3) E(`[范围] 辣度越界: ${tag} → ${r.sp}`);
    if (!r.t || r.t < 5) E(`[范围] 时长异常: ${tag} → ${r.t}`);

    /* 厨具引用 */
    (r.tl || []).forEach(t => { if (!toolIds.has(t)) E(`[引用] 厨具 id 未知: ${tag} → ${t}`); });

    /* 主料 / 辅料:引用 + 用量 + 单位白名单 */
    const chk = (arr, label, isMain) => (arr || []).forEach(x => {
      if (!imap[x.i]) E(`[引用] ${label} id 未知: ${tag} → ${x.i}`);
      else {
        anyUse[x.i] = (anyUse[x.i] || 0) + 1;
        if (isMain) mainUse[x.i] = (mainUse[x.i] || 0) + 1;
      }
      if (x.q === undefined || x.q === null || x.q <= 0) E(`[用量] ${label}缺用量或用量非正: ${tag} → ${x.i}`);
      if (!x.u) E(`[用量] ${label}缺单位: ${tag} → ${x.i}`);
      else if (!UNITS.includes(x.u)) E(`[单位] 单位不在白名单: ${tag} → ${x.i} 用了 "${x.u}"(白名单: ${UNITS.join('/')})`);
    });
    chk(r.m, '主料', true);
    chk(r.s, '辅料', false);

    /* 调味:必须是 season 分类 */
    (r.se || []).forEach(id => {
      if (!imap[id]) E(`[引用] 调味 id 未知: ${tag} → ${id}`);
      else {
        anyUse[id] = (anyUse[id] || 0) + 1;
        if (imap[id].cat !== 'season') E(`[分类] se 里放了非调味食材: ${tag} → ${imap[id].n}`);
      }
    });

    /* 营养自洽 */
    const nu = r.nu;
    if (!nu || nu.k === undefined || nu.p === undefined || nu.f === undefined || nu.c === undefined) {
      E(`[营养] 营养字段不全: ${tag}`);
    } else {
      const calc = nu.p * 4 + nu.f * 9 + nu.c * 4;
      const dev = Math.abs(calc - nu.k) / Math.max(1, nu.k);
      if (dev > NUTR_ERR)
        E(`[营养] 标称热量与 PFC 折算偏差 ${(dev * 100).toFixed(0)}% (>${NUTR_ERR * 100}%): ${tag} 标 ${nu.k} / 算 ${calc}`);
      else if (dev > NUTR_WARN)
        W(`[营养] 偏差 ${(dev * 100).toFixed(0)}%: ${tag} 标 ${nu.k} / 算 ${calc}`);
      if (nu.k < KCAL_LO || nu.k > KCAL_HI) W(`[营养] 每份热量异常: ${tag} → ${nu.k} kcal`);
    }

    /* 步骤完整性 */
    const st = r.st || [];
    if (st.length < MIN_STEPS) E(`[步骤] 步骤少于 ${MIN_STEPS} 步: ${tag} → ${st.length} 步`);
    st.forEach((x, i) => {
      if (!x.t) E(`[步骤] 步骤缺文本: ${tag} #${i + 1}`);
      if (x.m === undefined) E(`[步骤] 步骤缺耗时: ${tag} #${i + 1}`);
    });
    if (!r.tp) E(`[步骤] 缺关键经验 tips: ${tag}`);

    /* 替代方案的 key 必须是本菜用到的食材 */
    if (r.sb) Object.keys(r.sb).forEach(k => {
      const used = [...(r.m || []), ...(r.s || [])].some(x => x.i === k) || (r.se || []).includes(k);
      if (!used) W(`[替代] sb 指向本菜未使用的食材: ${tag} → ${k}`);
    });
  });

  /* ---------- 3. PRD §10 两条硬约束 ---------- */
  const hots = ING.filter(g => g.hot);
  hots.forEach(g => {
    const n = mainUse[g.id] || 0;
    if (n < HOT_MAIN_MIN)
      E(`[覆盖度] 常用食材主料不足 ${HOT_MAIN_MIN} 道: ${g.n} 只有 ${n} 道(PRD §10 硬约束)`);
  });
  ING.forEach(g => {
    if (!anyUse[g.id])
      E(`[零孤儿] 食材未被任何菜谱使用: ${g.n} —— 用户勾了会得不到任何结果(PRD §10 硬约束)`);
  });

  return { errors, warns, stats: { mainUse, anyUse, hots: hots.length } };
}

/* ==========================================================================
 * 报告
 * ========================================================================== */
function report(D, res) {
  const { ING, RECIPES, TOOLS, DCATS, PACK } = D;
  const byCat = {};
  RECIPES.forEach(r => { byCat[r.cat] = (byCat[r.cat] || 0) + 1; });
  const steps = RECIPES.reduce((a, r) => a + r.st.length, 0);
  const kcals = RECIPES.map(r => r.nu.k);

  console.log('==== 规模 ====');
  console.log(`菜谱 ${RECIPES.length} 道 · 食材 ${ING.length} 项 · 厨具 ${TOOLS.length} 种 · 调味基础包 ${Object.keys(PACK).length} 样`);
  console.log('分类分布: ' + Object.keys(byCat).map(k => `${DCATS[k]} ${byCat[k]}`).join(' / '));
  console.log(`步骤总数 ${steps}(平均 ${(steps / RECIPES.length).toFixed(1)} 步/道) · 每份热量 ${Math.min(...kcals)}–${Math.max(...kcals)} kcal`);
  console.log('');

  console.log(`==== 错误 ${res.errors.length} ====`);
  res.errors.slice(0, 40).forEach(e => console.log('  ✗ ' + e));
  if (res.errors.length > 40) console.log(`  … 另有 ${res.errors.length - 40} 条`);
  if (!res.errors.length) console.log('  无');
  console.log('');

  console.log(`==== 提醒 ${res.warns.length} ====`);
  res.warns.slice(0, 20).forEach(w => console.log('  ! ' + w));
  if (res.warns.length > 20) console.log(`  … 另有 ${res.warns.length - 20} 条`);
  if (!res.warns.length) console.log('  无');
  console.log('');

  console.log('==== PRD §10 硬约束 ====');
  const thin = ING.filter(g => g.hot && (res.stats.mainUse[g.id] || 0) < HOT_MAIN_MIN);
  const orph = ING.filter(g => !res.stats.anyUse[g.id]);
  console.log(`  常用食材主料 ≥${HOT_MAIN_MIN} 道: ${res.stats.hots - thin.length}/${res.stats.hots} ${thin.length ? '✗' : '✓'}`);
  console.log(`  零孤儿食材:               ${ING.length - orph.length}/${ING.length} ${orph.length ? '✗' : '✓'}`);
}

/* ==========================================================================
 * --selftest:注入 7 类错误,验证每类都被准确报出
 * ========================================================================== */
function selftest(file) {
  const clone = () => JSON.parse(JSON.stringify(extract(file)));

  const cases = [
    ['引用完整性 · 未知食材 id', d => { d.RECIPES[0].m[0].i = 'buCunZaiDeShiCai'; }, '[引用]'],
    ['引用完整性 · 未知厨具 id', d => { d.RECIPES[0].tl = ['weiBoLu2000']; }, '[引用]'],
    ['id 唯一性 · 菜谱 id 重复', d => { d.RECIPES[1].id = d.RECIPES[0].id; }, '[id唯一]'],
    ['营养自洽 · 偏差超 20%', d => { d.RECIPES[0].nu.k = d.RECIPES[0].nu.k * 3; }, '[营养]'],
    ['单位规范 · 单位不在白名单', d => { d.RECIPES[0].m[0].u = '一大坨'; }, '[单位]'],
    ['步骤完整 · 步骤不足 / 缺经验', d => { d.RECIPES[0].st = [d.RECIPES[0].st[0]]; d.RECIPES[0].tp = ''; }, '[步骤]'],
    ['覆盖度 · 常用食材主料不足', d => {
      const hot = d.ING.find(g => g.hot);
      d.RECIPES.forEach(r => { r.m = r.m.filter(x => x.i !== hot.id); });
      d.RECIPES.forEach(r => { if (!r.m.length) r.m = [{ i: 'jidan', q: 1, u: '个' }]; });
    }, '[覆盖度]'],
    ['零孤儿 · 食材无人使用', d => {
      d.ING.push({ id: 'guDanShiCai', n: '孤单食材', cat: 'veg', e: '🫥', sd: 7 });
    }, '[零孤儿]'],
  ];

  console.log('==== check.js 自检:注入错误 → 是否被报出 ====\n');

  /* 基线:未注入时必须零 error */
  const base = validate(extract(file));
  const baseOK = base.errors.length === 0;
  console.log(`  ${baseOK ? 'PASS' : '**FAIL**'} | 基线(未注入) error=${base.errors.length} warn=${base.warns.length}`);

  let pass = baseOK ? 1 : 0, total = 1;
  cases.forEach(([name, mutate, expectTag]) => {
    total++;
    const d = clone();
    mutate(d);
    const r = validate(d);
    const hit = r.errors.some(e => e.startsWith(expectTag));
    if (hit) pass++;
    const sample = (r.errors.find(e => e.startsWith(expectTag)) || r.errors[0] || '(无 error)');
    console.log(`  ${hit ? 'PASS' : '**FAIL**'} | ${name}`);
    console.log(`         → ${sample.length > 96 ? sample.slice(0, 96) + '…' : sample}`);
  });

  console.log(`\n  自检结果: ${pass}/${total} 通过`);
  return pass === total ? 0 : 1;
}

/* ==========================================================================
 * 入口
 * ========================================================================== */
function main() {
  const args = process.argv.slice(2);
  const isSelf = args.includes('--selftest');
  const fileArg = args.find(a => !a.startsWith('--'));
  const file = path.resolve(fileArg || path.join(__dirname, 'index.html'));

  if (!fs.existsSync(file)) {
    console.error('找不到文件: ' + file);
    process.exit(2);
  }

  if (isSelf) process.exit(selftest(file));

  let D;
  try {
    D = extract(file);
  } catch (e) {
    console.error('数据层解析失败: ' + e.message);
    process.exit(2);
  }
  const res = validate(D);
  report(D, res);
  process.exit(res.errors.length ? 1 : 0);
}

main();
