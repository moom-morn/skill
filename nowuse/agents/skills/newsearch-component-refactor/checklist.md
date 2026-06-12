# newMySearch 改造清单

## 前置（最优先）
- [ ] 确认目标 source 已在 `src/components/newMySearch/components/searchKey/compKey/{业务}.js` 中注册
- [ ] 若未注册，已在对应业务字典中新增条目（label/key/compType/opts/precise/defaultValue/keyJoinType 按需配置）
- [ ] 若业务文件未在 `searchKey/index.js` 中 import & spread，已补上
- [ ] 新增字典变动已获用户确认（涉及公共组件）

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
- [ ] `newMySearch` 的 `source="xxx"` 值已在对应模块的两个文件中注册（文件名与组件所属模块一致，如 match.js / predictor.js / active.js 等）：
  - `src/components/newMySearch/components/searchKey/compKey/{module}.js`（搜索字段配置）
  - `src/components/newMySearch/components/searchTopKey/topKeyItem/{module}.js`（顶部默认展示字段）

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
1. source 未在 searchKey 字典中注册，导致搜索区空白
2. data 未声明工具函数/字典
3. 未初始化 orderby_cond
4. mounted 未调 setupResizeObserver
5. 表格 ref 与 doLayout 不一致
6. 搜索条件处理前未检查对象是否存在
7. 保留排序条件未深拷贝
8. 未处理 callback 参数（导致 popover 不关、历史不存）
9. isSrearchComp 模式缺少 else 分支导致 refName 为空

## SLS 可选项（仅 sls_logs_list 场景）

**启用前提**
- [ ] 当前页面接口确认为 `sls_logs_list`（或等价 SLS Query/SQL）
- [ ] 已先完成本清单“基础”项，再叠加 SLS 差异

**查询拼装**
- [ ] `search_cond` 判空完整，不因缺失报错
- [ ] `created_at__range` 有值时写入 `from_time/to_time`
- [ ] `text` 仅拼接到全文检索，不混入 `key : value`
- [ ] `where` 仅拼接到 `FROM log` 后，不参与全文拼接
- [ ] 任意 `xxx__in` 按 `or` 分组拼接
- [ ] 全文为空时回退为 `" * "`
- [ ] 分页偏移使用 `(page - 1) * limit`

**请求与状态**
- [ ] API 请求前调用 `processInKeys`
- [ ] 列表与总数查询筛选条件一致（若启用总数查询）
- [ ] 关闭总数查询时，页面 `total` 有明确兜底
- [ ] `listLoading` 在 finally 释放
- [ ] `listQuery` 回写最终请求快照，翻页条件不丢失

**配置同步**
- [ ] 新增 SLS 搜索字段已同步：
  - `src/components/newMySearch/components/searchKey/compKey/slslog.js`
  - `src/components/newMySearch/components/searchTopKey/topKeyItem/slslog.js`
- [ ] `created_at`、`text`、`where` 仍保留在常用入口