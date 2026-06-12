# 电竞兼容化改造 - 进度记录

**日期**：2026-04-21  
**分支**：match-list-refactor  
**状态**：✅ 所有代码修改完成，已修复新发现问题

---

## 完成情况

### ✅ 阶段 1：新增电竞 newMySearch source key（5 个文件）
- [x] 新建 `src/components/newMySearch/components/searchKey/compKey/matchBall/lol.js`
- [x] 新建 `src/components/newMySearch/components/searchKey/compKey/matchBall/csgo.js`
- [x] 新建 `src/components/newMySearch/components/searchKey/compKey/matchBall/dota.js`
- [x] 新建 `src/components/newMySearch/components/searchKey/compKey/matchBall/kog.js`
- [x] 修改 `src/components/newMySearch/components/searchKey/compKey/match.js`（添加 4 个 import）

### ✅ 阶段 2：修改通用组件策略层（3 个文件）
- [x] 修改 `src/views/match/commonball/matchStrategyApi.js`（strategiesGame 补全）
- [x] 修改 `src/views/match/commonball/matchSreachKey.js`（新增 MatchRefNameKeyGameList）
- [x] 修改 `src/views/match/commonball/match_list.vue`（init() 按 sport_id=4 分支）

### ✅ 阶段 3：修复定位方法（1 个文件）
- [x] 修改 `src/mixins/formatMatch.vue`（positionMatchData 增加 sport_id=4 分支）

### ✅ 阶段 4：薄壳化电竞 list.vue（4 个文件）
- [x] 薄壳化 `src/views/match/lol/list.vue`
- [x] 薄壳化 `src/views/match/csgo/list.vue`
- [x] 薄壳化 `src/views/match/dota/list.vue`
- [x] 薄壳化 `src/views/match/kog/list.vue`

### ✅ 阶段 5：新增电竞置顶 topKey 配置（4 个文件）
- [x] 新建 `src/components/newMySearch/components/searchTopKey/topKeyItem/matchBall/lol.js`
- [x] 新建 `src/components/newMySearch/components/searchTopKey/topKeyItem/matchBall/csgo.js`
- [x] 新建 `src/components/newMySearch/components/searchTopKey/topKeyItem/matchBall/dota.js`
- [x] 新建 `src/components/newMySearch/components/searchTopKey/topKeyItem/matchBall/kog.js`
- [x] 修改 `src/components/newMySearch/components/searchTopKey/topKeyItem/match.js`（添加 4 个 import）

### ✅ 阶段 6：修复兼容性问题（2 个文件）
- [x] 修改 `src/views/match/commonball/match_list.vue`（时间范围字段兼容 match_time__range 和 match_time）

**总计：18 个文件修改完成**（13 + 4 + 1）

---

## 修改内容摘要

