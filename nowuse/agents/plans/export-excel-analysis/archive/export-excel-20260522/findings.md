# Export Excel 导出组件 — 调研发现

## 文件结构

```
src/components/exportExcel/
├── index.vue              # 弹窗组件：UI + 状态 + 导出分发
├── exportExcelHelpers.js  # 纯函数：参数组装、接口映射、随机抽样、列格式化

src/vendor/
├── Export2Excel.js        # 普通导出引擎（基于 xlsx 库）
├── Export2ExcelImage.js   # 图片+超链接导出引擎（基于 exceljs 库）
```

## 文件职责

### index.vue — 弹窗容器

- **props**: `exportExcelSource` → 标识数据源，驱动 `titleMap` 查找
- **核心 data**:
  - `list` — 接口原始数据（永不修改）
  - `exportList` — 筛选后的导出数据
  - `total` — 时间段内总数
  - `created_at` — 时间范围 `"秒级戳|秒级戳"`，用于随机分层抽样
  - `exportImageMode` — `"image"` 嵌入 Base64 / `"link"` 仅超链接
- **方法**:
  - `init()` — 重置状态，打开弹窗
  - `getList()` — 组装参数 → `getApiData()`
  - `getApiData()` — 调接口，存 `created_at` 时间范围
  - `clickExportExcel(1|2|3)` — 导出核心分发
  - `Export2Excel()` — 普通导出（无图）
  - `Export2ExcelImageJump()` — 图片+超链接导出

### exportExcelHelpers.js — 纯函数集

- `jsonToExcelData` — 各列表导出配置（header / filterVal / imageTargetCol）
- `titleMap` — 数据源 → searchName / 弹窗标题 / 开关
- `buildExportListPayload()` — 参数组装 + search_cond 改写
- `fetchExportApiBySource()` — 数据源路由
- `applyExportApiData()` — 接口响应数据映射
- `getRandomExportList()` — 分层随机抽样
- `createExportExcelFormatters()` — 列格式化工厂

### Export2Excel.js — 基于 xlsx

- 轻量，xlsx 库，不支持图片
- `export_json_to_excel({header, data, filename, ...})`
- 内部 `sheet_from_array_of_arrays` 写数据

### Export2ExcelImage.js — 基于 exceljs

- 支持 Base64 图片嵌入 + 超链接（HREF:: 协议）
- `export_json_to_excel({header, data, filename, imageTargetCol, ...})`
- 核心函数：
  - `calcImagePosition()` — 多图横排布局
  - `handleImageList()` — 处理 Base64 图片 + 收集失败 URL
  - `handleHyperlinkValue()` — 解析 `"HREF::url::text"` 格式
  - `handleMultiLinksToText()` — 单链接 cell-level hyperlink / 多链接富文本
  - `arrayToWorksheet()` — 核心转换：数组 → Excel 行

## 数据流

```
用户操作 newMySearch
        ↓
@saveSearchData="getList"   (onSearch)
        ↓
buildExportListPayload → 改写 search_cond 兼容各列表
        ↓
fetchExportApiBySource → 按 pExcelSource 路由到具体接口
        ↓
applyExportApiData → 映射各列表响应到统一 {list, total}
        ↓
list 存组件 data

用户点击「导出」
        ↓
clickExportExcel(val)
  val=1 → copyList 全部
  val=2 → copyList.slice(0, preCount)
  val=3 → getRandomExportList(copyList, randomCount, created_at)
        ↓
exportExcel()
  isImage → Export2ExcelImageJump()
  !isImage → Export2Excel()
        ↓
createExportExcelFormatters().formatJson / formatJsonImageJump
  → v-for j of filterVal → 按列名格式化字段值
        ↓
excel.export_json_to_excel({header, data, ...})
```

## 列表配置体系

### jsonToExcelData 配置项

当前已配置 11 个列表：

| 配置 key | 数据源 | isImage | onlyAll | imageTargetCol |
|---|---|---|---|---|
| memberBanList | 封禁记录 | false | true | - |
| memberBanListExport | 封禁记录(旧) | false | true | - |
| postList | 帖子列表 | true | false | 8 |
| postCommentList | 帖子评论列表 | true | false | 7 |
| postLogList | 社区操作记录 | true | false | 10 |
| pushList | 广播列表 | false | true | - |
| newsList | 资讯列表 | false | true | - |
| newsCommentList | 资讯评论列表 | true | false | 7 |
| live_apply_export | 历史直播 | false | false | - |
| moderationLogList | 人审操作记录 | true | false | 8 |
| playerCommentList | 评分评论列表 | true | false | 6 |

### titleMap 字段含义

```javascript
{
  searchName: "xxx",    // 关联 newMySearch source
  name: "中文名称",      // 弹窗标题
  onlyAll: true/false,  // true=仅可导出全部，false=显示前N条/随机
  isImage: true/false,  // true=走 Export2ExcelImage 引擎
}
```

## 格式化函数深度解析

### formatJson（普通导出）

