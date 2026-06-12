# IP模板列统一替换 实现计划

> **供代理工作者使用：** 必需的子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 来逐个任务实现此计划。步骤使用 checkbox（`- [ ]`）语法。

**目标：** 将 5 个列表页中分散的 channel/ip/platform 列统一替换为 `IpTemplate` 组件，并补齐对应 searchKey 配置中缺失的搜索参数。

**架构：** 在 el-table 倒数第二列（操作列之前）插入 `<IpTemplate :info="row" :key="ip_template_${$index}" />`，删除原有的归属地/平台/渠道分散列。同时在对应的 newMySearch searchKey 配置中补充 `ip`、`device_id` 参数（参考 `user.js` 中 `memberOpinionList` 的完整配置）。

**技术栈：** Vue 2 选项式 API + Element UI

**参考模板：** `src/views/forum/postList.vue:405-409` — 已有的 IpTemplate 实现

---

## 非 el-table 接口清单（不处理）

以下接口对应页面不含 el-table 或位于 components 子目录，不在本次改造范围：

| 接口 | 原因 |
|---|---|
| `/v1/group/comment_detail/<comment_id>` | 详情页，非列表 |
| `/v1/group/charge_post_buyer` | `src/views/forum/components/` 子目录 |
| `/v1/chat/gift_buyer` | views 中无 el-table 使用 |
| `/v1/chat/meme_buyer` | `src/views/chat_room/components/` 子目录 |
| `/v1/news/comment_detail/<comment_id>` | 详情页 |
| `/v1/news/tip_list` | `src/views/intelligence/tipList.vue` 无 channel/ip/platform 列 |
| `/v1/pay/abnormal_recharge_list` | views 中无 .vue 使用 |
| `/v1/member/device_login_log` | views 中无 .vue 使用 |
| `/v1/member/device_register_log` | views 中无 .vue 使用 |
| `/v1/member/pendant_data` | `src/views/member/components/` 子目录 |
| `/v1/member/pendant_buyer` | `src/views/member/components/` 子目录 |
| `/v1/group/report_list` | `src/views/forum/report_list.vue` 无 channel/ip/platform 列 |
| `/v1/group/me_tipping` | views 中无 .vue 直接使用 |
| `/v1/group/tipping_me` | `src/views/forum/components/` 子目录 |
| `/v1/group/post_detail_v2/<post_id>` | 详情接口 |
| `/v1/member/opinion_list` (feedBackList.vue) | 已有 IpTemplate ✅ |
| `/v1/group/post_list_v2` (postList.vue) | 已有 IpTemplate ✅ |

---

## 改造清单

共 5 个列表页 + 4 处 searchKey 配置补充：

| 序号 | View 文件 | 接口 | searchKey source | searchKey 文件 | 需补参数 |
|---|---|---|---|---|---|
| 1 | `src/views/forum/comment_list.vue` | `/v1/group/comment_list` | `postCommentList` | `post.js` | `device_id` |
| 2 | `src/views/intelligence/intelligenceComment.vue` | `/v1/news/intelligence_comment_lists` | `newsCommentList` | `news.js` | `device_id` |
| 3 | `src/views/member/newReportingList.vue` | `/v1/member/complain_list_v2` | `postReportingList` / `newsReportingList` | `post.js` / `news.js` | 无需补 ✅ |
| 4 | `src/views/forum/weekly_card_list.vue` | `/v1/group/week_card_purchase_list` | `interactiveWeeklyCardList` | `post.js` | `ip`, `device_id` |
| 5 | `src/views/pay/transactionlist.vue` | `/v1/pay/transaction_list` | `payTransactionList` | `pay.js` | `ip`, `device_id` |

---

### 任务 1：postCommentList searchKey 补充 device_id

**文件：**
- 修改：`src/components/newMySearch/components/searchKey/compKey/post.js:375-390`

- [ ] **第 1 步：在 postCommentList 中添加 device_id 参数**

在 `postCommentList` 对象的 `ip` 行之后，添加 `device_id`：

