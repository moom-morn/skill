---
name: newsearch-component-refactor
description: Guide Vue component refactoring to use newMySearch component with proper table sorting, dynamic height, and time formatting. Use when refactoring list views, adapting search components, fixing table sorting issues, or implementing newMySearch integration.
compatibility: Vue 2.x + Node 12. Requires newMySearch component, Pagination component, getH mixin, and tool utilities (getTimeToText, processInKeys, headerCellStyle, tableOrderbyCond).
metadata:
  version: "1.5"
---

# newMySearch 组件改造指南

环境约束：Vue 2.x + Node 12，禁止 `?.`、`??`、链式 `.map().filter()`。

默认策略（强约束）：
- 未被明确指定为 SLS 场景时，统一走“标准场景”改造流程（第 0~8 节）
- 仅当用户明确说“这是 SLS 场景”或接口明确为 `sls_logs_list`/SLS Query 时，才启用第 9 节可选模板
- 禁止在未确认 SLS 的页面提前套用 SLS 多条件拼接逻辑

完整代码见 [reference.md](reference.md) · 验收清单见 [checklist.md](checklist.md)

---

## 改造步骤

### 快速落地顺序（建议按此执行）
1. 先确认 `source` 字典是否已注册（未注册先获用户确认再加）
2. 再补齐导入 + `data` 基线字段（`refName/listQuery/outParameter`）
3. 然后改模板（`ref`、`heightTableMixins`、排序头样式、`sort-change`）
4. 最后改 `getList/sortChange/pgetList`，并做一次分页与排序联调

这样可以先保证“搜得到 + 渲得出”，再处理“查得准 + 排得对”。

### 0. 前置：确认 source 字典（改造第一步，常被遗漏）

newMySearch 的查询项配置 **不是后端下发**，而是前端静态字典：
- 入口：[`src/components/newMySearch/components/searchKey/index.js`](../../../src/components/newMySearch/components/searchKey/index.js)
- 按业务聚合子字典：`news / pay / predictor / post / user / expert / match / push / system / slslog / chatRoom`
- 每个 source 是 `compKey/xxx.js` 里对外暴露的一个对象键

