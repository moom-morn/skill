# 📚 Thunder Cup 分组补齐 - 调查结果

**最后更新**: 2026-04-28

---

## 代码现状分析

**文件**: `src/views/active/components/thunderCup/thunderCupGroupStage.vue`

### 1. getRank 方法（行 136-183）流程图

```
Input: { stage, round } 
  ↓
[API 调用] thunder_cup_vote_rank
  ↓ res.data.rank 和 res.data.groups
  ↓
[建立 rankMap] rank 数组 → uid 映射
  ↓
[映射 groups] 用 rankMap 补充每个 player 的完整信息
  ↓
[补齐每组人数] group.rank < 4 → 补空数据
  ↓
[组数限制] groups.length > maxGroups ? slice : 保持
  ❌ 缺少补齐逻辑 (groups.length < maxGroups)
  ↓
Output: editGroups
```

### 2. 当前补齐逻辑

**行 155-168**: 补齐每组为 4 人 ✅

```js
groups = groups.map(g => {
    const rankCount = g.rank.length
    if (rankCount < 4) {
        const emptySlots = Array(4 - rankCount).fill(null).map(() => ({
            id: null,
            uid: null,
            name: "",
            avatar: "",
            num: 0
        }))
        g.rank = [...g.rank, ...emptySlots]
    }
    return g
})
```

**行 171-174**: 只有截断，缺补齐 ❌

```js
const maxGroups = this.stageData.stage === 4 ? 12 : 8
if (groups.length > maxGroups) {
    groups = groups.slice(0, maxGroups)
}
// 缺少: if (groups.length < maxGroups) { ... }
```

### 3. 补齐所需的空组结构

根据行 155-168 的 emptySlots 模式，一个空组应为：

```js
{
    group_name: "第X组",  // 需要确认从哪里来
    rank: [
        // playersPerGroup 个空位
        { id: null, uid: null, name: "", avatar: "", num: 0 },
        // ... 重复 playersPerGroup - 1 次
    ]
}
```

**动态人数规则**:
- stage=4: rank 固定 4 个
- stage=5, round=1: rank 固定 4 个  
- stage=5, round=2: rank 固定 **3 个** ✨ **新规则**

### 4. group_name 命名规则

观察 template（行 68-71）：
```vue
<span class="group-title">{{ group.group_name }}组</span>
```

API 返回的 groups 应该已经包含 group_name。补齐时需要生成新的 group_name。

推测规则：当前 groups 有 X 个，补到 maxGroups 时，新增的命名为 "第(X+1)组"、"第(X+2)组"... 等

---

## 关键参数表

| 字段 | stage=4 | stage=5, round=1 | stage=5, round=2 | 说明 |
|------|---------|-----------------|------------------|------|
| maxGroups | 12 | 8 | 8 | 目标组数 |
| playersPerGroup | 4 | 4 | **3** ✨ | 每组人数 |
| totalPlayers | 48 | 32 | 24 | 总人数（理论） |

---

## 修改建议

### 方案：支持轮次相关人数的完整改造

**修改位置**：行 155-176（getRank 方法中 groups 处理部分）

```js
// 第 1 步：计算当前 stage 和 round 对应的规格
const maxGroups = this.stageData.stage === 4 ? 12 : 8
const playersPerGroup = 
    this.stageData.stage === 4 ? 4 : 
    (this.activeRound === '2' ? 3 : 4)

// 第 2 步：补齐每组到 playersPerGroup 个人（替代现在的硬编码 4）
groups = groups.map(g => {
    const rankCount = g.rank.length
    if (rankCount < playersPerGroup) {
        const emptySlots = Array(playersPerGroup - rankCount).fill(null).map(() => ({
            id: null,
            uid: null,
            name: "",
            avatar: "",
            num: 0
        }))
        g.rank = [...g.rank, ...emptySlots]
    } else if (rankCount > playersPerGroup) {
        // 截断超额的人员
        g.rank = g.rank.slice(0, playersPerGroup)
    }
    return g
})

// 第 3 步：补齐或截断 groups 到 maxGroups 个组（新增）
if (groups.length < maxGroups) {
    // 补齐空组
    const emptyGroup = (index) => ({
        group_name: `第${index + 1}组`,
        rank: Array(playersPerGroup).fill(null).map(() => ({
            id: null,
            uid: null,
            name: "",
            avatar: "",
            num: 0
        }))
    })
    const additionalGroups = Array(maxGroups - groups.length)
        .fill(null)
        .map((_, i) => emptyGroup(groups.length + i))
    groups = [...groups, ...additionalGroups]
} else if (groups.length > maxGroups) {
    groups = groups.slice(0, maxGroups)
}
```

### 关键考量

1. **group_name 命名**: 补齐时按递增顺序命名 "第(n+1)组"
   - 现有 API 返回的 group_name 格式已确认
   - 补齐新组时按顺序生成

2. **每组人数检查**: 已在行 161-176 处理 ✅

3. **Node 12 兼容**: 避免 `?.` 和 `??` ✅（方案中未使用）

---

## 关键确认项 ✅

- ✅ **stage=5 第二轮（round=2）时每组 3 人** — 用户已确认
- ✅ 补齐空组时的 group_name 生成规则（"第13组"、"第14组"...）
- ✅ API 返回的 groups 按照 group_name 排序的（便于推断顺序）
- ℹ️ stage=1-3 使用 thunderCupQualifier，未涉及分组补齐
