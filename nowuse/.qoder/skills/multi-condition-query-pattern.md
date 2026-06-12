# 多条件查询模式技能文档

基于 `src/views/member/list.vue` 的通用多条件查询实现模式，适用于列表类页面。

## 核心架构

### 数据结构

```javascript
data() {
    return {
        listQuery: {
            page: 1,              // 当前页码（通常从1开始）
            limit: 15,            // 每页数量（默认15条）
            orderby_cond: []      // 排序条件数组，格式：['field', '-field'] 表示升序/降序
        },
        list: [],                 // 数据列表
        total: 0,                 // 总数量
        loading: false            // 加载状态
    }
}
```

### 查询参数流转

```
用户输入
  ↓
newMySearch 组件（搜索字段组件）
  ↓
@saveSearchData 事件触发 getList()
  ↓
getList(obj, row) 方法构建请求参数
  ↓
API 调用 (member_list(data))
  ↓
更新 list 和 total
```

## 详细实现步骤

### 1. 模板结构（Template）

#### 搜索组件集成

```vue
<div :class="!isSrearchComp ? 'filter-container' : ''">
    <!-- 批量操作栏（可选） -->
    <div class="box_h" v-show="banlist.length > 0">
        <el-button type="primary" @click="batchAction()">批量操作</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="box_h" v-show="banlist.length == 0">
        <newMySearch
            ref="newSearchArea"
            source="memberList"              <!-- 关键：指定搜索源 -->
            :isAdd="!isSrearchComp && hasPwer('add_member')"
            :isReport="!isSrearchComp"
            @newlyAdded="addUser()"           <!-- 新增事件 -->
            @seeReport="seeReport()"          <!-- 报表事件 -->
            @saveSearchData="getList"         <!-- 关键：搜索触发 -->
            @reset="$set(listQuery, 'orderby_cond', [])"  <!-- 重置排序 -->
            style="margin-left: 5px; width: calc(100%)"
            :outParameter="outParameter"
            :noUseHistoryData="isSrearchComp"
            :displayHistory="!isSrearchComp"
        />
    </div>
</div>
```

#### 表格结构

```vue
<el-table
    :stripe="true"
    v-loading="listLoading"
    :data="list"
    border
    style="width: 100%"
    @selection-change="showBanBtn"        <!-- 多选事件 -->
    @sort-change="sortChange"             <!-- 排序事件 -->
    :height="heightTableMixins(refName, isSrearchComp ? 260 : 200)"
    :header-cell-style="options => headerCellStyle(listQuery['orderby_cond'], options)"
>
    <!-- 多选列（可选） -->
    <el-table-column :width="40" type="selection" v-if="!isSrearchComp" />

    <!-- 数据列 -->
    <el-table-column label="UID" :width="120" sortable="custom" prop="uid">
        <template slot-scope="{row}">
            <span v-if="isSrearchComp" @click="clickID(row)" class="blue">{{ row.uid }}</span>
            <span v-else>{{ row.uid }}</span>
        </template>
    </el-table-column>

    <!-- 其他列... -->
</el-table>

<!-- 分页 -->
<pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
```

### 2. 脚本实现（Script）

#### Props 定义

```javascript
props: {
    isSrearchComp: Boolean,      // 是否在搜索组件内使用（改变UI和功能）
    isGroupId: [Array, Number]   // 分组ID（可选，用于条件渲染）
}
```

#### 核心方法：getList

```javascript
getList(obj, row) {
    this.listLoading = true
    let data = {}

    // 情景1：来自 newMySearch 组件的搜索
    if (obj && obj.myDataSearch) {
        // myDataSearch 结构：{search_cond: {...}, orderby_cond: [...]}
        data = {
            limit: this.listQuery.limit,
            page: 1,                    // 新搜索重置为第1页
            ...obj.myDataSearch
        }

        // 保留用户手动设置的排序条件
        if (this.listQuery.orderby_cond && this.listQuery.orderby_cond.length) {
            data['orderby_cond'] = [...this.listQuery.orderby_cond]
        }

        // 特殊字段处理：某些字段需要映射或转换
        if (data['search_cond'] && data['search_cond']['isOtherId']) {
            let key = data['search_cond']['isOtherId']
            data['search_cond'][key] = true
            delete data['search_cond']['isOtherId']
        }
    }
    // 情景2：分页或排序请求
    else {
        data = this.delKey({...this.listQuery})  // delKey 移除空值字段
    }

    // API 调用
    member_list(data)
        .then(response => {
            if (response.code == 0) {
                this.list = response.data
                this.total = response.total
                this.listQuery = JSON.parse(JSON.stringify(data))
            } else {
                this.list = []
                this.total = 0
            }
            this.listLoading = false
        })
        .catch(() => {
            this.listLoading = false
        })
}
```

