# newMySearch 参考

## 查询参数来源：searchKey 字典

### 字典位置与链路

| 环节 | 位置 |
|------|------|
| 组件读取 | [`src/components/newMySearch/index.vue`](../../../src/components/newMySearch/index.vue) `created()` 中：`this.dictConfig = searchKey[this.source] \|\| {}` |
| 字典聚合入口 | [`src/components/newMySearch/components/searchKey/index.js`](../../../src/components/newMySearch/components/searchKey/index.js) |
| 业务子字典 | `src/components/newMySearch/components/searchKey/compKey/{news,pay,predictor,post,user,expert,match,push,system,slslog,chatRoom}.js` |

**关键事实**：`dictConfig` **完全由前端静态字典驱动**，与后端接口无关。source 未在字典中注册 → 搜索区为空白。

### source 字典条目字段规范

```js
// 示例：predictor.js 中的 predictor_trade_report
predictor_trade_report: {
    // 日期选择
    created_at: {
        label: "购买时间",
        key: "created_at",
        compType: "date",
        defaultValue: setClickShortcutsTime(9)   // 默认近 9 天
    },
    // 按钮互斥（keyJoinType:2 顶层字段）
    compare: {
        label: "日周月",
        key: "compare",
        compType: "button",
        isBtnRequired: true,
        defaultValue: "day",
        keyJoinType: 2,
        opts: [{label: "天", value: "day"}, {label: "周", value: "week"}, {label: "月", value: "month"}]
    },
    // 多选下拉
    play_type: {
        key: "play_type",
        label: "玩法",
        compType: "select",
        more: true,
        opts: PlayTypeToTextFn(false)
    },
    // 运动类型按钮
    sport_id: {
        key: "sport_id",
        label: "运动",
        compType: "button",
        opts: BTNFK
    }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `label` | ✓ | 界面展示文案 |
| `key` | ✓ | 字段标识，与业务字段对齐 |
| `compType` | ✓ | `date` / `select` / `input` / `range` / `button` |
| `opts` | select/button | 下拉/按钮选项；字典统一用 `Object.values(xxxStatus)` |
| `more` | × | select 是否可多选（多选走 `__in`）|
| `precise` | × | input/select 是否支持模糊/精确切换（影响后缀 `__icontains`/`__in`）|
| `defaultValue` | × | 默认值，日期常用 `setClickShortcutsTime(9)` |
| `keyJoinType` | × | `1`=走顶层 `search_field/search_keyword` 互斥；`2`=直接挂顶层 other |
| `parameterKey` | × | `true`=强制用原 key 不加后缀 |
| `parameterValue` | × | `true`=特殊场景 value 转换（如用户列表 isVip→时间戳）|
| `notStored` | × | `true`=不存本地历史 |
| `rules` / `isBtnRequired` / `maxCount` / `minCount` | × | 校验、按钮必填、范围上下限 |

完整字段注释见 [`searchKey/index.js`](../../../src/components/newMySearch/components/searchKey/index.js) 顶部 JSDoc。

### myDataSearch 键名生成规则

`saveData()` 遍历 `popoverData`，经 `generateKeyAndValue()` 产出最终 `fullKey`：

| 字典 compType | 输入值 | 生成 fullKey | 值处理 |
|---------------|--------|-------------|--------|
| `range` | 数组 | `{key}__range` | 原样数组 |
| `date` | 数组（起止） | `{key}__range` | **毫秒转秒** `parseInt(v/1000)` |
| `date` | 快捷 pick | `{key}__range` | 通过 `setClickShortcutsTime` 生成秒级数组 |
| `date` | 单值 | 原 `key`（不加后缀）| **毫秒转秒** |
| `precise:1` + value | 字符串 | `{key}__icontains`，命中 `startswithList[source]` 时 `{key}__startswith` | 原样 |
| `precise:2` + `input` | 字符串 | 原 `key` | 原样 |
| `precise:2` + 非 input | 值 | `{key}__in` | 包成 `[value]` |
| 默认（数组多值） | 数组 | `{key}__in` | 原样数组 |
| 默认（单值） | 单值 | 原 `key` | 原样 |
| `parameterKey:true` | 任意 | 强制原 `key` | 原样 |
| `keyJoinType:1` | 任意 | 顶层 `search_field`+`search_keyword` | 按用户输入互斥 |
| `keyJoinType:2` | 任意 | 顶层 `{key}` | 不进 `search_cond` |

### myDataSearch 最终结构

```js
{
    search_cond: {
        created_at__range: [1715000000, 1715600000],   // 秒级
        play_type__in: [1, 2, 3],
        sport_id: 1,
        nickname__icontains: "张"
    },
    // keyJoinType:1 互斥搜索（UID/昵称二选一）
    search_field: "uid",
    search_keyword: "12345",
    // keyJoinType:2 顶层字段
    compare: "day"
}
```

### saveSearchData 事件签名

```js
// newMySearch/index.vue: saveData()
this.$emit(
    "saveSearchData",
    {myDataSearch},     // 参数 1：查询参数
    successCb,          // 参数 2：成功回调 → 存历史 + 关 popover
    noHistoryCb         // 参数 3：仅关 popover（不存历史）
)
```

父组件 `getList(obj, callback)` 中的 `callback` 即 `successCb`，**finally 必须调 `callback(true)`**，否则 popover 不关、历史不存。

### 新增 source 字典的标准步骤

1. 在 `src/components/newMySearch/components/searchKey/compKey/{业务}.js` 中新增条目：
   ```js
   times_card_purchase_list: {
       created_at: {label: "购买时间", key: "created_at", compType: "date", defaultValue: setClickShortcutsTime(9)}
       // ... 其他字段
   }
   ```
2. 若对应业务文件尚未在 [`searchKey/index.js`](../../../src/components/newMySearch/components/searchKey/index.js) 中 import & spread，补上
3. 在页面组件中 `source="times_card_purchase_list"` 即生效
4. 字段 key 命名应与后端接口期望的业务字段保持一致（后缀由 compType 自动生成，无需手工拼）

## 完整组件示例

```vue
<template>
    <div class="app-container">
        <div :ref="refName">
            <newMySearch ref="newSearchArea" source="memberList" :isAdd="false"
                @saveSearchData="getList" :outParameter="outParameter" />
        </div>
        <el-table :data="list" v-loading="listLoading"
            :height="heightTableMixins(refName, 200)"
            :header-cell-style="e => headerCellStyle(listQuery.orderby_cond, e)"
            @sort-change="sortChange" ref="member_table">
            <el-table-column prop="id" label="ID" sortable="custom" />
            <el-table-column prop="created_at" label="创建时间" sortable="custom">
                <template slot-scope="{row}">{{ getTimeToText(row.created_at) }}</template>
            </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page="listQuery.page"
            :limit="listQuery.limit" @pagination="getList" />
    </div>
