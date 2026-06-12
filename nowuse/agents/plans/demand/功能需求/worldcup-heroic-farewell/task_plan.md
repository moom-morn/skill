# Task Plan: WorldCup 英雄谱 & 告别榜

## 目标
在 `src/views/active/worldcup.vue` 中添加 el-tabs，包含"英雄谱"和"告别榜"两个 tab；
新建弹框编辑组件 `src/views/active/components/editWorldcupBoard.vue`。

## 需求解读
- worldcup.vue 当前文件内容为空（1行），需要从零写
- 两个 tab 分别调 heroic_spectrum / farewell_list 接口
- 每个 tab 显示现有数据（可能为空），有"编辑"按钮打开弹框
- 弹框字段：title(string)、description(string)、items(数组)
  - items 每条：logo、intelligence_id、player{id,name,logo}
- items 通过 searchResource 组件（searchFields="intelligence"）添加
- setObj 回调：检查 params.redirect_items 中是否有 type:10 的项(A)
  - 有：A.id/name/logo → player；params.id → intelligence_id；params.cover → logo
  - 无：只取 params.id → intelligence_id；params.cover → logo；player 为空

## 文件清单
| 文件 | 操作 |
|------|------|
| `src/views/active/worldcup.vue` | 新建（当前为空） |
| `src/views/active/components/editWorldcupBoard.vue` | 新建 |
| `src/api/active.js` | 追加 4 个接口（heroic_spectrum 等） |

## Tasks

### Task 1: 追加 API 接口（~2min）
- 文件：`src/api/active.js` 末尾
- 内容：heroic_spectrum / save_heroic_spectrum / farewell_list / save_farewell_list
- 验证：文件末尾存在 4 个 export const

### Task 2: 新建编辑弹框组件（~5min）
- 文件：`src/views/active/components/editWorldcupBoard.vue`
- 字段：title、description、items[]
- el-card 内有添加按钮 → 触发 searchResource（intelligence）
- setObj 逻辑：取 redirect_items 中 type:10 的项作为 player
- 验证：组件可被父组件 ref 调用 init(data, type) 方法

### Task 3: 新建 worldcup.vue 主页面（~3min）
- el-tabs 两个 tab：英雄谱、告别榜
- 分别在 created/tab 切换时调对应接口
- 每个 tab 显示数据概要 + "编辑"按钮（数据为空时也显示"添加"）
- 验证：两个 tab 可切换，编辑按钮可打开弹框

## 验证标准
- [ ] API 接口已追加
- [ ] 弹框组件可打开、表单可填写、items 可通过 searchResource 添加
- [ ] setObj 正确提取 player（type:10）和 intelligence_id / logo
- [ ] worldcup.vue 两个 tab 正常切换，各自读取数据
- [ ] 保存时调用正确接口（save_heroic_spectrum / save_farewell_list）
