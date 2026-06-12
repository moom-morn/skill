# 任务计划：intelligence.vue isPool 区域对齐 postList.vue 逻辑

## 目标
将 `src/views/intelligence/intelligence.vue` 中 `isPool` 模式下的查询交互区域，改为与 `src/views/forum/postList.vue:83` 相同的逻辑，包括：
- 清空按钮（onPoolNameClear）
- 帖子 ID 存在路径提示（poolSearchResult）
- 自动/人工黑名单按钮

## 阶段

### Phase 1: 模板改动
- [ ] 将 `class="mb10"` 改为 `class="box_h mb10"`
- [ ] 添加清空按钮 `<newButton>`（onPoolNameClear）
- [ ] 添加 poolSearchResult 展示区域（「存在于」标签 / 「不在任何池子中」提示）
- [ ] 添加 flex1 占位
- [ ] 添加自动/人工黑名单按钮

### Phase 2: data 属性新增
- [ ] 新增 `poolNameSearchRunning: false`
- [ ] 新增 `poolSearchResult: null`

### Phase 3: 方法新增
- [ ] `trimPoolNameInput()` — 去首尾空格
- [ ] `parsePostIdForPoolQuery()` — 纯数字转 number
- [ ] `findPoolPathsByPostId()` — 在 poolList 中查找路径
- [ ] `onPoolNameClear()` — 清空搜索 + 重载
- [ ] `onPoolNameSearch()` — 搜索逻辑（防并发）
- [ ] `jumpToPool()` — 点击标签跳转
- [ ] `showPoolBlackList()` — 打开黑名单管理

## 关键问题
- `intelligence.vue` 的 `poolList` 结构与 `postList.vue` 一致（都有 `items` 字段），`findPoolPathsByPostId` 可直接复用
- `showPoolBlackList` 在 postList.vue 里打开 `poolblackList` 子组件，intelligence.vue 需要确认是否有相同组件

## 决定
- 黑名单管理：intelligence.vue 已有 `editPoolBlack` 方法处理黑名单，暂无 `poolblackList` 子组件。方案：直接复用现有 `editPoolBlack`，改为调用 `editPoolBlack` 传 type。