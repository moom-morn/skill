# searchResource.vue 懒加载优化 - 任务规划

## 项目概述
- **目标**：将 searchResource.vue 的 45+ 个子组件从同步导入改为懒加载，减少首屏 bundle size
- **范围**：仅修改 `src/components/leisu/searchResource/searchResource.vue`，不涉及子组件改动
- **优先级**：中等（性能优化，无功能变化）

## 任务分解

### Task 1: 代码改动
- [x] 删除 54 行同步 import 语句
- [x] 改写 components 选项为懒加载形式（45+ 个组件，按类别分组）
- [x] 保留 resourceTextJump 的同步导入（依赖关键）

### Task 2: 结构清理
- [x] 删除 3 处已注释的备用 searchMatchCorrelation 代码块
  - season 区块（12 行）
  - competition 区块（11 行）
  - team 区块（13 行）
- [x] 精简 JSDoc 注释，移除伪代码示例

### Task 3: 可读性提升
- [x] 添加 searchFields 值分类说明注释（6 个分类）
- [x] 按类别分组注释 components 对象（比赛类、帖子类、赛事/队伍/球员等）

### Task 4: 验证
- [x] 语法检查（Vue 格式正确）
- [ ] 功能验证（需要 npm run dev，手动打开弹窗测试）

## 关键文件清单
- `src/components/leisu/searchResource/searchResource.vue`（主要改动）
- `src/components/leisu/searchResource/searchDependence/` （子组件，仅读取验证）

## 改动数据
- **文件行数**：490 → 394（-96 行，-19.6%）
- **删除同步 import**：54 行
- **删除废弃注释块**：36 行
- **新增注释**：10 行（searchFields 说明）

## 风险&约束
- ⚠️ 懒加载可能导致首次打开弹窗时有轻微延迟（通常 < 100ms）
- ✅ 项目已有多个组件使用此写法（oddDialog.vue、history.vue），兼容性有保证
- ✅ Vue 2.6 原生支持 dynamic import

## 参考资源
- 相关先例：`src/views/match/components/oddDialog.vue`（已使用懒加载）
- 项目规范：`.claude/CLAUDE.md`（技术栈）、`.claude/rules/RULES.md`（工作流）

## 状态
- **当前阶段**：执行完成
- **完成度**：100%（代码改完，待手动验证）
