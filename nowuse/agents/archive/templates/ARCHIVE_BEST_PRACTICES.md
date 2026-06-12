# Archive 最佳实践指南

本文档说明如何最大化利用 archive/ 来加速开发和节省 token。

---

## 🎯 Archive 的 3 个用途

### 1. 知识库 — 加速学习和参考
```
遇到新问题
↓
查阅 archive/ARCHIVE_INDEX.md
↓
找到相似的已完成项目
↓
查看分析文档和解决方案
↓
复用方案，加快开发
```

**示例**：
- 要做"优惠券列表"？→ 查阅 `archive/projects/coupon-refactor-2026-04-14/`
- 要修复"滚动位置"Bug？→ 查阅 `archive/projects/bug-fixes-scroll-2026-04-14/`

### 2. 模板库 — 快速启动项目
```
新项目需要规划
↓
参考 archive/templates/NEW_PROJECT_CHECKLIST.md
↓
快速创建 task_plan.md / findings.md / progress.md
↓
按模板执行
```

### 3. 决策参考 — 验证方案有效性
```
考虑某个技术方案
↓
查阅 archive 中的类似项目
↓
看看之前是如何处理的
↓
采用或改进之前的方案
```

---

## 💡 高效查阅的 5 个技巧

### 技巧 1：使用 ARCHIVE_INDEX.md 作为入口
```bash
# 第一步：总是从索引开始
cat /Users/chenwen/leisu_admin/.claude/archive/ARCHIVE_INDEX.md

# 扫一遍所有项目名称、完成日期、参考价值
# 快速定位相关项目
```

### 技巧 2：按项目类型分类查找
```bash
# 所有 Bug 修复类项目
ls -d archive/projects/*bug* archive/projects/*fix*

# 所有列表页面重构项目
ls -d archive/projects/*list* archive/projects/*refactor*

# 所有组件重构项目
ls -d archive/projects/*component*
```

### 技巧 3：查看 README.md 快速了解
```bash
# 每个项目的 README.md 都有项目概述
cat archive/projects/match-list-refactor-2026-04-20/README.md

# 快速判断是否与当前需求相关
```

### 技巧 4：复用已验证的方案
```bash
# 一旦找到相关项目，直接复用：
1. 查看核心代码修改（DAILY_SUMMARY 中的统计）
2. 复制 diff 或指导思路
3. 在新项目中应用

# 这样比从头分析快得多
```

### 技巧 5：更新 ARCHIVE_INDEX.md 中的"参考价值"
```markdown
**参考价值**：
- Vue 2 多运动列表兼容性处理
- 动态路由映射和权限验证
- newMySearch 组件集成模式
- 如何处理 API 返回多种运动类型
```

多描述一些"为什么有用"，下次查找时更容易判断相关性。

---

## 🚀 启动新项目时的流程

### 第 1 步：查阅 archive（5 分钟）
```bash
# 有没有类似的已完成项目？
cat /Users/chenwen/leisu_admin/.claude/archive/ARCHIVE_INDEX.md

# 如果有，查看：
cat archive/projects/{类似项目}/README.md
cat archive/projects/{类似项目}/task_plan.md
```

### 第 2 步：确定是否可复用（2 分钟）
```
相似度高（80%+） → 直接复用方案
相似度中（50-80%） → 参考思路，改进方案
相似度低 → 创建新的规划
```

### 第 3 步：使用模板快速规划（5 分钟）
```bash
# 参考 NEW_PROJECT_CHECKLIST.md
cat archive/templates/NEW_PROJECT_CHECKLIST.md

# 基于模板创建 task_plan / findings / progress
```

### 第 4 步：执行和迭代（X 小时）
```
按规划执行
↓
更新 progress.md
↓
完成后确认是否归档
```

---

## 📊 预期效果：Token 节省

### 情景对比

**不使用 Archive**：
```
遇到新需求
↓
从头分析（30 分钟，大量 token）
↓
从头规划（20 分钟）
↓
从头实现（1-2 小时）
总耗时：~2 小时 + 大量 token
```

**使用 Archive**：
```
遇到新需求
↓
查阅 archive（5 分钟，少量 token）
↓
找到相似项目，复用思路（5 分钟）
↓
快速规划（5 分钟）
↓
实现（1-1.5 小时）
总耗时：~1.5 小时，token 减少 40-50%
```

### Token 节省的关键
- **分析阶段**：直接复用历史分析，跳过重复调查
- **规划阶段**：用模板快速生成，避免从零开始
- **决策阶段**：查看已验证的方案，少做讨论
- **实现阶段**：查看代码示例，快速编写

---

## 🔧 维护 Archive 的规则

### 何时添加
- ✅ 项目完成，用户确认归档
- ✅ 发现可复用的模板或流程
- ✅ 写好了新的最佳实践指南

### 何时删除
- ❌ 方案已过时，不再适用
- ❌ 发现更好的替代方案
- ❌ 项目需要调整后再存档

### 何时更新
- 📝 添加"参考价值"说明
- 📝 更新"完成日期"或"状态"
- 📝 添加相关链接或交叉参考

---

## 📌 示例：快速参考流程

**需求**：完成一个新的订单列表页面

**步骤**：
```bash
# 1. 查找已完成项目
cat archive/ARCHIVE_INDEX.md | grep -i "list\|order\|table"

# 2. 找到"比赛列表"项目（最相似）
# 3. 快速查看
cat archive/projects/match-list-refactor-2026-04-20/README.md

# 4. 识别核心技术：newMySearch + el-table + pagination
# 5. 复用框架和模式
# 6. 实现新的订单列表（避免重复分析）

# 结果：节省 1 小时分析 + 50% token
```

---

## 📚 相关文档

- **ARCHIVE_INDEX.md** — Archive 中的所有项目列表
- **GLOBAL_RULES.md** — 文档归档的规则
- **README.md** — .claude 目录总体说明
- **NEW_PROJECT_CHECKLIST.md** — 新项目启动模板

---

**作者**：Claude Code + 陈文  
**目的**：加速开发、复用知识、节省 token  
**维护者**：陈文