```js
// 帖子评论
postCommentList: {
    created_at: {label: "创建时间", key: "created_at", compType: "date", more: false, defaultValue: setClickShortcutsTime(9)},
    id: {label: "评论ID", key: "id", compType: "input", rules: "int", parameterKey: true},
    member_id: {label: "UID", key: "member_id", compType: "input", parameterKey: true, search: "user", rules: "int"},
    post_id: {label: "帖子ID", key: "post_id", compType: "input", rules: "int", search: "post", parameterKey: true},
    catalog_id: {label: "圈子", key: "catalog_id", more: true, compType: "select", filterable: true, selectGroupType: "groupCircle", selectGroup: true, opts: postCatalogFilterOption()},
    platform: {label: "平台", key: "platform", compType: "select", more: true, opts: platformList},
    channel: {label: "渠道", key: "channel", compType: "select", more: true, selectGroupType: "groupChannel", selectGroup: true, opts: channelListFilterOption()},
    content: {label: "评论内容", key: "content", compType: "input", precise: 1, showPrecise: true},
    votes: {label: "点赞数", key: "votes", compType: "range"},
    deleted: {label: "删除", key: "deleted", compType: "select", opts: YesOrNo},
    hidden: {label: "隐藏", key: "hidden", compType: "select", opts: YesOrNo},
    parent_id: {label: "父级评论ID", key: "parent_id", compType: "input", rules: "int", parameterKey: true},
    ip: {label: "IP", key: "ip", compType: "input"},
    device_id: {label: "设备ID", key: "device_id", compType: "input"},  // ← 新增
    at_id: {label: "被引用的评论id", key: "at_id", compType: "input", rules: "int", parameterKey: true}
},
```

---

### 任务 2：newsCommentList searchKey 补充 device_id

**文件：**
- 修改：`src/components/newMySearch/components/searchKey/compKey/news.js:330-345`

- [ ] **第 1 步：在 newsCommentList 中添加 device_id 参数**

在 `newsCommentList` 对象的 `ip` 行之后，添加 `device_id`：

```js
newsCommentList: {
    ctime: {label: "创建时间", key: "ctime", compType: "date", more: false, defaultValue: setClickShortcutsTime(9)},
    id: {label: "评论ID", key: "id", compType: "input", rules: "int", parameterKey: true},
    member_id: {label: "UID", key: "member_id", compType: "input", parameterKey: true, search: "user", rules: "int"},
    intelligence_id: {label: "资讯ID", key: "intelligence_id", compType: "input", rules: "int", search: "intelligence", parameterKey: true},
    platform: {label: "平台", key: "platform", compType: "select", more: true, opts: platformList},
    channel: {label: "渠道", key: "channel", compType: "select", more: true, selectGroupType: "groupChannel", selectGroup: true, opts: channelListFilterOption()},
    content: {label: "评论内容", key: "content", compType: "input", precise: 1, showPrecise: true},
    votes: {label: "点赞数", key: "votes", compType: "range"},
    deleted: {label: "删除", key: "deleted", compType: "select", opts: YesOrNo},
    status: {label: "隐藏", key: "status", compType: "select", opts: YesOrNo},
    pid: {label: "父级评论ID", key: "pid", compType: "input", rules: "int", parameterKey: true},
    ip: {label: "IP", key: "ip", compType: "input"},
    device_id: {label: "设备ID", key: "device_id", compType: "input"},  // ← 新增
    at_id: {label: "被引用的评论id", key: "at_id", compType: "input", rules: "int", parameterKey: true},
    magic: {label: "神评", key: "magic", compType: "select", opts: YesOrNo}
},
```

---

### 任务 3：interactiveWeeklyCardList searchKey 补充 ip + device_id

**文件：**
- 修改：`src/components/newMySearch/components/searchKey/compKey/post.js:89-103`

- [ ] **第 1 步：在 interactiveWeeklyCardList 中添加 ip 和 device_id 参数**

在 `platform` 行之后，`id` 行之前，添加 `ip` 和 `device_id`：

```js
interactiveWeeklyCardList: {
    // 互动周卡
    created_at: {label: "创建时间", key: "created_at", compType: "date", more: false},
    buyer_id: {label: "买家", key: "buyer_id", compType: "input", search: "user", parameterKey: true, rules: "int"},
    seller_id: {label: "卖家", key: "seller_id", compType: "input", search: "user", parameterKey: true, rules: "int"},
    type: {label: "类型", key: "type", compType: "select", opts: Object.values(week_card_purchase_type)},
    source: {label: "购买方式", key: "source", compType: "select", opts: Object.values(weekPurMethod)},
    pur_scene: {label: "来源", key: "pur_scene", compType: "select", defaultValue: 19871130, opts: [{value: 19871130, label: "全部"}, ...Object.values(weekPurSceneMethod)]},
    channel: {key: "channel", label: "渠道", compType: "select", more: true, selectGroupType: "groupChannel", selectGroup: true, opts: channelListFilterOption()},
    platform: {label: "平台", key: "platform", compType: "select", more: true, opts: platformList},
    ip: {label: "IP", key: "ip", compType: "input"},                      // ← 新增
    device_id: {label: "设备ID", key: "device_id", compType: "input"},     // ← 新增
    id: {label: "ID", key: "id", compType: "input", precise: 2, rules: "int"},
    buyer__banned: {label: "买家封禁", key: "buyer__banned", defaultValue: 19871130, compType: "select", opts: [{value: 19871130, label: "否"}, {value: 4, label: "是"}]},
    buyer__group_id: {label: "买家黑名单", key: "buyer__group_id", defaultValue: 19871130, compType: "select", opts: [{value: 19871130, label: "否"}, {value: 3, label: "是"}]},
    expire_at: {label: "结束时间", key: "expire_at", compType: "date", more: false}
},
```

