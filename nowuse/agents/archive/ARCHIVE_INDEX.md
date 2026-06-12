# 项目归档索引

记录所有已完成并归档的项目，便于后续查询和复用方案。

---

## 已归档项目列表

### 10. 预测购物车组件
- **完成日期**: 2026-05-15
- **项目类型**: 功能需求
- **涉及文件**: `src/views/match/components/match_cart/edit_match_cart.vue`、`src/views/match/components/match_cart/editPrediction.vue`、`src/api/match.js`
- **核心功能**: 购物车主弹框（API 获取/保存方案列表，el-card 展示，标题跳详情）；子弹框 tabs 切换单关/串关/足彩，在售校验（match_status=0），多选后追加去重到主列表
- **关键逻辑**: 在售判断-单关看 `item.match.match_status`，串关/足彩看 `item.match_list[0].match_status`；normalizeCartItem 统一 mainMatch 用于展示首场信息
- **可复用**: el-tabs 切换子列表组件（v-if 挂载/卸载自动清空选中）；多选后 emit success + handleConfirm 追加去重模式
- **文档位置**: `archive/prediction-cart-2026-05-15/`

### 9. 人群包使用报表弹框
- **完成日期**: 2026-05-12
- **项目类型**: 功能需求
- **涉及文件**: `src/views/push/components/segmentRuleReport.vue`（新建）、`src/api/push.js`、`src/views/push/list.vue`、`searchKey/compKey/push.js`、`searchTopKey/topKeyItem/push.js`
- **核心功能**: drag-dialog 弹框展示人群包使用报表，newMySearch 仅 created_at 参数（默认值 setClickShortcutsTime(3)），el-table 展示 rule_id/rule_name/use_count，在 list.vue showReport() 触发
- **可复用**: 弹框内使用 newMySearch 的模式（source key 需同时在 compKey 和 topKeyItem 两个配置文件中添加）；接口仅传 search_cond 不带分页参数的模式
- **文档位置**: `archive/人群包使用报表弹框-2026-05-12/`

### 8. 篮球热门球员弹框组件
- **完成日期**: 2026-05-12
- **项目类型**: 功能需求
- **涉及文件**: `src/views/match/basketball/components/bkHotPlayerList.vue`、`src/api/matchapi/ball/basketball.js`
- **核心功能**: drag-dialog 弹框展示热门球员列表，支持通过 searchResource 添加（单选/多选）、$confirm 确认后删除
- **可复用**: searchResource 篮球模式打开方式（sportId=2）、增删合并为单一 POST 接口模式
- **文档位置**: `archive/bkHotPlayerList/README.md`

### 7. 黑名单圈子本地筛选
- **归档日期**: 2026-05-09
- **项目类型**: 功能需求（待实现）
- **目标文件**: `src/views/forum/postList.vue`
- **核心需求**: `isPoolBlack` 模式下，从 `tablePoolList` 收集 `catalog_id` 生成下拉选项，本地过滤后沿用 `formatPool` 排序分页
- **关键实现**: `poolBlackCatalogFilter`、`poolBlackCatalogOptions`、`rebuildPoolBlackCatalogOptions()`、`getPoolBlackFilteredList()`、工具条 `el-select`
- **状态**: ⬜ 所有 todos 均为 pending，尚未实现
- **文档位置**: `archive/黑名单圈子本地筛选-2026-05-09/task_plan.md`

### 6. MD5 性能对比测试（console 日志）
- **完成日期**: 2026-05-08
- **项目类型**: 调试工具 / 性能测试
- **核心成果**:
  - 在 `calculateFileMD5` 内加入计时日志
  - SDK 分片上传时自动同时跑串行+并行，控制台输出耗时对比和提速百分比
  - 直传文件只打串行耗时
- **日志格式**: `[MD5对比] video.mp4 (256MB) 原串行: 1840ms 新并行: 620ms 提速: 66.3%`
- **文档位置**: `archive/md5-benchmark-2026-05-08/task_plan.md`

