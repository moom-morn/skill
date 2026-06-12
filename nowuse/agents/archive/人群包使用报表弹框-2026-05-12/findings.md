# Findings: 人群包使用报表弹框

## 现有结构

### list.vue
- 路径：`src/views/push/list.vue`
- 已有弹框模式：`reportDetail`（ref 调用 `.init(msg_id, content)`）、`editPublic`（ref 调用 `.editPushItem(id)`）
- `showReport()` 方法在 ~329 行后（目前为空，只有 `$nextTick`）
- 引入方式：直接 import + components 注册

### push.js API
- 路径：`src/api/push.js`
- 现有函数：`getPushList`、`pushReport`、`doPush` 等
- 新接口需要追加到末尾

### reportDetail.vue（参考模式）
- 路径：`src/views/push/components/reportDetail.vue`
- 弹框：`drag-dialog :visible.sync="reportDetailShow"`
- init 方法：接受参数 → 调用接口 → 设置 visible = true
- close 方法：重置数据

### components 目录
- `src/views/push/components/`：editPublic.vue、editTarget.vue、editTargetCopy.vue、reportDetail.vue

## 接口信息
- URL: `push/segment_rule_report`（完整：`v1/admin/push/segment_rule_report`）
- Method: POST
- 参数: `{ created_at }`
- 返回:
  ```
  code: integer
  data: [
    { rule_id: integer, rule_name: string, use_count: integer }
  ]
  ```

## newMySearch 使用模式
- list.vue 中使用 `source="pushList"` + `@saveSearchData="getData"`
- getData 接收 `obj.myDataSearch` 作为搜索参数
- 弹框内使用需确认是否支持（需查看其他弹框中是否有类似模式）
- 简单方案：不用 newMySearch，直接用 el-date-picker 做日期选择

## 决策点（待用户确认）
- created_at 参数格式：日期字符串 or 数组 [start, end]？
