---
name: 代码审查发现汇总
description: dev分支的4个关键文件审查结果（Bug、质量、效率）
type: findings
date: 2026-04-22
---

## 发现汇总（按优先级）

### 🔴 高优先级（必须修复）

#### 1. 拼写错误 + 异常处理缺陷（misc.js:14-37）
- **reslove** → **resolve**（参数名拼写错误，会导致Promise无法正确reject）
- 错误处理后未return，代码继续执行（行49-59）
- 预计影响：**高** - 功能bug

#### 2. AES密钥硬编码在客户端（main.js:237-248）
- 加密密钥 hardcoded 在源代码中（安全风险）
- 预计影响：**高** - 安全风险

#### 3. Viewer事件监听器内存泄漏（main.js:123-135）
- `addEventListener` 未清理，每次viewer实例化都会增加新监听器
- 预计影响：**高** - 内存泄漏

#### 4. 代码重复：ks_tostring vs ks_tostring222（main.js:251-317）
- 99%相同，应该合并，只保留一个版本
- 预计影响：**中** - 维护成本

#### 5. 域名判断重复3次（main.js:389-417）
- jump_M_window / get_small_window / get_pc_window 中的domain判断完全重复
- 预计影响：**中** - 维护性

#### 6. 异常处理：askInfo/askVideoInfo（misc.js:39-122）
- 缺少return导致多次调用callback
- 代码重复度85%，应该合并
- 预计影响：**高** - 功能bug + 代码质量

#### 7. Magic Numbers & 硬编码参数（tool.js:481-521）
- 税费计算硬编码：0.03, 0.14, 0.112，金额阈值：800, 4000
- 嵌套7层if-else，应提取为配置表
- 预计影响：**高** - 维护性 + 易出错

#### 8. Base64处理重复正则匹配（tool.js:150-195）
- 多次执行正则替换和分割，可合并为单次操作
- 预计影响：**中** - 效率

### 🟡 中优先级（应该修复）

#### 9. 参数爆炸：uploadFileToOss（tool.js:73-85）
- 5个参数，应改为config对象
- 预计影响：**中** - API设计

#### 10. onlineImageSetBase64 返回值不一致（tool.js:204-288）
- 成功返回Base64，失败返回 `url + "\n"` 或空字符串
- 调用方无法区分
- 预计影响：**中** - Bug隐患

#### 11. 图片资源释放不完整（tool.js:226-265）
- `img.decode().catch()` 未完整清理Image对象
- 预计影响：**中** - 内存泄漏

#### 12. 数值库并行（tool.js:1-6, 338-479）
- Decimal + BigDecimal双库，API不一致
- 建议统一选择Decimal
- 预计影响：**中** - 维护性 + 代码膨胀

#### 13. 全局组件/prototype过多（main.js:33-408）
- 18个全局组件 + 30+个Vue.prototype方法
- 影响初始化时间，应lazy-load低频组件
- 预计影响：**中** - 初始化性能

#### 14. 时间格式化重复（tool.js:549-708 vs main.js:318-353）
- getTimeToText / getTimeToTextObj / getTimeToTextS / get_timeString 功能重复
- formatDateComponent 补零逻辑重复5处
- 预计影响：**中** - 代码复用

#### 15. Base64前缀检查硬编码（tool.js:110-142）
- 正则分散在多个函数，应提取为统一常量
- 预计影响：**低** - 代码维护性

### 🟢 低优先级（优化项）

#### 16. console覆盖无条件判断（main.js:504-509）
- 应检查是否已覆盖再操作
- 预计影响：**低** - 规范化

#### 17. 硬编码注释（main.js:100-101, 371-373）
- 时间戳注释应用git消息，代码注释应删除
- 预计影响：**低** - 代码整洁

---

## 修复计划（按优先级）

### 第一轮（3-4个高优先级修复）
- [ ] 修复 reslove 拼写错误 + 异常处理（misc.js）
- [ ] 提取AES密钥到secure config（main.js）
- [ ] 修复Viewer内存泄漏（main.js）
- [ ] 合并ks_tostring/ks_tostring222（main.js）

### 第二轮（中优先级）
- [ ] 提取域名判断为辅助函数（main.js）
- [ ] 合并askInfo/askVideoInfo（misc.js）
- [ ] 提取税费规则为配置表（tool.js）
- [ ] Base64处理优化（tool.js）

### 第三轮（低优先级）
- [ ] console覆盖规范化（main.js）
- [ ] 删除硬编码注释（main.js）
- [ ] 时间函数合并（tool.js + main.js）

---

## 修复顺序理由
1. 先修复功能bug（reslove, 内存泄漏, 异常处理）
2. 再修复安全风险（AES密钥）
3. 再处理代码质量问题（重复代码、magic numbers）
4. 最后优化性能和维护性
