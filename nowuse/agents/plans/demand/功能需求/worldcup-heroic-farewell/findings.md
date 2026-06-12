# Findings

## 已有组件参考
- `editQuiz.vue` / `editYHSAward.vue`：drag-dialog + el-form 模式，可复用结构
- `thunderCupList.vue`：el-tabs 用法示例
- `editYHSAward.vue`：searchResource 用法参考（ref="searchResourceDialog" @setObj="setobj"）
- searchResource 调用方式：`this.$refs.searchResourceDialog.dialogVisible = true`

## worldcup.vue 现状
- 当前文件只有 1 行（几乎空文件），需要全新写

## API 文件位置
- `src/api/active.js`（已有 active 接口，worldcup 4 个接口追加到末尾）

## searchResource setObj 参数结构
- params.id → intelligence_id
- params.cover → item logo（封面）
- params.redirect_items[] 中 type:10 的项 → player { id, name, logo }

## 样式参考
- drag-dialog 组件：已在多个弹框中使用
- /deep/ .el-card__body { padding: 10px } 是项目惯例
- box_h 是 flex + justify-content:space-between 的全局类
