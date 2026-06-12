# 调研发现

## searchResource 用法
- 组件路径：`src/components/leisu/searchResource/searchResource.vue`
- 搜索比赛：`searchFields="match"`
- 传 sportId：通过 `this.$refs.searchResource.sportId = 1` 赋值
- 多选回调：`@setList="fn"`，回调参数是对象数组，每个对象含 `match_id` 等字段
- 参考文件：`src/views/match/football/gifBlackList.vue`、`src/views/chat_room/components/chatMatchBlackWhitelist.vue`

## 现有组件模式
- 弹窗用 `drag-dialog`（用法与 `el-dialog` 一致）
- 组件通过 `init()` 方法打开，`visible` 控制显示
- 参考：`src/views/predictor/components/matchEdit.vue`

## 父组件传递 sport_id
- matchList.vue 中 `listQuery.search_cond.sport_id`，showBlackList 时 `init(sport_id)` 传入
- `黑名单` 按钮只在 `sport_id == 1`（足球）时显示

## API 设计
- GET `/v1/admin/predictor/abandoned_match_black_list` — 参数 `sport_id`
- POST `/v1/admin/predictor/abandoned_match_black_save` — 参数 `{ match_ids, add, sport_id }`