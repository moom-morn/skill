---
name: newsearch-component-refactor
description: Guide Vue component refactoring to use newMySearch component with proper table sorting, dynamic height, and time formatting. Use when refactoring list views, adapting search components, fixing table sorting issues, or implementing newMySearch integration.
compatibility: Vue 2.x + Node 12. Requires newMySearch component, Pagination component, getH mixin, and tool utilities (getTimeToText, processInKeys, headerCellStyle, tableOrderbyCond).
metadata:
  version: "1.0"
---

# newMySearch 组件改造指南

环境约束：Vue 2.x + Node 12，禁止 `?.`、`??`、链式 `.map().filter()`。

完整代码见 [reference.md](reference.md) · 验收清单见 [checklist.md](checklist.md)

---

## 改造步骤

### 0. 前置：确认 source 字典（改造第一步，常被遗漏）

newMySearch 的查询项配置 **不是后端下发**，而是前端静态字典：
- 入口：[`src/components/newMySearch/components/searchKey/index.js`](../../../src/components/newMySearch/components/searchKey/index.js)
- 按业务聚合子字典：`news / pay / predictor / post / user / expert / match / push / system / slslog / chatRoom`
- 每个 source 是 `compKey/xxx.js` 里对外暴露的一个对象键

**改造前必须确认：**
1. 目标 source 是否已在对应业务字典中注册 —— 否则搜索区为空白
2. 若未注册，需在对应 `compKey/{业务}.js` 中新增条目（字段规范见 [reference.md › 查询参数来源](reference.md#查询参数来源searchkey-字典)）
3. 该动作涉及公共组件字典，应获用户确认后再加

### 1. 导入（4 项）
- `Pagination`、`newMySearch` 组件
- `getH` mixin（mixins 数组加入）
- `getTimeToText, processInKeys, headerCellStyle, tableOrderbyCond` from `@/utils/tool.js`
- 字典常量 from `@/utils/dict.js`

### 2. data（5 个字段）
```
getTimeToText, headerCellStyle, tableOrderbyCond, xxxStatus  ← 工具函数/字典
refName: ""          ← created 中按模式设置
list/total/listLoading
listQuery: { page, limit, orderby_cond: [] }
outParameter: {}
```

### 3. created（三选一模式）

| 模式 | refName | 额外操作 |
|------|---------|---------|
| 标准 | `"componentContainer"` | 无 |
| isDrawer | drawer ? `"_d"` : 默认 | uid → outParameter |
| isSrearchComp | comp ? `"_s"` : 默认 | sportId → outParameter |

代码见 [reference.md › 模式配置](reference.md#created-三模式配置)

### 4. mounted
```javascript
if (this.$refs[this.refName]) this.setupResizeObserver(this.refName)
```

### 5. 模板（3 个必要属性）
`<div :ref="refName">` 包裹 newMySearch，el-table 必须设：
- `:height="heightTableMixins(refName, offset)"`
- `:header-cell-style="e => headerCellStyle(listQuery.orderby_cond, e)"`
- `@sort-change="sortChange"`

完整模板见 [reference.md › 完整组件示例](reference.md#完整组件示例)

### 6. getList 要点
1. `obj.myDataSearch` 存在时重置 page=1，否则用 `this.listQuery`
2. 保留排序：`[...this.listQuery.orderby_cond]`（深拷贝）
3. 调用前包裹 `processInKeys(data)`
4. 更新后 `this.$refs["table_ref"].doLayout()`
5. finally 里释放 loading 并执行 `callback(true)`

特殊字段处理见 [reference.md › 搜索条件特殊处理](reference.md#搜索条件特殊处理)

### 7. sortChange
重置 page=1 → `tableOrderbyCond(...)` 更新排序条件 → `this.getList()`

### 8. 查询参数结构（父组件接收）
`saveSearchData` 事件回传的 `obj.myDataSearch` 结构：
```
{
  search_cond: { [fullKey]: value, ... },   // 所有业务搜索字段默认都在这（含 __range/__in/__icontains/__startswith 后缀）
  search_field, search_keyword,             // keyJoinType:1 互斥顶层字段
  [otherKey]: otherValue                    // keyJoinType:2 等顶层 other
}
```
后缀生成规则与字典配置映射关系详见 [reference.md › 查询参数来源](reference.md#查询参数来源searchkey-字典)
