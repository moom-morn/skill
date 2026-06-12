# 任务：predictor 比赛列表 - 自动黑名单弹窗

## 目标
在 `matchList.vue` 的 `showBlackList()` 方法中，新建 `matchBlackAbandonedDialog` 弹窗组件，
实现比赛自动黑名单的增删管理。

## 阶段

### 阶段 1：API 接口
- [x] 在 `src/api/predictor.js` 新增 `abandoned_match_black_list`（GET）、`abandoned_match_black_save`（POST）
- 状态：complete ✓

### 阶段 2：弹窗组件
- [x] 创建 `src/views/predictor/components/matchBlackAbandonedDialog.vue`
- [x] 组件包含：添加按钮、多选、批量删除、el-table 渲染、searchResource 搜索、删除按钮
- 状态：complete ✓

### 阶段 3：父组件注册
- [x] 在 `matchList.vue` 中 import 并注册 matchBlackAbandonedDialog 组件
- [x] showBlackList 传入 sport_id
- 状态：complete ✓

## 关键决策
- sport_id 来自 `listQuery.search_cond.sport_id`（父组件传递）
- 添加按钮与批量删除按钮用 `v-if` 互斥（根据是否有 selection 选中）
- searchResource 用 `@setList` 拿到多选结果，过滤掉已在表中的 match_id，调用 save 接口