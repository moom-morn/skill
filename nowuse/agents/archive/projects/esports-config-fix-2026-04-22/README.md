# 电竞配置修正项目 — 2026-04-22 完成归档

**项目名**：电竞游戏搜索条件标准化修正  
**完成日期**：2026-04-22  
**状态**：✅ 已完成并归档

---

## 📋 项目概述

本项目修正了电竞游戏（LOL、CSGO、DOTA、KOG）搜索配置中的参数值错误，确保搜索条件与 `resourceTextJump` 标准字典保持一致。

### 核心完成内容

**1. 代码修复（4个文件）**
- `src/components/newMySearch/components/searchKey/compKey/matchBall/lol.js`
- `src/components/newMySearch/components/searchKey/compKey/matchBall/csgo.js`
- `src/components/newMySearch/components/searchKey/compKey/matchBall/dota.js`
- `src/components/newMySearch/components/searchKey/compKey/matchBall/kog.js`

**修正内容：**
- ✅ `search` 参数值标准化：
  - `queryTournament` → `competition`
  - `queryStage` → `stage`
  - `queryTeam` → `team`
- ✅ 注释掉无对应 resourceTextJump 定义的字段
  - `hero_id`（英雄）
  - `equipment_id`（装备）
  - `map_id`（地图）
  - `weapon_id`（武器）
  - `item_id`（物品）

**2. 开发参考文档（2个核心文档）**

#### `多条件查询核心概念.md`
- SearchCondition 配置对象结构详解
- compType 四种组件类型说明
- Parameter pasting 与 search 参数详解
- esports 游戏映射与字段分类
- 两种实现方式对比（动态search vs 静态opts）
- 实现工作流指南

#### `电竞配置修正清单.md`
- 详细错误诊断和修正方案
- 所有 4 游戏的具体修正步骤
- 修正前后配置对比示例
- 完整的修正检查清单

---

## 🎯 参考价值

### 多条件查询系统
- SearchCondition 配置的标准结构
- compType（select、input、date、range）使用规范
- Parameter pasting 与字段映射关系

### 搜索参数标准化
- resourceTextJump 字典的重要性和使用方法
- 有效搜索值验证机制
- 动态搜索（search）vs 静态选项（opts）的选择策略

### 电竞游戏配置
- 4个电竞游戏（LOL、CSGO、DOTA、KOG）的统一配置模式
- searchSportId 映射（LOL=1, CSGO=2, DOTA=3, KOG=4）
- 通用字段 vs 游戏特有字段的处理方式

---

## 📚 后续工作

### 优先级：中
1. **静态数据完善** — 为 game-specific 字段填充 opts 数组
   - 英雄、装备、地图、武器、物品的静态选项列表
   - 需要从后端 API 或数据库获取完整列表

2. **后端验证** — 确认后端支持新的 search 参数值
   - 测试 API 是否接受 "competition"、"stage"、"team" 值
   - 验证返回数据格式正确性

3. **集成测试** — 本地测试搜索功能
   - 验证筛选逻辑正确
   - 验证分页和排序配合工作

---

## 📁 文件清单

```
.claude/archive/projects/esports-config-fix-2026-04-22/
├── README.md                        （此文件）
├── 多条件查询核心概念.md             （核心开发参考）
└── 电竞配置修正清单.md              （修正指南）
```

---

## 🔗 相关代码位置

**修改的游戏配置文件：**
- `/src/components/newMySearch/components/searchKey/compKey/matchBall/lol.js`
- `/src/components/newMySearch/components/searchKey/compKey/matchBall/csgo.js`
- `/src/components/newMySearch/components/searchKey/compKey/matchBall/dota.js`
- `/src/components/newMySearch/components/searchKey/compKey/matchBall/kog.js`

**参考字典：**
- `/src/utils/dict/common.js` — resourceTextJump 定义

**搜索组件：**
- `/src/components/newMySearch/` — 多条件搜索组件

---

**管理人**：陈文  
**最后更新**：2026-04-22