---

### 任务 4：payTransactionList searchKey 补充 ip + device_id

**文件：**
- 修改：`src/components/newMySearch/components/searchKey/compKey/pay.js:69-`

- [ ] **第 1 步：在 payTransactionList 中添加 ip 和 device_id 参数**

在 `platform` 行之后，`status` 行之前，添加 `ip` 和 `device_id`：

```js
payTransactionList: {
    // 支付-支付记录列表
    create_at: {label: "创建时间", key: "create_at", compType: "date", more: false},
    channel: {
        key: "channel",
        label: "渠道",
        compType: "select",
        more: true,
        selectGroupType: "groupChannel", selectGroup: true, opts:channelListFilterOption()
    },
    platform: {
        label: "平台",
        key: "platform",
        compType: "select",
        more: true,
        opts: platformList
    },
    ip: {label: "IP", key: "ip", compType: "input"},                      // ← 新增
    device_id: {label: "设备ID", key: "device_id", compType: "input"},     // ← 新增
    status: {
        key: "status",
        // ... 后续保持不变
```

注意：需要确认 `pay.js` 顶部已 import `platformList` 和 `channelListFilterOption`（第 1 行附近检查）。

---

### 任务 5：comment_list.vue 改造

**文件：**
- 修改：`src/views/forum/comment_list.vue`

**操作：**
- 删除 line 170-179 的"归属地"列（`<el-table-column label="归属地" :width="220">...</el-table-column>`）
- 删除 line 180-186 的"渠道"列（`<el-table-column label="渠道" :width="80">...</el-table-column>`）
- 在 line 187（操作列之前）插入 IpTemplate 列
- 在 `<script>` 中 import `IpTemplate` 并注册

- [ ] **第 1 步：删除归属地列**

定位到 `<el-table-column label="归属地" :width="220">` 并删除整个列定义（从 line 170 到 179）。

- [ ] **第 2 步：删除渠道列**

定位到 `<el-table-column label="渠道" :width="80">` 并删除整个列定义（从 line 180 到 186）。

- [ ] **第 3 步：插入 IpTemplate 列**

在操作列（`<el-table-column label="操作"`，原 line 187）之前插入：

```html
<el-table-column label="渠道/设备/IP" :width="200">
    <template slot-scope="{row, $index}">
        <IpTemplate :info="row" :key="`ip_template_${$index}`" />
    </template>
</el-table-column>
```

- [ ] **第 4 步：import IpTemplate**

在 `<script>` 中添加 import：

```js
import IpTemplate from "@/components/general/ipTemplate.vue"
```

或者（如果 general/index.js 统一导出可用）:

```js
import {IpTemplate} from "@/components/general"
```

- [ ] **第 5 步：注册组件**

在 `components` 中注册 `IpTemplate`。

- [ ] **第 6 步：确认不再使用的变量**

检查原本归属地/渠道列使用的 `platformSVG` 是否在其他列还在使用，如果不再使用则从 import 中移除。

---

### 任务 6：intelligenceComment.vue 改造

**文件：**
- 修改：`src/views/intelligence/intelligenceComment.vue`

**操作：**
- 删除 line 141-150 的"归属地"列
- 在 line 151（操作列之前）插入 IpTemplate 列
- import 并注册 IpTemplate

- [ ] **第 1 步：删除归属地列**

定位到 `<el-table-column label="归属地" :width="180">` 并删除整个列定义（约 line 141-150）。

- [ ] **第 2 步：插入 IpTemplate 列**

在操作列（`<el-table-column v-if="hasPwer('intelligence_save_comment_group')...`，line 151）之前插入：

```html
<el-table-column label="渠道/设备/IP" :width="200">
    <template slot-scope="{row, $index}">
        <IpTemplate :info="row" :key="`ip_template_${$index}`" />
    </template>
</el-table-column>
```

- [ ] **第 3 步：import 和注册 IpTemplate**

```js
import {IpTemplate} from "@/components/general"
```

在 components 中注册。

- [ ] **第 4 步：清理 platformSVG**

检查 `platformSVG` 是否在其他地方使用，如果不再使用则从 import 和 data 中移除。

