# 次卡销售/使用报表 — 调研发现

## 架构类型确认（重大调整）

**不是分页列表，是时间维度汇总报表。** 参考文件从 `purchaseItem.vue` 切换为 [groupReport.vue](file:///Users/chenwen/leisu_admin/src/views/forum/components/interactChargeReport/groupReport.vue)。

### 接口约定

| 维度 | 说明 |
|------|------|
| 返回结构 | `{code, data: [{period, ...metrics}]}` |
| **无** total | 不分页，一次返回全部时间段行 |
| 请求体 | `{compare, search_cond: {...}}` |
| compare | `day` / `week` / `month`（来自 newMySearch 的 compare 字段，**keyJoinType:2 让它不进 search_cond**） |
| search_cond | 其余筛选条件（日期范围等）由 newMySearch 自动包装 |

## 参考文件清单（调整）

| 文件 | 作用 |
|------|------|
| [timesCardPurchaseList.vue](file:///Users/chenwen/leisu_admin/src/views/predictor/timesCardPurchaseList.vue) | tabs 容器（保留，在第 8-10 行「待添加」tab 位扩展） |
| [groupReport.vue](file:///Users/chenwen/leisu_admin/src/views/forum/components/interactChargeReport/groupReport.vue) | **汇总报表样板**（newMySearch + echarts + el-table + show-summary + 导出 Excel） |
| [searchKey/compKey/post.js#L181-L204](file:///Users/chenwen/leisu_admin/src/components/newMySearch/components/searchKey/compKey/post.js#L181-L204) | groupReport 的 source 字典，含 `compare` 字段完整写法 |
| [utils/dict/common.js#L576](file:///Users/chenwen/leisu_admin/src/utils/dict/common.js#L576) | DWM 常量（日/周/月三选项） |
| [@/vendor/Export2Excel](file:///Users/chenwen/leisu_admin/src/vendor/Export2Excel.js) | Excel 导出工具（按需 import） |

## 接口字段（用户提供）

### 销售报表 `/v1/admin/predictor/times_card_sales_report`

| key | 类型 | 说明 |
|------|------|------|
| period | string | 时间段 |
| buyer_count | int | 购买人数 |
| purchase_count | int | 购买次数 |
| fee_sum | string | 购买金额 |
| first_buyer_count | int | 首次付费用户（近 90 天内无方案购买记录） |
| renewal_buyer_count | int | 续费人数 |
| renewal_rate | string | 续费率 |
| repurchase_7d_count | int | 7 天复购人数 |
| repurchase_7d_rate | string | 7 天复购率 |
| repurchase_30d_count | int | 30 天复购人数 |
| repurchase_30d_rate | string | 30 天复购率 |

### 使用报表 `/v1/admin/predictor/times_card_usage_report`

| key | 类型 | 说明 |
|------|------|------|
| period | string | 时间段 |
| sold_times | int | 售出总次数 |
| consumed_times | int | 已消耗总次数 |
| avg_cycle_times | int | 卡均使用时长（秒） |
| buyer_count | int | 购买人数 |

## compare 字段标准字典项（照抄 post.js 写法）

```js
compare: {
    label: "日周月",
    key: "compare",
    compType: "button",
    isBtnRequired: true,
    defaultValue: "day",
    keyJoinType: 2,
    opts: DWM
}
```

说明：
- `isBtnRequired: true` → 必选（不能取消）
- `defaultValue: "day"` → 进页默认按日维度
- `keyJoinType: 2` → 这个键不放进 `search_cond`，而是平铺到 `myDataSearch.compare`
- `opts: DWM` → 来自 `@/utils/dict/common.js`，日/周/月三选项

## getReport 核心逻辑（照抄 groupReport.vue#L191-L225）

```js
async getReport(data = {}, api, close) {
    this.listLoading = true
    let obj = {
        compare: data.myDataSearch ? data.myDataSearch.compare : "day",
        search_cond: data && data.myDataSearch
            ? {...data.myDataSearch.search_cond}
            : {...this.nextData}
    }
    let res = await times_card_xxx_report(obj)
    if (res && res.code == 0) {
        if (close) close(true)
        this.nextData = {...obj.search_cond}
        this.reportData = res.data || []
        // 如需图表：this.formData(this.reportData)
    }
    this.listLoading = false
}
```

## API 函数模板

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

## newMySearch 字典 source 骨架（待字段补充）

```js
// searchKey/compKey/predictor.js
times_card_sales_report: {
    created_at: {label: "统计日期", key: "created_at", compType: "date", more: false, defaultValue: setClickShortcutsTime(9)},
    compare: {label: "日周月", key: "compare", compType: "button", isBtnRequired: true, defaultValue: "day", keyJoinType: 2, opts: DWM}
    // 其余 search_cond 字段待用户补充
},
times_card_usage_report: {
    created_at: {label: "统计日期", key: "created_at", compType: "date", more: false, defaultValue: setClickShortcutsTime(9)},
    compare: {label: "日周月", key: "compare", compType: "button", isBtnRequired: true, defaultValue: "day", keyJoinType: 2, opts: DWM}
    // 其余 search_cond 字段待用户补充
}
```

需从 `@/utils/dict/common.js` 引入 `DWM`、`setClickShortcutsTime`。

## 子组件字段列表（建议）

### salesReportItem.vue — el-table 列（11 列）
| label | prop | 宽度 | 备注 |
|------|------|------|------|
| 时间 | period | 160 | fixed="left" |
| 购买人数 | buyer_count | — | |
| 购买次数 | purchase_count | — | |
| 购买金额 | fee_sum | — | |
| 首次付费用户 | first_buyer_count | — | header 加 tooltip「近 90 天内无方案购买记录」 |
| 续费人数 | renewal_buyer_count | — | |
| 续费率 | renewal_rate | — | |
| 7 天复购人数 | repurchase_7d_count | — | |
| 7 天复购率 | repurchase_7d_rate | — | |
| 30 天复购人数 | repurchase_30d_count | — | |
| 30 天复购率 | repurchase_30d_rate | — | |

### usageReportItem.vue — el-table 列（5 列）
| label | prop | 宽度 | 备注 |
|------|------|------|------|
| 时间 | period | 160 | fixed="left" |
| 售出总次数 | sold_times | — | |
| 已消耗总次数 | consumed_times | — | |
| 卡均使用时长 | avg_cycle_times | — | 秒数建议格式化为 "Xh Ym Zs" |
| 购买人数 | buyer_count | — | |

## 可复用方案

### 汇总报表样板（groupReport 版）
1. source 字典必带 `compare`（keyJoinType:2 + defaultValue:"day"）
2. getReport 签名 `(data, api, close)`，obj 结构 `{compare, search_cond}`
3. `this.nextData` 缓存 search_cond，用于 tab 切换/刷新时复用
4. 表格数据直接赋值 `res.data`，不走分页
5. `show-summary + :summary-method="getSummaries"`（utils/tool 的 addCount）
6. 可选：echarts 折线图、导出 Excel、周末行高亮

## 待用户确认事项

1. **search_cond 额外字段**（除 created_at + compare 外）是否还需要其他筛选？例如：买家 UID / 商品 ID / 平台 / 购买场景 / 渠道
2. **是否要折线图**（groupReport 在表格上方有 echarts）
3. **是否要导出 Excel 按钮**
4. **是否要合计行 `show-summary`**
5. **是否要周末高亮**（groupReport 有周末行变色）
6. **avg_cycle_times 秒数展示格式**：原始秒数 / "X 天 Y 小时" / "HH:mm:ss" ？

## 踩坑记录

（暂无）

## 最佳实践

- compare 字段必带 `keyJoinType: 2`，否则它会被错误地塞进 search_cond 里
- 返回结构无 total 的汇总报表不用 Pagination 组件
- reportData 推荐用 `res.data || []`，兜底空对象
