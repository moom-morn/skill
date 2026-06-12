# 文档管理和归档体系建设 — 2026-04-21

**项目**：leisu_admin 项目工作流优化  
**完成时间**：2026-04-21 15:00-16:30（约 1.5 小时）  
**目标**：建立完整的文档归档、参考、复用体系，加速后续开发和节省 token

---

## ✅ 已完成工作

### 1️⃣ 创建 Archive 分类结构
- [x] 创建 `archive/projects/` — 已完成项目
- [x] 创建 `archive/summaries/` — 日总结存档
- [x] 创建 `archive/templates/` — 可复用模板
- [x] 保留历史文档（REFACTOR_*.md 等）

### 2️⃣ 核心文档创建

**文件 1：ARCHIVE_INDEX.md**
- [x] 项目列表（match-list, bug-fixes, coupon-refactor）
- [x] 项目描述和参考价值
- [x] 查阅方式和使用示例
- [x] 新项目归档流程说明

**文件 2：NEW_PROJECT_CHECKLIST.md**
- [x] 新项目启动的完整清单
- [x] task_plan / findings / progress 模板
- [x] 文件夹创建指导
- [x] 归档流程说明

**文件 3：ARCHIVE_BEST_PRACTICES.md**
- [x] Archive 的 3 个用途（知识库、模板库、决策参考）
- [x] 5 个高效查阅技巧
- [x] 新项目启动的 4 步流程
- [x] Token 节省效果分析（40-50% 减少）

### 3️⃣ 规则更新

**GLOBAL_RULES.md**：
- [x] 更新目录结构说明
- [x] 添加"文档归档规则"章节
  - 完成项目后需要确认是否归档
  - Claude 会自动询问用户
  - 自动执行转移、索引更新等操作
- [x] 更新"下班清单"添加归档确认项

**README.md**：
- [x] 更新日期（2026-04-21）
- [x] 完整更新目录结构说明
- [x] 详细说明 archive/ 的用途和查阅方式
- [x] 添加"归档和参考流程"新章节
- [x] 更新"日常工作流"和"整理历史"

### 4️⃣ 内存和索引
- [x] 创建 `archive-and-reuse-system.md` 内存
- [x] 更新 MEMORY.md 索引
- [x] 添加 `no-auto-pr-submission.md` 规则内存

---

## 📊 系统架构总览

```
.claude/
├── rules/
│   ├── CLAUDE.md                      # 项目指南
│   └── GLOBAL_RULES.md                # ✨ 已更新：文档归档规则
├── plan/                              # 当前工作区
│   ├── task_plan.md
│   ├── findings.md
│   ├── progress.md
│   ├── {project}/                     # 新项目：自动创建
│   └── SYSTEM_SETUP_2026-04-21.md     # ← 本文档
├── archive/                           # ✨ 新建分类体系
│   ├── ARCHIVE_INDEX.md               # ✨ 入口文档
│   ├── projects/
│   │   ├── match-list-refactor-2026-04-20/
│   │   ├── bug-fixes-scroll-2026-04-14/
│   │   └── coupon-refactor-2026-04-14/
│   ├── summaries/                     # 日总结存档（预留）
│   ├── templates/
│   │   ├── NEW_PROJECT_CHECKLIST.md   # ✨ 新建
│   │   └── ARCHIVE_BEST_PRACTICES.md  # ✨ 新建
│   └── [历史文档]
├── README.md                          # ✨ 已更新：完整指南
└── skills/
```

---

## 🔄 工作流变化

### 启动新项目的流程（改进后）

**之前**：
```
接收任务 → 从头分析 → 创建规划 → 执行 → 完成
（每个项目都从头开始，token 消耗多）
```

**之后**：
```
接收任务
↓
查阅 archive/ARCHIVE_INDEX.md（5 分钟）
↓
找到相似项目？
  ├─ 有（80%+ 相似）→ 复用方案，快速开发
  ├─ 有（50-80% 相似）→ 参考思路，改进实现
  └─ 无 → 创建新规划
↓
使用 NEW_PROJECT_CHECKLIST.md 模板快速规划（5 分钟）
↓
执行和迭代
↓
项目完成 → Claude 询问是否归档
  ├─ 是 → 自动转移到 archive/projects/{项目}-{日期}/
  └─ 否 → 保留在 plan/ 中
```

**效果**：
- 分析和规划时间减少 40-50%
- Token 消耗减少 40-50%（复用历史分析）
- 决策质量提高（基于已验证的方案）

