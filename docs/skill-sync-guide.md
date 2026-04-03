# rules + Skill 同步操作指南

## 1. 前置要求

- Node.js 20+
- 本地仓库已配置 GitHub 远端

## 2. 目录约定

| 本地 | Cursor | 同步方式 |
|------|--------|---------|
| `rules/**` | `~/.cursor/rules/**` | 双向全量 |
| `skillFile/<Name>/` | `~/.cursor/skills/<Name>/` | 双向，仅 3 个文件 |

Skill 同步的文件由 `skill-sync.config.json` 的 `skillFiles` 控制，默认：`SKILL.md`、`reference.md`、`checklist.md`。

## 3. 命令详解

### `npm run sync:to-skill`
本地 → Cursor。将 `rules/` 和 `skillFile/*` 写入 `~/.cursor/`。

### `npm run sync:from-skill`
Cursor → 本地。将 `~/.cursor/` 内容回写到 `rules/` 和 `skillFile/*`。

### `npm run sync:github`
本地 → GitHub。执行流程：
1. `git pull origin <当前分支>`
2. `git add .`
3. 检测到有变更则 `commit` + `push`（无变更自动跳过，不创建空提交）

### `npm run sync:publish`
**本地改完后用**：sync:to-skill → sync:github（一键发布到 Cursor + GitHub）

### `npm run sync:pull-skill`
**Cursor 改完后用**：sync:from-skill → sync:github（回写本地 + 上传 GitHub）

## 4. 新增 Skill

1. 在 `skillFile/` 下新建子目录（如 `skillFile/NewSkill/`）
2. 放入 `SKILL.md`、`reference.md`、`checklist.md`
3. 执行 `npm run sync:publish`

无需修改任何脚本，新 Skill 自动参与同步。

## 5. 常见问题

**提示 Cursor 目录不存在**
先执行 `npm run sync:to-skill`，脚本会自动创建目录。

**GitHub 同步冲突**
手动解决冲突后，重新执行同步命令。

**没有生成 commit**
无变更时脚本自动跳过提交，属正常行为。

**调整 Skill 同步的文件名**
编辑 `skill-sync.config.json` 的 `skillFiles` 数组，重新执行同步即可。