处理每个 filterVal 列名 → 值映射：
- 时间列 → `getTimeToText()`
- `name` → `v.member.name || v.name || "未知用户"`
- `operate` → 系统/管理员/协管员 判断
- `source`/`banType` → 字典映射
- `catalog_id` → `getCatalogs()` 查圈子名
- `persist_time` → `timeToTextS()` 格式化
- 其它 → 直接返回原值

### formatJsonImageJump（图片+超链接导出）

扩展功能：

1. **HREF 列**（返回数组 `["HREF::url::text"]`）：
   - `id` (postCommentList) → `HREF::...comment_list?comment_id=...`
   - `id` (postList) → `HREF::...list?post_id=...`
   - `post_id` → `HREF::...list?post_id=...`
   - `object_id` (postLogList) → 按 `group_type` 路由到帖子/评论详情
   - `attachments` (link 模式) → 每个 URL 转为 `HREF::url::url`

2. **Base64 图片**（返回 Base64 字符串，image 模式）：
   - `attachments` 列 → 预取 `preprocessAllImages()` → 嵌入 Base64
   - 获取失败的 URL → 转超链接

3. **额外格式化**：
   - `postType` → `POST_TYPE_NAME` 字典
   - `action` → `postDeldeteOperateType` 字典
   - `status` → 隐藏/删除/正常
   - `visited` → 竖线拆分为浏览数/浏览人数
   - `category` (moderationLogList) → 聊天室/安全审核类型

## 随机导出分层抽样算法

```javascript
getRandomExportList(originList, targetCount, created_at)
```

1. 解析 `created_at` 时间范围 → `getCreatedAtRangeSeconds()`
2. **≤1小时**：直接 `sort(random).slice(0, targetCount)`
3. **>1小时**：
   a. 按自然小时分组（hourStartTimestamp）
   b. 按 `ratio = targetCount / total` 比例分配每组取几条
   c. `Math.floor()` 舍弃小数 → 可能不足
   d. 不足 → `targetCount - sumCounts` 从未选中的行中随机补全
   e. 超出 → 随机截断
4. 无时间范围 → 退化为简单随机抽样

**已知问题**：补全去重依赖 `v.id`，部分数据源无此字段。

## 导出引擎对比

| 维度 | Export2Excel.js | Export2ExcelImage.js |
|------|----------------|---------------------|
| 底层库 | `xlsx` | `exceljs` |
| 图片 | 不支持 | 支持 Base64 嵌入 |
| 超链接 | 不支持 | 支持（HREF:: 协议） |
| 列宽 | 自动计算 | 图片列固定宽，其余自动 |
| 合并单元格 | 支持 | 支持 |
| 使用数据源 | isImage=false | isImage=true |

## HREF:: 协议格式

`formatJsonImageJump` 生成 `HREF::` 前缀的字符串，`Export2ExcelImage.js` 解析：

```
格式: HREF::url::displayText
示例: HREF::https://admin.leisu.com/#/forum/list?post_id=123::123

解析: handleHyperlinkValue  split("::") → {text: "123", hyperlink: "https://..."}
```

## 接入新列表步骤

1. **jsonToExcelData 加配置**：header（表头）/ filterVal（字段）/ imageTargetCol（图片列号）
2. **titleMap 加映射**：searchName / name / onlyAll / isImage
3. **applyExportApiData 加映射分支**：接口响应 → {list, total}
4. **fetchExportApiBySource 加分支**：pExcelSource → 接口函数
5. **可选**：buildExportListPayload 加 search_cond 改写

## 可复用方案

1. **导出组件标准化**：所有列表页共享 Export Excel 弹窗，通过 `exportExcelSource` 区分
2. **newMySearch 统一搜索**：导出弹窗复用搜索组件，带出时间范围
3. **随机分层抽样**：适用于需要按时间均匀取样的场景
4. **HREF:: 协议 + 图片模式**：自定义导出格式定制方案

## 踩坑记录

1. **ExcelJS 超链接**：`richText` 的 text run 属性 `hyperlink` 不被 `exceljs 4.4.0` 支持，单超链接必须用 `cell.value = {text, hyperlink}`
2. **随机导出断链**：`getCreatedAtRangeSeconds()` 原先是无参调用，`dateTimeStr` 始终为 `undefined`，分层抽样死代码
3. **created_at 未赋值**：组件声明了但从未提取时间范围，修复后从 `data.search_cond.created_at_range` 提取
4. **missing id 字段去重**：部分数据源行无 id，补全时 `selectedIds` 为空集，可能重复选取

## 最佳实践

1. **数据不可变性**：`list` 始终不修改，导出前深拷贝 `JSON.parse(JSON.stringify(this.list))`
2. **格式缓存**：`createExportExcelFormatters()` 用 computed 创建一次，复用多次
3. **无状态纯函数**：exportExcelHelpers 保持无状态，所有数据通过参数传入
4. **枚举驱动**：一个 `titleMap` + `jsonToExcelData` 配置枚举决定所有行为
5. **异步并行**：图片预取 `preprocessAllImages()` 批量处理
6. **newMySearch 双向绑定**：`@saveSearchData="getList"` 将搜索条件传回组件