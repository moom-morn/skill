---
name: newsearch-component-refactor
description: Guide Vue component refactoring to use newMySearch component with proper table sorting, dynamic height, and time formatting. Use when refactoring list views, adapting search components, fixing table sorting issues, or implementing newMySearch integration.
---

# newMySearch 组件改造指南

本技能提供系统化的 Vue 组件改造流程,帮助将现有列表组件迁移到 newMySearch 标准。

## 何时使用此技能

- 改造现有列表页面使用 newMySearch 组件
- 修复表格排序问题
- 实现动态表格高度
- 标准化时间格式化
- 创建可复用的搜索组件

## 改造流程

### 阶段 1: 准备工作

**1.1 导入必需依赖**

```javascript
import Pagination from "@/components/Pagination"
import newMySearch from "@/components/newMySearch/index"
import getH from "@/mixins/getH"
import {getTimeToText, processInKeys, headerCellStyle, tableOrderbyCond} from "@/utils/tool.js"
```

**1.2 混入 getH**

```javascript
export default {
    mixins: [getH],
    // ...
}
```

### 阶段 2: 数据结构改造

**2.1 声明工具函数**

```javascript
import {常量1, 常量2} from "@/utils/dict.js"  // 从字典导入状态常量

data() {
    return {
        getTimeToText,
        headerCellStyle,
        tableOrderbyCond,
        常量1,
        常量2,
        // ...
    }
}
```

**2.2 定义容器 ref**

```javascript
data() {
    return {
        refName: "",  // 在 created 中根据模式设置
        // ...
    }
}
```

**2.3 初始化 listQuery**

```javascript
data() {
    return {
        listQuery: {
            page: 1,
            limit: 15,
            orderby_cond: []  // ⚠️ 必须初始化
        },
        outParameter: {}  // 外部固定参数
    }
}
```

### 阶段 3: 生命周期钩子

**3.1 在 created 中处理动态配置**

```javascript
created() {
    // 抽屉模式
    if (this.isDrawer) {
        this.refName = "componentContainer_d"
        if (this.uid) {
            this.outParameter["member_id"] = this.uid
        }
    } else {
        this.refName = "componentContainer"
    }
    
    // 或者搜索组件模式
    if (this.isSrearchComp) {
        this.refName = "componentContainer_s"
        if (this.sportId) {
            this.outParameter["sport_id"] = `${this.sportId}_${this.gameId || 0}`
        }
    }
}
```

**3.2 在 mounted 中设置高度监听**

```javascript
mounted() {
    if (this.$refs[this.refName]) {
        this.setupResizeObserver(this.refName)
    }
}
```

### 阶段 4: 模板改造

**4.1 添加容器和 newMySearch**

