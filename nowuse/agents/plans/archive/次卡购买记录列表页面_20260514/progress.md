# 进度日志

## 2026-05-14

### 需求确认
- [x] 确认需求:创建 el-tabs 页面,第一个 tab 为次卡购买记录列表
- [x] 确认接口:`/v1/admin/predictor/times_card_purchase_list`
- [x] 确认查询参数:created_at(时间范围)
- [x] 确认文件位置:`/src/views/predictor/`
- [x] 确认权限:暂无(roles 为空数组)

### 调研阶段
- [x] 查看参考文件:abnormalMatchList.vue (简单列表)
- [x] 查看参考文件:predictorList.vue (复杂列表)
- [x] 查看路由配置:predictor.js
- [x] 查看 API 文件:predictor.js
- [x] 确认项目规范:分页字段、API 封装格式、路由配置格式

### 方案设计
- [x] 确定页面结构:el-tabs + el-tab-pane
- [x] 确定查询表单:created_at(日期范围选择器)
- [x] 确定表格字段:待确认(接口返回未知)
- [x] 确定分页:pageNum/pageSize/total
- [x] 确定路由配置方案
- [x] 确定 API 封装方案

### 创建计划文件
- [x] 创建 task_plan.md
- [x] 创建 findings.md
- [x] 创建 progress.md

### 执行实现
- [x] 添加 API 接口函数到 predictor.js (times_card_purchase_list)
- [x] 创建 timesCardPurchaseList.vue 页面
  - [x] 实现 el-tabs 结构(含预留 tab)
  - [x] 实现查询表单(created_at 日期范围)
  - [x] 实现 el-table(字段留空)
  - [x] 实现分页功能
- [x] 添加路由配置到 predictor.js

### 待验证
- [ ] 页面渲染是否正常
- [ ] 查询功能是否正常
- [ ] 分页功能是否正常

### newMySearch 组件化改造（第三轮，/newsearch-component-refactor）
- [x] 确认口径：source=`times_card_purchase_list`、分页用 page/limit、暗埋排序基础设施
- [x] purchaseItem.vue 按 skill 全量改造：
  - 导入 `newMySearch` + `{getTimeToText, processInKeys, headerCellStyle, tableOrderbyCond}`
  - 移除本地 `search-form`（日期选择器/查询/重置），由 newMySearch 接管
  - `<div :ref="refName">` 包裹 newMySearch
  - `listQuery` 改为 `{page:1, limit:15, orderby_cond:[]}`，新增 `outParameter:{}`
  - el-table 补 `heightTableMixins` 动态高度 + `header-cell-style` + `sort-change`
  - Pagination 改用 `page/limit`
  - `getList(obj, callback)` 按规范：myDataSearch、深拷贝 orderby_cond、processInKeys、callback(true)、doLayout
  - 新增 `sortChange` + mounted 里 `setupResizeObserver(refName)`
- [x] 接口返回结构按 `res.code == 0 ? res.data : []` 和 `res.total` 处理（newMySearch 通用约定，待后端确认）

### 容器组件化重做（第二轮，用户要求推翻重做页面结构）
- [x] 确认重做范围：每个 el-tab-pane 的内容抽成独立子组件
- [x] 新建 `src/views/predictor/components/timesCard/purchaseItem.vue`
  - 承载查询表单（created_at 日期范围）、el-table 空壳、Pagination、接口调用
  - 复用 `getH` mixin 获取 tableHeight
  - 日期范围仍映射 start_time / end_time
- [x] 覆盖重写 `timesCardPurchaseList.vue`
  - 外层 `:class="$attrs.isDrawer ? '' : 'app-container'"`
  - `el-tabs(tab-position="top" type="border-card")`
  - 第一个 tab：`<purchaseItem v-if="bar_name === 'purchaseList'" v-bind="$attrs" />`
  - 第二个 tab：保留「待添加」占位
  - `created()` 兼容 `$attrs.options.bar_name` 入口
- [x] API / 路由 / 权限未动

## 待确认问题
1. el-table 需要展示哪些字段?(接口返回结构未知)
2. 是否需要其他查询条件?
3. el-tabs 是否需要其他 tab?
