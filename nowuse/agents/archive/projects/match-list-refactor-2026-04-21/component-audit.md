# 组件审计表：match_list.vue 内部组件兼容性

**生成日期**：2026-04-20  
**审计范围**：match_list.vue 的所有 import + template 中使用的所有组件  
**用途**：理解当前组件依赖关系，为后续电竞兼容改造做准备

---

## 📋 import 列表审计

### 核心导入汇总

| 序号 | 组件/模块名 | 导入路径 | 类型 | 用途 | 兼容性 |
|------|-----------|---------|------|------|--------|
| 1 | `MatchStrategy` | `./matchStrategyApi` | 类 | API 策略分发（sport_id/game_id → API） | ⚠️ 中等（sport_id=4 电竞无映射） |
| 2 | `MatchStrategyKey` | `./matchSreachKey` | 对象 | sport_id → sourceName 映射 | ⚠️ 中等（sport_id=4 缺失） |
| 3 | `pagination` | `@/components/Pagination` | Vue 组件 | 分页控制 | ✅ 完全兼容 |
| 4 | `matchInfo` | `@/components/leisu/matchInfo.vue` | Vue 组件 | 比赛基本信息展示 | ✅ 完全兼容（内部自处理 sport_id） |
| 5 | `otherControl` | `@/views/match/components/otherControl` | Vue 组件 | 额外操作列（情报、动态、报表等） | 🔴 有问题（Mid-1：任务按钮 v-else） |
| 6 | `getH` | `@/mixins/getH` | Mixin | 高度计算 mixin | ✅ 完全兼容 |
| 7 | `formatMatch` | `@/mixins/formatMatch` | Mixin | 比赛格式化 + 定位 mixin | 🔴 有问题（Bug-1：positionMatchData 不完整） |
| 8 | `newMySearch` | `@/components/newMySearch/index` | Vue 组件 | 搜索条件面板 | ⚠️ 中等（sport_id 动态切换未监听） |
| 9 | `todayComp` | `@/views/match/components/todayComp` | Vue 组件 | 今日赛事快捷筛选 | ⚠️ 中等（仅足篮球有快捷入口） |
| 10 | `headerCellStyle/tableOrderbyCond/getTimeToText` | `@/utils/tool.js` | 函数 | 工具函数 | ✅ 完全兼容 |
| 11 | `roomechartsList` | `@/views/match/components/roomecharts_for_list` | Vue 组件 | 报表弹窗 | ⚠️ 未验证（需检查是否支持所有 sport_id） |
| 12 | `oddInfo` | `@/views/match/components/oddInfo` | Vue 组件 | 亚盘让球/让分列 | 🔴 有问题（Mid-2：篮球状态码） |

---

## 📊 按兼容性分类

### ✅ 完全兼容（无问题）

| 组件 | 说明 | 原因 |
|------|------|------|
| `pagination` | 分页通用组件 | 与 sport_id 无关，纯分页逻辑 |
| `matchInfo` | 比赛信息展示 | 内部自行处理所有 sport_id 的显示差异 |
| `getH` mixin | 高度计算 | 通用的计算逻辑，与 sport_id 无关 |
| 工具函数 | `headerCellStyle` 等 | 格式化工具，与 sport_id 无关 |

**评估**：无需修改

---

### ⚠️ 中等风险（可用但有缺陷）

#### 1. `MatchStrategy` 和 `MatchStrategyKey`

**问题**：
- `MatchStrategyKey.MatchRefNameKeyList` 缺少 sport_id=4（电竞）的 key
- 当 sport_id=4 时，`refName` 和 `sourceName` 为 undefined

**使用位置**：
- `init()` 方法中：`this.refName = MatchStrategyKey.MatchRefNameKeyList[this.sport_id]`
- `init()` 方法中：`this.sourceName = MatchStrategyKey.MatchRefNameKeyList[this.sport_id]`

**影响**：
- sport_id=1~3 / 5~24：正常
- sport_id=4：sourceName 为 undefined，newMySearch 无法初始化

**建议**：
- 如果要支持电竞，需补全 sport_id=4 的映射
- 目前电竞(sport_id=4)有独立的 list.vue，不走 commonball 体系，暂无影响

---

#### 2. `newMySearch` 组件

**问题**：
- match_list.vue 中 `watch.sport_id` 被注释（Bug-2）
- 动态切换 sport_id 时，newMySearch 的 source 不更新

**使用位置**：
```html
<newMySearch 
    v-if="sourceName" 
    ref="queryForm"
    :source="sourceName"
    ...
/>
```