**改造前必须确认：**
1. 目标 source 是否已在对应业务字典中注册 —— 否则搜索区为空白
2. 若未注册，需在对应 `compKey/{业务}.js` 中新增条目（字段规范见 [reference.md > 查询参数来源](reference.md#查询参数来源searchkey-字典)）
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

代码见 [reference.md > 模式配置](reference.md#created-三模式配置)

### 4. mounted
```javascript
if (this.$refs[this.refName]) this.setupResizeObserver(this.refName)
```

### 5. 模板（3 个必要属性）
`<div :ref="refName">` 包裹 newMySearch，el-table 必须设：
- `:height="heightTableMixins(refName, offset)"`
- `:header-cell-style="e => headerCellStyle(listQuery.orderby_cond, e)"`
- `@sort-change="sortChange"`

完整模板见 [reference.md > 完整组件示例](reference.md#完整组件示例)

### 6. getList 要点
1. `obj.myDataSearch` 存在时重置 page=1，否则用 `this.listQuery`
2. 保留排序：`[...this.listQuery.orderby_cond]`（深拷贝）
3. 调用前包裹 `processInKeys(data)`
4. 更新后 `this.$refs["table_ref"].doLayout()`
5. finally 里释放 loading 并执行 `callback(true)`

特殊字段处理见 [reference.md > 搜索条件特殊处理](reference.md#搜索条件特殊处理)

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
后缀生成规则与字典配置映射关系详见 [reference.md > 查询参数来源](reference.md#查询参数来源searchkey-字典)

---

## 9. SLS 日志列表（`sls_logs_list` + newMySearch）

**启用条件：** 列表数据来自 `sls_logs_list`，搜索区用 `newMySearch`。否则走第 0~8 节标准 REST 列表。

**权威参考（9.5 与线上一致，以此为准）：**
- `src/views/system/operate_logs.vue` 的 `pgetList` + `getList`

其他 SLS 页（如 `moderation_log_list.vue`）若有 `__in`、`FROM log`、列表 `map` 清洗等，在 9.5 拷贝后再按现网增量改，不得改写 9.5 主干结构。

### 9.1 与标准场景的差异（不要混用）

| 项 | 标准 REST 列表（第 2~8 节） | SLS 列表（本节） |
|----|---------------------------|------------------|
| 分页字段 | `listQuery.page` / `listQuery.limit` | `page` / `limit`（独立字段） |
| `listQuery` 含义 | 含 page、limit、orderby_cond | 仅缓存 `getList` 入参 `{...obj}`，供分页回调查询 |
| 请求体 | 业务 API + `processInKeys` | `{ logstore, query, from_time, to_time }` |
| 条件来源 | 多为顶层字段 | `obj.myDataSearch.search_cond` |
| 表格排序 | 常配 `sortChange` + `orderby_cond` | 排序写在 SLS SQL 的 `order by`，表格一般不加 `sortable` |
| 字典文件 | 各业务 `compKey/*.js` | SLS 页在 `compKey/slslog.js` 注册 `source` |

### 9.2 改造前检查

1. `source` 已在 `src/components/newMySearch/components/searchKey/compKey/slslog.js` 注册；SLS 多条件 source 必须包含 `text`、`where`，否则无法补充高级检索条件
2. 确认 `logstore`、查询字段列表、默认排序字段（见 9.7 对照表）
3. 新 `source` 需用户确认后再改公共字典

### 9.3 页面骨架（模板 + data）

```vue
<div :ref="refName" class="box_h" style="padding-bottom: 10px;">
  <newMySearch
    ref="newSearchArea"
    source="你的source"
    @saveSearchData="getList"
    :outParameter="outParameter"
  />
</div>

<el-table
  ref="tableRef"
  v-loading="listLoading"
  :data="list"
  border
  :height="heightTableMixins(refName, 220)"
>
  <!-- 列定义 -->
</el-table>

<Pagination
  v-show="total > 0"
  :total="total"
  :page.sync="page"
  :limit.sync="limit"
  @pagination="pgetList"
/>
```

```javascript
import { sls_logs_list } from '@/api/ops_tools'
import Pagination from '@/components/Pagination'
import getH from '@/mixins/getH'
import newMySearch from '@/components/newMySearch/index.vue'
import { getTimeToText } from '@/utils/tool.js'

export default {
  components: { Pagination, newMySearch },
  mixins: [getH],
  data() {
    return {
      getTimeToText,
      refName: '你的容器ref',
      listLoading: false,
      page: 1,
      limit: 15,
      list: [],
      total: 0,
      listQuery: {},
      outParameter: {}
    }
  },
  created() {
    this.refName = '你的容器ref'
  },
  mounted() {
    if (this.$refs[this.refName]) {
      this.setupResizeObserver(this.refName)
    }
  }
}
```

### 9.4 `search_cond` 固定键（与 `operate_logs.vue` 一致）

| 键 | 处理 |
|----|------|
| `created_at__range` | 写入 `query.from_time` / `query.to_time`（`queryall` 同步） |
| `text` | 必须作为搜索字段注册；赋给 `queryText`，拼到管道前 `fullText` 尾部 |
| `where` | 必须作为搜索字段注册；赋给 `whereText`，拼进管道后 SQL 的 `${whereText}` |
| 其他字段 | 非空时 `queryList.push(\`${key} : ${value}\`)` |

`fullText`：`queryList.join(" and ")`，再拼 `queryText`；若以 `and` 开头则 `replace(/^\s*and/, "")`；为空时列表/总数 SQL 用 `" * "`。

**不要**在 9.5 模板里擅自加 `__in` 分支；`moderation_log_list` 等页面的 `__in` 见 9.7。

SLS 聚合报表即使不分页、不做总数查询，也必须保留 `text`、`where` 分流：
- `text` 追加到 `fullText`，与普通 `key : value` 条件一起位于 `|` 前。
- `where` 追加到 `select ...` 后、`group by/order by` 前，用于 SQL 级过滤。
- 对应 `searchTopKey` 也要展示 `text`、`where`，便于运营补充高级条件。

### 9.5 唯一 `getList` 实现（与 `operate_logs.vue` 一致，整段拷贝）

```javascript
pgetList() {
    this.getList(this.listQuery, null, null, 1)
},
async getList(obj, a, i, isPageReset) {
    this.listLoading = true
    if (isPageReset != 1) {
        this.page = 1
    }

    let query = {
        logstore: "admin_log",
        query: ""
    }
    let queryall = {
        logstore: "admin_log",
        query: ""
    }

    let queryList = []
    let queryText = ""
    let whereText = ""
    if (obj.myDataSearch && obj.myDataSearch["search_cond"]) {
        Object.keys(obj.myDataSearch["search_cond"]).forEach(key => {
            if (key == "created_at__range") {
                if (obj.myDataSearch["search_cond"][key] && obj.myDataSearch["search_cond"][key].length) {
                    query.from_time = obj.myDataSearch["search_cond"][key][0]
                    query.to_time = obj.myDataSearch["search_cond"][key][1]
                    queryall.from_time = obj.myDataSearch["search_cond"][key][0]
                    queryall.to_time = obj.myDataSearch["search_cond"][key][1]
                }
            } else if (key == "text") {
                queryText = obj.myDataSearch["search_cond"][key]
            } else if (key == "where") {
                whereText = obj.myDataSearch["search_cond"][key]
            } else {
                let value = obj.myDataSearch["search_cond"][key]
                if (value !== null && value !== undefined && value !== "") {
                    queryList.push(`${key} : ${value}`)
                }
            }
        })
    }

    let fullText = queryList.length ? queryList.join(" and ") : ""
    if (queryText) {
        fullText += ` ${queryText}`
    }
    if (fullText && fullText.trim().startsWith("and")) {
        fullText = fullText.replace(/^\s*and/, "")
    }
    query["query"] = `${fullText ? fullText : " * "} | SELECT ip, op,params,path,time,user_id,user_real_name ${whereText}  order by time desc limit ${(this.page - 1) * this.limit},${
        this.limit
    }`

    queryall["query"] = `${fullText ? fullText : " * "} | select count(1) as total  ${whereText}`

    let [listRes, totalRes] = await Promise.all([sls_logs_list(query), sls_logs_list(queryall)])
    if (listRes && listRes.code == 0) {
        this.list = listRes.data || []
    } else {
        this.list = []
    }
    if (totalRes && totalRes.code == 0 && totalRes.data && totalRes.data.length) {
        this.total = totalRes.data[0].total - 0
    } else {
        this.total = 0
    }
    this.listQuery = {...obj}
    this.$nextTick(() => {
        if (this.$refs.operateLogTable) {
            this.$refs.operateLogTable.doLayout()
        }
    })
    this.listLoading = false
},
```

### 9.6 拷贝 9.5 后只改这 4 处（对应 `operate_logs.vue`）

| # | 文件位置 | `operate_logs` 现值 | 新页替换为 |
|---|----------|---------------------|------------|
| 1 | `query` / `queryall` 的 `logstore` | `"admin_log"` | 你的 logstore |
| 2 | `query["query"]` 中 `\| SELECT ... order by` 段 | `ip, op,params,path,time,user_id,user_real_name` + `order by time desc` | 你的字段与排序 |
| 3 | `queryall["query"]` | `` \| select count(1) as total  ${whereText} `` | 按现网 SQL 改（若需 `FROM log` 等同理替换整句） |
| 4 | `$refs.xxx.doLayout()` | `operateLogTable` | 你的 `el-table` ref |

### 9.7 非模板增量（勿写进 9.5）

| 页面 | 在 9.5 基础上的增量 |
|------|---------------------|
| `moderation_log_list.vue` | `forEach` 增加 `moderate_type__in` 分支；列表 SQL 含 `FROM log`；`queryall` 为 `` count(*) total FROM log ``；列表赋值后 `.map()` 清洗 |
| `userTrack.vue` | 列表 SQL 含 `concat(...) ... FROM log`；表头排序改 `order by` 时需改第 2 处 SQL |

### 9.8 验收清单

- [ ] `@saveSearchData="getList"`，`@pagination="pgetList"`
- [ ] 搜索触发 `isPageReset != 1` 时 `page` 归 1；分页触发传 `1` 保留页码
- [ ] `created_at__range` 同时写入列表、总数请求
- [ ] `fullText` 为空时为 `' * '`
- [ ] 列表与总数请求的 `logstore`、`from_time`、`to_time` 一致
- [ ] `source` 已在 `slslog.js` 注册
- [ ] 未误用 `listQuery.page`、未对 SLS 请求套 `processInKeys`（除非页面已有特殊需求且用户确认）

### 9.9 禁止项

- 禁止拆成多套 SLS 模板或 A/B 分支
- 禁止把某一页的 `map` 清洗抽成全局工具
- 禁止未确认 SLS 时套用本节

---

## 10. 常见误区（优化补充）
- 只改 `getList` 未改 `pgetList`，导致分页时页码被重置
- SLS 页误用 `listQuery.page`，与 `Pagination :page.sync="page"` 不一致
- 只改表格排序事件，未同步 `headerCellStyle`，导致排序高亮异常（SLS 页通常不需要）
- 忘记初始化 `orderby_cond: []`，导致首屏排序状态不稳定（仅标准 REST 列表）
- `search_cond` 未判空直接读写，导致空查询时报错
- SLS 场景把页面私有数据清洗抽成全局逻辑，影响其他列表页
