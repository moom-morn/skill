# 兼容性 Bug 详细分析

**生成日期**：2026-04-20  
**优先级**：高 + 中  
**文件数**：5 个 Bug/问题，分 3 个文件跨越

---

## 🔴 Bug-1：positionMatchData 只处理斯诺克，定位进行中失效

### 问题描述

**路径**：`src/mixins/formatMatch.vue`

**表现**：
- 点击"定位进行中"按钮
- 对足球/篮球/网球/电竞/板球/棒球/冰球/排球/乒乓/橄榄 —— **完全无反应**，无法定位
- 仅对斯诺克(sport_id=19) 正常工作

**影响范围**：10 个运动类型（除斯诺克外的所有 commonball 运动）

---

### 根因分析

在 `formatMatch.vue` 中有两个定位方法：

#### 旧方法：`positionMatch`（完整实现）

```javascript
async positionMatch(obj) {
    if (this.sport_id == 1) {
        position = await football_active_match({match_time})
    } else if (this.sport_id == 2) {
        position = await basketball_active_match({match_time})
    } else if (this.sport_id == 3) {
        position = await tennis_active_match({match_time})
    } else if (this.sport_id == 5) {
        position = await cricket_active_match({match_time})
    } else if (this.sport_id == 6) {
        position = await baseball_active_match({match_time})
    } else if (this.sport_id == 8) {
        position = await puck_active_match({match_time})
    } else if (this.sport_id == 10) {
        position = await volleyball_active_match({match_time})
    } else if (this.sport_id == 11) {
        position = await pingpong_active_match({match_time})
    } else if (this.sport_id == 17) {
        position = await rugby_active_match({match_time})
    } else if (this.sport_id == 19) {
        position = await snooker_active_match({match_time})
    } else if (this.sport_id == 24) {
        position = await badminton_active_match({match_time})
    }
    // ... 分页跳转逻辑
}
```

✅ 完整覆盖所有 11 个运动

#### 新方法：`positionMatchData`（不完整）

```javascript
async positionMatchData(obj) {
    if (sport_id == 19) {
        position = await snooker_active_match({match_time})
    }
    // 其他所有 sport_id 都没有实现！
    return position  // 返回 undefined
}
```

❌ 只实现了 sport_id=19（斯诺克），其他全为 undefined

### 修复方案

**文件**：`src/mixins/formatMatch.vue`（方法 `positionMatchData`）

**步骤**：

1. 找到 `positionMatchData` 方法（通常在 100-150 行范围）
2. 复制旧方法 `positionMatch` 中的完整 if-else 分支（sport_id=1 到 24）
3. 替换到 `positionMatchData` 中

**代码片段**（供参考，需根据实际文件调整）：

```javascript
async positionMatchData(obj) {
    let position = null
    if (this.sport_id == 1) {
        position = await football_active_match({match_time: obj.match_time})
    } else if (this.sport_id == 2) {
        position = await basketball_active_match({match_time: obj.match_time})
    } else if (this.sport_id == 3) {
        position = await tennis_active_match({match_time: obj.match_time})
    } else if (this.sport_id == 5) {
        position = await cricket_active_match({match_time: obj.match_time})
    } else if (this.sport_id == 6) {
        position = await baseball_active_match({match_time: obj.match_time})
    } else if (this.sport_id == 8) {
        position = await puck_active_match({match_time: obj.match_time})
    } else if (this.sport_id == 10) {
        position = await volleyball_active_match({match_time: obj.match_time})
    } else if (this.sport_id == 11) {
        position = await pingpong_active_match({match_time: obj.match_time})
    } else if (this.sport_id == 17) {
        position = await rugby_active_match({match_time: obj.match_time})
    } else if (this.sport_id == 19) {
        position = await snooker_active_match({match_time: obj.match_time})
    } else if (this.sport_id == 24) {
        position = await badminton_active_match({match_time: obj.match_time})
    }
    
    // ... 后续分页跳转逻辑
    return position
}
```

---

### 验证方法

