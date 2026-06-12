# 进度日志

## 2026-05-22 14:53
- 开始任务，创建规划文件
- 完成调研：searchResource 用法、现有组件模式、API 设计

## 2026-05-22 15:20
- 任务1: predictor.js 追加 `abandoned_match_black_list` 和 `abandoned_match_black_save` ✓
- 任务2: 创建 `matchBlackAbandonedDialog.vue` 弹窗组件 ✓
- 任务3: matchList.vue 3 处修改（import + components + showBlackList 传 sport_id）✓
- 全部使用 `function() {}.bind(this)` 模式，无 ES2020+ 语法