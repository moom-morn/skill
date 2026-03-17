# newMySearch 改造参考文档

## 完整组件示例

```vue
<template>
    <div class="app-container">
        <div :ref="refName">
            <newMySearch
                ref="newSearchArea"
                source="memberList"
                :isAdd="false"
                @saveSearchData="getList"
                :outParameter="outParameter"
            />
        </div>

        <el-table
            :data="list"
            v-loading="listLoading"
            :height="heightTableMixins(refName, 200)"
            :header-cell-style="e => headerCellStyle(listQuery.orderby_cond, e)"
            @sort-change="sortChange"
            ref="member_table"
        >
            <el-table-column prop="id" label="ID" sortable="custom" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="created_at" label="创建时间" sortable="custom">
                <template slot-scope="{row}">
                    {{ getTimeToText(row.created_at) }}
                </template>
            </el-table-column>
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

<script>
import Pagination from "@/components/Pagination"
import newMySearch from "@/components/newMySearch/index"
import getH from "@/mixins/getH"
import {getTimeToText, processInKeys, headerCellStyle, tableOrderbyCond} from "@/utils/tool.js"
import {member_list} from "@/api/member"

export default {
    name: "member_list",
    components: {Pagination, newMySearch},
    mixins: [getH],

    data() {
        return {
            getTimeToText,
            headerCellStyle,
            tableOrderbyCond,
            refName: "memberListContainer",
            list: [],
            total: 0,
            listLoading: true,
            listQuery: {
                page: 1,
                limit: 15,
                orderby_cond: [],
            },
            outParameter: {},
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
            let data = {}

            if (obj && obj.myDataSearch) {
                data = {
                    limit: this.listQuery.limit,
                    page: 1,
                    ...obj.myDataSearch,
                }
                if (this.listQuery.orderby_cond?.length) {
                    data["orderby_cond"] = [...this.listQuery.orderby_cond]
                }
            } else {
                data = {...this.listQuery}
            }

            try {
                let response = await member_list(processInKeys(data))

                if (response.code == 0) {
                    this.list = response.data
                    this.total = response.total
                } else {
                    this.list = []
                    this.total = 0
                }

                this.listQuery = {...data}
                this.$nextTick(() => {
                    this.$refs["member_table"] && this.$refs["member_table"].doLayout()
                })
            } catch (err) {
                this.list = []
                this.total = 0
            } finally {
                if (callback) callback(true)
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
    },
}
</script>
```

## 搜索组件模式完整示例

```vue
<template>
    <div :ref="refName">
        <newMySearch
            ref="newSearchArea"
            source="topicList"
            :displayHistory="!isSrearchComp"
            :isCreatedSearch="isSrearchComp"
            :isAdd="isSrearchComp ? false : hasPwer('topic_add')"
            @saveSearchData="getList"
            :outParameter="outParameter"
        />

        <el-table :data="list" :height="heightTableMixins(refName, 200)">
            <el-table-column label="ID">
                <template slot-scope="{row}">
                    <div v-if="isSrearchComp" @click="setID(row)" class="blue">
                        {{ row.id }}
                    </div>
                    <div v-else>{{ row.id }}</div>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
export default {
    props: ["isSrearchComp", "sportId", "gameId"],
    mixins: [getH],

    data() {
        return {
            refName: "componentContainer",
            outParameter: {}
        }
    },

    created() {
        if (this.isSrearchComp) {
            this.refName = "componentContainer_s"
            if (this.sportId) {
                this.outParameter["sport_id"] = `${this.sportId}_${this.gameId || 0}`
            }
        }
    },

    mounted() {
        if (this.$refs[this.refName]) {
            this.setupResizeObserver(this.refName)
        }
    },

    methods: {
        setID(row) {
            this.$emit("success", row.id)
            this.$emit("successObj", row)
        },

        async getList(obj, callback) {
            // ... 标准 getList 实现 ...
        }
    }
}
</script>
```

## isDrawer 抽屉模式完整示例

```vue
<template>
    <div :class="!isDrawer ? 'app-container' : ''">
        <div :ref="refName" class="mb5">
            <newMySearch
                ref="newSearchArea"
                source="memberList"
                @saveSearchData="getList"
                :outParameter="outParameter"
                :displayHistory="!isDrawer"
            />
        </div>

        <el-table
            :data="list"
            v-loading="listLoading"
            :height="heightTableMixins(refName, isDrawer ? 240 : 200)"
            :header-cell-style="e => headerCellStyle(listQuery.orderby_cond, e)"
            @sort-change="sortChange"
            ref="member_table"
        >
            <el-table-column prop="id" label="ID" sortable="custom" />
            <el-table-column prop="name" label="名称" v-if="!isDrawer" />
        </el-table>
    </div>
</template>

<script>
export default {
    props: ["isDrawer", "uid"],
    mixins: [getH],

    data() {
        return {
            refName: "",
            outParameter: {}
        }
    },

    created() {
        if (this.isDrawer) {
            this.refName = "componentContainer_d"
            if (this.uid) {
                this.outParameter["member_id"] = this.uid
            }
        } else {
            this.refName = "componentContainer"
        }
    },

    mounted() {
        if (this.$refs[this.refName]) {
            this.setupResizeObserver(this.refName)
        }
    },

    methods: {
        async getList(obj, callback) {
            // ... 标准 getList 实现 ...
        }
    }
}
</script>
```

