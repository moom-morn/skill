---
name: requesting-code-review
description: 完成任务、实现主要功能或在合并之前验证工作满足需求时使用
---

# 请求代码审查

派发一个代码审阅子代理，在问题级联之前捕获它们。审阅者获得精心构造的上下文用于评估——永远不会拿到你会话的历史记录。这使审阅者聚焦于工作产物而不是你的思考过程，并为你自己的继续工作保留了上下文。

**核心原则：** 早期审阅，频繁审阅。

## 何时请求审查

**必须：**
- 子代理驱动开发中每个任务之后
- 完成主要功能之后
- 合并到 main 之前

**可选但有价值：**
- 卡住时（新视角）
- 重构之前（基线检查）
- 修复复杂 bug 之后

## 如何请求

**1. 获取 git SHA：**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # 或 origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. 派发代码审阅子代理：**

使用 Task 工具，类型为 `general-purpose`，填充 `code-reviewer.md` 中的模板

**占位符：**
- `{DESCRIPTION}` — 你构建内容的简要总结
- `{PLAN_OR_REQUIREMENTS}` — 它应该做什么
- `{BASE_SHA}` — 起始提交
- `{HEAD_SHA}` — 结束提交

**3. 处理反馈：**
- Critical 问题立即修复
- Important 问题在继续之前修复
- Minor 问题标注稍后处理
- 审阅者错了就反对（附上理由）

## 示例

```
[刚完成第 2 个任务：添加验证函数]

你：让我在继续之前请求代码审查。

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[派发代码审阅子代理]
  DESCRIPTION: 添加了 verifyIndex() 和 repairIndex()，支持 4 种问题类型
  PLAN_OR_REQUIREMENTS: 来自 docs/superpowers/plans/deployment-plan.md 的第 2 个任务
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[子代理返回]：
  优点：架构干净，真实的测试
  问题：
    Important: 缺少进度指示器
    Minor: 魔数（100）用于报告间隔
  评估：可以继续

你：[修复进度指示器]
[继续到第 3 个任务]
```

## 与工作流程集成

**子代理驱动开发：**
- 每个任务之后审阅
- 在问题叠加之前捕获
- 在进入下一任务之前修复

**执行计划：**
- 每个任务之后或自然检查点审阅
- 获取反馈，应用，继续

**临时开发：**
- 合并之前审查
- 卡住时审查

## 红灯信号

**永远不要：**
- 因为"很简单"就跳过审查
- 忽略 Critical 问题
- 在 Important 问题未修复时继续
- 与有效的技术反馈争论

**如果审阅者错了：**
- 用技术推理反对
- 展示证明它工作的代码/测试
- 请求澄清

模板见：requesting-code-review/code-reviewer.md