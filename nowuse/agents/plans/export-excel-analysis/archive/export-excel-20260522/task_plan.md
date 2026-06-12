# Export Excel 导出组件 — 反向分析归档

## 目标

梳理 Export Excel 弹窗组件的完整架构、数据流、文件职责与核心边界，输出可复用的新列表接入技术方案。

## 阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 1. 文件结构与职责划分 | complete | 4 个文件：组件、助手、普通导出、图片导出 |
| 2. 数据流链路 | complete | 弹窗 → newMySearch → 列表接口 → 数据映射 → 格式化 → 写文件 |
| 3. 导出模式与边界 | complete | 全部 / 前 N 条 / 随机 N 条；普通 / 图片+超链接 |
| 4. 随机导出分层抽样 | complete | 时间范围分层 + 按小时比例分配 + 补全截断 |
| 5. 超链接修复 | complete | 单超链接 cell-level HREF；多超链接回退富文本 |
| 6. 接入新列表步骤 | complete | 4 步：配置 → titleMap → 映射 → 关联 |

## 决策记录

| 决策 | 方案 | 原因 |
|------|------|------|
| 导出引擎分离 | Export2Excel.js（xlsx） / Export2ExcelImage.js（ExcelJS） | 图片支持需 ExcelJS 能力，xlsx 库不满足 |
| 随机导出分层逻辑 | getRandomExportList + getCreatedAtRangeSeconds + 按小时分组 | 保证时间段内各小时均匀分布，避免集中抽样 |
| 超链接修复 | 单链接 cell-level `{text, hyperlink}`；多链接回退富文本 | ExcelJS 4.4.0 不支持 rich text run 级别 hyperlink |
| 列表配置集中化 | jsonToExcelData 统一管理表头/字段/图片列 | 新列表只需加一条配置即可接入导出 |
| 图片模式 | image（嵌入 Base64）/ link（超链接） | Base64 文件大加载慢，link 模式性能好但需后续点开 |
| 去重改用索引 | 补全时用 `v.id` | 部分数据源无 id 字段时存在重复风险（已知问题，未修） |

## 已知问题

1. **随机导出补全去重有隐患**：`getRandomExportList` 第 540 行用 `v.id` 做去重，部分数据源行无 id 字段，`filter(Boolean)` 后 `selectedIds` 为空，补全时可能重复选取已选中的行。应改用数组下标去重。

## 验证标准

- [x] 导出 Excel 文件内容正确，表头匹配配置
- [x] 全部/前 N 条/随机 N 条三种模式均正常
- [x] 图片模式：嵌入 Base64 或超链接可选
- [x] 单超链接可点击（帖子 ID / 评论 ID / 操作对象 ID 链至后台）
- [x] 多附件超链接显示文字可见