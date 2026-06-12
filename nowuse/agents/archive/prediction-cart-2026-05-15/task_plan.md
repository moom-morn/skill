# 任务计划：预测购物车组件

## 目标
新建预测方案购物车功能，包括：
1. `edit_match_cart.vue` 主弹框（显示已选方案列表、调用 API 获取/保存购物车）
2. `editPrediction.vue` 子弹框（从单关/串关/足彩三个列表中多选方案）

## 涉及文件

| 文件 | 操作 |
|------|------|
| `src/views/match/components/match_cart/edit_match_cart.vue` | 重建 |
| `src/views/match/components/match_cart/editPrediction.vue` | 新建 |
| `src/api/match.js` | 新增 match_prediction_cart、match_save_prediction_cart |

## 验证标准
- 打开购物车弹框，init(params) 正确调用 API，cartData 渲染为 el-card 列表
- 点"添加"→ editPrediction 弹框，tabs 切换单关/串关/足彩，各自过滤当前 match_id
- 在售方案（match_status=0）可多选，点确定 emit success → handleConfirm 追加到 cartData（去重）
- 点"保存"调用 match_save_prediction_cart，成功提示后关闭弹框
- 标题行点击跳文章详情（articleDetail 组件）

## 状态
✅ 完成归档（2026-05-15）
