# Skill 同步操作指南

本文档说明如何在本地项目、Cursor Skill 和 GitHub 之间进行双向同步。

## 1. 同步目标

当前项目把本地目录 `SearchSkill/` 作为 Skill 源目录，并与下面的 Cursor 全局目录同步：

```text
~/.cursor/skills/newsearch-component-refactor/
```

同步文件如下：

| 本地项目 | Cursor Skill |
| --- | --- |
| `SearchSkill/SKILL.md` | `~/.cursor/skills/newsearch-component-refactor/SKILL.md` |
| `SearchSkill/reference.md` | `~/.cursor/skills/newsearch-component-refactor/reference.md` |
| `SearchSkill/checklist.md` | `~/.cursor/skills/newsearch-component-refactor/checklist.md` |

这些映射定义在 `skill-sync.config.json` 中。

## 2. 前置要求

- 已安装 Node.js 20 或更高版本
- 本地仓库已经配置好 GitHub 远端
- 在 Cursor 终端或系统终端中进入项目根目录

```bash
cd "/Users/chenwen/办公/skill"
```

## 3. 首次初始化

如果这是你第一次使用这套同步方案，建议先执行下面的命令：

```bash
npm run sync:to-skill
```

这个命令会：

- 自动创建 `~/.cursor/skills/newsearch-component-refactor/`
- 把本地 Skill 文件复制到 Cursor Skill 目录

执行完成后，你就可以在 Cursor 中使用这份 Skill。

## 4. 命令说明

### `npm run sync:to-skill`

用途：本地项目 -> Cursor Skill

适用场景：

- 你刚修改了 `SearchSkill/` 下的文档
- 你想把本地版本发布到 Cursor 使用

执行效果：

- 读取 `skill-sync.config.json`
- 按映射把本地文件复制到 `~/.cursor/skills/newsearch-component-refactor/`

### `npm run sync:from-skill`

用途：Cursor Skill -> 本地项目

适用场景：

- 你直接修改了 Cursor 全局 Skill
- 你希望把 Cursor 中的最新版本回写到仓库

执行效果：

- 从 `~/.cursor/skills/newsearch-component-refactor/` 复制文件回本地 `SearchSkill/`
- 如果 Cursor Skill 目录不存在，会直接报错并停止

### `npm run sync:github`

用途：本地项目 <-> GitHub

执行流程：

1. 读取当前 Git 分支
2. 从 `origin/<当前分支>` 拉取最新内容
3. 执行 `git add .`
4. 检查是否有待提交变更
5. 如果有变更，自动生成提交信息并推送到 GitHub

说明：

- 该命令不会强制写死 `main`
- 会按你当前所在分支执行同步
- 如果没有本地变更，会提示并结束，不会空提交

### `npm run sync:publish`

用途：本地项目 -> Cursor Skill -> GitHub

适用场景：

- 你在本地改完 Skill，希望一次性发布到 Cursor 和 GitHub

### `npm run sync:pull-skill`

用途：Cursor Skill -> 本地项目 -> GitHub

适用场景：

- 你在 Cursor 里改完 Skill，希望一次性回写到仓库并同步到 GitHub

## 5. 推荐工作流

### 场景 A：你在本地仓库里修改了 Skill

执行：

```bash
npm run sync:publish
```

结果：

- Cursor Skill 更新
- GitHub 更新

### 场景 B：你在 Cursor 里直接改了 Skill

执行：

```bash
npm run sync:pull-skill
```

结果：

- 本地仓库更新
- GitHub 更新

### 场景 C：你只想同步 GitHub，不动 Skill

执行：

```bash
npm run sync:github
```

## 6. 兼容旧命令

为了兼容你原来的使用习惯，保留了两个旧入口：

- `node sync.js`
  - 等价于 `npm run sync:github`
- `node push-skills.js`
  - 等价于 `npm run sync:publish`

推荐后续统一使用 `npm run` 命令，便于记忆和扩展。

## 7. 常见问题

### 7.1 提示 `Cursor Skill 目录不存在`

原因：你还没有把本地 Skill 首次发布到 Cursor 目录。

处理：

```bash
npm run sync:to-skill
```

### 7.2 GitHub 同步时报冲突

原因：远端分支和本地分支存在冲突，`git pull` 无法自动合并。

处理方式：

1. 先手动解决冲突
2. 确认本地代码无误
3. 再重新执行同步命令

### 7.3 没有生成 commit

原因：脚本检测到没有本地变更。

这是正常行为，脚本不会创建空提交。

### 7.4 想增加新的同步文件

处理方式：

编辑 `skill-sync.config.json`，在 `files` 中增加映射项，例如：

```json
{
  "source": "examples.md",
  "target": "examples.md"
}
```

然后重新执行同步命令。

## 8. 维护建议

- 把本地仓库作为最终版本源
- 把 Cursor Skill 作为运行时副本
- 把 GitHub 作为备份和共享入口
- 需要新增 Skill 文件时，优先先改 `skill-sync.config.json`
