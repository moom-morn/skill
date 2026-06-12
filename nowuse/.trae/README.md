# .claude 目录说明

**整理日期**：2026-04-20  
**最后更新**：2026-04-21（添加 archive 分类体系）  
**适用项目**：leisu_admin  

---

## 📁 目录结构

```
.claude/
├── rules/                          # 📋 规则和指南
│   ├── RULES.md                    # ⭐ 核心规则（5条，500 tokens）
│   ├── CLAUDE.md                   # 技术指南（编码标准、技术栈）
│   ├── cursor-core.mdc             # Cursor 核心规则
│   ├── leisu-admin-project.mdc     # leisu-admin 特定规则
│   ├── jsdoc-zs-trigger.mdc        # JSDoc 触发器规则
│   └── .copilot-instructions.md    # Copilot 指令
├── plan/                           # 📊 项目规划和进度（动态）
│   ├── task_plan.md                # 任务目标、阶段、决策
│   ├── findings.md                 # 关键发现、数据汇总
│   ├── progress.md                 # 执行日志、验证清单、暂停点 ⬅️ **关键文件**
│   ├── DAILY_SUMMARY_*.md          # 日总结
│   ├── {project}/                  # 具体项目子目录（完成后归档）
│   └── ...
├── archive/                        # 📦 已完成项目和历史文档
│   ├── ARCHIVE_INDEX.md            # 归档索引和查阅指南 ⬅️ **查找参考资料从这里开始**
│   ├── projects/                   # 已完成的项目
│   │   ├── match-list-refactor-2026-04-20/  # 比赛列表兼容性修复
│   │   ├── bug-fixes-scroll-2026-04-14/     # Scroll Bug 修复
│   │   └── coupon-refactor-2026-04-14/      # 优惠券重构
│   ├── summaries/                  # 日总结、周总结存档
│   ├── templates/                  # 可复用的模板文档
│   └── [历史参考文档]              # REFACTOR_*.md 等
├── skills/                         # 🛠️ Claude Code 技能定义
│   ├── planning-with-files/        # 文件规划技能
│   └── newsearch-component-refactor/ # 组件重构技能
├── config/                         # ⚙️ 配置文件
│   └── settings.local.json         # 本地配置
├── .gitignore                      # Git 忽略规则
└── README.md                       # 本文档
```

---

## 📖 各文件夹用途

### `rules/` — 规则和指南

存放项目的**规则、标准、指南**等持久性文档。

**核心文件**：
- **RULES.md** ⭐ — 5 条核心规则（500 tokens，必读）
- **CLAUDE.md** — 技术栈、编码标准、架构指南

**何时查看**：
- 项目开始：读 RULES.md（2 分钟）
- 编码标准：查 CLAUDE.md
- 工作流不清：参考 RULES.md 第 2 条

---

### `plan/` — 项目规划和进度

存放**任务规划、执行进度、验证清单**等动态文档。

**核心 3 件套**：
1. **task_plan.md** — 任务目标、阶段、关键决策、错误记录
2. **findings.md** — 关键发现、数据对比、源文档摘要
3. **progress.md** — 执行日志、修复记录、**下班暂停点** ⬅️ **最重要**

**何时更新**：
- 每个工作日：morning 读 progress.md（找暂停点），evening 更新（记录进度）
- 每个阶段：更新 task_plan.md 的阶段状态
- 每次发现：即时写入 findings.md
- 下班前：更新 progress.md 的"下班暂停点"

**何时查看**：
- 恢复工作：先读 progress.md 找暂停点
- 理解背景：读 task_plan.md + findings.md

---

### `skills/` — Claude Code 技能定义

存放 Claude Code 的**自定义技能**（如 planning-with-files）。

**一般不需要修改**，除非：
- 创建新技能
- 更新现有技能配置

---

### `config/` — 配置文件

存放项目的**配置文件**（如 settings.local.json）。

**何时修改**：
- 调整 Claude Code 行为
- 配置本地覆盖

---

### `archive/` — 历史文档和已完成项目

存放**已完成项目的规划、分析和总结文档**。作为**项目知识库**和**参考模板库**使用。

**子目录说明**：
- **`projects/`** — 已完成的完整项目
  - 每个项目一个目录：`{项目名}-{完成日期}/`
  - 包含所有规划、分析、总结、日志
  - 例：`match-list-refactor-2026-04-20/`

