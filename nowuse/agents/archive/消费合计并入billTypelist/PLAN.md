# 计划：消费合计并入 billTypelist

## Context

用户要求：在 `billTypelist` 数据首位加入 `{type_id: 'all', name: "消费合计"}`，
让消费合计列通过 `billTypelistColumnGroups` 统一渲染，不再单独维护模板和 computed。

---

## 目标文件

`src/views/forum/components/interactChargeReport/postDiffPayFlow.vue`

---

## 实现方案

### 1. billTypelist 首位加入消费合计

```javascript
billTypelist: [{type_id: 'all', name: "消费合计"}, {type_id: 8, name: "互动直播"}, ...]
```

### 2. addConsumptionHeji 字段名改为 `_all` 后缀

`buildSubColumns('all')` 生成的字段为 `user_all/num_all/moneysum_all/renci_all/renjun_all/bijun_all`，
所以 `addConsumptionHeji` 中赋值字段需从 `moneysum_heji/user_heji` 等改为 `moneysum_all/user_all` 等：

```javascript
out.moneysum_all = moneySum
out.user_all     = userSum
out.num_all      = numSum
out.renci_all    = numSum > 0 ? decimalDivideCount(userSum, numSum, 2) : 0
out.renjun_all   = userSum > 0 ? decimalDivideCount(moneySum, userSum, 2) : 0
out.bijun_all    = numSum > 0 ? decimalDivideCount(moneySum, numSum, 2) : 0
```

### 3. summaryMethod 中 agg 初始化需跳过 type_id='all'

summaryMethod 里遍历 billTypelist 累加各类型数据，`type_id='all'` 是汇总列，不需要从接口数据中累加，需跳过：

```javascript
_this.billTypelist.forEach(bt => {
    if (bt.type_id === 'all') return  // 消费合计是汇总列，不累加
    var tid = bt.type_id
    agg["user_" + tid] = 0
    ...
})
```

同理 `enrichRowWithRatios` 里也需跳过 `type_id='all'`（它的比例字段由 addConsumptionHeji 计算）。

### 4. 模板删除独立的消费合计列块（第 66-80 行）

```html
<!-- 删除这整个块 -->
<el-table-column label="消费合计" min-width="60" align="center" class-name="mergeBH">
    <el-table-column v-for="(subItem, index) in hejiSubColumns" ...>
    </el-table-column>
</el-table-column>
```

### 5. 删除 `hejiSubColumns` computed

不再需要。

---

## 改动摘要

| 位置 | 改动 |
|------|------|
| `data.billTypelist` | 首位加入 `{type_id: 'all', name: "消费合计"}` |
| `methods.addConsumptionHeji` | 字段名从 `*_heji` 改为 `*_all` |
| `methods.summaryMethod` | agg 初始化循环跳过 `type_id==='all'` |
| `methods.enrichRowWithRatios` | 循环跳过 `type_id==='all'` |
| `computed.hejiSubColumns` | 删除 |
| 模板第 66-80 行 | 删除独立消费合计列块 |

### 6. 图表双Y轴：消费合计用右轴，其余用左轴

**formatData 中创建 series 时**，对 `type_id==='all'` 的 series 指定 `yAxisIndex: 1`，其余保持默认（`yAxisIndex: 0`）：

```javascript
Object.keys(newShowObj).forEach((item, index) => {
    var isAll = item === 'all'
    demo.series[item] = createSeriesWithDynamicMarkArea(newShowObj[item], {
        color: this.colors[index],
        areaStyle: {color: this.area_colors[index]},
        initialBorderWidth: 10,
        borderColor: "#FFF5EE",
        yAxisIndex: isAll ? 1 : 0   // 消费合计用右轴
    })
})
```

**drawCharts 中 yAxis 配置**已有两个轴（第 328-343 行），右轴（index 1）当前为空对象，补充样式：

```javascript
yAxis: [
    {   // 左轴：各 billType
        type: "value",
        splitLine: {show: true, lineStyle: {color: "#e1e1e1", width: 1, type: "dashed"}},
        axisLine: {show: true},
        axisTick: {show: true}
    },
    {   // 右轴：消费合计
        type: "value",
        axisLine: {show: true},
        axisTick: {show: true},
        splitLine: {show: false}
    }
]
```

同时 `grid.right` 从 `"40"` 适当加宽到 `"60"` 防止右轴标签被截断。

---

## 验证方式

1. 表头第一列（时间后）显示「消费合计」，包含 6 个子列
2. 后续互动直播/付费帖/周卡/三日卡列正常显示
3. 表尾合计行消费合计数据正确
4. 图表左轴对应各 billType 折线，右轴对应消费合计折线
