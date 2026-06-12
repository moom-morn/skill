# 调研发现：intelligence.vue isPool 区域对齐 postList.vue 逻辑

## 现有状态对比

### intelligence.vue isPool 模板（line 70-74）
- 仅有 cascader 和 input
- 无清空按钮、无路径提示、无黑名单管理按钮

### postList.vue isPool 模板（line 83-101）
- 有清空按钮（newButton + svg-icon delete）
- 有 poolSearchResult 路径提示（「存在于」标签或「不在任何池子中」警告）
- 有 flex1 弹性占位
- 有自动/人工黑名单按钮

### intelligence.vue 现有相关方法
- `poolList` data（line 515）— 与 postList 结构一致：{ value, label, children: [{ value, label, items }] }
- `tablePoolList` data（line 516）
- `cascaderPoolValue` data（line 517）
- `editPoolBlack(add, row)`（line 905）— 已有黑名单管理能力
- `getPoolDataList()`（line 1231）— 已有级联选择后加载列表
- `formatPool()`（line 1273）— 已有本地分页
- `getPool()`（line 1111）— 已有拉取 poolList

### intelligence.vue 缺失
- `poolNameSearchRunning` data
- `poolSearchResult` data
- `trimPoolNameInput()` 方法
- `parsePostIdForPoolQuery()` 方法
- `findPoolPathsByPostId()` 方法
- `onPoolNameClear()` 方法
- 完整的 `onPoolNameSearch()` 方法（模板引用但未在 methods 中找到定义）
- `jumpToPool()` 方法
- `showPoolBlackList()` 方法

## 关键发现
1. `poolList` 数据结构完全兼容 — 都有 `items` 字段
2. intelligence.vue 已有 `editPoolBlack` 处理黑名单，`showPoolBlackList` 可以调它
3. `newButton` 和 `svg-icon` 已在 intelligence.vue 其他位置使用，可用
4. `class="box_h"` 是 flex 布局 class，用于水平排列，不加样式没问题
5. 当前 intelligence.vue 模板引用了 `onPoolNameSearch` 但 methods 中未找到定义，说明该方法是缺失的