```vue
<template>
    <div :class="!isDrawer ? 'app-container' : ''">
        <div :ref="refName" class="mb5">
            <newMySearch
                ref="newSearchArea"
                source="sourceKey"
                :isAdd="false"
                :displayHistory="!isDrawer"
                :isCreatedSearch="true"
                @saveSearchData="getList"
                :outParameter="outParameter"
            >
                <template slot="Button">
                    <!-- 自定义按钮 -->
                </template>
            </newMySearch>
        </div>

        <el-table
            :data="list"
            :height="heightTableMixins(refName, isDrawer ? 240 : 200)"
            :header-cell-style="e => headerCellStyle(listQuery.orderby_cond, e)"
            @sort-change="sortChange"
            ref="table_ref"
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

### 阶段 5: 实现核心方法

**5.1 标准 getList 方法 (支持 callback)**

```javascript
async getList(obj, callback) {
    this.listLoading = true
    let data = {}

    // newMySearch 数据格式处理
    if (obj && obj.myDataSearch) {
        data = {
            limit: this.listQuery.limit,
            page: 1,
            ...obj.myDataSearch
        }
        // 保留排序条件
        if (this.listQuery.orderby_cond?.length) {
            data["orderby_cond"] = [...this.listQuery.orderby_cond]
        }
    } else {
        data = {...this.listQuery}
    }

    try {
        let response = await api_function(processInKeys(data))

        if (response.code == 0) {
            this.list = response.data
            this.total = response.total
        } else {
            this.list = []
            this.total = 0
        }

        this.listQuery = {...data}
        this.$nextTick(() => {
            this.$refs["table_ref"] && this.$refs["table_ref"].doLayout()
        })
    } catch (err) {
        this.list = []
        this.total = 0
    } finally {
        if (callback) callback(true)  // 回调通知完成
        this.listLoading = false
    }
}
```

**5.2 排序处理方法**

```javascript
sortChange(options) {
    this.listQuery.page = 1
    this.listQuery.orderby_cond = tableOrderbyCond(
        this.listQuery.orderby_cond,
        options.prop,
        options.order
    )
    this.getList()
}
```

### 阶段 6: 时间格式化迁移

**6.1 替换过滤器**

⚠️ **禁止使用 ParseTime 过滤器**，统一使用 `getTimeToText` 方法

```vue
<!-- ❌ 旧方式 -->
{{ row.time | ParseTime("yyyy-MM-dd hh:mm:ss") }}

