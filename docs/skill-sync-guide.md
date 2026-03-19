# rules + Skill 同步操作指南

本文档说明如何在本地项目、Cursor 本地目录和 GitHub 之间同步 `rules` 与多 Skill 内容。

## 1. 同步目标

本项目同步两类资源：

- `rules/`：规则目录
- `skillFile/`：Skill 根目录（每个子目录是一个 Skill）

对应 Cursor 目录：

- `~/.cursor/rules/`
- `~/.cursor/skills/`

并通过 Git 上传到 GitHub。

## 2. 前置要求

- 已安装 Node.js 20 或更高版本
- 本地仓库已配置 GitHub 远端
- 在终端进入项目根目录

```bash
cd "/Users/chenwen/办公/skill"
```

## 3. 本地目录约定

### 3.1 rules

- 本地：`rules/**`
- Cursor：`~/.cursor/rules/**`

规则目录会双向同步，目录结构保持一致。

### 3.2 skillFile

- 本地：`skillFile/<SkillName>/`
- Cursor：`~/.cursor/skills/<SkillName>/`

系统会自动扫描 `skillFile` 下所有子目录。

每个 Skill 默认同步以下文件：

- `SKILL.md`
- `reference.md`
- `checklist.md`

这些文件名由 `skill-sync.config.json` 的 `skillFiles` 控制。

## 4. 命令说明

### `npm run sync:to-skill`

用途：本地 -> Cursor

执行内容：

- `rules/` 同步到 `~/.cursor/rules/`
- `skillFile/*` 同步到 `~/.cursor/skills/*`

### `npm run sync:from-skill`

用途：Cursor -> 本地

执行内容：

- `~/.cursor/rules/` 回写到 `rules/`
- `~/.cursor/skills/*` 回写到 `skillFile/*`

### `npm run sync:github`

用途：本地仓库上传 GitHub

执行流程：

1. 读取当前分支
2. `git pull origin <当前分支>`
3. `git add .`
4. 检查是否有待提交变更
5. 有变更则自动 `commit` 并 `push`

说明：

- “同步到 GitHub”就是执行该命令（或包含该命令的组合命令）
- 没有变更时不会创建空提交

### `npm run sync:publish`

用途：本地 -> Cursor -> GitHub

适合场景：本地改完 `rules` 或 `skillFile` 后一键发布。

### `npm run sync:pull-skill`

用途：Cursor -> 本地 -> GitHub

适合场景：直接在 Cursor 目录改了内容后回写并上传。

## 5. 推荐工作流

### 场景 A：你在本地改了内容

```bash
npm run sync:publish
```

结果：

- Cursor 更新
- GitHub 更新

### 场景 B：你在 Cursor 目录改了内容

```bash
npm run sync:pull-skill
```

结果：

- 本地更新
- GitHub 更新

### 场景 C：你只想上传 GitHub

```bash
npm run sync:github
```

## 6. 新增 Skill 的方式

以新增 `NewSkill` 为例：

1. 新建 `skillFile/NewSkill/`
2. 放入 `SKILL.md`、`reference.md`、`checklist.md`
3. 执行 `npm run sync:publish`

无需改脚本，`NewSkill` 会自动被同步到：

- `~/.cursor/skills/NewSkill/`
- GitHub 仓库

## 7. 兼容旧命令

- `node sync.js` 等价于 `npm run sync:github`
- `node push-skills.js` 等价于 `npm run sync:publish`

建议优先使用 `npm run` 命令。

## 8. 常见问题

### 8.1 提示 Cursor 目录不存在

先手动准备目录，或先执行一次：

```bash
npm run sync:to-skill
```

### 8.2 GitHub 同步冲突

处理步骤：

1. 手动解决冲突
2. 确认代码正确
3. 重新执行同步命令

### 8.3 没有生成 commit

脚本检测到无变更时会自动跳过提交，这是正常行为。

### 8.4 想调整 Skill 同步文件名

编辑 `skill-sync.config.json` 的 `skillFiles` 数组后重新执行同步命令。