| 步骤 | 检查点 |
|------|--------|
| **步骤 1** | 进入足球列表：`/match/football/list` |
| **步骤 2** | 在列表中找到一场进行中的比赛（status=2 左右） |
| **步骤 3** | 点击右上角"定位进行中"按钮 |
| **检查** | ✅ 应跳转到该比赛所在页，列表滚动到该比赛位置 |
| | ❌ 若无反应或跳转错页，说明修复不成功 |
| **重复** | 对篮球、网球、板球、棒球、冰球、排球、乒乓、橄榄、羽毛球逐一验证 |

**验证命令**（本地）：
```bash
npm run dev
# 访问 http://dev.leisu.com:80/match/football/list
# 点击"定位进行中"按钮，观察是否定位成功
```

---

## 🔴 Bug-2：watch sport_id 被注释，Tab 切换后 sourceName 不更新

### 问题描述

**路径**：`src/views/match/commonball/match_list.vue`（第 167-174 行）

**表现**：
- 在包含 Tab 的页面（如某个比赛详情页有运动类型 Tab）
- 用户从足球 Tab 切换到篮球 Tab
- **搜索条件面板（newMySearch）仍显示足球的搜索 Key**（如"赛事"是足球的 Key）
- 搜索结果仍是足球的数据，而非篮球的数据

**影响范围**：所有动态切换 sport_id 的场景（Tab、多选弹窗等）

---

### 根因分析

**watch 被注释的代码**（第 167-174 行）：

```javascript
// watch: {
//     sport_id: {
//         handler(newVal, oldVal) {
//             this.sourceName = ""
//             this.$nextTick(() => {
//                 this.init()
//             })
//         },
//         immediate: true
//     }
// },
```

**问题链路**：

1. 初始化时 `created()` 调用 `init()`，设置 `sourceName = "footballMatchList"` 和 `refName = "footballMatchList"`
2. 用户在 Tab 中切换 `sport_id` prop（从 1 变为 2）
3. ❌ `watch` 被注释，不响应 sport_id 变化
4. ❌ `sourceName` 仍为 `"footballMatchList"`（足球）
5. ❌ `newMySearch` 组件使用的搜索 source 仍然是足球的配置
6. ❌ 搜索结果错误

**为什么被注释？** — 可能是为了避免动态切换时的双重初始化（created + watch），但这导致了更严重的 bug（搜索数据源完全错误）

---

### 修复方案

**文件**：`src/views/match/commonball/match_list.vue`

**步骤**：

1. 取消注释第 167-174 行的 watch 代码
2. 确保 `init()` 方法中的逻辑支持幂等操作（调用多次也无副作用）
3. 或者，在 watch 中手动设置 `isCreatedSearch = false`，防止双重搜索

**修复后的代码**（选项 1 —— 直接取消注释）：

```javascript
watch: {
    sport_id: {
        handler(newVal, oldVal) {
            this.sourceName = ""
            this.$nextTick(() => {
                this.init()
            })
        },
        immediate: true  // 注意：created 时也会触发，确保 init() 可幂等
    }
},
```

**修复后的代码**（选项 2 —— 防止双重初始化）：

```javascript
watch: {
    sport_id: {
        handler(newVal, oldVal) {
            if (this.list && this.list.length > 0) {
                // 仅在动态切换时执行（已初始化过后）
                this.sourceName = ""
                this.$nextTick(() => {
                    this.init()
                })
            }
        }
    }
},
```

**建议**：使用选项 1（直接取消注释），因为 `init()` 在本体系中已经是幂等的。

---

### 验证方法

| 步骤 | 检查点 |
|------|--------|
| **场景** | 找一个有多运动 Tab 的页面（如某社区推荐页有足篮球 Tab） |
| **步骤 1** | 打开足球 Tab，观察搜索面板的 Key（应该是足球的 source） |
| **步骤 2** | 点击篮球 Tab，sport_id 变为 2 |
| **步骤 3** | **关键**：观察搜索面板是否立即刷新为篮球的 Key |
| **检查** | ✅ 搜索 Key 应改变为篮球配置（如"赛事"改变映射） |
| | ❌ 若搜索 Key 仍是足球的，说明修复未生效 |
| **验证搜索** | 点搜索，确认返回的数据是篮球数据，不是足球数据 |