<!-- ✅ 新方式 -->
{{ getTimeToText(row.time) }}           <!-- 完整时间 -->
{{ getTimeToText(row.time, true) }}     <!-- 仅日期 -->
{{ getTimeToText(row.time, "hms") }}    <!-- 仅时间 -->
```

### 阶段 7: 状态渲染最佳实践

**7.1 使用字典常量**

在 `dict/*.js` 中定义状态字典，并在组件中导入使用：

```javascript
// 1. 导入字典
import {withdrawStatusList} from "@/utils/dict.js"

// 2. 在 data 中声明
data() {
    return {
        withdrawStatusList
    }
}
```

**7.2 模板中渲染**

```vue
<el-tag
    :type="withdrawStatusList[row.status].type"
    v-if="withdrawStatusList[row.status]"
>
    {{ withdrawStatusList[row.status].label }}
</el-tag>
```

## 搜索配置文件

### 搜索字段配置

**位置**: `src/components/newMySearch/components/searchKey/compKey/`

使用 `Object.values()` 从字典获取选项:

```javascript
import {withdrawStatusList} from "@/utils/dict.js"

// 示例: user.js
export default {
    sourceKey: {
        id: {label: "ID", key: "id", compType: "input", rules: "int"},
        name: {label: "名称", key: "name", compType: "input"},
        status: {
            label: "状态",
            key: "status",
            compType: "select",
            opts: Object.values(withdrawStatusList)
        }
    }
}
```

### 顶部快捷键配置

**位置**: `src/components/newMySearch/components/searchTopKey/topKeyItem/`

```javascript
// 示例: user.js
export default {
    sourceKey: ["created_at", "id", "name"]
}
```

## 高级场景

### 作为搜索选择器使用

当组件需要被其他组件调用作为搜索选择器:

**1. 定义 props**

```javascript
props: ["isSrearchComp", "sportId", "gameId"]
```

**2. 动态配置 refName**

```javascript
created() {
    if (this.isSrearchComp) {
        this.refName = "componentContainer_s"
        if (this.sportId) {
            this.outParameter["sport_id"] = `${this.sportId}_${this.gameId || 0}`
        }
    }
}
```

**3. 模板适配**

```vue
<newMySearch
    :displayHistory="!isSrearchComp"
    :isCreatedSearch="isSrearchComp"
    :isAdd="isSrearchComp ? false : hasPwer('xxx')"
/>

<el-table-column label="ID">
    <template slot-scope="{row}">
        <div v-if="isSrearchComp" @click="setID(row)" class="blue">{{ row.id }}</div>
        <div v-else>{{ row.id }}</div>
    </template>
</el-table-column>
```

**4. 数据返回**

```javascript
methods: {
    setID(row) {
        this.$emit("success", row.id)
        this.$emit("successObj", row)
    }
}
```

### 搜索条件特殊处理

在 getList 中转换业务逻辑:

**拆分复合字段**

```javascript
if (data["search_cond"] && data["search_cond"]["sport_id"]) {
    let srList = data["search_cond"]["sport_id"].split("_")
    data["search_cond"]["sport_id"] = srList[0]
    data["search_cond"]["game_id"] = srList[1]
}
```

**过滤不支持的字段**

```javascript
let filterKeyList = ["channel", "android_sn", "android_id"]
if (data["search_cond"] && typeof data["search_cond"] === 'object') {
    Object.keys(data["search_cond"]).forEach(item => {
        if (filterKeyList.includes(item)) {
            delete data["search_cond"][item]
        }
    })
}
```

**状态转时间戳条件**

```javascript
if (data["search_cond"] && data["search_cond"]["topic_status"]) {
    const now = parseInt(new Date().getTime() / 1000)

    if (data["search_cond"]["topic_status"] == 1) {
        data["search_cond"]["start_time__gt"] = now
    } else if (data["search_cond"]["topic_status"] == 2) {
        data["search_cond"]["start_time__lt"] = now
        data["search_cond"]["end_time__gt"] = now
    } else if (data["search_cond"]["topic_status"] == 3) {
        data["search_cond"]["end_time__lt"] = now
    }

    delete data["search_cond"]["topic_status"]
}
```

## 常见问题修复

### TypeError: Cannot convert undefined or null to object

**原因**: 使用 Object.keys() 时对象为空

**修复**:

```javascript
// ❌ 错误
Object.keys(data.search_cond).forEach(...)

// ✅ 正确
if (data.search_cond && typeof data.search_cond === 'object') {
    Object.keys(data.search_cond).forEach(...)
}
```

### 表格排序未生效

**检查清单**:
- [ ] listQuery.orderby_cond 已初始化为 []
- [ ] 使用 tableOrderbyCond 方法
- [ ] 表格绑定了 headerCellStyle
- [ ] sortChange 方法正确实现

### 表格高度不自适应

**检查清单**:
- [ ] 混入了 getH
- [ ] mounted 中调用了 setupResizeObserver
- [ ] 表格使用了 heightTableMixins
- [ ] 容器有正确的 ref

## 改造检查清单

完成改造后,逐项验证:

- [ ] props 定义了 isDrawer、uid (如适用)
- [ ] created 中动态设置了 refName 和 outParameter
- [ ] 导入了所有必需工具函数和字典常量
- [ ] 混入了 getH
- [ ] 初始化了 orderby_cond: []
- [ ] 模板添加了 ref 容器, 抽屉模式适配了 class 和 displayHistory
- [ ] mounted 中调用了 setupResizeObserver
- [ ] 表格使用了 heightTableMixins 动态高度
- [ ] 表格绑定了 headerCellStyle
- [ ] 实现了标准 getList 方法 (支持 callback)
- [ ] 实现了 sortChange 方法
- [ ] 分页组件正确绑定
- [ ] 时间格式化使用 getTimeToText
- [ ] 状态渲染使用字典常量
- [ ] 搜索配置使用 Object.values(字典)
- [ ] 添加了类型安全检查

## 执行策略

当用户请求改造组件时:

1. **读取目标组件**,分析现有结构
2. **识别改造类型**:
   - 简单列表页面 → 使用标准模板
   - 搜索选择器 → 添加 isSrearchComp 支持
   - 双模式组件 → 添加字段过滤逻辑
3. **按阶段执行改造**,每个阶段完成后验证
4. **使用检查清单**确保没有遗漏
5. **测试关键功能**:排序、分页、搜索

## 详细参考

完整规范和示例见项目文档: `.cursor/rules/corsor.mdc`
