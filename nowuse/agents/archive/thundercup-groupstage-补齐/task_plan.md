# 🎯 Thunder Cup 分组数据补齐功能

**创建时间**: 2026-04-28  
**状态**: ✅ 实现完成  
**优先级**: 高

---

## 📋 需求概览

在 `thunderCupGroupStage.vue` 的 `getRank` 方法中，添加数据校验与补齐逻辑：

### 核心规则

| Stage | 组数 | 每组人数 | 条件 | 说明 |
|-------|------|---------|------|------|
| 4 | 12 | 4 | 任意轮次 | 48名作者分12组，运营手动分组，前32名晋级 |
| 5 | 8 | **轮次相关** | round=1 | 32名作者分8组，每组4人 |
| 5 | 8 | **3** | **round=2** | **第二轮时，8组每组3人** |

### 补齐逻辑

1. **groups 长度检查**
   - stage=4: 如果 groups < 12，补空组使其达到12
   - stage=5: 
     - round=1: 如果 groups < 8，补空组使其达到8
     - round=2: 如果 groups < 8，补空组使其达到8
   - groups > 限制：截断到对应上限

2. **每组 rank 检查**  
   - stage=4: 每组 rank 应该有4个元素
   - stage=5, round=1: 每组 rank 应该有4个元素
   - stage=5, round=2: **每组 rank 应该有3个元素** ✨ **新规则**
   - 如果 rank 不足：补充空数据 `{uid: null, name: "", avatar: "", num: 0}`
   - 如果 rank 超过：截断到对应数量

3. **已有逻辑**（第 148-176 行）
   - ✅ 每组补齐到4人（但需改为动态 playersPerGroup）
   - ❌ groups 长度未校验补齐（需要新增）
   - ❌ 没有支持轮次相关的人数规则（stage=5, round=2 时需要 3 人）

---

## 🔍 现有代码分析

**file**: `src/views/active/components/thunderCup/thunderCupGroupStage.vue:136-183`

### 当前 getRank 流程

```
1. 调用 API: thunder_cup_vote_rank
2. 遍历 rank 数组，建立 rankMap
3. 映射 groups，补充每组为4人 ✅
4. 组数限制（slice）❌ 没有补齐逻辑
5. 赋值 editGroups
```

### 问题点

- **行 171-174**: 只做 slice 截断，没有补齐空组
- **缺少明确性检查**: groups 是否满足 stage 对应的数量要求不清晰

---

## ✅ 验证标准

完成后应满足：

1. **单元检查**
   - [x] stage=4, groups=10 → 补齐到12组
   - [x] stage=5, round=1, groups=6 → 补齐到8组  
   - [x] stage=5, round=2, groups=6 → 补齐到8组，**每组3人** ✨
   - [x] stage=4, groups=15 → 截断到12组
   - [x] 每组 rank < playersPerGroup → 补空数据

2. **集成测试**
   - [x] 选择不同轮次，显示正确的组数和人数
   - [x] 编辑和保存后，数据不丢失

3. **代码规范**
   - [x] 遵循 CLAUDE.md 的命名和注释规范
   - [x] 无 optional chaining / nullish coalescing（Node 12 兼容）

---

## 📝 实现阶段

### Phase 1: 代码修改（✅ 完成）

**目标**: 在 getRank 中补齐 groups 长度校验和补充逻辑（支持轮次相关的每组人数）

**文件**: `src/views/active/components/thunderCup/thunderCupGroupStage.vue:148-198`

**具体步骤**:
1. 计算 `playersPerGroup`（根据 stage 和 round 判断）
   - stage=4: 总是 4
   - stage=5, round='2': **3** ✨
   - stage=5, round≠'2': 4
2. 补齐每组的 rank 到 `playersPerGroup` 个人（代替现在的硬编码 4）
3. 补齐 groups 到 maxGroups 个组（新增逻辑）

**关键代码修改**:
```js
// 在行 155 处添加动态人数计算
const playersPerGroup = 
    this.stageData.stage === 4 ? 4 : 
    (this.activeRound === '2' ? 3 : 4)

// 改造行 156-168 中的补齐逻辑，从硬编码 4 改为 playersPerGroup
if (rankCount < playersPerGroup) {
    const emptySlots = Array(playersPerGroup - rankCount).fill(null).map(...)
    g.rank = [...g.rank, ...emptySlots]
}

// 改造行 171-174 的 groups 补齐逻辑（从只截断改为补齐）
```

### Phase 2: 测试与验证（✅ 完成）

**目标**: 验证数据完整性

**测试点**:
- [x] Mock API 返回不同长度的 groups，验证补齐逻辑
- [x] 前端显示是否正确（12 或 8 组卡片）
- [x] 空槽位是否正确占位

---

## 🚨 风险与假设

| 假设 | 风险 | 处理方案 |
|------|------|---------|
| groups 从 API 返回完整数据 | API 可能返回不完整数据 | 添加校验补齐 ✅ |
| 每组 rank 总是有对应的 rankMap | 某些 uid 可能不在 rankMap 中 | 已在行 151 处理（ternary） ✅ |
| stage 只有 4 和 5 | 后续可能新增 stage | 使用三元表达式而非 switch |

---

## 📌 决策记录

- **2026-04-28 v1**: 用户确认需求，stage 4 补到 12 组，stage 5 补到 8 组
- **2026-04-28 v2**: 用户明确新规则：stage=5 **第二轮时**（round=2），8 组**每组 3 人**（非 4 人）
- **2026-04-28 v3**: 实现完成，通过两阶段审查

---

## ❌ 错误日志

（无）
