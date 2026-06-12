# 电竞兼容化改造 - 发现与分析

**分析日期**：2026-04-21

---

## 探索结论

### 1. 电竞现状（sport_id=4, game_id=1-4）

**现有实现**：4 个独立的完整 list.vue（lol/csgo/dota/kog），使用旧版 MySearch 组件，代码结构相同，差异仅在 game_id。

**问题**：不走通用 match_list.vue，与 11 个传统体育分离，难以维护和扩展。

### 2. 通用组件缺口分析

| 缺口 | 原因 | 影响 |
|-----|------|------|
| API 分发不完整 | strategiesGame 只有 game_id=1，其余 fallback 到 lol | CSGO/DOTA/KOG 用错 API |
| sourceName 映射缺失 | MatchRefNameKeyList 无电竞条目 | newMySearch source 为 undefined，搜索栏不渲染 |
| newMySearch source 不存在 | match.js 没有 lol/csgo/dota/kog 的 source key | 无法使用新版搜索组件 |
| positionMatchData 无电竞分支 | 方法只有传统体育逻辑 | 电竞列表"定位进行中"无法工作 |

### 3. 电竞搜索字段（电竞各游戏统一）

从旧 MySearch 组件 optionsData 提取，4 个游戏的搜索字段完全一致：

- match_time（比赛时间）
- id（比赛ID）
- team_id（队伍ID）
- competition_id（赛事ID）
- match_status（比赛状态，枚举 1-15，对应 matchStatusList(4)）
- deleted（逻辑删除，YesOrNo）
- extra_data（额外数据，精确搜索）
- updated_at（更新时间）

### 4. API 策略分发优先级

```
getApi() {
    if (this.gameId && this.gameId != 0)  // gameId 优先
        return strategiesGame[gameId]
    else
        return strategies[sportId]
}
```

**现状**：电竞走 gameId 分支，传统体育走 sportId 分支。

### 5. 定位进行中的 API 映射

| game_id | API 函数 | 接口路径 | 状态 |
|---------|---------|---------|------|
| 1 | lol_active_match | /v1/admin/match/esports/lol/lol_active_match | ✅ 已在 positionMatch 中实现 |
| 2 | csgo_active_match | /v1/admin/match/esports/csgo/csgo_active_match | ✅ 已定义，未在 positionMatchData 中使用 |
| 3 | dota_active_match | /v1/admin/match/esports/dota/dota_active_match | ✅ 已定义，未在 positionMatchData 中使用 |
| 4 | kog_active_match | /v1/admin/match/esports/kog/kog_active_match | ✅ 已定义，未在 positionMatchData 中使用 |

### 6. otherControl.vue 和 todayComp.vue 兼容性

**结论**：两个组件已完整支持 sport_id=4 及其 game_id 分支，无需修改。

- otherControl.vue：有 `sport_id == 4` 的完整判断，包括直播弹窗、刷新、统计等
- todayComp.vue：按钮样式针对 sport_id=4 有特殊处理，功能无需改动

### 7. 薄壳化可行性评估

**现有薄壳模式**（如 volleyball/list.vue）：可适配为 `<match-list :sport_id="4" :game_id="1" />`

**可行性**：✅ 完全可行，match_list.vue 已支持 game_id prop。

---

## 实施策略总结

- **4 个新建 source key 文件**（各游戏独立）
- **3 个改造策略层文件**（API 分发 + sourceName 映射）
- **1 个修复定位方法**（positionMatchData）
- **4 个薄壳化 list.vue**（500+ 行 → 9 行）

**总工时**：~3 小时  
**代码削减**：~2000 行
