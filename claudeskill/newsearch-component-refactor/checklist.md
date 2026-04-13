# newMySearch 改造清单

## 基础 (16 项)

**导入**
- [ ] `getTimeToText, processInKeys, headerCellStyle, tableOrderbyCond` from `@/utils/tool.js`
- [ ] 字典常量 from `@/utils/dict.js`
- [ ] `getH` from `@/mixins/getH`；混入 getH
- [ ] `newMySearch`、`Pagination` 组件

**data**
- [ ] 声明工具函数和字典常量
- [ ] `refName`（created 中按模式设置）
- [ ] `listQuery.orderby_cond: []`、`outParameter: {}`

**生命周期**
- [ ] `created`：按模式设 refName/outParameter
- [ ] `mounted`：`setupResizeObserver(this.refName)`

**模板**
- [ ] `<div :ref="refName">` 包裹 newMySearch
- [ ] 表格 `:height="heightTableMixins(refName, isDrawer ? 240 : 200)"`
- [ ] 表格 `:header-cell-style="e => headerCellStyle(listQuery.orderby_cond, e)"`
- [ ] 表格 `@sort-change="sortChange"`

**方法**
- [ ] `getList(obj, callback)`：处理 myDataSearch、保留 orderby_cond、processInKeys、try/catch/finally、doLayout
- [ ] `sortChange(options)`：tableOrderbyCond + getList

## 高级场景

**isDrawer 模式**
- [ ] props: `["isDrawer", "uid"]`
- [ ] created: `refName = "componentContainer_d"`
- [ ] `:class="!isDrawer ? 'app-container' : ''"`、`:displayHistory="!isDrawer"`
- [ ] 不需要的列加 `v-if="!isDrawer"`

**isSrearchComp 模式**
- [ ] props: `["isSrearchComp", "sportId", "gameId"]`
- [ ] created: `refName = "componentContainer_s"`（else 分支设默认 `"componentContainer"`）
- [ ] 实现 `setID(row)` → emit success/successObj

**特殊逻辑**
- [ ] 复合字段拆分（sport_id → sport_id + game_id）
- [ ] 状态转时间戳条件
- [ ] 双模式：过滤不支持字段

**渲染**
- [ ] 时间：全部替换 ParseTime → `getTimeToText`
- [ ] 状态：`<el-tag :type="xxxStatus[row.status].type" v-if="xxxStatus[row.status]">`
- [ ] 搜索配置：`opts: Object.values(字典)`

## 常见遗漏
1. data 未声明工具函数/字典
2. 未初始化 orderby_cond
3. mounted 未调 setupResizeObserver
4. 表格 ref 与 doLayout 不一致
5. 搜索条件处理前未检查对象是否存在
6. 保留排序条件未深拷贝
7. 未处理 callback 参数
8. isSrearchComp 模式缺少 else 分支导致 refName 为空
