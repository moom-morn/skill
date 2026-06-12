# task_plan.md — oneMatchEventCardList

## 目标

1. 新建 `src/views/match/eventComment/oneMatchEventCardList.vue` — 事件卡片列表组件
2. 新建 `src/views/match/eventComment/oneMatchEventCardListDialog.vue` — 弹框，引用上述列表

## 验证标准

- [ ] 列表组件使用 `newMySearch` + `Pagination` + `el-table`
- [ ] 接口调用 `event_card_list`（来自 `@/api/match`）
- [ ] 表格列覆盖接口所有字段
- [ ] 弹框通过 `drag-dialog` 包裹列表，支持 `init()` 打开
- [ ] `$attrs` 透传参数（如 `match_id`）到列表

## 阶段

| # | 阶段 | 状态 |
|---|------|------|
| 1 | 收集参考：读取 eventComment.vue、API 文件 | ✅ 完成 |
| 2 | 创建 oneMatchEventCardList.vue | ✅ 完成 |
| 3 | 创建 oneMatchEventCardListDialog.vue | ✅ 完成 |

## 关键决策

- 参考 `eventComment.vue` 的结构（newMySearch + pagination + 排序）
- `isDrawers` prop 控制独立页面 vs 抽屉模式
- 弹框宽度 1100px，通过 `v-bind="$attrs"` 透传 `match_id`