**影响**：
- Tab 或弹窗中动态切换 sport_id 时，搜索条件不刷新

**建议**：
- 修复 Bug-2（取消注释 watch sport_id）

---

#### 3. `todayComp` 快捷赛事组件

**问题**：
- 仅为足球(1)和篮球(2)提供快捷赛事入口
- 其他运动的快捷赛事为空（需 API 动态加载）

**使用位置**：
```html
<todayComp :sport_id="sport_id" :game_id="game_id" />
```

**影响**：
- sport_id 5/6/8/10/11/17/19/24：无硬编码快捷赛事，仅靠 API 返回

**建议**：
- 低优先级，需产品提供快捷赛事数据

---

#### 4. `roomechartsList` 报表组件

**问题**：
- 不确定其内部是否支持所有 sport_id
- 需深入审查组件代码

**使用位置**：
```html
<component 
    v-if="component_name" 
    :is="component_name" 
    ... 
/>
<!-- component_name 为 "roomechartsList" 时调用 -->
```

**建议**：
- 检查 `src/views/match/components/roomecharts_for_list.vue` 是否有 sport_id 限制
- 确保覆盖所有 11 个运动

---

### 🔴 有问题（需修复）

#### 1. `otherControl` 额外操作列

**问题**：Mid-1 —— 任务按钮 v-else 对所有非足篮球始终显示

**使用位置**：
```html
<el-table-column label="额外数据" width="400">
    <template slot-scope="{row}">
        <otherControl :row="row" :sport_id="row.sport_id" />
    </template>
</el-table-column>
```

**影响**：
- sport_id 5/6/8/10/11/17/19/24：任务按钮显示逻辑不当

**修复**：Mid-1 对应的修复方案

---

#### 2. `formatMatch` mixin

**问题**：Bug-1 —— `positionMatchData` 只处理斯诺克(sport_id=19)

**使用位置**：
```javascript
mixins: [getH, formatMatch],
// 使用其中的 positionMatchData 方法
```

**影响**：
- 定位进行中功能对所有非斯诺克运动失效

**修复**：Bug-1 对应的修复方案

---

#### 3. `oddInfo` 亚盘组件

**问题**：Mid-2 —— 状态码判断对篮球不准确

**使用位置**：
```html
<el-table-column v-if="sport_id == 1 || sport_id == 2" ...>
    <template slot-scope="{row}">
        <oddInfo :row="row" :sport_id="row.sport_id" />
    </template>
</el-table-column>
```

**影响**：
- sport_id=2（篮球）：让分列的胜负颜色判断错误

**修复**：Mid-2 对应的修复方案

---

## 📐 template 中的条件渲染审计

### 按 sport_id 条件渲染的部分

| 组件/功能 | 条件 | sport_id 覆盖 | 备注 |
|---------|------|-------------|------|
| `<newMySearch>` | `v-if="sourceName"` | 1-3, 5-24（4 缺）| 动态，依赖 init 结果 |
| `<newButton>` 定位 | `v-if="!isSrearchComp && !isTab"` | 所有 | 不受 sport_id 限制 |
| `<oddInfo>` 让球/让分 | `v-if="sport_id == 1 \|\| sport_id == 2"` | 仅 1, 2 | 足球/篮球专属 |
| `<el-table-column>` 比赛 ID | `v-if="isSrearchComp \|\| sport_id == 1"` | 仅 1 或 searchComp 模式 | 仅足球和嵌入模式显示链接 |

### 未条件渲染但有 sport_id 逻辑的组件

| 组件 | 说明 | 内部逻辑 |
|------|------|---------|
| `<todayComp>` | 始终渲染 | 内部只为 sport_id=1/2 提供快捷赛事数据 |
| `<otherControl>` | 始终渲染 | 内部有多项 sport_id 条件分支 |
| `<matchInfo>` | 始终渲染 | 内部自处理所有 sport_id 显示差异 |
| `<component :is="roomechartsList">` | 条件渲染（v-if="component_name"） | 内部是否支持所有 sport_id？需验证 |

---

## 🎯 后续电竞兼容改造的准备清单

如果后续要做电竞兼容（sport_id=4），需要针对以下文件/组件进行改造：

### 必做项

- [ ] `matchSreachKey.js`：补全 sport_id=4 的 sourceName 映射
- [ ] `matchStrategyApi.js`：补全 sport_id=4 的 API 映射（或继续用 strategiesGame）
- [ ] `match_list.vue`：确保 `init()` 中能正确处理 sport_id=4，转为 game_id 查询

### 选做项（依赖设计决策）

