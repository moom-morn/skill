# newMySearch 参考

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
| `getTimeToText(ts)` | 完整时间；`true` 表示仅日期；`"hms"` 表示仅时分秒；空值返回 `"无"` |
| `processInKeys(data)` | API 调用前处理特殊字段，所有接口请求都应包裹 |
| `tableOrderbyCond(cond, prop, order)` | 更新排序条件数组 |
| `headerCellStyle(orderby_cond, e)` | 已排序列表头高亮 |
| `heightTableMixins(refName, offset)` | 动态表格高度，`offset` 默认 `200` |

时间格式化示例：

```vue
{{ getTimeToText(row.time) }}
{{ getTimeToText(row.time, true) }}
{{ getTimeToText(row.time, "hms") }}
```

## 搜索条件特殊处理

```javascript
if (data.search_cond && data.search_cond.sport_id) {
    let s = data.search_cond.sport_id.split("_")
    data.search_cond.sport_id = s[0]
    data.search_cond.game_id = s[1]
}

let blacklist = ["channel", "uuid"]
if (data.search_cond && typeof data.search_cond === "object") {
    Object.keys(data.search_cond).forEach(k => {
        if (blacklist.includes(k)) delete data.search_cond[k]
    })
}
```

## 状态渲染

```javascript
import {withdrawStatusList} from "@/utils/dict.js"
```

```vue
<el-tag :type="withdrawStatusList[row.status].type" v-if="withdrawStatusList[row.status]">
    {{ withdrawStatusList[row.status].label }}
</el-tag>
```

搜索配置示例：`opts: Object.values(withdrawStatusList)`

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
created() {
    this.refName = "componentContainer"
}
```

```javascript
created() {
    this.refName = this.isDrawer ? "componentContainer_d" : "componentContainer"
    if (this.isDrawer && this.uid) this.outParameter["member_id"] = this.uid
}
```

```javascript
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

1. `refName` 在各模式下必须唯一，避免多实例冲突。
2. 搜索时必须复制保留 `orderby_cond`。
3. `Object.keys()` 前先检查对象是否存在。
4. 数据更新后调用 `doLayout()` 修复表格错位。
5. 禁止继续使用 `ParseTime` 过滤器，统一改为 `getTimeToText`。
