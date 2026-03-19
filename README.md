# rules + Skill 同步工具

这个仓库用于统一管理并同步两类内容：

- `rules/`：Cursor 规则文件
- `skillFile/`：多个 Skill 的源文件目录（每个子目录代表一个 Skill）

同步目标包含两处：

- Cursor 本地目录（`~/.cursor/rules`、`~/.cursor/skills`）
- GitHub 仓库（通过 Git 提交与推送）

## 目录结构

```text
skill/
├── rules/                        # 本地 rules 源目录
├── skillFile/
│   └── SearchSkill/              # 一个 Skill 示例（可继续新增更多子目录）
├── scripts/                      # 同步脚本
├── docs/                         # 详细使用文档
├── skill-sync.config.json        # 同步配置
├── package.json                  # 命令入口
├── sync.js                       # 兼容旧入口，等价于 sync:github
└── push-skills.js                # 兼容旧入口，等价于 sync:publish
```

## 同步规则

### rules 同步

- 本地：`rules/**`
- Cursor：`~/.cursor/rules/**`
- 双向全量文件同步（保留目录结构）

### Skill 同步

- 本地：`skillFile/<SkillName>/`
- Cursor：`~/.cursor/skills/<SkillName>/`
- 自动扫描 `skillFile` 下所有子目录
- 每个 Skill 仅同步这 3 个文件：
  - `SKILL.md`
  - `reference.md`
  - `checklist.md`

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

- `npm run sync:to-skill`：本地 (`rules` + `skillFile/*`) -> Cursor
- `npm run sync:from-skill`：Cursor -> 本地 (`rules` + `skillFile/*`)
- `npm run sync:github`：本地仓库执行 `pull -> add -> commit -> push` 上传到 GitHub
- `npm run sync:publish`：先本地 -> Cursor，再上传 GitHub
- `npm run sync:pull-skill`：先 Cursor -> 本地，再上传 GitHub

## 新增一个 Skill

1. 在 `skillFile/` 下新建子目录（例如 `skillFile/NewSkill/`）
2. 放入 `SKILL.md`、`reference.md`、`checklist.md`
3. 执行 `npm run sync:publish`

无需修改脚本或命令，新 Skill 会自动参与同步。

## 详细文档

完整操作说明见 `docs/skill-sync-guide.md`。
