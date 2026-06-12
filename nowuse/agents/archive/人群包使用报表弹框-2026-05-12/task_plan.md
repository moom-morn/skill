# Task Plan: 人群包使用报表弹框

## 目标
新建弹框组件 `segmentRuleReport.vue`，展示人群包使用情况报表，通过 `push/segment_rule_report` 接口查询，在 list.vue 的 `showReport()` 方法中触发。

## 验证标准
- [ ] `src/api/push.js` 新增 `segmentRuleReport` 函数，接口路径 `v1/admin/push/segment_rule_report`，POST
- [ ] `src/views/push/components/segmentRuleReport.vue` 组件新建，使用 `drag-dialog`、`newMySearch`（仅 created_at 参数）、`el-table`
- [ ] `list.vue` 中 `showReport()` 方法调用组件的 `init()`，并注册组件
- [ ] 表格展示：人群包id（rule_id）、人群包名字（rule_name）、使用次数（use_count）

---

## 任务列表

### Task 1：API 新增 `segmentRuleReport`
- 文件：`src/api/push.js`（末尾追加）
- 内容：POST `v1/admin/push/segment_rule_report`，参数 `{ created_at }`
- 验证：函数可正常导入

### Task 2：新建组件 `segmentRuleReport.vue`
- 文件：`src/views/push/components/segmentRuleReport.vue`（新建）
- 结构：
  - `drag-dialog` 包裹，`:visible.sync="visible"`，title="人群包使用报表"
  - `newMySearch` source="segmentRuleReport"，仅 created_at 参数
  - `el-table` 展示 rule_id、rule_name、use_count
  - `init()` 方法：打开弹框
  - `getData()` 方法：调用接口，传入搜索参数
  - 关闭时重置表单
- 验证：弹框可正常打开/关闭，搜索可触发接口

### Task 3：list.vue 注册组件并实现 `showReport()`
- 文件：`src/views/push/list.vue`
- 修改：
  1. import 新组件
  2. components 注册
  3. 模板中添加 `<segmentRuleReport ref="segmentRuleReport" />`
  4. `showReport()` 调用 `this.$refs.segmentRuleReport.init()`
- 验证：showReport() 可触发弹框打开

---

## 状态

| Task | 状态 |
|------|------|
| Task 1 API | ⬜ pending |
| Task 2 组件 | ⬜ pending |
| Task 3 list.vue | ⬜ pending |

---

## 关键假设
- 接口 URL 为 `v1/admin/push/segment_rule_report`（POST）
- `created_at` 为日期范围（数组），与其他列表页一致
- newMySearch source key 为 `segmentRuleReport`（需在搜索配置中添加，但配置文件不在此次改动范围内，先按模式注册）
- 分页：pageNum / pageSize / total，默认 1/10/0
