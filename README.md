# Cursor 规则与技能同步

一个用于在本地仓库和 Cursor 配置目录之间管理和同步 [Cursor](https://cursor.com) 规则和 [Agent Skills](https://agentskills.io) 的工具，GitHub 作为唯一事实来源。

**管理内容：**

| 本地 | Cursor | 同步方式 |
|-------|--------|------|
| `rules/` | `~/.cursor/rules/` | 双向，完整目录 |
| `skillFile/<name>/` | `~/.cursor/skills/<name>/` | 双向，按技能文件 |

---

## 环境要求

- Node.js 20+
- 已配置远程的 Git（用于 GitHub 同步）

## 快速开始

```bash
# 1. 克隆此仓库
git clone <your-fork-url>
cd skill

# 2. 安装依赖（无需安装 —— 纯 Node.js 脚本）

# 3. 如需修改路径，请在 skill-sync.config.json 中配置
#    默认值：rules/ → ~/.cursor/rules/, skillFile/ → ~/.cursor/skills/

# 4. 将你的规则和技能推送到 Cursor
npm run sync:to-skill
```

## 命令

| 命令 | 方向 | 描述 |
|---------|-----------|-------------|
| `npm run sync:to-skill` | 本地 → Cursor | 复制 `rules/` 和 `skillFile/*` 到 `~/.cursor/` |
| `npm run sync:from-skill` | Cursor → 本地 | 将 `~/.cursor/` 拉取回 `rules/` 和 `skillFile/` |
| `npm run sync:github` | 本地 → GitHub | `git pull` → `add` → `commit` → `push`（无变更时跳过） |
| `npm run sync:publish` | 本地 → Cursor + GitHub | 先执行 `sync:to-skill` 然后 `sync:github` |
| `npm run sync:pull-skill` | Cursor → 本地 + GitHub | 先执行 `sync:from-skill` 然后 `sync:github` |

**典型工作流：**

```bash
# 在本地编辑规则/技能后：
npm run sync:publish

# 在 Cursor 的 AI 聊天中编辑后（技能/规则由 Cursor 自动更新）：
npm run sync:pull-skill
```

## 目录结构

```
skill/
├── rules/                          # Cursor 规则文件 (.mdc)
│   ├── cursor-core.mdc             # 示例：始终启用的全局规则
│   ├── leisu-admin-project.mdc     # 示例：自动附加的项目规则
│   └── jsdoc-zs-trigger.mdc        # 示例：自动附加的 JSDoc 助手
├── skillFile/
│   └── newsearch-component-refactor/   # 示例技能（目录名 = 技能名）
│       ├── SKILL.md                    # 必需：元数据 + 指令
│       ├── reference.md                # 可选：完整代码示例
│       └── checklist.md                # 可选：验证清单
├── scripts/                        # 同步脚本（无需编辑）
├── docs/                           # 详细操作指南
├── skill-sync.config.json          # 路径配置
└── package.json
```

## 添加新技能

技能遵循 [Agent Skills 规范](https://agentskills.io/specification)。

1. 在 `skillFile/` 下创建目录 —— **目录名必须与 `SKILL.md` 中的 `name` 字段匹配**
2. 创建包含必需 frontmatter 的 `SKILL.md`：

```markdown
---
name: your-skill-name
description: 此技能的作用以及何时使用它。请具体说明 —— agent 使用此信息来决定何时激活技能。
---

# 技能标题

## 步骤 1
...
```

3. 可选添加 `reference.md`（详细示例）和 `checklist.md`（验证步骤）
4. 运行 `npm run sync:publish`

无需修改脚本 —— 新技能会被自动发现。

## 添加新规则

Cursor 规则遵循 [`.mdc` 格式](https://docs.cursor.com/context/rules)。选择规则类型：

| 类型 | `alwaysApply` | `globs` | 应用时机 |
|------|:---:|:---:|-----------------|
| 始终应用 | `true` | — | 每次 AI 请求 |
| 自动附加 | `false` | `**/*.ts` | 当上下文中存在匹配的文件 |
| Agent 请求 | `false` | — | AI 根据 `description` 决定 |
| 手动 | `false` | — | 仅当使用 `@ruleName` 引用时 |

示例：

```markdown
---
description: TypeScript 编码规范
globs: "**/*.ts,**/*.tsx"
alwaysApply: false
---

始终使用严格类型。优先使用 `interface` 而非 `type`。
```

保存到 `rules/your-rule.mdc`，然后运行 `npm run sync:publish`。

## 配置

`skill-sync.config.json` 控制所有路径和同步的文件名：

```json
{
  "localRulesDir": "rules",
  "cursorRulesDir": "~/.cursor/rules",
  "localSkillRootDir": "skillFile",
  "cursorSkillsRootDir": "~/.cursor/skills",
  "skillFiles": ["SKILL.md", "reference.md", "checklist.md"]
}
```

`skillFiles` —— 每个技能同步的文件列表。添加或移除条目以控制复制哪些文件。

## 详细指南

查看 [`docs/skill-sync-guide.md`](docs/skill-sync-guide.md) 获取故障排除和高级用法。
