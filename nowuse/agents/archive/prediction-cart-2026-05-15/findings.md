# 发现与调查

## 三个预测列表组件共性
- `singleList` / `multibetList` / `lotteryList` 均在 `src/views/predictor/`
- 均支持 props：`match_id`、`sport_id`、`isSearchComp`、`canMoreChose`
- `@successObj` emit 单选，`@successList` emit 多选（数组）
- 数据方案唯一标识字段：`row.id`

## 在售判断逻辑
- activeType='single'：`item.match.match_status === 0`
- activeType='multibet'/'lottery'：`item.match_list[0].match_status === 0`

## 单关数据结构
```
item.match → { id, match_time, sport_id, competition, home, away, match_status }
```

## 串关/足彩数据结构
```
item.match_list → [ { match_time, sport_id, competition, home, away, match_status }, ... ]
item.matches → 同上（用于 obj 构建）
```

## normalizeCartItem 逻辑
- 单关：mainMatch = item.match
- 串关/足彩：mainMatch = item.matches[0]
- 用于统一在主列表中展示首场比赛信息

## API 接口规范
- 获取：GET /v1/admin/match/common/match_prediction_cart?sport_id=&match_id=
- 保存：POST /v1/admin/match/common/match_save_prediction_cart，body: { sport_id, match_id, predictions: [...] }
