# 进度记录 - 事件卡数据梳理

## 2026-05-06
- 初始化任务规划文件。
- 完成阶段 1-4: 建立基线、差异分析、消费映射、产出契约 v1。
- 梳理结论已记录在 `findings.md`。
- 任务完成，等待用户确认。
- 修正规划文件路径至 `.cursor/plans/`。

## 2026-05-06 (续)
- 补充比赛事件全局说明到 findings.md
- 新增阶段 6：事件卡列表页面开发
- 模拟数据源：.qoder/plans/data.js
- 在 matchEventCard.vue 中绘制首发阵容展示（一级事件）
  - 双方球队信息 + 阵型显示
  - 11人球员头像/球衣号/评分/队长标识
  - 按 position_num 排序
  - 投票组件（5档评分）
  - 球员点击跳转资料库（待实现）
- 拆分首发阵容为独立子组件 components/lineupCard.vue
- 父组件 matchEventCard.vue 改为按 event_type 动态渲染组件
- 新增 TYPE_COMPONENT_MAP 映射表（event_type: 1 -> lineupCard）
- 后续新事件类型只需新增组件并注册到映射表

## 2026-05-09 新增自定义事件弹框
- 新建 [src/views/match/eventComment/components/addCustomEventDialog.vue](file:///Users/chenwen/leisu_admin/src/views/match/eventComment/components/addCustomEventDialog.vue)，采用 drag-dialog + 内部 visit + init(row) 模式，参考 oneMatchEventCardListDialog.vue。
- [src/api/match.js](file:///Users/chenwen/leisu_admin/src/api/match.js) 新增 `add_event_card`，占位路径 `/v1/admin/match/common/add_event_card`，待后端确认。
- [src/views/match/eventComment/matchEventCard.vue](file:///Users/chenwen/leisu_admin/src/views/match/eventComment/matchEventCard.vue) 引入并注册组件，模板末尾挂载 `<add-custom-event-dialog ref="addCustomEventDialog" @success="getList" />`，`addCustomEvent` 改为 `this.$refs.addCustomEventDialog.init({ match_id: this.match_id })`。
- 弹框内表单字段暂留空，等后端接口对齐后补充。

## 2026-05-09 自定义事件卡片组件（event_type=99）
- 新建 [src/views/match/eventComment/components/customEventCard.vue](file:///Users/chenwen/leisu_admin/src/views/match/eventComment/components/customEventCard.vue)，基础模版：el-card + title + content + level/fire 标签。
- [src/utils/dict/match.js](file:///Users/chenwen/leisu_admin/src/utils/dict/match.js) event_type 99 映射已存在且已启用，无需修改。
- [src/views/match/eventComment/matchEventCard.vue](file:///Users/chenwen/leisu_admin/src/views/match/eventComment/matchEventCard.vue) 引入并注册 customEventCard，getCardComponent 通过 matchCardEventType[99] 自动返回组件名称。
- 后续按需扩展 option_data 内容渲染。