#### 排序方法：sortChange

```javascript
sortChange(options) {
    // options.prop: 列字段名
    // options.order: 排序方向 ('ascending'/'descending'/null)

    this.listQuery.orderby_cond = tableOrderbyCond(
        this.listQuery.orderby_cond,
        options.prop,
        options.order
    )

    this.listQuery.page = 1    // 排序重置为第1页
    this.getList()
}
```

**tableOrderbyCond 工具函数说明（来自 @/utils/tool.js）：**
- 输入：当前排序数组、列名、排序方向
- 输出：更新后的排序数组
- 格式约定：`'field'` 表示升序，`'-field'` 表示降序

#### 多选处理：showBanBtn

```javascript
showBanBtn(rows) {
    // rows: 多选框选中的行数组

    if (rows.length > 0) {
        this.fIn = true          // 触发批量操作栏展示动画
        this.banlist = []
        rows.forEach(arr => {
            this.banlist.push(arr.uid)  // 收集选中行的ID
        })
    } else {
        this.fIn = false
        this.banlist = []
    }
}
```

### 3. 关键配置

#### 引用的工具和Mixin

```javascript
import {member_list, set_name} from '@/api/member'        // API 模块
import newMySearch from '@/components/newMySearch/index'  // 搜索组件
import Pagination from '@/components/Pagination'          // 分页组件
import {headerCellStyle, tableOrderbyCond, getTimeToText} from '@/utils/tool.js'
import format from '@/mixins/format'                      // 格式化 mixin
import getH from '@/mixins/getH'                          // 高度计算 mixin
import {userGroupObj} from '@/utils/dict.js'             // 字典数据
```

#### 关键 Mixin 方法

| 方法 | 来源 | 说明 |
|------|------|------|
| `hasPwer(permission)` | 权限系统 | 检查用户权限 |
| `delKey(obj)` | 自定义或基础 | 删除对象中的空值/undefined |
| `aes_tostring(str, mode)` | 加解密工具 | AES 解密（用于 URL 参数） |
| `heightTableMixins(refName, offset)` | getH mixin | 动态计算表格高度 |
| `setupResizeObserver(refName)` | getH mixin | 监听窗口大小变化 |

### 4. 生命周期集成

#### created() - 初始化

```javascript
created() {
    // 根据 props 动态生成 ref 名称（用于高度计算）
    if (this.isGroupId && this.isGroupId.includes(7)) {
        this.refName = 'userContainer_' + this.isGroupId.join('_')
    } else if (this.isSrearchComp) {
        this.refName = 'userContainer_s'
    } else {
        this.refName = 'userContainer'
    }

    // 处理 URL 查询参数（支持自动打开详情）
    let url_uid = this.$route.query.uid ||
                  this.aes_tostring(this.$route.query.user_id, 0).replace(/[^0-9]/g, '')

    if (url_uid) {
        window.setTimeout(() => {
            this.showUserInfo(url_uid)
        }, 500)
    }
}
```

#### mounted() - 绑定高度监听

```javascript
mounted() {
    if (this.$refs[this.refName]) {
        this.setupResizeObserver(this.refName)  // 动态高度
    }
}
```

#### activated() - Keep-Alive 激活

```javascript
activated() {
    // 用于路由缓存场景：组件重新显示时的处理
    let url_uid = this.$route.query.uid
    if (url_uid) {
        this.searchData({searchValueKey: 'uid', searchValue: url_uid})
        window.setTimeout(() => {
            this.showUserInfo(url_uid)
        }, 500)
    }
}
```

## 场景特定实现

### 场景1：独立列表页面（isSrearchComp=false）

```vue
<template>
    <member-list />
</template>

<!-- 特点：
- 显示完整的表格列
- 支持多选和批量操作
- 显示搜索历史
- 支持新增/报表功能
-->
```

### 场景2：搜索弹窗内嵌（isSrearchComp=true）

```vue
<template>
    <member-list :isSrearchComp="true" />
</template>

<!-- 特点：
- 隐藏多选列
- 点击行 ID 触发 @success 和 @successObj 事件
- 不显示搜索历史
- 不支持新增/报表
-->
```

### 场景3：分组过滤（isGroupId 包含特定值）

```javascript
// 用于显示或隐藏特定列
<template v-if="isGroupId == 7">
    <!-- 协管员专用列 -->
    <el-table-column label="用户信息">...</el-table-column>
    <el-table-column label="操作">
        <el-button @click="editPower(row)">移除</el-button>
    </el-table-column>
</template>
```

## 最佳实践

### 1. 查询参数管理

