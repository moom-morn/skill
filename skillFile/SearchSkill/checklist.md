---
description: 专门用于 Vue2 和 Node12 环境下的搜索组件重构规则
globs: ["src/components/search/**/*.vue", "src/api/*.js"]
---

# NewSearch 重构技能

- **核心环境**: Vue 2.x, Node 12
- **编程约束**:
  - 严禁使用可选链 (`?.`) 或零合并运算符 (`??`)（Node 12 不支持）。
  - 禁止使用链式结构（如 `.map().filter().reduce()`），请使用基础循环。
- **输出要求**:
  - 必须提供修改后的完整代码文件。
  - 每一行核心逻辑必须包含详细的中文注释。

# newMySearch 改造快速检查清单

## 基础改造 (16 项)

### 导入和混入

- [ ] 导入 `getTimeToText, processInKeys, headerCellStyle, tableOrderbyCond` from `@/utils/tool.js`
- [ ] 导入所需的字典常量 (如 `import {xxxStatus} from "@/utils/dict.js"`)
- [ ] 导入 `getH` from `@/mixins/getH`
- [ ] 导入 `newMySearch` 和 `Pagination` 组件
- [ ] 在 export default 中混入 `getH`

### 数据初始化

- [ ] 在 data 中声明 `getTimeToText, headerCellStyle, tableOrderbyCond` 和字典常量
- [ ] 在 created 中根据模式 (isDrawer/isSrearchComp) 动态设置 `refName` 和 `outParameter`
- [ ] 初始化 `listQuery.orderby_cond: []`

### 生命周期

- [ ] mounted 中调用 `setupResizeObserver(this.refName)`

### 模板结构

- [ ] 添加 `<div :ref="refName">` 包裹 newMySearch，抽屉模式适配 class 和 displayHistory
- [ ] 表格使用 `:height="heightTableMixins(refName, isDrawer ? 240 : 200)"`
- [ ] 表格绑定 `:header-cell-style="e => headerCellStyle(listQuery.orderby_cond, e)"`
- [ ] 表格绑定 `@sort-change="sortChange"`

### 核心方法

- [ ] 实现标准 `getList(obj, callback)` 方法
  - [ ] 处理 `obj.myDataSearch` 格式
  - [ ] 使用可选链保留 `orderby_cond` (`this.listQuery.orderby_cond?.length`)
  - [ ] 使用 `processInKeys(data)`
  - [ ] try-catch 错误处理
  - [ ] finally 中调用回调 `if (callback) callback(true)` 并重置 loading
  - [ ] 调用 `doLayout()`
- [ ] 实现 `sortChange(options)` 方法

## 高级场景检查

### isDrawer 抽屉模式

- [ ] 定义 props: `["isDrawer", "uid"]`
- [ ] created 中动态设置 `refName = "componentContainer_d"`
- [ ] 模板适配 `:class="!isDrawer ? 'app-container' : ''"`
- [ ] 搜索组件配置 `:displayHistory="!isDrawer"`
- [ ] 隐藏抽屉模式不需要的列 (`v-if="!isDrawer"`)

### 搜索组件模式

- [ ] 定义 props: `["isSrearchComp", "sportId", "gameId"]`
- [ ] created 中动态设置 `refName = "componentContainer_s"`
- [ ] 配置 `displayHistory` 和 `isCreatedSearch`
- [ ] 实现 `setID(row)` 方法
- [ ] 表格列添加点击事件

### 特殊业务逻辑

- [ ] 复合字段拆分 (如 sport_id 包含 game_id)
- [ ] 状态转时间戳条件
- [ ] 过滤不支持的字段 (双模式组件)

### 时间格式化和状态渲染

- [ ] 替换所有 `ParseTime` 过滤器为 `getTimeToText`
- [ ] 状态渲染使用字典常量 (`<el-tag :type="xxxStatus[row.status].type">`)
- [ ] 搜索配置使用 `Object.values(字典)`

## 验证测试

### 功能测试

- [ ] 搜索功能正常
- [ ] 排序功能正常 (点击表头)
- [ ] 分页功能正常
- [ ] 表格高度自适应
- [ ] 时间和状态显示正确

### 错误检查

- [ ] 无 console 错误
- [ ] 无 TypeError 关于 Object.keys
- [ ] 排序图标正确显示
- [ ] 搜索后排序条件保留

## 常见遗漏项

1. ❌ 忘记在 data 中声明工具函数和字典
2. ❌ 忘记初始化 orderby_cond
3. ❌ 忘记在 mounted 中调用 setupResizeObserver
4. ❌ 表格 ref 名称与 doLayout 中不一致
5. ❌ 搜索条件处理时未检查对象是否存在
6. ❌ 保留排序条件时未深拷贝数组
7. ❌ 未处理 getList 的 callback 参数
