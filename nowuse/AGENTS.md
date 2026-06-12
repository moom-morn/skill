# Codex Project Instructions

本项目的规则与技能统一维护在 `agents/` 目录。`AGENTS.md` 只作为 Codex 入口适配层，不作为第二套规则源。

## 必读规则

开始处理本项目任务前，先读取并遵守：

- `agents/rules/cursor-core.md`
- `agents/rules/leisu-admin-project.md`
- `agents/rules/jsdoc-zs-trigger.md`

其中 `agents/rules/` 是项目规则唯一维护位置；不要创建或维护 `.codex/rules`。

## 专项技能

遇到对应任务时，读取并按 `agents/skills/` 下的技能执行：

- `agents/skills/planning-with-files/SKILL.md`：复杂任务规划、长链路执行、研究排查、进度跟踪。
- `agents/skills/newsearch-component-refactor/SKILL.md`：Vue 2 列表页改造、接入 `newMySearch`、表格排序、动态高度、时间格式化。
- `agents/skills/sls-logs-multi-condition/SKILL.md`：`sls_logs_list` 场景多条件查询拼装、分页总数双查询、结果标准化。
- `agents/skills/multi-condition-query-pattern.md`：列表页多条件查询参数流转参考。
- `agents/skills/writing-plans/SKILL.md`：多步骤实现计划。
- `agents/skills/systematic-debugging/SKILL.md`：系统化排查 bug 或测试失败。
- `agents/skills/test-driven-development/SKILL.md`：实现功能或修复 bug 时的测试驱动流程。
- `agents/skills/requesting-code-review/SKILL.md` 与 `agents/skills/receiving-code-review/SKILL.md`：代码审查相关任务。

## 核心硬规则

- 默认使用简体中文回复。
- 技术栈为 Vue 2 选项式 API、Element UI、axios、dayjs、xlsx，运行环境兼容 Node 12。
- 禁止使用 Vue 3、Composition API、`<script setup>`。
- 禁止使用 `?.`、`??` 等 ES2020+ 语法。
- 默认做最小必要改动；每行改动都应能追溯到用户需求。
- 不主动修改无关代码，不做顺手格式化、重构或清理。
- 不自动提交 git；提交、推送等操作必须由用户明确要求。
- 用户限定当前文件或单文件时，只读写该文件，除非用户明确允许扩展范围。
- 复杂需求先做计划，确认范围和关键决策后再实现。
-

