# 发现记录 - 事件卡数据梳理

## 顶层结构基线 (Top Level)

| 字段 | Swagger 类型 | 实际返回类型 | 备注 |
|---|---|---|---|
| `code` | integer | integer | 一致 |
| `current_page` | integer | (缺失) | 实际样本中未见 |
| `page_size` | integer | (缺失) | 实际样本中未见 |
| `total` | integer | (缺失) | 实际样本中未见，但列表页代码有引用 |
| `data` | object | object | 核心容器 |

## data 内部结构

| 字段 | Swagger 类型 | 实际返回类型 | 备注 |
|---|---|---|---|
| `match_id` | integer | integer | 一致 |
| `home_team` | array (of object) | object | **差异**：Swagger 说是数组，实际是对象 |
| `away_team` | array (of object) | object | **差异**：Swagger 说是数组，实际是对象 |
| `cards` | array | array | 一致 |

## 字段差异矩阵与风险评估

| 差异项 | 类型 | 风险等级 | 描述与建议 |
|---|---|---|---|
| `home_team`/`away_team` | 结构偏移 | **高** | Swagger 标注为数组 `[]`，实际返回对象 `{}`。若按数组处理（如 `.length` 或 `[0]`）会报错。建议：按对象处理，并做 `|| {}` 兜底。 |
| `fixed_time` | 类型偏移 | **中** | Swagger 标注为 `boolean` | 实际为 `integer` (时间戳)。逻辑判断不能仅用 `if(fixed_time)`，需判断是否大于当前时间或特定值。 |
| 分页字段 (`total` 等) | 缺失 | **低** | 实际样本未见，但 `oneMatchEventCardList.vue` 强依赖 `res.total`。建议：接口层确保返回，或前端做 `res.total || 0` 兼容。 |
| `extra_data` | 未定义新增 | **低** | 实际返回有此字段，Swagger 未列出。目前看是空对象，暂不影响逻辑，可作为扩展预留。 |
| `event_data` 动态性 | 语义偏移 | **中** | Swagger 将所有卡片类型的字段混在一起。实际需根据 `event_type` 拆分逻辑，否则会读取到大量 `undefined`。 |

# 字段契约 v1 (基于实际返回)

## 1. 顶层容器 (Response)
```json
{
  "code": 0,
  "data": {
    "match_id": "number",
    "home_team": { "id": "number", "name": "string", "logo": "string", "score": "number" },
    "away_team": { "id": "number", "name": "string", "logo": "string", "score": "number" },
    "cards": []
  }
}
```

## 2. 卡片基础对象 (Card Base)
| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `id` | number | - | 唯一标识 |
| `event_type` | number | - | 类型枚举 (1-31, 99) |
| `level` | number | 1 | 等级 |
| `fixed_time` | number | 0 | 置顶过期时间戳 (秒) |
| `fire` | boolean | false | 是否火热 |
| `title` | string | "" | 标题 |
| `content` | string | "" | 内容 |
| `event_data` | object | {} | 动态业务数据 |
| `option_data` | object | { options: [], total: 0 } | 投票/选项数据 |
| `emoji_data` | object | { emoji: [], total: 0 } | 表情互动数据 |

## 3. 动态 event_data 契约 (按需扩展)
- **Type 1 (阵容)**: `{ home_formation, away_formation, home_players: [], away_players: [] }`
- **Type 3 (裁判)**: `{ referee_info: { id, name, logo, yellow_avg, ... } }`
- **Type 4 (天气)**: `{ venue: { name, city }, environment: { temperature, weather, ... } }`

## 4. 默认值兜底策略
- 数组字段: 统一使用 `[]` 兜底，避免 `.map` 报错。
- 对象字段: 统一使用 `{}` 兜底，避免 `.` 访问报错。
- 字符串字段: 统一使用 `""` 兜底。
