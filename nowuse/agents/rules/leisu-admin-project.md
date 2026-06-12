---
description: Project coding standards for leisu_admin (Vue 2 + Element UI + Node 12). Apply when working on .vue or .js files in this project.
globs:
  - "**/*.vue"
  - "**/*.js"
alwaysApply: true
---

## 技术栈
Vue 2 选项式 API + Element UI + axios + dayjs + xlsx，Node 12

## 工具识别（自动判断）
规则文件是三处工具共用的同一份物理文件。各工具通过检查项目根目录下各自的专属文件/目录来自动判断：
- 存在 `.qoder/repowiki/` → 当前是 **Qoder**
- 存在 `.claude/memory/` → 当前是 **Claude Code**
- 存在 `.cursor/hooks.json` → 当前是 **Cursor**
- 以上均不匹配 → 默认无专属行为

## 强制约束
- 禁止 `<script setup>`、Composition API、Vue 3 语法
- 禁止 `?.` `??` 等 ES2020+ 语法
- 组件库：`el-form`、`el-table`、`el-pagination`
- 分页字段：`pageNum` / `pageSize` / `total`（默认 1 / 10 / 0）
- 接口文件放 `src/api/`，使用 axios 封装，内含 `try/catch`
- 弹窗用 `visible.sync` 控制，关闭时重置表单（可选 `drag-dialog` 用法与 `el-dialog` 一致）
- 样式加 `scoped`；缩进 2 空格；字符串用单引号
- 方法命名：`handleXXX` / `getXXXList` / `submitXXX` / `exportXXX`
- 日期处理用 dayjs；Excel 导出用 xlsx
- 函数参数、返回值、每一行代码作用加注释
- 组件文件名：`xxx.vue`
- 声明变量时用 `const` 或 `let`，禁止用 var
- 禁止自动修改代码，每次修改都要经过我同意
- 禁止自动提交 git，代码全部由我手动推送
- 进入 /plan 或 /planning-with-files 模式后，未经用户同意禁止自动退出；如需退出必须先向用户确认，等待用户允许后再退出，默认保持模式待命等待后续需求补充
- 回复加前缀：`Cursor:`

## 输出要求
给完整可运行代码；交互操作处加 `$message` / `$confirm`；贴合现有目录结构。

## 输出前自检清单（Karpathy 4 条）
改动完成前，对照以下 4 点自检：

- [ ] **最少代码原则**：代码是否是解决问题的最少量？有没有未被要求的功能？
- [ ] **追溯原则**：每行改动是否都能追溯到用户的具体需求？或者是"顺手优化"？
- [ ] **精确改动**：有没有顺手"优化"不相关的代码（格式、注释、dead code）？禁止。
- [ ] **验证标准**：成功标准是否明确？用户能通过什么方式验证完成了？

**违反此清单的常见错误：** 范围蔓延、返工、用户反馈"改了不该改的"