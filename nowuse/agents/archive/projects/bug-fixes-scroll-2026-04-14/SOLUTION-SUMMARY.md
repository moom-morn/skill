# Scroll重置Bug - 解决方案总结

**问题**: 打开people抽屉时，列表页面滚动位置会回到顶部

**影响**: postList 及其他使用people组件的页面

**优先级**: 🔴 高（严重影响用户体验）

---

## 一句话总结原因

People组件在mounted时将DOM挂到body上，导致可能的DOM重排或sliderSide样式副作用，重置了滚动位置。

---

## 问题根源（按可能性排序）

### 1️⃣ 最可能：SliderSide样式导致重排（70%概率）
- SliderSide组件显示时可能修改了 `body.overflow` 或其他全局样式
- 这会触发浏览器重新计算布局，导致滚动位置重置
- **证据**: 问题发生在打开侧边栏时，不是页面加载时

### 2️⃣ 很可能：DOM脱离操作（20%概率）
```javascript
// people.vue mounted()
body.append(this.$el)  // ← 这个操作可能触发重排
```
- 将Vue组件DOM移出文档树挂到body
- 浏览器可能因此重新计算滚动位置

### 3️⃣ 不太可能：其他因素（10%概率）
- 异步操作时序问题
- 路由变化
- 第三方库干扰

---

## 修复方案对比

| 方案 | 代码改动 | 修复原理 | 优先级 |
|------|--------|--------|------|
| **A** | 3行 | 保存滚动位置，打开后恢复 | ⭐⭐⭐ 立即修 |
| **B** | 中 | 改进people组件挂载方式 | ⭐⭐ 根本修 |
| **C** | 小 | 侧边栏显示时禁用body滚动 | ⭐⭐ 可尝试 |
| **D** | 多 | 改进组件通信机制 | ⭐ 长期优化 |

### 推荐执行顺序

1. **立即**: 使用方案A（最快，临时修复）
2. **短期**: 同时进行步骤2的调试，确认真正原因
3. **长期**: 根据调试结果选择方案B、C或D进行根本修复

---

## 立即可执行的修复（方案A）

**只需修改 1 个文件: `lsUser.vue`**

找到 `showUserInfo` 方法，替换为：

```javascript
showUserInfo(uid, ev) {
    // 🔴 关键改动：保存当前滚动位置
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    
    // ... 原有的 z-index 计算代码保持不变 ...
    
    this.$refs.people.isShowsideVisible = true
    this.$refs.people.peopleId = uid

    // 🟢 关键改动：打开侧边栏后立即恢复滚动位置
    this.$nextTick(() => {
        requestAnimationFrame(() => {
            window.scrollTo(0, scrollPosition);
        });
    });

    setTimeout(() => {
        this.$refs.people.askIt(moudelName, xxkName)
    }, 0)
}
```

**验证修复**:
1. 打开postList，滚动到中间位置
2. 点击用户头像打开people
3. ✅ 页面应该保持在之前的位置，不会跳到顶部

---

## 深度调试流程

如果方案A不起作用，执行以下调试：

### Step 1: 查找真正的滚动容器

在浏览器console执行：
```javascript
// 找出实际滚动的容器
console.log('window.scrollY:', window.scrollY);
console.log('.el-scrollbar scrollTop:', document.querySelector('.el-scrollbar')?.scrollTop);
console.log('.app-container scrollTop:', document.querySelector('.app-container')?.scrollTop);
```

### Step 2: 监控打开people时的位置变化

在 lsUser.vue 中添加：
```javascript
showUserInfo(uid, ev) {
    console.log('📍 打开前:', window.scrollY);
    this.$refs.people.isShowsideVisible = true;
    
    // 多个检查点
    requestAnimationFrame(() => console.log('📍 RAF后:', window.scrollY));
    setTimeout(() => console.log('📍 0ms后:', window.scrollY), 0);
    setTimeout(() => console.log('📍 100ms后:', window.scrollY), 100);
}
```

**目标**: 找到具体哪个操作导致了滚动位置变化

### Step 3: 检查sliderSide

在浏览器DevTools Elements标签中：
1. 打开people侧边栏
2. 检查 `<body>` 的 style 属性
3. 查看是否有 `overflow: hidden` 或其他关键样式被添加

### Step 4: 查看DOM变化

在DevTools中勾选 "Break on subtree modifications"：
1. 右键点击 `<body>` 元素
2. 选择 "Break on" → "subtree modifications"
3. 再次打开people侧边栏
4. 看console会停在修改DOM的代码

---

## 文件位置参考

```
src/
├─ views/
│  └─ forum/
│     └─ postList.vue         ← 问题现象出现地
│  └─ member/
│     └─ components/
│        └─ lsUser.vue        ← 需要修改此文件（showUserInfo方法）
└─ components/
   └─ leisu/
      └─ people.vue           ← 问题根源地（mounted钩子）
      └─ sliderSide/          ← 需要检查此组件
      └─ peopleInfo/          ← people的子组件
```

---

## 常见问题

**Q: 为什么别的抽屉/弹窗没有这个问题？**  
A: 他们可能没有在mounted时将DOM append到body，或者有特殊的滚动位置处理。

**Q: 改了lsUser.vue会影响其他地方吗？**  
A: 不会，这只是恢复滚动位置，是纯UI层的修改，不影响逻辑。

**Q: 能直接改people.vue的mounted吗？**  
A: 可以，但需要验证append到body是否必要。改动前最好先调试确认问题原因。

**Q: 关闭侧边栏后还需要恢复滚动吗？**  
A: 通常不需要，因为滚动位置本来就被打开时的操作改变了。但如果还是有问题，可以在people关闭时再恢复一次。

---

## 下一步行动

- [ ] **今天**: 执行方案A（lsUser.vue修改），验证是否解决
- [ ] **明天**: 如果方案A有效，记录完成；如果无效，执行深度调试
- [ ] **本周**: 根据调试结果选择根本修复方案
- [ ] **后续**: 检查所有使用people的地方是否都受影响

---

## 相关资源

- Vue $nextTick 文档：https://v3.vuejs.org/api/instance-methods.html#nexttick
- requestAnimationFrame 用法：MDN
- 滚动位置恢复最佳实践：见 scroll-reset-debug-guide.md

---

## 备注

- 此问题可能与 `sliderSide` 组件的CSS实现有关
- 需要进一步查看 sliderSide 的完整代码（特别是样式部分）
- 可以考虑添加通用的"打开modal时保存滚动位置"的工具函数，避免重复代码