### 5. MD5 CPU+I/O 全并行（生产方案）
- **完成日期**: 2026-05-08
- **项目类型**: 性能优化
- **目标文件**: `src/utils/parallel-hash.js`、`src/utils/chunk-md5.worker.js`
- **核心成果**:
  - Worker 内联 SparkMD5 源码，各分片 CPU+I/O 全并行
  - Worker 逻辑拆分到独立文件 `chunk-md5.worker.js`，通过 `raw-loader` 引入
  - 分片大小固定 2MB，同文件结果稳定
  - 线程数 = min(CPU核数, 分片数)，超出部分轮询复用 Worker
- **预期提速**: 大文件 60%~80%
- **注意**: 结果非标准整文件 MD5，仅适用于 OSS 文件名生成（仅后台，无跨端要求）
- **文档位置**: `archive/md5-parallel-cpu-chunk-2026-05-08/task_plan.md`

### 4. MD5 并行 I/O 读取（过渡方案，已被方案5替代）
- **完成日期**: 2026-05-08
- **项目类型**: 性能优化 / 中间过渡方案
- **核心成果**:
  - Worker 并行读取各分片 ArrayBuffer，主线程按顺序 append SparkMD5
  - 结果与原串行方法完全一致（标准整文件 MD5）
  - 提速约 20%~70%（仅 I/O 并行，CPU 仍串行）
- **为何废弃**: CPU 计算未并行，方案5 提速更大
- **适用场景**: 需要与其他端保持标准 MD5 一致时可恢复此方案
- **文档位置**: `archive/md5-parallel-io-read-2026-05-08/task_plan.md`

### 3. Thunder Cup 分组数据补齐
- **完成日期**: 2026-04-28
- **项目类型**: Bug 修复 / 功能增强
- **目标组件**: `src/views/active/components/thunderCup/thunderCupGroupStage.vue`
- **核心成果**:
  - 实现 groups 长度动态补齐（groups < maxGroups 时补空组）
  - 支持轮次相关的每组人数规则（stage=5, round=2 时 3 人，其他情况 4 人）
  - 改造 saveAll 校验逻辑为动态支持不同每组人数
  - 行号修改: 148-198 (getRank)、236-246 (saveAll)
- **技术亮点**:
  - 动态计算 playersPerGroup（根据 stage 和 round 判断）
  - 支持轮次感知的业务规则
  - 完整的 groups 和 rank 两维度补齐逻辑
  - 保证 Node 12 兼容性（无 `?.` / `??`）
- **核心规则**:
  - stage=4: 12组，每组4人
  - stage=5, round=1: 8组，每组4人
  - stage=5, round=2: 8组，每组3人 ✨
- **文档位置**: `archive/thundercup-groupstage-补齐/`
  - [task_plan.md](thundercup-groupstage-补齐/task_plan.md) - 需求和验证标准
  - [findings.md](thundercup-groupstage-补齐/findings.md) - 代码分析和修改方案
  - [progress.md](thundercup-groupstage-补齐/progress.md) - 实现进度和两阶段审查

### 2. searchResource.vue 懒加载优化
- **完成日期**: 2026-04-27
- **项目类型**: 性能优化
- **目标组件**: `src/components/leisu/searchResource/searchResource.vue`
- **核心成果**:
  - 45+ 个子组件从同步导入改为动态导入（懒加载）
  - 删除 96 行代码（3 处废弃注释块 + 54 行同步 import）
  - 按类别分组组件声明，提升可读性（6 个分组：比赛类、帖子类、赛事/队伍/球员等）
  - 新增 searchFields 分类说明注释，便于开发维护
  - 文件行数减少 19.6%（490 → 394 行）
- **技术亮点**:
  - Vue 2.6 dynamic import 模式（项目已有先例验证）
  - 按功能类别分组组织代码
  - 删除已注释备用代码，提升代码清晰度
