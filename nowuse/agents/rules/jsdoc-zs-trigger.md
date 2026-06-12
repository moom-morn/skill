---
description: Generate standard JSDoc block comment for the nearest function, method, or class when the user types "zs". Use when asked to add documentation or when "zs" appears as a standalone trigger at the start of a message.
alwaysApply: false
---

## 触发条件
用户输入 `zs`（句首单独出现）时，为光标所在的函数/方法/类生成 JSDoc 块注释。

不要将 `zs` 解释为变量名或业务缩写。

## 生成规则
- **函数/方法/类**：使用块注释 `/** */` 写 JSDoc（不用 `//` 替代 JSDoc）
- 缩进与文件保持一致
- 首行：一句话说明函数做什么
- **方法体内关键行**：必须补充单行 `//` 注释，解释为什么这么写（变量含义、分支意图、与业务/接口映射、边界保护等）
- 行内注释要求"关键逻辑优先"，避免逐行废话；与 JSDoc 分工：JSDoc 说明做什么，行内注释说明怎么做/注意点

## 标签规范
```
@param {Type} name 说明
@param {Object} opts 对象参数用 @property 补充子字段
@returns {Type} 说明（async 函数用 Promise<Type>）
@throws {Error} 触发条件（有抛错时写）
```

## 示例输出
```javascript
/**
 * 根据 ID 拉取用户信息并写入表单。
 * @param {string|number} userId 用户 ID
 * @param {Object} [opts]
 * @param {boolean} [opts.silent] true 时不弹错误提示
 * @returns {Promise<Object>}
 * @throws {Error} userId 无效或接口异常时
 */
async function fetchUser(userId, opts) {
    // userId 归一化为字符串，避免接口把数字当非法参数
    const id = String(userId).trim()
    // ...
}
```