</template>

<script>
import Pagination from "@/components/Pagination"
import newMySearch from "@/components/newMySearch/index"
import getH from "@/mixins/getH"
import {getTimeToText, processInKeys, headerCellStyle, tableOrderbyCond} from "@/utils/tool.js"
import {member_list} from "@/api/member"

export default {
    components: {Pagination, newMySearch},
    mixins: [getH],
    data() {
        return {
            getTimeToText, headerCellStyle, tableOrderbyCond,
            refName: "memberListContainer",
            list: [], total: 0, listLoading: true,
            listQuery: {page: 1, limit: 15, orderby_cond: []},
            outParameter: {},
        }
    },
    mounted() {
        if (this.$refs[this.refName]) this.setupResizeObserver(this.refName)
    },
    methods: {
        async getList(obj, callback) {
            this.listLoading = true
            let data = {}
            if (obj && obj.myDataSearch) {
                data = {limit: this.listQuery.limit, page: 1, ...obj.myDataSearch}
                if (this.listQuery.orderby_cond && this.listQuery.orderby_cond.length) {
                    data["orderby_cond"] = [...this.listQuery.orderby_cond]
                }
            } else {
                data = {...this.listQuery}
            }
            try {
                let res = await member_list(processInKeys(data))
                this.list = res.code == 0 ? res.data : []
                this.total = res.code == 0 ? res.total : 0
                this.listQuery = {...data}
                this.$nextTick(() => {
                    this.$refs["member_table"] && this.$refs["member_table"].doLayout()
                })
            } catch (err) {
                this.list = []; this.total = 0
            } finally {
                if (callback) callback(true)
                this.listLoading = false
            }
        },
        sortChange(options) {
            this.listQuery.page = 1
            this.listQuery.orderby_cond = tableOrderbyCond(
                this.listQuery.orderby_cond, options.prop, options.order)
            this.getList()
        },
    },
}
</script>
```

## 工具函数速查

| 函数 | 用法 |
|------|------|
| `getTimeToText(ts)` | 完整时间；`true`→仅日期；`"hms"`→仅时分秒；空值返回"无" |
| `processInKeys(data)` | API 调用前处理特殊字段，所有接口必须包裹 |
| `tableOrderbyCond(cond, prop, order)` | 更新排序条件数组 |
| `headerCellStyle(orderby_cond, e)` | 已排序列表头高亮 |
| `heightTableMixins(refName, offset)` | 动态表格高度，offset 默认 200 |

时间格式化用法：
```vue
{{ getTimeToText(row.time) }}         <!-- YYYY-MM-DD HH:mm:ss -->
{{ getTimeToText(row.time, true) }}   <!-- YYYY-MM-DD -->
{{ getTimeToText(row.time, "hms") }}  <!-- HH:mm:ss -->
```

## 搜索条件特殊处理

```javascript
// 复合字段拆分（如 sport_id 包含 game_id）
if (data.search_cond && data.search_cond.sport_id) {
    let s = data.search_cond.sport_id.split("_")
    data.search_cond.sport_id = s[0]
    data.search_cond.game_id = s[1]
}

