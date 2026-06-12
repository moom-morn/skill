# 新项目启动清单

使用此清单来创建新的项目规划和文档结构。

---

## 📋 项目信息

- **项目名称**：____________
- **项目简述**：____________
- **预期完成日期**：____________
- **优先级**：🔴 高 / 🟡 中 / 🟢 低

---

## 📁 文件夹创建

```bash
# 在 .claude/plan/ 下创建项目子目录
mkdir -p /Users/chenwen/leisu_admin/.claude/plan/{项目名}/
```

---

## 📄 创建规划文件

### 1. task_plan.md
```markdown
# {项目名} — 任务规划

**项目目标**：
- [ ] 目标 1
- [ ] 目标 2
- [ ] 目标 3

**阶段划分**：
1. 📋 分析阶段（预计 X 小时）
2. 🛠️ 实现阶段（预计 X 小时）
3. ✅ 验证阶段（预计 X 小时）

**关键决策**：
- 决策 1：为什么选择这个方案
- 决策 2：为什么排除了其他方案

**错误记录**：
- [日期] 错误 1 → 改进方案

**当前阶段**：pending → in_progress → completed
```

### 2. findings.md
```markdown
# {项目名} — 关键发现

**数据汇总**：
| 指标 | 值 |
|------|-----|
| 文件数 | X |
| 行数修改 | Y |
| 影响范围 | Z |

**关键发现**：
1. 发现 1
2. 发现 2
3. 发现 3

**源文档摘要**：
- 文件 1：主要内容
- 文件 2：主要内容
```

### 3. progress.md
```markdown
# {项目名} — 执行进度

**阶段 1：分析** ✅ / ⏳ / ❌

- [x] 任务 1 — 完成时间
- [x] 任务 2 — 完成时间
- [ ] 任务 3 — 预计完成时间

**阶段 2：实现** ✅ / ⏳ / ❌

- [x] 修改 1 — 文件：line X-Y
- [ ] 修改 2 — 预计完成时间

**下班暂停点**：
[描述下次继续的位置、未完成的任务、已修改文件]
```

---

## ✅ 启动清单

- [ ] 创建项目子目录
- [ ] 创建 task_plan.md
- [ ] 创建 findings.md
- [ ] 创建 progress.md
- [ ] 在当前会话中维护这些文档
- [ ] 完成后确认是否归档到 archive/

---

## 🔄 完成后归档流程

当项目完成时：

1. **Claude 会问**："✅ 项目已完成。是否将文档移到 archive/?"

2. **如果用户答'是'**，Claude 会：
   ```bash
   # 创建归档目录
   mkdir -p /Users/chenwen/leisu_admin/.claude/archive/projects/{项目名}-{完成日期}/
   
   # 转移所有文件
   mv /Users/chenwen/leisu_admin/.claude/plan/{项目名}/* \
      /Users/chenwen/leisu_admin/.claude/archive/projects/{项目名}-{完成日期}/
   
   # 更新 ARCHIVE_INDEX.md
   # （添加新项目的条目和参考价值说明）
   ```

3. **plan/ 保持清洁**，下次新项目可立即创建新目录

---

## 📚 参考已完成项目

```bash
# 查看所有已完成项目
cat /Users/chenwen/leisu_admin/.claude/archive/ARCHIVE_INDEX.md

# 查看特定项目
ls -la /Users/chenwen/leisu_admin/.claude/archive/projects/{项目名}-{日期}/
```

---

**说明**：此文档是模板，保存在 `archive/templates/` 中供参考