## 状态渲染最佳实践

在组件中使用字典常量渲染状态标签：

```javascript
import {withdrawStatusList} from "@/utils/dict.js"

export default {
    data() {
        return {
            withdrawStatusList
        }
    }
}
```

```vue
<el-table-column label="状态">
    <template slot-scope="{row}">
        <el-tag
            :type="withdrawStatusList[row.status].type"
            v-if="withdrawStatusList[row.status]"
        >
            {{ withdrawStatusList[row.status].label }}
        </el-tag>
    </template>
</el-table-column>
```

## 搜索配置使用字典

在 `searchKey/compKey/*.js` 中配置搜索项时：

```javascript
import {withdrawStatusList} from "@/utils/dict.js"

export default {
    sourceKey: {
        status: {
            label: "状态",
            key: "status",
            compType: "select",
            opts: Object.values(withdrawStatusList)
        }
    }
}
```

## getTimeToText 详细说明

| 参数 | 类型 | 说明 | 返回格式 |
|------|------|------|----------|
| timestamp | Number | 时间戳(秒或毫秒) | - |
| 不传第二参数 | - | 完整时间 | YYYY-MM-DD HH:mm:ss |
| true | Boolean | 仅日期 | YYYY-MM-DD |
| "hms" | String | 仅时间 | HH:mm:ss |

**特性**:
- 自动识别秒级/毫秒级时间戳
- 空值返回 "无"
- 兼容老代码的 getTime_S 过滤器

## processInKeys 说明

用于处理搜索条件中的特殊字段,将数组或特殊格式转换为 API 需要的格式。

**使用位置**: 所有 API 调用前

```javascript
let response = await api_function(processInKeys(data))
```

## tableOrderbyCond 说明

处理表格排序条件的工具函数。

**参数**:
- `orderby_cond`: 当前排序条件数组
- `prop`: 排序字段
- `order`: 排序方向 ("ascending" | "descending" | null)

**返回**: 更新后的排序条件数组

## headerCellStyle 说明

为已排序的表头列添加视觉标识。

**使用**:

```vue
<el-table :header-cell-style="e => headerCellStyle(listQuery.orderby_cond, e)">
```

## heightTableMixins 说明

计算表格动态高度。

**参数**:
- `refName`: 容器 ref 名称
- `offset`: 额外偏移量(默认 200)

**返回**: 计算后的表格高度

## 双模式组件处理

对于有埋点模式和日志模式的组件:

```javascript
async getLogData(data) {
    // 定义日志模式不支持的字段
    let filterKeyList = ["channel", "android_sn", "android_id", "idfa", "uuid", "type"]

    if (data.search_cond && typeof data.search_cond === 'object') {
        Object.keys(data.search_cond).forEach(item => {
            if (filterKeyList.includes(item)) {
                delete data.search_cond[item]
            }
        })
    }

    let response = await equipment_api(processInKeys(data))
    // ...
}
```

## outParameter 用法

### 固定条件

```javascript
data() {
    return {
        outParameter: {
            status: 1,
            type: "active"
        }
    }
}
```

### 动态设置

```javascript
created() {
    if (this.userId) {
        this.outParameter["user_id"] = this.userId
    }
}
```

### 响应式更新

```javascript
methods: {
    changeFilter(key, value) {
        this.outParameter = {
            ...this.outParameter,
            [key]: value
        }
    }
}
```

## 从表格单元格触发搜索

```javascript
methods: {
    setSearchValue(key, value) {
        this.outParameter = {[key]: value}
    }
}
```

```vue
<template>
    <span class="blue" @click="setSearchValue('uid', row.uid)">
        {{ row.uid }}
    </span>
</template>
```

## 级联选择器集成

```javascript
cascaderChange(arr) {
    if (arr && arr.length > 0) {
        if (arr[0] === 4) {
            this.sport_id = 4
            this.game_id = arr[1]
        } else {
            this.sport_id = arr[0]
            this.game_id = 0
        }
    } else {
        this.sport_id = undefined
        this.game_id = undefined
    }
    this.listQuery.page = 1
    this.getList()
}
```

## 注意事项

1. **refName 必须唯一**: 不同模式使用不同的 refName 避免冲突
2. **orderby_cond 必须保留**: 搜索时不能丢失排序条件
3. **类型安全**: 使用 Object.keys() 前检查对象是否存在
4. **表格刷新**: 数据更新后调用 doLayout()
5. **错误处理**: try-catch 包裹异步操作,finally 中重置 loading
6. **时间格式化**: 统一使用 getTimeToText,禁止 ParseTime 过滤器
