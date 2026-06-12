# 任务规划 - 事件卡数据梳理与对齐

## 目标
- 整理事件卡接口字段，对齐 Swagger 与实际返回。
- 产出字段契约 v1，为后续开发打桩。

## 阶段
- [x] 阶段 1: 建立数据基线 (`baseline-schema`)
- [x] 阶段 2: 差异分析与风险评估 (`diff-matrix`)
- [x] 阶段 3: 消费映射与优先级定义 (`consumption-map`)
- [x] 阶段 4: 产出字段契约 v1 (`v1-contract`)
- [x] 阶段 5: 验收与冻结 (`phase-gate`)
- [ ] 阶段 6: 事件卡列表页面开发 (`matchEventCard`)
- [x] 阶段 7: 新增自定义事件弹框 (`add-custom-event-dialog`)
- [x] 阶段 8: 自定义事件卡片组件 (`customEventCard`, event_type=99)

## 决策记录
- 2026-05-06: 确定"实际返回优先"原则。
- 2026-05-06: 新增阶段 6，基于模拟数据开发事件卡列表页面。
- 2026-05-09: 新增阶段 7，自定义事件弹框采用 drag-dialog + ref.init(row) 统一打开模式（参考 oneMatchEventCardListDialog.vue）。
- 2026-05-09: 新增阶段 8，event_type=99 自定义事件卡片组件 customEventCard，基础模版（el-card + title + content + level/fire 标签）。

---

## 阶段 6: 事件卡列表页面开发 (`event-card-list`)

### 目标
- 使用 `.qoder/plans/data.js` 的模拟数据
- 创建事件卡管理页面
-

### 任务清单
- [ ] 6.1 创建 API 接口文件 `src/api/eventCard.js`（模拟数据返回）
- [ ] 6.2 创建 Vue 弹框 中的组件页面 `src/views/eventCard/matchEventCard`
- [ ] 6.4 验证页面功能

### 技术决策
- 数据源：使用 data.js 导出模拟数据，API 层做模拟返回
- 页面结构： 每一个事件卡片 都用el-card

---

## 阶段 7: 新增自定义事件弹框 (`add-custom-event-dialog`)

### 目标
- 点击 matchEventCard.vue 「添加自定义事件」按钮，打开独立弹框组件 A（基础模版），提交后刷新卡片列表。

### 任务清单
- [x] 7.1 新建 [addCustomEventDialog.vue](file:///Users/chenwen/leisu_admin/src/views/match/eventComment/components/addCustomEventDialog.vue)，采用 drag-dialog + 内部 visit 状态 + init(row) 接口，弹框内单字段先占位。
- [x] 7.2 [src/api/match.js](file:///Users/chenwen/leisu_admin/src/api/match.js) 新增 `add_event_card`（占位路径 `/v1/admin/match/common/add_event_card`，待后端确认）。
- [x] 7.3 [matchEventCard.vue](file:///Users/chenwen/leisu_admin/src/views/match/eventComment/matchEventCard.vue) 引入注册组件，模板末尾挂载 `<add-custom-event-dialog ref="addCustomEventDialog" @success="getList" />`，`addCustomEvent` 改为 `this.$refs.addCustomEventDialog.init({ match_id: this.match_id })`。

### 技术决策
- 弹框打开模式统一采用项目现有约定：父组件 `$refs.xxx.init(row)`，子组件内部自持 `visit` 状态（参考 [oneMatchEventCardListDialog.vue](file:///Users/chenwen/leisu_admin/src/views/match/eventComment/oneMatchEventCardListDialog.vue)）。
- 字段待定，弹框先交付框架；字段设计与后端接口对齐后再补充到 `el-form` 内。
- `handleSubmit` 成功后 `$emit('success')`，由父组件触发 `getList` 刷新。

### 验证标准
- 点击按钮 → 弹框正常打开，标题“新增自定义事件”。
- 取消/关闭 → visit 重置，form 清空。
- 确定 → 调用 add_event_card，成功后关闭弹框并触发父组件 getList。

---

## 阶段 8: 自定义事件卡片组件 (`customEventCard`, event_type=99)

### 目标
- 当 event_type=99 时，matchEventCard.vue 动态渲染 customEventCard 组件。

### 任务清单
- [x] 8.1 新建 [customEventCard.vue](file:///Users/chenwen/leisu_admin/src/views/match/eventComment/components/customEventCard.vue)，基础模版：el-card + 标题 + content + level/fire 标签，标准 props（card, homeTeam, awayTeam, optionImages）。
- [x] 8.2 [match.js](file:///Users/chenwen/leisu_admin/src/utils/dict/match.js) event_type 99 映射已存在且已启用（`99: {component: "customEventCard", label: "自定义事件"}`），无需修改。
- [x] 8.3 [matchEventCard.vue](file:///Users/chenwen/leisu_admin/src/views/match/eventComment/matchEventCard.vue) 引入并注册 customEventCard，getCardComponent 通过 matchCardEventType[99] 自动返回 component 名称。

### 技术决策
- 与现有卡片组件保持一致的 props 约定（card, homeTeam, awayTeam, optionImages），由父组件通过 v-bind 传入。
- 基础模版展示 card.title、card.content、card.level、card.fire，后续按需扩展 option_data 渲染。
- 通过 matchCardEventType 映射表驱动 getCardComponent，新增 event_type 无需修改父组件逻辑。
