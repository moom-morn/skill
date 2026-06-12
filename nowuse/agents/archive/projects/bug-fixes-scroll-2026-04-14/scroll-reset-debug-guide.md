# Scroll重置问题 - 调试指南和修复方案

## 快速调试步骤

### 步骤1：确认滚动容器

在 postList.vue 中添加以下代码：

```javascript
mounted() {
    // 找出真正的滚动容器
    console.log('Window scrollable:', window.document.documentElement.scrollHeight > window.innerHeight);
    console.log('Current scroll container:', this.$el.scrollTop, this.$el.scrollHeight);
    
    // 监听滚动
    this._scrollListener = () => {
        console.log('Scroll position:', window.scrollY);
    };
    window.addEventListener('scroll', this._scrollListener);
}

beforeDestroy() {
    window.removeEventListener('scroll', this._scrollListener);
}
```

**预期输出**：确认是 `window` 还是某个 `.app-container` 元素在滚动

---

### 步骤2：监控打开people时的滚动变化

在 lsUser.vue 的 showUserInfo 中修改：

```javascript
showUserInfo(uid, ev) {
    // 记录打开前的位置
    const scrollBefore = window.scrollY;
    console.log('Scroll BEFORE opening people:', scrollBefore);
    
    // ... 计算z-index代码 ...
    
    this.$refs.people.isShowsideVisible = true;
    this.$refs.people.peopleId = uid;
    
    // 多个时序点监测
    this.$nextTick(() => {
        console.log('After $nextTick:', window.scrollY);
    });
    
    requestAnimationFrame(() => {
        console.log('After 1st RAF:', window.scrollY);
    });
    
    setTimeout(() => {
        console.log('After 0ms setTimeout:', window.scrollY);
        this.$refs.people.askIt(moudelName, xxkName);
    }, 0);
    
    setTimeout(() => {
        console.log('After 100ms setTimeout:', window.scrollY);
    }, 100);
}
```

**预期输出**：看到某个时序点的滚动位置发生了跳变

---

### 步骤3：检查people组件的DOM操作

在 people.vue 中添加日志：

```javascript
mounted() {
    console.log('People mounted - scroll position:', window.scrollY);
    console.log('This.$el:', this.$el);
    console.log('This.$el.style:', this.$el.style.cssText);
    
    this.$nextTick(() => {
        const body = document.querySelector("body");
        console.log('Body scroll before append:', window.scrollY);
        
        if (body.append) {
            body.append(this.$el);
        } else {
            body.appendChild(this.$el);
        }
        
        console.log('Body scroll after append:', window.scrollY);
    });
}
```

**预期输出**：看到 append 操作前后滚动位置是否改变

---

### 步骤4：检查sliderSide组件

需要找到 sliderSide 组件（`@/components/leisu/sliderSide`）并检查：

```javascript
// 在 sliderSide 组件中添加
watch: {
    isShowsideVisible(newVal) {
        console.log('SliderSide visibility changed:', newVal);
        console.log('Body overflow before:', document.body.style.overflow);
        this.$nextTick(() => {
            console.log('Body overflow after:', document.body.style.overflow);
            console.log('Body position:', document.body.style.position);
            console.log('Current scroll:', window.scrollY);
        });
    }
}
```

---

## 可能的修复方案

### 方案A：保存和恢复滚动位置（最快的临时方案）

**修改 lsUser.vue**:

```javascript
showUserInfo(uid, ev) {
    // 保存当前滚动位置
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    
    // ... 现有代码 ...
    
    this.$refs.people.isShowsideVisible = true;
    this.$refs.people.peopleId = uid;

    // 在侧边栏显示完成后恢复滚动位置
    this.$nextTick(() => {
        requestAnimationFrame(() => {
            window.scrollTo(0, scrollPosition);
        });
    });
    
    setTimeout(() => {
        this.$refs.people.askIt(moudelName, xxkName);
    }, 0);
}
```

**优点**: 快速、简单、立即可用  
**缺点**: 治标不治本，不优雅

---

### 方案B：改进people组件的挂载方式