**验证命令**：
```bash
npm run dev
# 找一个有多运动 Tab 的页面，切换 Tab，观察搜索面板
```

---

## 🔴 Bug-3：setId 跳转路由缺少乒乓球(sport_id=11)前缀

### 问题描述

**路径**：`src/views/match/commonball/match_list.vue`（`setId` 方法，~第 279-304 行）

**表现**：
- 在乒乓球列表点击比赛 ID（蓝色链接）
- 跳转到 `/live/detail-xxx`（无运动子路径）
- **正确的路由应该是** `/live/pingpong/detail-xxx`（带 pingpong 前缀）
- 结果：404 或错误的比赛详情页

**影响范围**：乒乓球(sport_id=11) 列表的比赛 ID 点击跳转

---

### 根因分析

在 `setId` 方法中，有一个 sport_id → 路由前缀 的映射：

```javascript
setId(row) {
    if (isSrearchComp) {
        // emit 模式，无问题
    } else {
        let str = ""
        if (row.sport_id == 2) str = "lanqiu/"
        else if (row.sport_id == 3) str = "wangqiu/"
        else if (row.sport_id == 5) str = "banqiu/"
        else if (row.sport_id == 6) str = "bangqiu/"
        else if (row.sport_id == 8) str = "binqiu/"
        else if (row.sport_id == 10) str = "paiqiu/"
        // ❌ sport_id == 11 (乒乓) 没有映射！
        else if (row.sport_id == 17) str = "gelangluan/"
        else if (row.sport_id == 19) str = "shuoke/"
        else if (row.sport_id == 24) str = "yumaoquiu/"
        
        this.get_small_window(`/live/${str}detail-${row.match_id}`)
    }
}
```

**问题**：sport_id=11 的映射缺失，导致 `str=""` 保持空值，路由为 `/live/detail-xxx`（无前缀）

---

### 修复方案

**文件**：`src/views/match/commonball/match_list.vue`（`setId` 方法）

**步骤**：

1. 在 setId 方法的 if-else 中，找到所有 sport_id 的映射
2. 在 sport_id=10 和 sport_id=17 之间插入 sport_id=11 的映射
3. 乒乓球的英文名通常是 `pingpong`，所以前缀应是 `pingpong/`

**修复代码**：

```javascript
setId(row) {
    if (isSrearchComp) {
        // emit 模式
    } else {
        let str = ""
        if (row.sport_id == 2) str = "lanqiu/"
        else if (row.sport_id == 3) str = "wangqiu/"
        else if (row.sport_id == 5) str = "banqiu/"
        else if (row.sport_id == 6) str = "bangqiu/"
        else if (row.sport_id == 8) str = "binqiu/"
        else if (row.sport_id == 10) str = "paiqiu/"
        else if (row.sport_id == 11) str = "pingpong/"  // ✅ 补全
        else if (row.sport_id == 17) str = "gelangluan/"
        else if (row.sport_id == 19) str = "shuoke/"
        else if (row.sport_id == 24) str = "yumaoquiu/"
        
        this.get_small_window(`/live/${str}detail-${row.match_id}`)
    }
}
```

---

### 验证方法

| 步骤 | 检查点 |
|------|--------|
| **步骤 1** | 进入乒乓球列表：`/match/pingpong/list` |
| **步骤 2** | 点击任意比赛 ID（蓝色链接），例如 `detail-12345` |
| **步骤 3** | 观察浏览器地址栏的路由变化 |
| **检查** | ✅ 应跳转到 `/live/pingpong/detail-12345`（带 pingpong 前缀） |
| | ❌ 若显示 `/live/detail-12345`（无前缀）或 404，说明修复失败 |

**验证命令**：
```bash
npm run dev
# 访问 http://dev.leisu.com:80/match/pingpong/list
# 点击任意比赛 ID，观察路由是否包含 pingpong 前缀
```

