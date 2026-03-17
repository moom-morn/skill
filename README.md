# Cursor Skill 双向同步

这个仓库现在承担 3 个角色：

- 保存本地 Skill 源文件
- 同步到 Cursor 全局 Skill 目录
- 同步到 GitHub 仓库

当前 Skill 的目标目录是 `~/.cursor/skills/newsearch-component-refactor/`。

## 目录结构

```text
skill/
├── SearchSkill/                  # 本地 Skill 源文件
├── scripts/                      # 同步脚本
├── docs/                         # 详细使用文档
├── skill-sync.config.json        # 同步映射配置
├── package.json                  # 命令入口
├── sync.js                       # 兼容旧入口，等价于 sync:github
└── push-skills.js                # 兼容旧入口，等价于 sync:publish
```

## 常用命令

需要 Node 20 或更高版本。

```bash
npm run sync:to-skill
npm run sync:from-skill
npm run sync:github
npm run sync:publish
npm run sync:pull-skill
```

命令说明：

- `npm run sync:to-skill`：把本地 `SearchSkill/` 同步到 `~/.cursor/skills/newsearch-component-refactor/`
- `npm run sync:from-skill`：把 `~/.cursor/skills/newsearch-component-refactor/` 回写到本地 `SearchSkill/`
- `npm run sync:github`：将当前分支和 GitHub 执行 `pull -> add -> commit -> push`
- `npm run sync:publish`：先同步到 Cursor Skill，再同步到 GitHub
- `npm run sync:pull-skill`：先从 Cursor Skill 拉回本地，再同步到 GitHub

## 文件映射

当前同步以下文件：

- `SearchSkill/SKILL.md` <-> `~/.cursor/skills/newsearch-component-refactor/SKILL.md`
- `SearchSkill/reference.md` <-> `~/.cursor/skills/newsearch-component-refactor/reference.md`
- `SearchSkill/checklist.md` <-> `~/.cursor/skills/newsearch-component-refactor/checklist.md`

如需修改映射，编辑 `skill-sync.config.json`。

## 推荐日常使用

如果你改的是本地项目里的 Skill 文档：

```bash
npm run sync:publish
```

如果你改的是 Cursor 里的 Skill：

```bash
npm run sync:pull-skill
```

## 详细说明

完整操作文档见 `docs/skill-sync-guide.md`。
