---
name: 工作目录根的 .claude 规则
description: 所有 .claude 操作必须跟随当前工作目录，不混用层级
type: feedback
---

## 规则

**优先级最高**：当前工作目录在哪，`.claude` 的所有操作（归档、规划、memory、task等）就在哪

**禁止**: 混用不同层级的 `.claude` 目录

## 具体例子

- 在 `/Users/chenwen/leisu_admin` 工作 → 使用 `/Users/chenwen/leisu_admin/.claude/`
- 在 `/Users/chenwen/` 工作 → 使用 `/Users/chenwen/.claude/`

## Why

保持工作目录和文件存储位置的一致性，避免项目文件散落到全局或混在一起，造成查找和管理混乱。

## How to apply

- 每次操作前检查当前工作目录（git status 显示的根目录）
- 所有归档、规划文件、memory 记录都写到该目录的 `.claude/` 下
- 不要在多个层级的 `.claude` 目录中重复创建相同项目的文件
