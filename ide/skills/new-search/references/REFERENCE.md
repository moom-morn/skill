# New Search Reference

This file stores detailed templates and lower-frequency examples for the `new-search` skill.

## Base imports and structure

```javascript
import Pagination from "@/components/Pagination"
import newMySearch from "@/components/newMySearch/index"
import getH from "@/mixins/getH"
import {
    getTimeToText,
    processInKeys,
    headerCellStyle,
    tableOrderbyCond
} from "@/utils/tool.js"

export default {
    components: { Pagination, newMySearch },
    mixins: [getH],
    props: ["isDrawer", "uid", "isSrearchComp", "sportId", "gameId"],
    data() {
        return {
            getTimeToText,
            headerCellStyle,
            listLoading: false,
            list: [],
            total: 0,
            refName: "componentContainer",
            outParameter: {},
            listQuery: {
                page: 1,
                limit: 15,
                orderby_cond: []
            }
        }
    },
    created() {
        if (this.isDrawer) {
            this.refName = "componentContainer_d"
            if (this.uid) {
                this.outParameter.member_id = this.uid
            }
        }

        if (this.isSrearchComp) {
            this.refName = "componentContainer_s"
            if (this.sportId) {
                this.outParameter.sport_id = this.sportId + "_" + (this.gameId || 0)
            }
        }
    },
    mounted() {
        if (this.$refs[this.refName]) {
            this.setupResizeObserver(this.refName)
        }
    },
    methods: {
        async getList(obj, callback) {
            this.listLoading = true
            var data = {}

            if (obj && obj.myDataSearch) {
                data = Object.assign(
                    {
                        page: 1,
                        limit: this.listQuery.limit
                    },
                    obj.myDataSearch
                )

                if (this.listQuery.orderby_cond && this.listQuery.orderby_cond.length) {
                    data.orderby_cond = [].concat(this.listQuery.orderby_cond)
                }
            } else {
                data = Object.assign({}, this.listQuery)
            }

            try {
                var response = await apiFunction(processInKeys(data))
                if (response.code == 0) {
                    this.list = response.data || []
                    this.total = response.total || 0
                } else {
                    this.list = []
                    this.total = 0
                }

                this.listQuery = Object.assign({}, data)
                this.$nextTick(() => {
                    if (this.$refs.tableRef) {
                        this.$refs.tableRef.doLayout()
                    }
                })
            } catch (err) {
                this.list = []
                this.total = 0
            } finally {
                if (callback) {
                    callback(true)
                }
                this.listLoading = false
            }
        },
        sortChange(options) {
            this.listQuery.page = 1
            this.listQuery.orderby_cond = tableOrderbyCond(
                this.listQuery.orderby_cond,
                options.prop,
                options.order
            )
            this.getList()
        },
        setID(row) {
            this.$emit("success", row.id)
            this.$emit("successObj", row)
        }
    }
}
```

## Base template

```vue
<template>
    <div :class="!isDrawer ? 'app-container' : ''">
        <div :ref="refName" class="mb5">
            <newMySearch
                ref="newSearchArea"
                source="sourceKey"
                :isAdd="false"
                :displayHistory="!isDrawer && !isSrearchComp"
                :isCreatedSearch="true"
                :outParameter="outParameter"
                @saveSearchData="getList"
            />
        </div>

        <el-table
            ref="tableRef"
            :data="list"
            :height="heightTableMixins(refName, isDrawer ? 240 : 200)"
            :header-cell-style="function(e) { return headerCellStyle(listQuery.orderby_cond, e) }"
            @sort-change="sortChange"
        >
            <!-- 列定义 -->
        </el-table>

        <pagination
            v-show="total > 0"
            :total="total"
            :page="listQuery.page"
            :limit="listQuery.limit"
            @pagination="getList"
        />
    </div>
</template>
```

## Time rendering

```vue
{{ getTimeToText(row.time) }}
{{ getTimeToText(row.time, true) }}
{{ getTimeToText(row.time, "hms") }}
```

## Status dictionary example

```javascript
import {withdrawStatusList} from "@/utils/dict.js"

data() {
    return {
        withdrawStatusList
    }
}
```

```vue
<el-tag v-if="withdrawStatusList[row.status]" :type="withdrawStatusList[row.status].type">
    {{ withdrawStatusList[row.status].label }}
</el-tag>
```

## Search config example

```javascript
import {withdrawStatusList} from "@/utils/dict.js"

export default {
    sourceKey: {
        id: { label: "ID", key: "id", compType: "input", rules: "int" },
        name: { label: "名称", key: "name", compType: "input" },
        status: {
            label: "状态",
            key: "status",
            compType: "select",
            opts: Object.values(withdrawStatusList)
        }
    }
}
```

## Search-selector example

```javascript
props: ["isSrearchComp", "sportId", "gameId"]
```

```vue
<newMySearch
    :displayHistory="!isSrearchComp"
    :isCreatedSearch="true"
/>

<el-table-column label="ID">
    <template slot-scope="{row}">
        <div v-if="isSrearchComp" class="blue" @click="setID(row)">{{ row.id }}</div>
        <div v-else>{{ row.id }}</div>
    </template>
</el-table-column>
```

## Search param transform examples

```javascript
if (data.search_cond && data.search_cond.sport_id) {
    var sportList = data.search_cond.sport_id.split("_")
    data.search_cond.sport_id = sportList[0]
    data.search_cond.game_id = sportList[1]
}
```

```javascript
if (data.search_cond && typeof data.search_cond === "object") {
    Object.keys(data.search_cond).forEach(item => {
        if (["channel", "android_sn", "android_id"].includes(item)) {
            delete data.search_cond[item]
        }
    })
}
```
