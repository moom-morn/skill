---
name: using-git-worktrees
description: 当开始需要与当前工作空间隔离的功能工作，或在执行实现计划之前使用 - 通过原生工具或 git worktree 兜底确保隔离的工作空间存在
---

# 使用 Git Worktrees

## 概述

确保工作在隔离的工作空间中进行。优先使用平台的原生 worktree 工具。仅在无原生工具可用时兜底使用手动 git worktrees。

**核心原则：** 先检测已有隔离。然后使用原生工具。然后兜底用 git。永远不要与 harness 对抗。

**开始时声明：** "我将使用 using-git-worktrees 技能来设置隔离的工作空间。"

## 第 0 步：检测已有隔离

**在创建任何东西之前，检查你是否已在隔离的工作空间中。**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**子模块防护：** `GIT_DIR != GIT_COMMON` 在 git 子模块内部也为真。在得出"已在 worktree 中"的结论之前，验证你不在子模块中：

```bash
# 如果这返回一个路径，你在子模块中，而不是 worktree——当作普通仓库处理
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**如果 `GIT_DIR != GIT_COMMON`（且不在子模块中）：** 你已在链接的 worktree 中。跳到第 3 步（项目设置）。不要再创建 worktree。

报告分支状态：
- 在分支上："已在隔离的工作空间 `<path>`，分支 `<name>`。"
- 分离 HEAD："已在隔离的工作空间 `<path>`（分离 HEAD，外部管理）。完成时需要创建分支。"

**如果 `GIT_DIR == GIT_COMMON`（或在子模块中）：** 你在普通仓库中。

你的指令中用户是否已表明 worktree 偏好？如果没有，在创建 worktree 之前征得同意：

> "你想让我设置一个隔离的 worktree 吗？它可以保护你当前的分支不受改动影响。"

如果已有声明的偏好，直接遵循，无需询问。如果用户拒绝同意，在当前目录工作并跳到第 3 步。

## 第 1 步：创建隔离的工作空间

**你有两种机制。按此顺序尝试。**

### 1a. 原生 Worktree 工具（优先）

用户已要求隔离的工作空间（第 0 步已获同意）。你是否有创建 worktree 的方式？可能是一个叫 `EnterWorktree`、`WorktreeCreate` 的工具，或 `/worktree` 命令，或 `--worktree` 参数。如果有，使用它并跳到第 3 步。

原生工具自动处理目录位置、分支创建和清理。在有原生工具的情况下使用 `git worktree add` 会产生你的 harness 看不见也无法管理的幻影状态。

只有在你没有原生 worktree 工具可用时才继续第 1b 步。

### 1b. Git Worktree 兜底

**仅当第 1a 步不适用时才使用此方法**——你没有原生 worktree 工具可用。使用 git 手动创建 worktree。

#### 目录选择

按此优先级执行。明确的用户偏好总是胜过观察到的文件系统状态。

1. **检查你的指令中是否有声明的 worktree 目录偏好。** 如果用户已指定，直接使用，无需询问。

2. **检查已有的项目本地 worktree 目录：**
   ```bash
   ls -d .worktrees 2>/dev/null     # 优先（隐藏）
   ls -d worktrees 2>/dev/null      # 备选
   ```
   如果找到，使用它。如果两者都存在，`.worktrees` 优先。

3. **检查已有的全局目录：**
   ```bash
   project=$(basename "$(git rev-parse --show-toplevel)")
   ls -d ~/.config/superpowers/worktrees/$project 2>/dev/null
   ```
   如果找到，使用它（向后兼容旧的全局路径）。

4. **如果没有其他指导可用**，默认使用项目根目录下的 `.worktrees/`。

#### 安全检查（仅项目本地目录）

**在创建 worktree 之前必须验证目录已被忽略：**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**如果未被忽略：** 添加到 .gitignore，提交改动，然后继续。

**为什么这很重要：** 防止意外提交 worktree 内容到仓库。

全局目录（`~/.config/superpowers/worktrees/`）不需要验证。

#### 创建 Worktree

```bash
project=$(basename "$(git rev-parse --show-toplevel)")

# 根据所选位置确定路径
# 项目本地：path="$LOCATION/$BRANCH_NAME"
# 全局：path="~/.config/superpowers/worktrees/$project/$BRANCH_NAME"

git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**沙箱兜底：** 如果 `git worktree add` 因权限错误失败（沙箱拒绝），告诉用户沙箱阻止了 worktree 创建，你将在当前目录中工作。然后在原地运行设置和基线测试。

## 第 3 步：项目设置

自动检测并运行适当的设置：

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

## 第 4 步：验证干净的基线

运行测试确保工作空间开始状态干净：

```bash
# 使用项目适当的命令
npm test / cargo test / pytest / go test ./...
```

**如果测试失败：** 报告失败，询问是继续还是调查。

**如果测试通过：** 报告就绪。

### 报告

```
Worktree 就绪于 <full-path>
测试通过（<N> 个测试，0 个失败）
准备好实现 <feature-name>
```

## 快速参考

| 情况 | 动作 |
|------|------|
| 已在链接 worktree 中 | 跳过创建（第 0 步） |
| 在子模块中 | 当作普通仓库处理（第 0 步防护） |
| 有原生 worktree 工具 | 使用它（第 1a 步） |
| 无原生工具 | Git worktree 兜底（第 1b 步） |
| `.worktrees/` 已存在 | 使用它（验证已被忽略） |
| `worktrees/` 已存在 | 使用它（验证已被忽略） |
| 两者都存在 | 使用 `.worktrees/` |
| 两者都不存在 | 检查指令文件，然后默认 `.worktrees/` |
| 全局路径已存在 | 使用它（向后兼容） |
| 目录未被忽略 | 添加到 .gitignore + 提交 |
| 创建时权限错误 | 沙箱兜底，当前目录工作 |
| 基线测试失败 | 报告失败 + 询问 |
| 无 package.json/Cargo.toml | 跳过依赖安装 |

## 常见错误

### 与 harness 对抗

- **问题：** 当平台已经提供隔离时使用 `git worktree add`
- **修复：** 第 0 步检测已有隔离。第 1a 步优先使用原生工具。

### 跳过检测

- **问题：** 在已有 worktree 内部创建嵌套 worktree
- **修复：** 在创建任何东西之前总是运行第 0 步

### 跳过忽略验证

- **问题：** Worktree 内容被追踪，污染 git 状态
- **修复：** 在创建项目本地 worktree 之前总是使用 `git check-ignore`

### 假定目录位置

- **问题：** 造成不一致，违反项目约定
- **修复：** 遵循优先级：已有的 > 全局遗留 > 指令文件 > 默认

### 测试失败时继续

- **问题：** 无法区分新 bug 和预先存在的问题
- **修复：** 报告失败，获得明确许可后再继续

## 红灯信号

**永远不要：**
- 在第 0 步检测到已有隔离时创建 worktree
- 在有原生 worktree 工具时使用 `git worktree add`（例如 `EnterWorktree`）。这是 #1 错误——如果你有这个工具，就用它。
- 跳过第 1a 步直接跳到第 1b 步的 git 命令
- 创建 worktree 而不验证它已被忽略（项目本地）
- 跳过基线测试验证
- 在不询问的情况下以测试失败继续

**始终：**
- 先运行第 0 步检测
- 优先使用原生工具而不是 git 兜底
- 遵循目录优先级：已有的 > 全局遗留 > 指令文件 > 默认
- 项目本地 worktree 验证目录已被忽略
- 自动检测并运行项目设置
- 验证干净的测试基线