| 文件 | 变更说明 |
|-----|---------|
| **searchKey/** lol/csgo/dota/kog.js | 新建 4 个电竞 source key，8 个搜索字段 |
| searchKey/match.js | 添加 4 个 import + export 4 个电竞 source key |
| matchStrategyApi.js | 添加 csgo/dota/kog import + strategiesGame 补全 game_id=2/3/4 |
| matchSreachKey.js | 新增 MatchRefNameKeyGameList（game_id → sourceName）+ export 更新 |
| **match_list.vue** | init() 按 sport_id=4 分支 + 时间范围字段兼容 |
| formatMatch.vue | positionMatchData 增加 sport_id=4 的 game_id 分支（4 个 active_match API） |
| lol/csgo/dota/kog/list.vue | 薄壳化（500+ 行 → 9 行） |
| **searchTopKey/** lol/csgo/dota/kog.js | 新建 4 个电竞 topKey 置顶字段配置 |
| searchTopKey/match.js | 添加 4 个 import + export 4 个电竞 topKey |

---

## 问题发现与修复

### 问题 1：newMySearch 初始化报错
**错误**：`[Vue warn]: Error in created hook: "SyntaxError: "undefined" is not valid JSON"`  
**原因**：缺少电竞的 topKey 置顶字段配置  
**修复**：在 `searchTopKey/topKeyItem/matchBall/` 下新建 4 个电竞 topKey 文件（lol.js、csgo.js、dota.js、kog.js）

### 问题 2：时间范围字段不兼容
**错误**：`todayComp` 组件获取不到时间范围  
**原因**：`listQuery.search_cond.match_time__range` 是传统体育的字段名，电竞使用 `match_time`  
**修复**：改为 `listQuery.search_cond.match_time__range || listQuery.search_cond.match_time`

---

## 待验证

- [ ] 访问 `/match/LOL/list`，页面正常渲染，newMySearch 搜索栏可用
- [ ] 访问 `/match/CSGO/list`、`/match/DOTA/list`、`/match/kog/list`，各页面正常
- [ ] 点击"定位进行中"，各游戏调用对应的 active_match API（不是 fallback 到 lol）
- [ ] 搜索框输入比赛ID、赛事ID、选择状态，能正确查询对应游戏的比赛数据
- [ ] otherControl 中直播、刷新等按钮正常显示（应该已支持）
- [ ] todayComp 中赛事筛选按钮正常显示（应该已支持）

---

## 关键设计点

### 电竞的 sport_id 与 game_id 分层

- **sport_id=4** → 电竞大类
- **game_id=1/2/3/4** → 具体游戏（LOL/CSGO/DOTA2/KOG）

### newMySearch source key 名规范

- `lolMatchList`、`csgoMatchList`、`dotaMatchList`、`kogMatchList`
- 与传统体育的 `footballMatchList`、`basketballMatchList` 等模式一致

### API 策略分发

- matchStrategyApi.js 中 strategiesGame 按 game_id 索引（1→lol_match_list、2→csgo_match_list 等）
- getApi() 方法优先级：game_id > sport_id

### 薄壳化的好处

- 减少代码重复（4 个电竞 list.vue 从 ~500+ 行简化为 9 行）
- 统一的搜索、排序、分页、定位逻辑
- 便于后续新增电竞游戏（仅需新建 1 个 source key 文件 + 1 个 list.vue 薄壳）

---

## 下一步（可选）

1. 性能优化（Perf-1：searchResource 缓存）- 需求文档存放在 `.claude/plan/demand/性能优化/`
2. 功能扩展（如电竞计分板、直播推送等） - 可通过 `/match/demand/` 新增文档
3. 提交 PR 到 dev 分支，等待 CR 和测试

---

---

## 文件分类统计

| 分类 | 数量 | 说明 |
|-----|------|------|
| 新建 source key | 4 | searchKey/compKey/matchBall/{lol,csgo,dota,kog}.js |
| 新建 topKey 配置 | 4 | searchTopKey/topKeyItem/matchBall/{lol,csgo,dota,kog}.js |
| 修改核心文件 | 6 | API 分发、sourceName 映射、策略层、定位方法、时间兼容 |
| 薄壳化列表 | 4 | lol/csgo/dota/kog/list.vue |
| **总计** | **18** | **4 新 + 4 新 + 6 改 + 4 壳** |

---

## 代码削减

- **4 个电竞 list.vue**：500+ 行 × 4 = 2000+ 行 → 9 行 × 4 = 36 行
- **削减率**：98%（约减少 1964 行重复代码）

---

**最后更新**：2026-04-21 19:30（含新发现问题修复）  
**项目状态**：✅ 代码修改完成，进入验证阶段

---

## 🛑 暂停点（下班记录）

**已完成**：
- ✅ 18 个文件修改完成
- ✅ 修复 2 个新发现的兼容性问题（topKey + 时间范围字段）
- ✅ progress.md 已更新

**待做（下班后恢复）**：
- [ ] 启动 npm run dev 测试 4 个电竞列表页面
- [ ] 验证 6 个测试场景（见"待验证"部分）
- [ ] 测试通过后提交 PR（但不自动推送，用户手动验证）

**关键数据**：
- **修改的 18 个文件**已暂存（git add 完成）
- **分支**：match-list-refactor（origin 已同步）
- **核心文件行号**：
  - match_list.vue:192-197（init() 方法的 refNameKey 分支）
  - match_list.vue:31（time_range 字段兼容）
  - formatMatch.vue:57-63（positionMatchData sport_id=4 分支）

**下次恢复步骤**：
1. 读取 progress.md（当前文件）确认进度
2. 运行 `npm run dev` 启动开发服务器
3. 访问 4 个电竞列表验证功能
4. 若无问题，提交 PR（规则：禁止自动 PR，用户手动）
