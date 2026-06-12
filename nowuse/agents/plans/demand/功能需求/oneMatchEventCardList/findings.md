# findings.md — oneMatchEventCardList

## API

- 文件：`src/api/match.js:1103`
- 函数：`event_card_list(data)`
- URL：`/v1/admin/match/common/event_card_list`

## 接口返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int64 | 卡片ID |
| match_id | int64 | 比赛ID |
| sport_id | int64 | 运动ID |
| comp_id | int64 | 赛事ID |
| season_id | int64 | 赛季ID |
| event_type | int64 | 事件类型 |
| level | int64 | 卡片等级 |
| icon_desc | string | icon描述 |
| title | string | 标题 |
| content | string | 内容 |
| total_comments | int64 | 评论总数 |
| deleted | int64 | 0正常/1删除 |
| created_at | int64 | 创建时间 |
| updated_at | int64 | 更新时间 |

## 参考组件

- `src/views/match/eventComment/eventComment.vue` — 同目录，结构完全一致，作为主要参考
- 模式：`newMySearch` + `el-table` + `pagination` + `sortChange` + `headerCellStyle`
- `outParameter` 通过 `$attrs` 注入（如 `match_id`）
