# 调研发现

## 项目结构
- 目标目录: `/Users/chenwen/leisu_admin/src/views/predictor/`
- 路由配置: `/Users/chenwen/leisu_admin/src/router/children/predictor.js`
- API 文件: `/Users/chenwen/leisu_admin/src/api/predictor.js`

## 参考文件分析

### abnormalMatchList.vue (简单列表参考)
- 文件: `/src/views/predictor/abnormalMatchList.vue`
- 特点:
  - 使用 el-table 展示数据
  - 使用 getH mixin 获取页面高度
  - 使用 v-loading 加载状态
  - 使用 Pagination 组件分页
  - 顶部有按钮组切换状态

### predictorList.vue (复杂列表参考)
- 文件: `/src/views/predictor/predictorList.vue`
- 特点:
  - 使用 newMySearch 组件查询
  - 使用 el-table 展示数据
  - 支持批量操作
  - 使用 heightTableMixins 动态高度

## 项目规范

### 分页字段
- pageNum: 当前页码(默认 1)
- pageSize: 每页条数(默认 10)
- total: 总条数(默认 0)

### API 封装格式
```javascript
export function function_name(data) {
    return request({
        url: "/v1/admin/xxx/xxx",
        method: "post",
        data
    })
}
```

### 路由配置格式
```javascript
{
    path: "/predictor/xxx",
    name: "xxxName",
    component: () => import("@/views/predictor/xxx.vue"),
    meta: {title: "页面标题", roles: []}
}
```

### 日期查询
- 使用 el-date-picker type="daterange"
- 返回值为数组 [start_date, end_date]
- 需要使用 dayjs 处理日期格式化

## 接口信息
- 接口路径: `/v1/admin/predictor/times_card_purchase_list`
- 请求方法: post(根据项目规范)
- 查询参数: created_at(时间范围)
- 返回字段: **未知**,需要用户确认

## 待确认事项
1. el-table 需要展示哪些字段?
2. 是否需要导出功能?
3. 是否需要其他查询条件?
4. el-tabs 后续是否需要添加其他 tab?

## 可复用方案

### tabs 容器 + 子组件懒加载模式
- 主页面只做 tabs 壳：`.app-container` + `el-tabs(tab-position="top" type="border-card")`
- 每个 `el-tab-pane` 内容单独抽成 `components/{业务}/xxxItem.vue`
- 通过 `v-if="bar_name === 'xxx'"` 懒加载，切 tab 时自动重置子组件状态
- 用 `v-bind="$attrs"` 把外部参数（uid、options、isDrawer 等）透传给子组件
- `created()` 里读 `$attrs.options.bar_name` 支持外部指定默认 tab
- 参考：`aiSaleTab.vue`、`buyHistoryTab.vue`

### 子组件文件组织
- 按业务放到 `src/views/predictor/components/{业务}/` 下
- 例：`components/buyerTab/buyerItem.vue`、`components/timesCard/purchaseItem.vue`

### newMySearch 标准接入五件套（新项目可直接照搬）
1. 导入：`newMySearch` + `{getTimeToText, processInKeys, headerCellStyle, tableOrderbyCond}` from `@/utils/tool.js` + `getH` mixin
2. data：工具函数挂到 data、`refName`、`listQuery:{page,limit,orderby_cond:[]}`、`outParameter:{}`
3. 模板：`<div :ref="refName">` 包 newMySearch；el-table 三件套 `heightTableMixins` / `header-cell-style` / `sort-change`；Pagination 用 `page/limit`
4. getList(obj,callback)：myDataSearch 分支、深拷贝 orderby_cond、`processInKeys` 包裹、finally 里放 callback(true) + listLoading=false + doLayout
5. sortChange：`tableOrderbyCond` 更新排序条件 + 重置页码 + getList

### source key 命名约定
- 优先与后端接口同名，如接口 `/v1/admin/predictor/times_card_purchase_list` 则 source 用 `times_card_purchase_list`
- 这样后端在 newMySearch 配置中下发查询项时对齐 key 即可

## 最佳实践
- 查询表单的日期范围用 `value-format="yyyy-MM-dd"`，传参时拆成 `start_time / end_time`
- 接口字段未确认时，el-table 保留单列占位，避免模板报错
- 主页面 `<style scoped lang="scss"></style>` 留空，样式交给各子组件管理