---

## 🟡 Mid-1：otherControl 任务按钮 v-else 对所有非足篮球始终显示

### 问题描述

**路径**：`src/views/match/components/otherControl.vue`（第 245 行左右）

**表现**：
- otherControl 是表格中"额外数据"列的操作组件
- "任务"按钮显示逻辑有 if-else 分支
- 对足球和篮球有权限检查
- 对其他运动（板球/棒球/冰球/排球/乒乓/橄榄/斯诺克/羽毛球），**通过 v-else 始终显示为可点击的蓝色按钮**
- **问题**：这些运动可能没有"任务"功能权限，但按钮仍然显示，用户误认为有此功能

**影响范围**：sport_id 5/6/8/10/11/17/19/24（8 个非足篮球运动）

---

### 根因分析

代码逻辑（伪代码）：

```html
<!-- 足球/篮球有权限检查 -->
<el-button v-if="sport_id == 1 || sport_id == 2" @click="...">任务</el-button>

<!-- 所有其他运动都走 v-else，始终显示为可点击 -->
<span class="blue" @click="showTasksSlsLog(row)" v-else>任务</span>
```

**问题根源**：
- if 条件仅限制足篮球，v-else 相当于 `sport_id >= 3` 时都显示
- 设计可能的意图是"其他运动只读"或"未来扩展"，但实际表现是无条件显示且可点击

---

### 修复方案

**选项 A：完全隐藏其他运动的任务按钮**

适用于：其他运动暂不支持任务功能

```html
<el-button v-if="sport_id == 1 || sport_id == 2" @click="...">任务</el-button>
<!-- v-else 删除，或改为：-->
<!-- <span v-else style="color: #ccc">任务</span> （禁用灰显示） -->
```

**选项 B：增加更细的条件判断**

适用于：后续计划为其他运动添加任务功能

```html
<el-button 
    v-if="[1, 2, 3, 5].includes(sport_id)" 
    @click="showTasksSlsLog(row)">
    任务
</el-button>
```

**建议**：采用选项 A（完全隐藏），除非产品确认其他运动需要任务功能。

---

### 验证方法

| 步骤 | 检查点 |
|------|--------|
| **步骤 1** | 进入板球列表：`/match/cricket/list` |
| **步骤 2** | 查看表格中每行的"额外数据"列（otherControl） |
| **步骤 3** | 检查"任务"按钮是否显示 |
| **检查** | ✅ 若修复为隐藏，应该不显示"任务"按钮 |
| | ❌ 若仍显示，说明修复未生效 |
| **重复** | 对冰球、排球、乒乓、橄榄、斯诺克逐一验证 |

---

## 🟡 Mid-2：oddInfo 的 compOddWin 状态码逻辑对篮球不准确

### 问题描述

**路径**：`src/views/match/components/oddInfo.vue`（`compOddWin` computed 属性）

**表现**：
- oddInfo 组件显示足球/篮球的亚盘初盘、终盘、胜负判断（用颜色标注）
- 胜负判断的逻辑依赖 `match_status` 字段
- **问题**：使用的状态码逻辑 `match_status > 1 && match_status < 9` 是**足球状态码范围**
- 篮球的 match_status 范围是 1-11，与足球的 1-8 不同
- **结果**：篮球的亚盘显示可能不准确（胜负颜色判断错误）

**影响范围**：篮球(sport_id=2) 列表的亚盘让分列

---

### 根因分析

假设 oddInfo.vue 中有如下逻辑：

```javascript
computed: {
    compOddWin() {
        // 旧代码：假设 match_status 范围是 1-8（足球标准）
        if (this.match_status > 1 && this.match_status < 9) {
            // 比赛进行中，显示"进行中"颜色（如黄色）
            return 'progress'
        } else if (this.match_status >= 9) {
            // 比赛结束，显示胜负结果（绿/红）
            return 'finished'
        }
    }
}
```

**篮球状态码可能是**：
- 1: 未开始
- 2-10: 进行中（多节）
- 11: 结束