- **性能提升**:
  - 首屏 bundle size 预期减少 15-30%
  - 组件首次加载延迟 < 100ms（可接受）
- **文档位置**: `archive/projects/searchResource-lazy-loading-2026-04-27/`
  - [task_plan.md](projects/searchResource-lazy-loading-2026-04-27/task_plan.md) - 任务规划
  - [findings.md](projects/searchResource-lazy-loading-2026-04-27/findings.md) - 调查发现与兼容性分析
  - [progress.md](projects/searchResource-lazy-loading-2026-04-27/progress.md) - 详细进度与执行记录

### 1. 消费合计并入 billTypelist
- **完成日期**: 2026-04-23
- **项目类型**: 功能重构
- **目标组件**: `src/views/forum/components/interactChargeReport/postDiffPayFlow.vue`
- **核心成果**: 
  - 将消费合计从独立的 hejiSubColumns 集成到 billTypelist 数据结构
  - 统一数据字段命名为 `*_all` 格式
  - 实现了图表双Y轴展示（消费合计右轴，其他类型左轴）
  - 解决了对象键序列化问题，确保 'all' 类型始终排在最前
- **技术亮点**: 
  - 动态列生成 (buildSubColumns 方法)
  - ECharts 双Y轴集成
  - 对象键插入顺序控制
- **文档位置**: `archive/消费合计并入billTypelist/`
  - [PLAN.md](消费合计并入billTypelist/PLAN.md) - 详细实现计划
  - [findings.md](消费合计并入billTypelist/findings.md) - 项目成果总结
  - [progress.md](消费合计并入billTypelist/progress.md) - 详细进度报告

---

## 归档方案复用指南

### 轮次感知的业务规则（来自项目 #3）
**适用场景**: 不同轮次需要不同的配置规则（如组数、每组人数等）
```javascript
// 根据 stage 和 round 动态计算规格
const maxGroups = this.stageData.stage === 4 ? 12 : 8
const playersPerGroup = 
    this.stageData.stage === 4 ? 4 : 
    (this.activeRound === '2' ? 3 : 4)

// 使用这些参数进行数据补齐
groups = groups.map(g => {
    if (g.rank.length < playersPerGroup) {
        // 补齐到 playersPerGroup
    }
})
```

### 二维度数据补齐（来自项目 #3）
**适用场景**: 需要同时处理集合长度和单个元素内部结构的不完整问题
```javascript
// 第 1 步：补齐或截断每个元素内部的数据
items = items.map(item => {
    if (item.subitems.length < expectedCount) {
        // 补充空数据
    }
    return item
})

// 第 2 步：补齐或截断集合本身的长度
if (items.length < maxCount) {
    // 补充空集合
}
```

### 对象键序列化问题（来自项目 #1）
**适用场景**: 需要控制 JavaScript 对象属性显示顺序时
```javascript
// 需要 'all' 排在最前
const result = {all: value}
Object.assign(result, otherProperties)
```

### 双Y轴图表配置（来自项目 #1）
**适用场景**: ECharts 需要展示多个不同量级或单位的数据
```javascript
// 在 series 创建时指定 yAxisIndex
yAxisIndex: isAll ? 1 : 0

// yAxis 配置两个轴
yAxis: [
  {type: "value", ...}, // 左轴
  {type: "value", ...}  // 右轴
]
```

### 动态列生成（来自项目 #1）
**适用场景**: 表格列数动态变化，需要统一列生成逻辑
```javascript
buildSubColumns(prefix) {
  return [
    {key: `user_${prefix}`, label: '人'},
    {key: `num_${prefix}`, label: '笔'},
    // ...
  ]
}
```

---

## 使用建议

1. **启动新项目前**: 查阅此索引，寻找相似项目的方案
2. **代码复用**: 参考已归档项目的代码模式和解决方案
3. **知识积累**: 整理项目中的技术亮点，供后续参考
