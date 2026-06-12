# 黑名单「圈子」本地筛选

## 基本信息
- **归档日期**: 2026-05-09
- **来源文件**: `/Users/chenwen/.cursor/plans/黑名单圈子本地筛选_16e21d92.plan.md`
- **项目类型**: 功能需求
- **目标文件**: `src/views/forum/postList.vue`
- **状态**: 待实现（todos 均为 pending）

---

## 需求概述

在 `isPoolBlack` 模式下，黑名单接口 + postListV2 合并得到 `tablePoolList` 后，从当前列表行收集出现过的 `catalog_id`，生成下拉选项；用选中项对 `tablePoolList` 做本地过滤，再沿用现有 `formatPool`（排序+分页）。

---

## 数据与展示约定

- **圈子** = 帖子行上的 `catalog_id`，文案用 `catalogsObj[row.catalog_id]` 的 `label`、`typeName`
- **数据源**：仅使用当前黑名单结果 `tablePoolList`，不请求全站圈子列表

---

## 实现要点（单文件 postList.vue）

### 1. data 新增
```javascript
poolBlackCatalogFilter: null,   // null/'' 表示全部
poolBlackCatalogOptions: []     // { value: String, label: String }[]
```

### 2. rebuildPoolBlackCatalogOptions()
- 遍历 `tablePoolList`，用 Set 收集出现过的 `catalog_id`
- 空/null/undefined 的 catalog_id 统一为 `value: '__none__'`，`label: '无圈子'`
- label 用 `catalogsObj[id]` 拼「名称+类型」；无配置时显示「ID: xxx」
- 选项按 label 排序

### 3. getPoolBlackFilteredList()
- 未选圈子 → 返回完整 `tablePoolList`
- 已选 → 过滤 `row.catalog_id`，`__none__` 匹配空 catalog_id
- 仅 `isPoolBlack` 时使用

### 4. 调用时机
- `getGroupBlackList` 成功后：`rebuildPoolBlackCatalogOptions()` + 重置 filter + page=1 + `getPagination()`
- 列表清空分支：清空 `poolBlackCatalogOptions` 和筛选值

### 5. getPagination 中 isPoolBlack 分支
```javascript
const filtered = this.getPoolBlackFilteredList()
this.total = filtered.length
this.list = JSON.parse(JSON.stringify(this.formatPool(filtered)))
```

### 6. UI（工具条，约 104-108 行）
```html
<el-select
  v-model="poolBlackCatalogFilter"
  placeholder="按圈子筛选"
  filterable
  clearable
  size="mini"
  @change="listQuery.page = 1; getPagination()"
>
  <el-option
    v-for="opt in poolBlackCatalogOptions"
    :key="opt.value"
    :label="opt.label"
    :value="opt.value"
  />
</el-select>
```

---

## 待实现 Todos

| id | 内容 | 状态 |
|----|------|------|
| data-methods | 新增 poolBlackCatalogFilter / poolBlackCatalogOptions；实现 rebuildPoolBlackCatalogOptions、getPoolBlackFilteredList | ⬜ pending |
| wire-getGroupBlackList | getGroupBlackList 成功/清空时重建选项并重置筛选；保证 list 与 total 更新 | ⬜ pending |
| wire-getPagination | isPoolBlack 分支改为 total/list 基于 filtered + formatPool(filtered) | ⬜ pending |
| toolbar-ui | isPoolBlack 工具条增加 el-select（filterable + clearable）与 el-option | ⬜ pending |

---

## 行为说明

- 换一批黑名单数据后选项集会变；刷新后筛选重置，避免指向已不存在的圈子
- 若多条帖子 `blackTime`、主排序字段相同，仍保留现有 `sortPoolListFull` 的 id 次序键逻辑，与本次筛选正交

---

## 数据流

```
getGroupBlackList
  └── 黑名单ID+时间 → postListV2详情 → tablePoolList
        ├── rebuildPoolBlackCatalogOptions → poolBlackCatalogOptions（下拉选项）
        └── getPoolBlackFilteredList（poolBlackCatalogFilter 过滤）
              └── formatPool（排序+分页）→ this.list
```
