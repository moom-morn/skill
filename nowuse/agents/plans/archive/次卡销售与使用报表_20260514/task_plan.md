# 次卡销售/使用报表 tab 接入

## 目标

在现有 [timesCardPurchaseList.vue](file:///Users/chenwen/leisu_admin/src/views/predictor/timesCardPurchaseList.vue) tabs 容器中，把第 8-10 行「待添加」tab 扩展为两个功能 tab：

- **次卡销售报表** → 接口 `/v1/admin/predictor/times_card_sales_report`
- **次卡使用报表** → 接口 `/v1/admin/predictor/times_card_usage_report`

两张报表均为**时间维度汇总型**（newMySearch + el-table，**无分页**），参照 [groupReport.vue](file:///Users/chenwen/leisu_admin/src/views/forum/components/interactChargeReport/groupReport.vue) 架构（非 purchaseItem.vue）。

## 已确认决策

- **Decision 1**：采用方案 B —— 复用现有 tabs 容器，新增两个子组件挂到新 tab
- **Decision 2**：多条件查询（newMySearch），但**返回结构无分页**（`{code, data:[]}`，按 period 聚合）
- **Decision 3**：请求体结构 `{compare, search_cond: {...}}`，compare 走 `keyJoinType:2` 平铺到顶层
- **Decision 4**：compare 维度走 DWM（日/周/月），默认 `day`
- **Decision 5**：已拿到 两张报表完整字段清单（销售 11 项 / 使用 5 项，见 findings.md）
- **Decision 6**：search_cond 仅放 `created_at`，不追加额外筛选字段
- **Decision 7**：保留折线图 echarts（参考 groupReport.vue `formData` + `drawCharts`）
- **Decision 8**：保留导出 Excel 按钮（按 groupReport 的 showTips + formatJson 复刻）
- **Decision 9**：保留合计行 `show-summary + :summary-method="getSummaries"`（addCount 求和；率/均值等无合计意义字段返回 `-`）
- **Decision 10**：不做周末行高亮（period 可为日/周/月，仅日维度生效意义有限）
- **Decision 11**：avg_cycle_times（秒）展示为「X 小时 Y 分 Z 秒」格式

## 关键阶段

### Phase 1：上下文调研 — **done**
- [x] 读 timesCardPurchaseList.vue 结构
- [x] 读 purchaseItem.vue 五件套（API / newMySearch / 排序 / 字典 / lsUser）
- [x] 确认 api/predictor.js 中同类 API 封装格式（POST /v1/admin/...）
- [x] 确认 searchKey 字典机制（前端静态字典驱动）

### Phase 2：字段与查询项确认 — **done**
- [x] 用户提供两份接口 JSON 字段清单（销售 11 项 / 使用 5 项）
- [x] 确认查询参数结构 `{compare, search_cond}`（参考 groupReport.vue 196-206）
- [x] search_cond 仅 `created_at`，不追加额外字段
- [x] 可选特性全部定档：折线图✅ / 导出 Excel✅ / 合计行✅ / 周末高亮❌ / avg_cycle_times「小时分秒」

### Phase 3：API 与字典注册 — **done**
- [x] `src/api/predictor.js` 追加 `times_card_sales_report` / `times_card_usage_report` 两个函数
- [x] `src/components/newMySearch/components/searchKey/compKey/predictor.js` 追加两个 source 字典
  - 各含 `created_at`（date, defaultValue: setClickShortcutsTime(9)）+ `compare`（button, DWM, defaultValue:"day", keyJoinType:2）

### Phase 4：两个子组件开发 — **done**
- [x] 新建 `src/views/predictor/components/timesCard/salesReportItem.vue`（355 行）
- [x] 新建 `src/views/predictor/components/timesCard/usageReportItem.vue`（324 行）
- [x] 骨架按 groupReport.vue 复刻：newMySearch + echarts + el-table + show-summary + 导出 Excel
- [x] usageReportItem.vue 的 `avg_cycle_times` 用 `formatSeconds` 转「X小时Y分Z秒」

### Phase 5：tabs 容器接入 — **done**
- [x] 修改 timesCardPurchaseList.vue 第 8-10 行：删除「待添加」tab，新增 salesReport / usageReport 两个 tab-pane
- [x] import 两个新子组件并注册

### Phase 6：验收 — **pending**
- [ ] `npm run dev` 能打开三个 tab 且数据可拉取
- [ ] 排序、分页、搜索、清空搜索均正常
- [ ] 切换 tab 不残留上一个 tab 的加载态

## 待用户确认的问题

- 全部 6 项已确认（见 Decision 6-11），等待**实施批准**开始 Phase 3-5

## Phase 3-5 可执行清单（待批准）

### 步骤 1：`src/api/predictor.js` 末尾追加两个函数

```js
// 次卡销售报表
export function times_card_sales_report(data) {
    return request({
        url: "/v1/admin/predictor/times_card_sales_report",
        method: "post",
        data
    })
}

// 次卡使用报表
export function times_card_usage_report(data) {
    return request({
        url: "/v1/admin/predictor/times_card_usage_report",
        method: "post",
        data
    })
}
```

### 步骤 2：`src/components/newMySearch/components/searchKey/compKey/predictor.js` 末尾追加

需在文件顶部确认已 import `DWM` 与 `setClickShortcutsTime`（若未 import 则补上）。

```js
// 次卡销售报表
times_card_sales_report: {
    created_at: {label: "创建时间", key: "created_at", compType: "date", more: false, defaultValue: setClickShortcutsTime(9)},
    compare: {label: "日周月", key: "compare", compType: "button", isBtnRequired: true, defaultValue: "day", keyJoinType: 2, opts: DWM}
},
// 次卡使用报表
times_card_usage_report: {
    created_at: {label: "创建时间", key: "created_at", compType: "date", more: false, defaultValue: setClickShortcutsTime(9)},
    compare: {label: "日周月", key: "compare", compType: "button", isBtnRequired: true, defaultValue: "day", keyJoinType: 2, opts: DWM}
}
```

### 步骤 3：新建 `salesReportItem.vue`

- source: `times_card_sales_report`
- 列（11 个数据列 + 1 个时间列）：period(fixed, 160) / buyer_count / purchase_count / fee_sum / first_buyer_count(tooltip 近 90 天无方案购买记录) / renewal_buyer_count / renewal_rate / repurchase_7d_count / repurchase_7d_rate / repurchase_30d_count / repurchase_30d_rate
- 图表 legend: 购买人数 / 购买次数 / 购买金额 / 续费人数 / 首次付费用户
- Excel 导出 title: 「次卡销售报表」
- getSummaries: fee_sum/购买人数/次数/首次/续费 → addCount 求和；renewal_rate/repurchase_*_rate → `-`

### 步骤 4：新建 `usageReportItem.vue`

- source: `times_card_usage_report`
- 列（5 个数据列 + 1 个时间列）：period(fixed, 160) / sold_times / consumed_times / avg_cycle_times（小时分秒格式化） / buyer_count
- 图表 legend: 售出总次数 / 已消耗总次数 / 购买人数（avg_cycle_times 不进图表，量纲不同）
- Excel 导出 title: 「次卡使用报表」
- `formatSeconds(sec)`：在组件内定义一个本地方法，`sec → 'X小时Y分Z秒'`
- getSummaries: sold_times/consumed_times/buyer_count → addCount 求和；avg_cycle_times → 合计=`-`

### 步骤 5：改 `timesCardPurchaseList.vue` 第 8-10 行

```vue
<el-tab-pane label="次卡销售报表" name="salesReport">
    <salesReportItem v-if="bar_name === 'salesReport'" v-bind="$attrs" />
</el-tab-pane>
<el-tab-pane label="次卡使用报表" name="usageReport">
    <usageReportItem v-if="bar_name === 'usageReport'" v-bind="$attrs" />
</el-tab-pane>
```

同步 `<script>` 里 `import` 两个新组件并 `components` 注册。

## 错误与尝试记录

（空）