- **`summaries/`** — 日总结、周总结存档
  - 定期从 plan/ 转移过来
  - 作为项目历史记录和检查点

- **`templates/`** — 可复用的模板和方案库
  - 常见问题的解决方案
  - 常见功能的实现模板
  - 重构或新功能的参考

**何时使用**（快速参考）：
```bash
# 遇到类似的 Bug 修复
cat archive/projects/bug-fixes-scroll-2026-04-14/SOLUTION-SUMMARY.md

# 要实现列表页面
cat archive/projects/match-list-refactor-2026-04-20/README.md

# 查看所有完成的项目
cat archive/ARCHIVE_INDEX.md
```

**何时添加**：
- 项目完成后，用户确认是否归档
- Claude 执行自动转移：创建目录 → 转移文件 → 更新索引
- 不用手动操作

**参考价值**（节省 token）**：
- 遇到相似需求时，查阅 archive 中的分析和方案
- 复用已验证的代码模式和流程
- 加快后续类似项目的开发速度

---

## 🚀 日常工作流

### 早上开始工作

```bash
# 1. 进入项目
cd /Users/chenwen/leisu_admin

# 2. 恢复上次的上下文（3 分钟）
cat .claude/plan/progress.md         # 找"下班暂停点"
cat .claude/plan/task_plan.md        # 看阶段状态

# 3. 查看是否有需要参考的历史项目
cat .claude/archive/ARCHIVE_INDEX.md # 了解已完成项目和模板
```

### 下班结束工作

```bash
# 1. 更新进度文档（2 分钟）
# - 更新 .claude/plan/progress.md 的"下班暂停点"
# - 记录待完成任务清单
# - 如果项目已完成，记录是否需要归档

# 2. 提交 git（1 分钟）
git add .
git commit -m "progress: 记录今日工作"
```

---

## 📦 归档和参考流程

### 当项目完成时

```
代码修改完成 ✅
↓
Claude 问：✅ 项目已完成。是否将文档移到 archive/?
↓
用户回答"是" → Claude 自动执行：
  1. 创建 archive/projects/{项目名}-{完成日期}/
  2. 转移 plan/{project}/ 下的所有文件
  3. 更新 archive/ARCHIVE_INDEX.md
  4. 删除 plan/{project}/ 目录（可选）
  5. 确认完成
↓
plan/ 保持清洁，archive/ 增加一个参考项目
```

### 当需要参考时

```bash
# 1. 查看所有已完成项目
cat /Users/chenwen/leisu_admin/.claude/archive/ARCHIVE_INDEX.md

# 2. 选择相关项目
# 例：查看"比赛列表"重构的完整分析
ls -la archive/projects/match-list-refactor-2026-04-20/

# 3. 查阅具体文档
cat archive/projects/match-list-refactor-2026-04-20/README.md
cat archive/projects/match-list-refactor-2026-04-20/bug-compatibility.md

# 4. 复用方案
# 基于历史的分析和实现，加速新项目开发
```

---

## 📌 关键约定

1. **progress.md 是生命线**  
   下班前必须更新"下班暂停点"，记录清楚下次继续的位置

2. **plan/ 文件不要手动删除**  
   历史数据可能有参考价值，需要时移到 archive/

3. **rules/ 是项目法则**  
   遇到编码问题，先查 rules/ 看是否有约定

4. **config/ 很少改动**  
   除非是真的要调整工作环境配置

5. **archive/ 只读参考**  
   完成的项目留在这里，不影响当前工作

---

## 🔄 整理历史

| 日期 | 操作 | 状态 |
|------|------|------|
| 2026-04-20 | 初始整理（move rules/config/archive） | ✅ 完成 |
| 2026-04-21 | 建立 archive 分类体系 + 文档归档规则 | ✅ 完成 |
| 2026-04-21 | 创建 ARCHIVE_INDEX.md 和查阅指南 | ✅ 完成 |
| 2026-04-21 | 更新 GLOBAL_RULES.md（添加文档归档规则） | ✅ 完成 |
| 2026-04-21 | 更新 README.md（完整工作流指南） | ✅ 完成 |

---

**说明**：本目录遵循 leisu_admin 项目的工作规则（详见 `rules/GLOBAL_RULES.md`）

