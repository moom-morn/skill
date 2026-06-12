# Bug分析：打开People抽屉导致页面滚动位置重置

**问题现象**: 在postList等多个页面中，打开people抽屉后，页面的滚动条会自动滚到顶部

**影响范围**: postList、可能还有其他包含类似交互的页面

**严重级别**: 高（影响用户体验，无法在打开信息卡后继续查看原位置内容）

---

## 问题分析

### 1. 根本原因链路

#### 问题发生的关键步骤：

1. **People组件DOM脱离**（people.vue:175-182）
   ```javascript
   mounted() {
       this.$nextTick(() => {
           const body = document.querySelector("body")
           if (body.append) {
               body.append(this.$el)  // ← 将people组件DOM挂到body
           } else {
               body.appendChild(this.$el)
           }
       })
   }
   ```
   - People组件在挂载时，**主动将自己的DOM节点从Vue组件树中移出**，直接附加到`<body>`上
   - 这样做的目的是为了实现"全局弹窗"效果（z-index层级独立）
   - **副作用**：这个操作可能触发浏览器重排/重绘，影响滚动位置

2. **SliderSide组件的样式影响**（people.vue 中使用）
   - SliderSide 组件通过 `isShowsideVisible` 控制显示/隐藏
   - 当侧边栏显示时，可能修改了父容器的滚动行为或布局

3. **打开过程中的DOM操作**（lsUser.vue:77-82）
   ```javascript
   showUserInfo(uid, ev) {
       // ... z-index计算
       this.$refs.people.isShowsideVisible = true  // ← 显示侧边栏
       this.$refs.people.peopleId = uid
       setTimeout(() => {
           this.$refs.people.askIt(moudelName, xxkName)
       }, 0)
   }
   ```
   - 同步改变 `isShowsideVisible` 和 `peopleId`
   - 这可能导致在SliderSide组件渲染期间产生滚动重置

### 2. 详细问题拆解

#### 问题A：DOM树外的组件初始化
- **位置**: people.vue mounted() 钩子
- **问题**: 组件脱离Vue组件树挂到body，失去了与父级滚动容器的同步
- **表现**: 打开侧边栏时，浏览器可能重新计算全局滚动位置
- **影响**: 所有使用people组件的页面都可能受影响

#### 问题B：滚动位置没有被保存
- **位置**: postList 或其他列表页面
- **问题**: 打开people侧边栏前，没有记录当前滚动位置
- **表现**: 无法恢复之前的滚动位置
- **影响**: 用户体验下降

#### 问题C：SliderSide组件的z-index和样式处理
- **位置**: people.vue 中的 sliderSide 组件
- **问题**: 不清楚 sliderSide 是否有全局样式修改（如 `overflow: hidden`）
- **表现**: 可能在显示侧边栏时修改了父级或body的overflow属性
- **影响**: 触发浏览器滚动位置重置

#### 问题D：异步操作时序问题
- **位置**: lsUser.vue showUserInfo() 中的 setTimeout
- **问题**: 虽然有setTimeout，但可能不足以等待DOM完全稳定
- **表现**: 在某些情况下（网络慢、页面复杂）会产生滚动闪烁
- **影响**: 不稳定的bug现象

---

## 排查清单

### 需要验证的点：

- [ ] **sliderSide 组件的样式**
  - 检查是否有 `position: fixed/absolute` 导致脱离文档流
  - 检查是否修改了父元素或body的 `overflow` 属性
  - 检查是否使用了 `transform/scale` 导致重排

- [ ] **postList 页面的滚动容器**
  - 确认滚动对象：是 `window` 还是某个 `.el-scrollbar` / `.scroll-container`
  - 检查是否有其他代码干扰滚动位置

- [ ] **people 组件的初始化时序**
  - 验证 mounted() 中 body.append 操作是否必要
  - 检查是否可以改为CSS方案（如 `position: fixed` 配合 z-index）

- [ ] **其他使用people的地方**
  - 列出所有引用 people 的组件
  - 确认是否都有相同问题

---

## 可能的根本原因总结

| 原因等级 | 描述 | 可能性 |
|---------|------|-------|
| **最可能** | SliderSide 或其父容器在显示时修改了 `overflow`/`position` 导致滚动重置 | ⭐⭐⭐⭐⭐ |
| **很可能** | People 组件 mounted() 时的 DOM 操作触发浏览器重排 | ⭐⭐⭐⭐ |
| **可能** | Body 上的样式改变（width/height）导致滚动条宽度变化 | ⭐⭐⭐ |
| **低概率** | 路由跳转或父组件更新导致的重新渲染 | ⭐⭐ |

---

## 后续行动计划

### Phase 1: 深入调查（开发环境）
1. 打开浏览器DevTools，监控：
   - 打开people侧边栏前后的 `window.scrollY` 变化
   - DOM变化（特别是 `<body>` 和滚动容器）
   - 触发的CSS重排/重绘事件

2. 在 postList 和 lsUser 中添加调试代码：
   ```javascript
   console.log('Before:', window.scrollY);
   this.$refs.people.isShowsideVisible = true;
   this.$nextTick(() => {
       console.log('After:', window.scrollY);
   });
   ```

3. 查看 sliderSide 组件代码（需要找到该组件文件）

### Phase 2: 修复方案设计（需要根据Phase 1结果调整）

可能的修复方向：
- **方案A**: 保存滚动位置后自动恢复
- **方案B**: 改造 people 组件的挂载方式（避免 DOM 脱离）
- **方案C**: 对 sliderSide 进行样式隔离，防止影响父级滚动
- **方案D**: 使用 Popover/Dialog 的标准方案替代自定义脱离

### Phase 3: 测试验证
- 在多个页面验证修复效果
- 测试滚动到不同位置时打开侧边栏
- 测试在侧边栏关闭后的滚动行为

---

## 相关文件关系图

```
postList.vue
    ↓
    使用了某个包含people的组件
    ↓
lsUser.vue (用户列表组件)
    ↓ 
    showUserInfo() 方法
    ↓
people.vue (人物信息侧边栏)
    ├─ mounted() → DOM挂到body
    ├─ sliderSide 组件 (未找到源码，需要查找)
    └─ 显示/隐藏通过 isShowsideVisible 控制
```

---

## 关键代码位置

- **people.vue**: L175-182 (mounted钩子，DOM脱离)
- **people.vue**: L13-14 (sliderSide使用)
- **lsUser.vue**: L77-82 (showUserInfo方法)
- **lsUser.vue**: L97 (people组件引用)

---

## 注意事项

- 此bug的症状是**滚动位置重置**，但真正的问题可能在 **sliderSide** 或 **CSS样式** 上
- 需要找到并检查 sliderSide 组件的完整代码（位置：`@/components/leisu/sliderSide`）
- 问题不止在 postList，说明这是 people 组件级别的通用问题
