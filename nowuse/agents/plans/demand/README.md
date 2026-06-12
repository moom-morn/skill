# 需求文档管理（.claude/plan/demand/）

**用途**：集中管理所有**未完成的**需求、功能、Bug、优化方案等

---

## 📋 分类说明

### 功能需求/
新功能开发、功能扩展相关的需求

**例**：
- `feature-live-notification.md` — 直播推送功能
- `feature-user-profile.md` — 用户档案页面

### Bug修复/
已识别但未修复的 Bug、问题

**例**：
- `bug-scroll-position.md` — 页面滚动位置重置问题
- `bug-match-filter.md` — 比赛筛选返回错误数据

### 性能优化/
性能相关的需求、优化方案评估

**例**：
- `perf-list-virtualization.md` — 大列表虚拟滚动
- `perf-api-cache.md` — API 响应缓存策略

### 界面优化/
UI/UX 改进、样式调整

**例**：
- `ui-dark-mode.md` — 深色主题支持
- `ui-mobile-responsive.md` — 移动端适配

### 重构/
代码重构、架构优化、清理技术债

**例**：
- `refactor-auth-system.md` — 认证系统重构
- `refactor-api-modules.md` — API 模块化改造

---

## 📝 文档模板

新建需求文档时参考此模板：

```markdown
# [需求标题]

**优先级**：高/中/低  
**创建日期**：YYYY-MM-DD  
**所属模块**：[模块名]  
**关联运动类型**：[运动ID或名称] 或 通用

---

## 需求描述

[简明扼要的需求说明]

## 背景/原因

[为什么需要这个需求，有什么业务价值或技术收益]

## 实施方案

[预期方案或实施思路]

## 相关文件

[涉及的源代码文件]

## 预估工时

[开发时间估算]

## 验收标准

[完成此需求需要满足的条件]

## 备注

[其他信息，如依赖、风险等]
```

---

## 🔄 工作流

### 1. 新需求到达
→ 选择合适的分类文件夹  
→ 新建 `需求-简短描述.md`  
→ 填写完整的需求信息

### 2. 需求审视
→ Claude 查看需求时自动发现  
→ 与相关任务关联  
→ 根据优先级排序

### 3. 需求开始
→ 相关的需求文档从 demand 移到对应的项目文件夹  
→ 或在 task_plan.md 中创建任务链接

### 4. 需求完成
→ 删除或归档需求文档  
→ 更新 progress.md 记录完成情况

---

## 💡 最佳实践

1. **每个需求一个文件** — 避免混乱，便于查找和追踪
2. **按优先级组织** — 高优先级的需求放在文件前面或专门标记
3. **定期检查** — 定期清理已完成的需求，保持清单最新
4. **关联字段** — 在需求中记录相关的 Bug ID、任务 ID、PR 链接等
5. **版本历史** — 如果需求有多个版本或演进，在文档中记录变更

---

## 🔍 快速查询

### 查看所有待处理需求
```bash
find /Users/chenwen/leisu_admin/.claude/plan/demand -name "*.md" | wc -l
```

### 按分类统计
```bash
ls -l /Users/chenwen/leisu_admin/.claude/plan/demand/*/
```

### 搜索特定需求
```bash
grep -r "keyword" /Users/chenwen/leisu_admin/.claude/plan/demand/
```

---

**管理人**：陈文  
**创建日期**：2026-04-21  
**规则依据**：`.claude/rules/RULES.md` 第 6 条
