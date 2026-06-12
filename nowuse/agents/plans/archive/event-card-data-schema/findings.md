# 发现记录 - 事件卡数据梳理

## 顶层结构啥大事基线 (Top Level)

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


## 5.模拟的实际数据
/Users/chenwen/leisu_admin/src/views/match/eventComment/data.json

---

## 6. 比赛事件全局说明

### 6.1 信息流状态标注
- 赛前 / 进行中 / 赛后

### 6.2 事件大类型分类
| 级别 | 说明 | 判断方式 |
|------|------|----------|
| 一级事件 | 置顶、通用 | 置顶状态 |
| 二级事件 | 通用 | 通用状态 |
| 自定义事件 | 具体事件类型 | 使用 `event_type` 判断 |

### 6.3 事件状态
- 通用状态
- 置顶状态

### 6.4 显示逻辑

#### 赛前：【阵容】【推迟】
- **一级事件**：常置顶，比赛开始后切换通用状态且回到原来时间线
- **二级事件**：有新事件产生收起上一个事件

#### 赛中：【进球、VAR判定、红牌、中断、腰斩】
- **一级事件**：默认置顶样式，X分钟或有新的一级事件切通用样式且回原时间线
- **二级事件**：默认通用样式

#### 赛后：【比赛结束 & MVP】
- **一级事件**：默认置顶样式，X分钟或有新的一级事件切回通用样式

### 6.5 参与人数计算
- 所有参与人数 = 组件参与人数 + 表情参与人数 + 评论人数
- 参与人数显示全部数值，不做换算

### 6.6 数据更新
- 组件数据、表情数据、卡片内容均为长链接更新

### 6.7 GIF 事件类型
进球、VAR判罚、黄牌、红牌、两黄变红、点球、点球未进、乌龙球、点球大战进球、点球大战未进

### 6.8 "完"状态保底逻辑
- 比赛结束依旧通过状态"完"判断
- 若比赛结束，状态又调整为"加"、"点"，则隐藏【比赛结束卡片】【MVP卡片】，直到再次出现"完"

### 6.9 所有事件汇总

| 阶段 | 一级事件 | 二级事件 |
|------|----------|----------|
| 赛前 | 首发、推迟 | 关键球员缺阵、裁判、天气、胜平负预测 |
| 赛中 | 进球、点球、乌龙球、VAR进球判定、VAR点球判定、VAR红牌判定、红牌、两黄一红、点球大战、中断、腰斩 | 绝佳机会未进（点球未进）、换人、黄牌、风向标、补水（球队射门、门将扑救、球员射门、球员关键传球、球队犯规、球队角球、球员成功过人）、中场结束、比赛恢复 |
| 赛后 | 比赛结束、MVP评选 | - |

---

## 7. 自定义事件弹框实现约定（2026-05-09）

### 7.1 弹框结构
- 外层：`drag-dialog`（已在 main.js 全局注册），`:visible.sync="visit"` + `append-to-body` + `@close="$emit('on-close')"`。
- 标题：`<div slot="title" class="el_dialog_title">新增自定义事件</div>`。
- 表单：`el-form` + `ref="form"` + `:model="form"`，字段待定（待后端接口对齐后补充）。
- 底部：`slot="footer"` 中放「取消 / 确定」按钮。

### 7.2 打开约定
- 弹框组件使用内部 `data.visit` 自控，不暴露 `visible` props。
- 提供 `init(row)` 方法：`this.matchInfo = {...row}` + `this.form = {}` + `this.visit = true`。
- 父组件通过 `<add-custom-event-dialog ref="addCustomEventDialog" @success="getList" />` 挂载，并用 `this.$refs.addCustomEventDialog.init({ match_id: this.match_id })` 打开。
- 同项目另一例参考：[oneMatchEventCardListDialog.vue](file:///Users/chenwen/leisu_admin/src/views/match/eventComment/oneMatchEventCardListDialog.vue)。

### 7.3 接口占位
- `add_event_card(data)`，路径 `/v1/admin/match/common/add_event_card`（POST），入参至少含 `match_id`，其他字段待后端确认后补入 `form`。
- 成功回调：`$message.success('新增成功')` → `this.visit = false` → `$emit('success')` → 父组件执行 `getList`。

---

## 8. 自定义事件卡片组件（event_type=99, 2026-05-09）

### 8.1 组件信息
- 文件：[customEventCard.vue](file:///Users/chenwen/leisu_admin/src/views/match/eventComment/components/customEventCard.vue)
- 映射：`matchCardEventType[99] = {component: "customEventCard", label: "自定义事件"}`（已在 match.js 启用）
- props：与现有卡片组件一致（card, homeTeam, awayTeam, optionImages），由 matchEventCard.vue 通过 `v-bind="$attrs"` 动态传入。

### 8.2 基础结构
- 外层 el-card（shadow="hover"），header 显示 card.title + level 标签 + fire 图标。
- body 内条件渲染 card.content（v-if）。
- 后续可按需扩展 option_data 投票/表情等内容。