```javascript
// ✅ 好：保持 listQuery 与实际请求同步
this.listQuery = JSON.parse(JSON.stringify(data))

// ❌ 避免：修改 listQuery 后不更新实际请求状态
// listQuery.page = 1  // 如果没有传给 API，数据不一致
```

### 2. 空值处理

```javascript
// ✅ 使用工具函数清理空值
data = this.delKey({...this.listQuery})

// ❌ 避免：直接发送包含空值的参数
// 空值可能导致后端查询异常
```

### 3. 排序和分页的关系

```javascript
// ✅ 排序/搜索时重置页码
this.listQuery.page = 1
this.getList()

// ❌ 避免：保留旧页码
// 可能导致翻页后的搜索结果显示错误
```

### 4. 条件字段映射

```javascript
// 当前端字段名与后端字段名不一致时使用
if (data['search_cond']['isOtherId']) {
    let key = data['search_cond']['isOtherId']
    data['search_cond'][key] = true
    delete data['search_cond']['isOtherId']
}

// 示例：前端 "是否第三方ID" -> 后端 "wechat_id/qq_id/weibo_id" 等
```

### 5. 响应处理

```javascript
// ✅ 统一处理错误状态
if (response.code == 0) {
    this.list = response.data
    this.total = response.total
} else {
    this.list = []
    this.total = 0
    this.$message.error(response.msg)
}

// 确保异常时清空列表，避免显示过期数据
```

## 适配于其他列表的改造清单

### 必需步骤

- [ ] 导入 `newMySearch` 组件
- [ ] 配置 `source` 属性（如 `source="memberList"`）
- [ ] 定义 `listQuery` 和 `list`、`total`
- [ ] 实现 `getList(obj, row)` 方法
- [ ] 绑定 `@saveSearchData="getList"` 事件
- [ ] 实现 `sortChange` 方法并绑定表格 `@sort-change`
- [ ] 添加分页组件 `<pagination>`

### 可选步骤（取决于业务）

- [ ] 多选功能：`<el-table-column type="selection">` + `showBanBtn()`
- [ ] 动态高度：`heightTableMixins()` + `setupResizeObserver()`
- [ ] URL 参数支持：`created()` 和 `activated()` 中的参数处理
- [ ] Keep-Alive 缓存：保持独立的 `refName`
- [ ] 批量操作：条件按钮显示和事件处理

## 常见问题排查

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 搜索后分页错位 | 未重置 `page: 1` | 在 getList 中确保 `data.page = 1` |
| 排序无效 | orderby_cond 格式错误 | 检查 tableOrderbyCond 输出，确保格式为 `'field'` 或 `'-field'` |
| 多选操作后不刷新 | getList() 未被调用 | 确保批量操作回调包含 `this.getList()` |
| 表格高度计算异常 | Mixin 未加载 | 确保混入 `getH` mixin，且 ref 名称匹配 |
| 空参数发送 | 未清理 listQuery | 使用 `delKey()` 或检查空值逻辑 |

## 关键组件交互流程图

```
User Input
    ↓
newMySearch (@saveSearchData)
    ↓
getList(obj) ← obj.myDataSearch 包含 search_cond 和 orderby_cond
    ↓
构建请求参数 data
    ↓
API 调用 (member_list)
    ↓
response.data → this.list
response.total → this.total
    ↓
Table 重新渲染
    ↓
用户操作（排序/分页）
    ↓
sortChange / pagination @pagination
    ↓
getList() 不带 obj 参数（使用 this.listQuery）
    ↓
循环
```

## 扩展应用示例

### 应用到比赛列表（match_list.vue）

```javascript
// 替换：newMySearch source="memberList" → source="matchBall" 或运动特定值
// 替换：API member_list → football_match_list / basketball_match_list 等
// 保持：getList、sortChange、listQuery 结构不变

data() {
    return {
        listQuery: {
            page: 1,
            limit: 15,
            orderby_cond: [],
            match_time: [/* 时间范围 */]  // 额外字段
        }
    }
}
```

### 应用到社区列表

```javascript
// 类似改造，根据社区管理的特定字段添加 search_cond
// 保持整体架构相同，只需修改：
// 1. source 值
// 2. API 调用
// 3. 表格列定义
```

## 总结

该模式通过以下核心机制实现多条件查询：

1. **分离关注点**：newMySearch 负责搜索 UI，list.vue 负责数据管理
2. **参数流转**：obj.myDataSearch 清晰传递搜索和排序条件
3. **状态同步**：listQuery 始终与实际请求数据一致
4. **灵活场景**：props 控制 UI 变体（isSrearchComp、isGroupId）
5. **可复用性**：改造新列表只需替换组件名和 API，保持逻辑不变

适用于任何需要多条件搜索、排序、分页的 Vue 列表页面。
