---
name: finishing-a-development-branch
description: 当实现完成、所有测试通过，需要决定如何整合工作时使用 - 指导开发工作的完成，提供结构化的合并、PR 或清理选项
---

# 完成开发分支

## 概述

指导开发工作的完成：呈现清晰的选项并处理所选的工作流程。

**核心原则：** 验证测试 → 检测环境 → 呈现选项 → 执行选择 → 清理。

**开始时声明：** "我将使用 finishing-a-development-branch 技能来完成这项工作。"

## 流程

### 第一步：验证测试

**在呈现选项之前，验证测试通过：**

```bash
# 运行项目测试套件
npm test / cargo test / pytest / go test ./...
```

**如果测试失败：**
```
测试失败（<N> 个失败）。完成前必须修复：

[展示失败信息]

在测试通过之前无法继续合并/PR。
```

停下来。不要进入第二步。

**如果测试通过：** 继续到第二步。

### 第二步：检测环境

**在呈现选项之前确定工作空间状态：**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

这决定了显示哪个菜单以及清理方式：

| 状态 | 菜单 | 清理 |
|------|------|------|
| `GIT_DIR == GIT_COMMON`（普通仓库） | 标准 4 个选项 | 无 worktree 需要清理 |
| `GIT_DIR != GIT_COMMON`，有命名分支 | 标准 4 个选项 | 基于来源（见第六步） |
| `GIT_DIR != GIT_COMMON`，分离 HEAD | 精简 3 个选项（无合并） | 不需要清理（外部管理） |

### 第三步：确定基础分支

```bash
# 尝试常见基础分支
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

或者问："这个分支是从 main 分出来的——对吗？"

### 第四步：呈现选项

**普通仓库和命名分支 worktree — 精确呈现以下 4 个选项：**

```
实现完成。你想怎么做？

1. 合并回 <base-branch>（本地）
2. Push 并创建 Pull Request
3. 保留分支不变（我稍后处理）
4. 放弃这项工作

选哪个？
```

**分离 HEAD — 精确呈现以下 3 个选项：**

```
实现完成。你处于分离 HEAD 状态（外部管理的工作空间）。

1. Push 为新分支并创建 Pull Request
2. 保持原样（我稍后处理）
3. 放弃这项工作

选哪个？
```

**不要添加解释** — 保持选项简洁。

### 第五步：执行选择

#### 选项 1：本地合并

```bash
# 获取主仓库根目录以确保 CWD 安全
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

# 先合并 — 在移除任何东西之前确认成功
git checkout <base-branch>
git pull
git merge <feature-branch>

# 验证合并结果上的测试
<test command>

# 只有在合并成功后：清理 worktree（第六步），然后删除分支
```

然后：清理 worktree（第六步），然后删除分支：

```bash
git branch -d <feature-branch>
```

#### 选项 2：Push 并创建 PR

```bash
# Push 分支
git push -u origin <feature-branch>

# 创建 PR
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<2-3 bullets of what changed>

## Test Plan
- [ ] <verification steps>
EOF
)"
```

**不要清理 worktree** — 用户需要它活着以便在 PR 反馈上迭代。

#### 选项 3：保持原样

报告："保留分支 <name>。Worktree 保留在 <path>。"

**不要清理 worktree。**

#### 选项 4：放弃

**先确认：**
```
这将永久删除：
- 分支 <name>
- 所有提交：<commit-list>
- Worktree 在 <path>

输入 'discard' 确认。
```

等待确切的确认。

如果已确认：
```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

然后：清理 worktree（第六步），然后强制删除分支：
```bash
git branch -D <feature-branch>
```

### 第六步：清理工作空间

**仅对选项 1 和 4 运行。** 选项 2 和 3 始终保留 worktree。

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

**如果 `GIT_DIR == GIT_COMMON`：** 普通仓库，没有 worktree 需要清理。完成。

**如果 worktree 路径在 `.worktrees/`、`worktrees/` 或 `~/.config/superpowers/worktrees/` 下：** Superpowers 创建了这个 worktree——我们负责清理。

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
git worktree remove "$WORKTREE_PATH"
git worktree prune  # 自愈：清理任何过时的注册
```

**否则：** 宿主环境（harness）拥有这个工作空间。**不要**移除它。如果你的平台提供了退出工作空间的工具，使用它。否则，保持工作空间不变。

## 快速参考

| 选项 | 合并 | Push | 保留 Worktree | 清理分支 |
|------|------|------|---------------|----------|
| 1. 本地合并 | 是 | - | - | 是 |
| 2. 创建 PR | - | 是 | 是 | - |
| 3. 保持原样 | - | - | 是 | - |
| 4. 放弃 | - | - | - | 是（强制） |

## 常见错误

**跳过测试验证**
- **问题：** 合并损坏的代码，创建失败的 PR
- **修复：** 在提供选项之前总是验证测试

**开放式问题**
- **问题：** "接下来我该做什么？"太含糊
- **修复：** 精确呈现 4 个结构化选项（分离 HEAD 为 3 个）

**为选项 2 清理 worktree**
- **问题：** 移除用户迭代 PR 所需的 worktree
- **修复：** 仅为选项 1 和 4 清理

**删除分支前未移除 worktree**
- **问题：** `git branch -d` 因为 worktree 仍引用该分支而失败
- **修复：** 先合并，移除 worktree，然后删除分支

**从 worktree 内部运行 git worktree remove**
- **问题：** 当 CWD 在被删除的 worktree 内部时命令静默失败
- **修复：** 在 `git worktree remove` 之前总是 `cd` 到主仓库根目录

**清理 harness 拥有的 worktrees**
- **问题：** 移除 harness 创建的 worktree 导致幻影状态
- **修复：** 只清理 `.worktrees/`、`worktrees/` 或 `~/.config/superpowers/worktrees/` 下的 worktrees

**放弃操作没有确认**
- **问题：** 意外删除工作
- **修复：** 需要键入 "discard" 确认

## 红灯信号

**永远不要：**
- 在测试失败时继续
- 不验证合并结果上的测试就合并
- 不经确认就删除工作
- 未经明确要求就强制推送
- 在确认合并成功之前移除 worktree
- 清理不是你创建的 worktree（来源检查）
- 从 worktree 内部运行 `git worktree remove`

**始终：**
- 在提供选项之前验证测试
- 在呈现菜单之前检测环境
- 精确呈现 4 个选项（分离 HEAD 为 3 个）
- 为选项 4 获取键入确认
- 仅为选项 1 和 4 清理 worktree
- 在移除 worktree 前 `cd` 到主仓库根目录
- 移除后运行 `git worktree prune`