---

### 任务 7：newReportingList.vue 改造

**文件：**
- 修改：`src/views/member/newReportingList.vue`

**操作：**
- 删除 line 138-144 的"渠道"列
- 删除 line 145-154 的"归属地"列
- 在 line 156（操作列之前）插入 IpTemplate 列
- import 并注册 IpTemplate

- [ ] **第 1 步：删除渠道列**

删除 `<el-table-column label="渠道" :width="120">`（line 138-144）。

- [ ] **第 2 步：删除归属地列**

删除 `<el-table-column label="归属地" :width="220">`（line 145-154）。

- [ ] **第 3 步：插入 IpTemplate 列**

在操作列（`<el-table-column label="操作"`，line 156）之前插入：

```html
<el-table-column label="渠道/设备/IP" :width="200">
    <template slot-scope="{row, $index}">
        <IpTemplate :info="row" :key="`ip_template_${$index}`" />
    </template>
</el-table-column>
```

- [ ] **第 4 步：import 和注册 IpTemplate**

在 `<script>` 中：

```js
import {ParsePlatformObj} from "@/utils/dict"
import IpTemplate from "@/components/general/ipTemplate.vue"
```

在 components 中注册。

- [ ] **第 5 步：清理不再使用的变量**

检查 `platformSVG` 是否还在其他地方使用（该文件在 data 中有 `platformSVG`），如果不再使用则移除。

---

### 任务 8：weekly_card_list.vue 改造

**文件：**
- 修改：`src/views/forum/weekly_card_list.vue`

**操作：**
- 删除 line 107-116 的"归属地"列
- 删除 line 117-123 的"渠道"列
- 在 line 124（额外数据列之前，或操作列 line 129 之前）插入 IpTemplate 列
- import 并注册 IpTemplate

- [ ] **第 1 步：删除归属地列**

删除 `<el-table-column label="归属地" :width="220">`（line 107-116）。

- [ ] **第 2 步：删除渠道列**

删除 `<el-table-column label="渠道" :width="80">`（line 117-123）。

- [ ] **第 3 步：插入 IpTemplate 列**

在操作列（`<el-table-column label="操作"`，line 129）之前插入：

```html
<el-table-column label="渠道/设备/IP" :width="200">
    <template slot-scope="{row, $index}">
        <IpTemplate :info="row" :key="`ip_template_${$index}`" />
    </template>
</el-table-column>
```

注意：该文件模板中使用 `scope.row` 而非解构 `{row}`，需检查模板风格保持一致。

- [ ] **第 4 步：import 和注册 IpTemplate**

```js
import {IpTemplate} from "@/components/general"
```

在 components 中注册。

- [ ] **第 5 步：清理 platformSVG**

检查 `platformSVG` 是否还在其他列使用，如果不再使用则移除。

---

### 任务 9：transactionlist.vue 改造

**文件：**
- 修改：`src/views/pay/transactionlist.vue`

**操作：**
- 删除 line 59-63 的"平台"列
- 删除 line 64-68 的"渠道"列
- 在 line 69（商品名称列之前）或操作列之前插入 IpTemplate 列
- import 并注册 IpTemplate

- [ ] **第 1 步：删除平台列**

删除 `<el-table-column label="平台" :width="60" align="center">`（line 59-63）。

- [ ] **第 2 步：删除渠道列**

删除 `<el-table-column prop="channel" label="渠道" width="100">`（line 64-68）。

- [ ] **第 3 步：插入 IpTemplate 列**

在操作列（`<el-table-column label="操作"`，line 106）之前插入：

```html
<el-table-column label="渠道/设备/IP" :width="200">
    <template slot-scope="{row, $index}">
        <IpTemplate :info="row" :key="`ip_template_${$index}`" />
    </template>
</el-table-column>
```

- [ ] **第 4 步：import 和注册 IpTemplate**

```js
import {IpTemplate} from "@/components/general"
```

在 components 中注册。

- [ ] **第 5 步：清理不再使用的变量**

检查 `platformSVG` 是否还在其他列使用，如果不再使用则移除相关 import/data。

---

## 执行顺序建议

1. 先完成 任务 1-4（searchKey 配置补充），它们独立互不依赖
2. 再完成 任务 5-9（view 文件改造），每个 view 独立互不依赖
3. 可并行执行

## 验证方式

- 每个 view 改造后，启动 dev server，打开对应列表页
- 确认"渠道/设备/IP"列正常渲染，包含平台图标、IP、归属地、渠道、设备ID
- 确认 newMySearch 搜索区出现新增的 IP/设备ID 搜索字段
- 确认原有功能（排序、分页、操作）不受影响