// 过滤不支持字段
let blacklist = ["channel", "uuid"]
if (data.search_cond && typeof data.search_cond === 'object') {
    Object.keys(data.search_cond).forEach(k => {
        if (blacklist.includes(k)) delete data.search_cond[k]
    })
}
```

## 状态渲染

```javascript
import {withdrawStatusList} from "@/utils/dict.js"
// data() 中声明: withdrawStatusList
```

```vue
<el-tag :type="withdrawStatusList[row.status].type" v-if="withdrawStatusList[row.status]">
    {{ withdrawStatusList[row.status].label }}
</el-tag>
```

搜索配置：`opts: Object.values(withdrawStatusList)`

## isSrearchComp 选择器模式

```javascript
props: ["isSrearchComp", "sportId", "gameId"],
methods: {
    setID(row) {
        this.$emit("success", row.id)
        this.$emit("successObj", row)
    }
}
```

```vue
<el-table-column label="ID">
    <template slot-scope="{row}">
        <div v-if="isSrearchComp" @click="setID(row)" class="blue">{{ row.id }}</div>
        <div v-else>{{ row.id }}</div>
    </template>
</el-table-column>
```

## created 三模式配置

```javascript
// 标准模式
created() {
    this.refName = "componentContainer"
}

// isDrawer 模式
created() {
    this.refName = this.isDrawer ? "componentContainer_d" : "componentContainer"
    if (this.isDrawer && this.uid) this.outParameter["member_id"] = this.uid
}

// isSrearchComp 模式
created() {
    if (this.isSrearchComp) {
        this.refName = "componentContainer_s"
        if (this.sportId) this.outParameter["sport_id"] = `${this.sportId}_${this.gameId || 0}`
    } else {
        this.refName = "componentContainer"
    }
}
```

## 注意事项

1. refName 各模式必须唯一，避免多实例冲突
2. 搜索时必须深拷贝保留 orderby_cond（`[...this.listQuery.orderby_cond]`）
3. Object.keys() 前检查对象是否存在
4. 数据更新后调用 doLayout() 修复表格错位
5. 禁止 ParseTime 过滤器，统一用 getTimeToText
