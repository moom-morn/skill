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
