# Task Plan: 创建次卡购买记录列表页面

## Goal

在 `/Users/chenwen/leisu_admin/src/views/predictor` 下创建一个使用 `el-tabs` 的路由页面,第一个 tab 为次卡购买记录列表,支持多条件查询(created_at),使用 el-table 展示数据。

## Phases

### Phase 1: 需求分析与现状调研

- [x] 确认需求:el-tabs 页面 + 第一个 tab 为列表查询
- [x] 确认接口:`/v1/admin/predictor/times_card_purchase_list`
- [x] 确认查询参数:created_at(时间范围)
- [x] 确认文件位置:`/src/views/predictor/`
- [x] 确认权限:暂无(roles 为空数组)
- [x] 查看参考文件:abnormalMatchList.vue, predictorList.vue
- [x] 查看路由配置:`/src/router/children/predictor.js`
- [x] 查看 API 文件:`/src/api/predictor.js`
- **Status:** complete

### Phase 2: 方案设计

- [x] 确定页面结构:el-tabs + el-tab-pane(次卡购买记录列表)
- [x] 确定查询表单:created_at(日期范围选择器)
- [x] 确定表格字段:待确认(接口返回字段未知)
- [x] 确定分页:pageNum/pageSize/total(项目标准)
- [x] 确定路由配置:添加到 predictor.js
- [x] 确定 API 封装:添加到 predictor.js API 文件
- **Status:** complete

### Phase 3: 执行实现

- [x] 在 `/src/api/predictor.js` 中添加 `times_card_purchase_list` 接口函数
- [x] 在 `/src/views/predictor/` 下创建 `timesCardPurchaseList.vue` 页面
  - [x] 实现 el-tabs 结构(预留其他 tab 位置)
  - [x] 实现第一个 el-tab-pane(次卡购买记录列表)
  - [x] 实现查询表单(created_at 日期范围)
  - [x] 实现 el-table(字段留空,后续补充)
  - [x] 实现分页功能
- [x] 在 `/src/router/children/predictor.js` 中添加路由配置
- **Status:** complete

### Phase 4: 验证与修正

- [ ] 检查页面渲染是否正常
- [ ] 检查查询功能是否正常
- [ ] 检查分页功能是否正常
- [ ] 修复发现的问题
- **Status:** pending（等待第二轮重做后再统一验证）

### Phase 5: 交付

- [ ] 确认需求是否满足
- [ ] 汇总风险和未完成项
- [ ] 交付结果
- **Status:** pending

### Phase 6: 容器组件化重做（用户要求推翻重做页面结构）

- [x] 新建子组件 `src/views/predictor/components/timesCard/purchaseItem.vue`，承载查询表单 + el-table + 分页 + 接口调用
- [x] 覆盖重写 `timesCardPurchaseList.vue` 为纯 tabs 壳（`app-container` + `tab-position="top"` + `type="border-card"`，子组件用 `v-if` 懒加载 + `v-bind="$attrs"` 透传）
- [x] 兼容 `$attrs.options.bar_name` 入口，对齐 aiSaleTab 用法
- [x] API `times_card_purchase_list`、路由、权限均不动
- **Status:** complete

### Phase 7: purchaseItem.vue 接入 newMySearch（/newsearch-component-refactor）

- [x] 引入 `newMySearch`、`{getTimeToText, processInKeys, headerCellStyle, tableOrderbyCond}`（getH/Pagination 已有）
- [x] 移除本地 `search-form`（created_at 日期选择器、查询/重置按钮），查询 UI 交给 newMySearch 托管
- [x] `<div :ref="refName">` 包裹 newMySearch，`source="times_card_purchase_list"`
- [x] `listQuery` 改为 `{page:1, limit:15, orderby_cond:[]}`，新增 `outParameter:{}`，声明工具函数
- [x] el-table 补齐 `:height=heightTableMixins(refName,200)` / `:header-cell-style` / `@sort-change` / `ref="times_card_table"`
- [x] Pagination 改为 `page/limit` 绑定
- [x] `getList(obj, callback)` 按规范实现：myDataSearch 分支、深拷贝 orderby_cond、`processInKeys` 包裹、finally 里 `callback(true)` + `doLayout()`
- [x] 新增 `sortChange`，使用 `tableOrderbyCond` 更新排序条件
- [x] mounted 调 `setupResizeObserver(refName)`
- **Status:** complete

## Key Questions

1. el-table 需要展示哪些字段?(接口返回结构未知,需要用户提供或我先按常见字段实现)
2. 是否需要其他查询条件?(目前只有 created_at,后续可能需要扩展)
3. el-tabs 是否需要其他 tab?(目前只实现第一个 tab,其他 tab 后续添加)

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| 使用项目标准的 pageNum/pageSize 分页字段 | 项目规范,与其他页面保持一致 |
| 使用 el-date-picker type="daterange" 查询 created_at | 项目常用时间范围查询方式 |
| 页面命名为 timesCardPurchaseList.vue | 符合项目命名规范 |
| 路由 path 为 `/predictor/times_card_purchase_list` | 与接口路径保持一致 |
| 权限 roles 设为空数组 | 用户明确说明权限暂无 |
| 主页面退化为纯 tabs 壳，tab 内容抽独立子组件 | 对齐 aiSaleTab/buyHistoryTab 现有风格，便于后续扩展 tab |
| 子组件路径 `components/timesCard/purchaseItem.vue` | 参考 `components/buyerTab/buyerItem.vue` 的分层方式 |
| 用 `v-if="bar_name === 'xxx'"` 懒加载子组件 | 切 tab 时重置子组件状态，避免隐藏 tab 的多余接口请求 |
| 透传 `v-bind="$attrs"` + `$attrs.isDrawer` 分支 class | 兼容抽屉/外部调用时传入 uid/options 等参数 |
| newMySearch source 用 `times_card_purchase_list` | 与后端接口同名，简单直接，后端配置时对齐同名 key 即可 |
| 分页字段用 page/limit | 跟随 newMySearch 生态，避免手动映射 |
| 暗埋 orderby_cond/sortChange/header-cell-style | 后续补真实列时直接打 `sortable="custom"` 即可生效 |

## Errors Encountered

| Error | Attempt | Resolution |
|-------|---------|------------|
| | 1 | |

## Notes

- 阶段状态按 `pending -> in_progress -> complete` 更新
- 做重大决策前先重读本文件
- 所有错误都记录,避免重复踩坑
- 接口返回字段未知,需要用户确认或先实现基础结构后调整
