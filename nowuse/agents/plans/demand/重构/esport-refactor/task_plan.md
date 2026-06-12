# 任务计划：电竞兼容化改造

**开始日期**：2026-04-21  
**分支**：`match-list-refactor`（继续）  
**总工时估算**：~3-4 小时（13 个文件修改，阶段 1 增加为 4 个独立文件）

---

## 目标

让通用组件 `match_list.vue` 完整支持电竞（sport_id=4），并将 4 个电竞 list.vue 改造为薄壳，与其他 11 个体育保持一致。

---

## 阶段状态

- [ ] **阶段 1**：新增电竞 newMySearch source key（5 个文件：4 个新建 + 1 个修改）
- [ ] **阶段 2**：修改通用组件策略层（3 个文件）
- [ ] **阶段 3**：修复 positionMatchData 电竞支持（1 个文件）
- [ ] **阶段 4**：薄壳化 4 个电竞 list.vue（4 个文件）
- [ ] **验证**：所有 6 个电竞列表场景验证

**总共 13 个文件修改**（4 新建 + 5 修改 + 4 薄壳化）

---

## 关键问题追踪

| 问题 | 状态 | 备注 |
|-----|------|------|
| esport.js 字段结构是否正确 | 待执行 | 需要参考 football.js 确认 |
| MatchRefNameKeyGameList 是否导出正确 | 待执行 | 需要检查 match.js 的 import 逻辑 |
| positionMatchData 参数 obj 是否有 game_id | 待执行 | 需要检查实际调用处 |

---

## 执行计划

### 阶段 1：新增电竞 newMySearch source key（4 个独立文件）
- [ ] 读取 football.js 确认字段格式
- [ ] 新建 lol.js（lolMatchList source key）
- [ ] 新建 csgo.js（csgoMatchList source key）
- [ ] 新建 dota.js（dotaMatchList source key）
- [ ] 新建 kog.js（kogMatchList source key）
- [ ] 修改 match.js（import 4 个文件 + 导出）

### 阶段 2：修改策略层
- [ ] 修改 matchStrategyApi.js（import + strategiesGame）
- [ ] 修改 matchSreachKey.js（新增 MatchRefNameKeyGameList）
- [ ] 修改 match_list.vue 的 init() 方法

### 阶段 3：修复定位方法
- [ ] 修改 formatMatch.vue 的 positionMatchData

### 阶段 4：薄壳化
- [ ] 薄壳化 lol/list.vue
- [ ] 薄壳化 csgo/list.vue
- [ ] 薄壳化 dota/list.vue
- [ ] 薄壳化 kog/list.vue

### 验证
- [ ] 访问 /match/LOL/list，确认页面正常
- [ ] 各游戏列表加载数据
- [ ] 点击"定位进行中"，各游戏调用对应 API
- [ ] 搜索和筛选功能正常