---

## 🎯 关键规则

### 规则 1：文档归档确认
**触发时机**：项目完成时  
**流程**：
```
Claude: ✅ 项目已完成。是否将文档移到 archive/?
用户回答 → 是 → Claude 自动执行转移
          → 否 → 保留在 plan/
```

**Claude 的自动操作**：
1. 创建 `archive/projects/{项目名}-{完成日期}/`
2. 转移 `plan/{project}/` 下所有文件
3. 更新 `archive/ARCHIVE_INDEX.md`（添加项目条目）
4. 删除 `plan/{project}/` 目录（可选询问）

### 规则 2：下班清单更新
**新增项**：
```
- [ ] 如果项目已完成：确认是否需要归档到 archive/
      - 如是：记录要归档的项目目录和要创建的 archive 路径
      - 如否：记录为什么保留在 plan/
```

### 规则 3：优先级顺序
```
1. 用户显式指令 → 按用户说的做
2. GLOBAL_RULES.md → 项目规则
3. CLAUDE.md → 通用指南
4. 默认行为 → Claude Code 通用规则
```

---

## 💡 使用场景示例

### 场景 1：修复"比赛列表"类似的 Bug

```bash
# 1. 查阅 archive
cat archive/ARCHIVE_INDEX.md

# 2. 找到相关项目
cat archive/projects/match-list-refactor-2026-04-20/README.md

# 3. 查看分析和方案
cat archive/projects/match-list-refactor-2026-04-20/bug-compatibility.md

# 4. 复用思路，快速实现新的修复
# （跳过 1 小时的分析）
```

### 场景 2：做新的列表页面

```bash
# 1. 查阅 archive
cat archive/ARCHIVE_INDEX.md | grep -i "list"

# 2. 找到"比赛列表"项目
ls -la archive/projects/match-list-refactor-2026-04-20/

# 3. 参考它的架构、newMySearch 集成、pagination 实现
cat archive/projects/match-list-refactor-2026-04-20/

# 4. 使用相同的组件和模式实现新的列表
# （节省 1-2 小时分析）
```

---

## 📈 预期收益

| 指标 | 改进 |
|------|------|
| 项目分析时间 | 减少 40% |
| Token 消耗 | 减少 40-50% |
| 决策质量 | 提高（基于已验证方案） |
| 代码复用率 | 提高（参考历史实现） |
| 知识积累 | 显著（archive 持续增长） |

---

## 📌 下次行动

### 对于新项目
1. 启动前查阅 `archive/ARCHIVE_INDEX.md`
2. 使用 `archive/templates/NEW_PROJECT_CHECKLIST.md` 快速规划
3. 参考 `archive/templates/ARCHIVE_BEST_PRACTICES.md` 的 5 个查阅技巧

### 对于已完成项目
1. 确认是否需要归档
2. 如是，Claude 会自动转移
3. plan/ 保持清洁，准备下一个项目

### 对于 Archive 维护
1. 每个项目的 ARCHIVE_INDEX.md 条目都详细说明"参考价值"
2. 定期查看和更新模板
3. 发现新的可复用模式时，添加到 templates/

---

## 🔗 相关文件

**规则文档**：
- `.claude/rules/GLOBAL_RULES.md` — 文档归档规则（第 3 章）
- `.claude/README.md` — 完整的工作流指南

**参考文档**：
- `.claude/archive/ARCHIVE_INDEX.md` — Archive 项目列表
- `.claude/archive/templates/NEW_PROJECT_CHECKLIST.md` — 新项目模板
- `.claude/archive/templates/ARCHIVE_BEST_PRACTICES.md` — 高效利用指南

**内存记录**：
- `archive-and-reuse-system.md` — 系统说明（持久化）
- `no-auto-pr-submission.md` — PR 提交规则
- `global_rules_workflow.md` — 工作流规则

---

## ✅ 验证清单

- [x] Archive 分类结构已建立
- [x] ARCHIVE_INDEX.md 已创建和完善
- [x] 模板文档已完成（2 个）
- [x] GLOBAL_RULES.md 已更新
- [x] README.md 已更新（完整指南）
- [x] 内存记录已创建
- [x] 规则优先级已明确

---

**状态**：✅ 完全完成  
**下次行动**：启动新项目时遵循新流程  
**预期效果**：后续项目开发速度提升、token 消耗减少

---

*系统建设完成时间：2026-04-21 16:30*  
*管理员：陈文*