**改造 people.vue 的 mounted**:

```javascript
// 改为使用 CSS 实现全局定位，而不是 DOM 脱离
mounted() {
    // 不再强制挂到 body，保留在 Vue 树中
    // 但给组件设置样式使其表现像全局组件
    
    // 可选：如果必须挂到 body，至少要做好滚动保护
    this.$nextTick(() => {
        const scrollTop = window.scrollY;
        
        const body = document.querySelector("body");
        if (body.append) {
            body.append(this.$el);
        } else {
            body.appendChild(this.$el);
        }
        
        // 强制恢复滚动位置
        window.scrollTo(0, scrollTop);
    });
}
```

---

### 方案C：在sliderSide显示时禁用body滚动（最优雅方案）

**如果sliderSide触发了滚动重置，可以这样处理**:

```javascript
// 在 people.vue 中
watch: {
    isShowsideVisible(val) {
        if (val) {
            // 记录当前滚动位置
            this._savedScrollPosition = window.scrollY;
            // 禁用 body 滚动
            document.body.style.overflow = 'hidden';
        } else {
            // 恢复滚动
            document.body.style.overflow = '';
            // 可选：恢复之前的位置
            this.$nextTick(() => {
                window.scrollTo(0, this._savedScrollPosition);
            });
        }
    }
}
```

---

### 方案D：使用事件机制保护滚动位置

在 lsUser 和 people 之间建立更清晰的通信：

```javascript
// lsUser.vue
showUserInfo(uid, ev) {
    // 保存滚动位置
    const scrollPos = window.scrollY;
    
    this.$refs.people.openDrawer(uid, moudelName, xxkName);
    
    // 监听 people 组件的打开完成事件
    this.$once('people-drawer-opened', () => {
        window.scrollTo(0, scrollPos);
    });
}

// people.vue
watch: {
    isShowsideVisible(val) {
        if (val) {
            this.$nextTick(() => {
                // 侧边栏打开完成
                this.$emit('drawer-opened');
            });
        }
    }
}
```

---

## 复现步骤（用于验证修复）

1. 打开 postList 页面
2. 向下滚动页面到某个位置（记住位置）
3. 点击任何用户头像/链接打开 people 侧边栏
4. **验证点**: 页面是否保持在之前的滚动位置
5. 关闭侧边栏
6. **验证点**: 页面是否仍在同样的位置

---

## 测试用例

### 测试场景1：浅滚动
- 滚动距离：50px
- 预期：打开侧边栏后仍在 ~50px 位置

### 测试场景2：深滚动
- 滚动距离：500px+
- 预期：打开侧边栏后仍在相同位置

### 测试场景3：顶部打开
- 滚动距离：0px
- 预期：打开侧边栏后仍在顶部

### 测试场景4：快速切换
- 打开侧边栏 → 关闭 → 再打开
- 预期：每次都能保持正确的滚动位置

### 测试场景5：在侧边栏中操作后
- 在 people 侧边栏中操作（如切换 tab）
- 关闭侧边栏
- 预期：主页面的滚动位置未改变

---

## 性能考虑

- 避免频繁的 `window.scrollTo()` 调用
- 使用 `requestAnimationFrame` 而非多个 setTimeout
- 考虑是否真的需要将 people 组件 append 到 body
  - 如果是为了 z-index 隔离，可用 CSS `isolation: isolate` 替代
  - 如果是为了逃出 overflow: hidden，考虑改进 postList 的布局

---

## 相关Vue特性

- **$nextTick()**: DOM更新后执行，但不保证浏览器完成重排
- **requestAnimationFrame()**: 在浏览器绘制前执行，更安全的时序控制
- **watch vs 事件**: watch 更简洁，事件更解耦

---

## 检查清单

- [ ] 确认滚动容器（window 或某个元素）
- [ ] 确认滚动位置变化的具体时序点
- [ ] 查看 sliderSide 组件的完整代码
- [ ] 检查是否有全局样式修改了 body/html 的 overflow
- [ ] 确认 people 组件的 append 操作是否必要
- [ ] 验证修复方案在多个页面的效果
