# newMySearch 改造清单

## 基础

**导入**
- [ ] `getTimeToText, processInKeys, headerCellStyle, tableOrderbyCond` from `@/utils/tool.js`
- [ ] 字典常量 from `@/utils/dict.js`
- [ ] `getH` from `@/mixins/getH`；混入 `getH`
- [ ] `newMySearch`、`Pagination` 组件

**data**
- [ ] 声明工具函数和字典常量
- [ ] `refName` 已声明，并在 `created` 中赋值
- [ ] `listQuery.orderby_cond: []`
- [ ] `outParameter: {}`

**生命周期**
- [ ] `created` 已按模式设置 `refName/outParameter`
- [ ] `mounted` 已调用 `setupResizeObserver(this.refName)`

**模板**
- [ ] `<div :ref="refName">` 包裹 `newMySearch`
- [ ] 表格设置 `:height="heightTableMixins(refName, isDrawer ? 240 : 200)"` 或等价偏移
- [ ] 表格设置 `:header-cell-style="e => headerCellStyle(listQuery.orderby_cond, e)"`
- [ ] 表格设置 `@sort-change="sortChange"`

**方法**
- [ ] `getList(obj, callback)` 已处理 `myDataSearch`
- [ ] `getList(obj, callback)` 已保留 `orderby_cond`
- [ ] `getList(obj, callback)` 已在请求前调用 `processInKeys`
- [ ] `getList(obj, callback)` 已在数据更新后调用 `doLayout`
- [ ] `getList(obj, callback)` 已在 `finally` 中释放 loading 并处理 `callback`
- [ ] `sortChange(options)` 已通过 `tableOrderbyCond` 更新排序并重新拉取列表

## 高级场景

**isDrawer 模式**
- [ ] props 包含 `isDrawer`、`uid`
- [ ] `created` 中使用 drawer 专属 `refName`
- [ ] 需要时透传 drawer 上下文到 `outParameter`
- [ ] 仅 drawer 不支持的列已按条件隐藏

**isSrearchComp 模式**
- [ ] props 包含 `isSrearchComp`、`sportId`、`gameId`
- [ ] `created` 中包含默认分支，避免 `refName` 为空
- [ ] 已实现 `setID(row)` 并 `emit success/successObj`

**特殊逻辑**
- [ ] 复合字段拆分（如 `sport_id -> sport_id + game_id`）
- [ ] 状态或时间条件已按接口要求转换
- [ ] 不支持字段已从 `search_cond` 过滤

**渲染**
- [ ] 时间渲染统一使用 `getTimeToText`
- [ ] 状态标签渲染前已检查字典项存在
- [ ] 搜索项枚举统一使用 `Object.values(字典)`

## 常见遗漏

1. `data()` 未声明工具函数或字典，导致模板访问异常。
2. 未初始化 `orderby_cond`，导致排序状态无法保留。
3. `mounted()` 未调用 `setupResizeObserver`，导致高度计算不稳定。
4. 表格 `ref` 与 `doLayout()` 使用的名字不一致。
5. 处理搜索条件前未检查对象是否存在。
6. 保留排序条件时未复制数组。
7. 未处理可选 `callback`。
8. `isSrearchComp` 模式缺少默认分支，导致 `refName` 为空。