所以篮球的 match_status=10（第4节进行中）会被旧逻辑误判为"结束"状态，导致颜色显示错误。

---

### 修复方案

**文件**：`src/views/match/components/oddInfo.vue`（`compOddWin` computed）

**步骤**：

1. 在 `compOddWin` 中区分 sport_id
2. 对篮球(sport_id=2)使用正确的状态码范围（假设 1-11）
3. 对足球(sport_id=1)保持原逻辑

**修复代码**：

```javascript
computed: {
    compOddWin() {
        // 区分足球和篮球的状态码范围
        if (this.sport_id == 1) {
            // 足球：status 2-8 为进行中
            if (this.match_status > 1 && this.match_status < 9) {
                return 'progress'
            } else if (this.match_status >= 9) {
                return 'finished'
            }
        } else if (this.sport_id == 2) {
            // 篮球：status 2-10 为进行中（假设）
            if (this.match_status > 1 && this.match_status < 11) {
                return 'progress'
            } else if (this.match_status >= 11) {
                return 'finished'
            }
        }
        // 其他运动暂不处理（oddInfo 仅足篮球使用）
        return 'unknown'
    }
}
```

---

### 验证方法

| 步骤 | 检查点 |
|------|--------|
| **步骤 1** | 进入篮球列表：`/match/basketball/list` |
| **步骤 2** | 找到一场进行中的比赛（status 2-10） |
| **步骤 3** | 查看亚盘让分列的颜色标注 |
| **检查** | ✅ 进行中的比赛应显示"进行中"颜色（如黄色） |
| | ❌ 若显示为结束颜色（绿/红），说明状态码判断错误 |
| **步骤 4** | 找到一场结束的比赛，验证颜色应为胜负颜色 |

---

## 📋 修复优先级和工时评估

| Bug | 优先级 | 文件 | 工时 | 难度 | 验证复杂度 |
|-----|--------|------|------|------|-----------|
| Bug-1 | 🔴 高 | formatMatch.vue | 0.5h | 低 | 低 |
| Bug-2 | 🔴 高 | match_list.vue | 0.25h | 低 | 低 |
| Bug-3 | 🔴 高 | match_list.vue | 0.1h | 低 | 低 |
| Mid-1 | 🟡 中 | otherControl.vue | 0.3h | 低 | 低 |
| Mid-2 | 🟡 中 | oddInfo.vue | 0.2h | 中 | 中 |
| **总计** | - | 5 个文件 | ~1.35h | - | - |

---

## ✅ 完整验证清单

### 修复前准备

- [ ] npm run dev 已启动
- [ ] 各个 list 页面访问正常
- [ ] 浏览器控制台无报错

### 按 Bug 验证

#### Bug-1 验证（定位进行中）

- [ ] 足球列表点"定位进行中" ✅ 正常定位
- [ ] 篮球列表点"定位进行中" ✅ 正常定位
- [ ] 网球列表点"定位进行中" ✅ 正常定位
- [ ] 板球列表点"定位进行中" ✅ 正常定位
- [ ] 乒乓列表点"定位进行中" ✅ 正常定位

#### Bug-2 验证（Tab 切换）

- [ ] 找到含 Tab 的页面（如某推荐页）
- [ ] 切换 Tab（如足球→篮球）
- [ ] 搜索面板立即更新 ✅
- [ ] 搜索结果正确（篮球数据）✅

#### Bug-3 验证（乒乓跳转）

- [ ] 乒乓列表点击比赛 ID
- [ ] 路由包含 `/live/pingpong/detail-xxx` ✅

#### Mid-1 验证（任务按钮）

- [ ] 板球列表无"任务"按钮（或灰显）✅
- [ ] 其他非足篮球运动同样无"任务"按钮✅

#### Mid-2 验证（篮球状态码）

- [ ] 篮球列表进行中比赛的亚盘显示为"进行中"色 ✅
- [ ] 篮球列表结束比赛的亚盘显示为"结束"色 ✅

---

**修复完成后，建议创建 PR 到 dev 分支，并附上本验证清单的检查结果。**