- [ ] `todayComp.vue`：考虑是否为电竞添加快捷赛事入口
- [ ] `otherControl.vue`：审查电竞是否需要额外的操作入口
- [ ] `roomechartsList.vue`：验证报表组件是否支持电竞

### 参考：电竞当前独立体系

```
src/views/match/lol/list.vue  (sport_id=4, game_id=1)
src/views/match/csgo/list.vue (sport_id=4, game_id=2)
src/views/match/dota/list.vue (sport_id=4, game_id=3)
src/views/match/kog/list.vue  (sport_id=4, game_id=4)
```

这些文件当前是完全独立的，不走 commonball 体系。如要统一到 match_list.vue，需要大量改造。

---

## 📊 兼容性等级总结

### 按兼容性等级分类

| 等级 | 组件数 | 列表 | 处理方式 |
|------|--------|------|---------|
| ✅ 完全兼容 | 4 | pagination, matchInfo, getH, tool.js | 无需修改 |
| ⚠️ 中等风险 | 4 | MatchStrategy, MatchStrategyKey, newMySearch, todayComp, roomechartsList | 部分需修改或待验证 |
| 🔴 有问题 | 3 | otherControl, formatMatch, oddInfo | **必须修复**（5 个 Bug/问题） |

---

## 🔗 问题关联表

### Bug/问题 → 受影响组件

| Bug | 组件 | 问题类型 | 修复优先级 |
|-----|------|---------|----------|
| Bug-1 | formatMatch | 功能缺失 | 🔴 高 |
| Bug-2 | match_list.vue + newMySearch | 监听缺失 | 🔴 高 |
| Bug-3 | match_list.vue | 映射缺失 | 🔴 高 |
| Mid-1 | otherControl | 显示逻辑 | 🟡 中 |
| Mid-2 | oddInfo | 状态码逻辑 | 🟡 中 |
| Low-1 | todayComp | 功能缺失（产品） | 🟢 低 |

---

## 💾 文件清单（完整参考）

### 核心改造文件

```
src/views/match/commonball/
├── match_list.vue ⭐ （主组件，Bug-2/3）
├── matchStrategyApi.js （API 策略）
└── matchSreachKey.js （sourceName 映射）
```

### 被 import 的组件/mixin/工具

```
src/mixins/
├── formatMatch.vue （Bug-1：positionMatchData）
└── getH.js （高度计算，✅）

src/components/
├── leisu/
│   └── matchInfo.vue （比赛信息，✅）
├── newMySearch/ （搜索面板）
│   ├── index.vue
│   └── components/searchKey/compKey/matchBall/
│       ├── football.js
│       ├── basketball.js
│       ├── tennis.js
│       ├── cricket.js
│       ├── baseball.js
│       ├── puck.js
│       ├── volleyball.js
│       ├── pingpong.js
│       ├── rugby.js
│       ├── snooker.js
│       └── badminton.js
└── Pagination （分页，✅）

src/views/match/components/
├── otherControl.vue （Mid-1：任务按钮）
├── oddInfo.vue （Mid-2：篮球状态码）
├── todayComp.vue （Low-1：快捷赛事）
└── roomecharts_for_list.vue （报表，未验证）

src/utils/
└── tool.js （工具函数，✅）
```

---

## ✅ 审计结论

### 现状总结

1. **通用基础**：match_list.vue 的大部分导入都是通用的（pagination, matchInfo, mixins 等）
2. **问题集中**：5 个兼容性问题集中在 3 个文件（formatMatch.vue, match_list.vue, otherControl.vue, oddInfo.vue）
3. **电竞独立**：电竞(sport_id=4)当前完全独立，暂无影响，但为后续统一做准备

### 修复路径

1. **立即修复**（优先级高）
   - Bug-1：formatMatch.vue positionMatchData 补全
   - Bug-2：match_list.vue watch sport_id 取消注释
   - Bug-3：match_list.vue setId 补全乒乓路由

2. **后续修复**（优先级中）
   - Mid-1：otherControl.vue 任务按钮条件
   - Mid-2：oddInfo.vue 篮球状态码

3. **待验证**（优先级低）
   - roomechartsList 是否支持所有 sport_id
   - todayComp 是否需要其他运动快捷赛事

### 后续改造建议

- **电竞兼容**：需补全 matchSreachKey.js 和 matchStrategyApi.js 的 sport_id=4 映射
- **性能优化**：searchResource 缓存（Perf-1）为首选

---

**审计完成日期**：2026-04-20  
**建议下一步**：按优先级修复 5 个 Bug/问题，然后验证所有 11 个运动的核心功能
