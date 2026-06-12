# 篮球热门球员弹框组件

**完成时间**: 2026-05-12
**状态**: ✅ 已完成

---

## 功能概述

在 `playerList.vue`（篮球队员列表页）中，点击"热门队员"按钮，弹出热门球员管理弹框，支持查看、添加、删除热门球员。

---

## 涉及文件

| 文件 | 改动说明 |
|------|---------|
| `src/views/match/basketball/components/bkHotPlayerList.vue` | 新建，热门球员弹框组件 |
| `src/api/matchapi/ball/basketball.js` | 新增两个 API 函数（第 562、569 行） |

---

## API

| 函数名 | 方法 | 接口路径 | 说明 |
|--------|------|---------|------|
| `basketball_hot_player` | GET | `/v1/admin/match/basketball/basketball_hot_player` | 获取热门球员列表，无参数 |
| `basketball_update_hot_player` | POST | `/v1/admin/match/basketball/basketball_update_hot_player` | 添加/取消热门球员 |

POST 参数：`{ player_id: int64, add: 1添加/0取消 }`

GET 返回数据结构：`[{ id, logo, name }, ...]`

---

## 组件调用方式（父组件）

```vue
<!-- template -->
<bkHotPlayerList ref="hotPlayerList" @close="showhotPlayerList = false" v-if="showhotPlayerList" />

<!-- 打开方式 -->
getHotPlayerList() {
    this.showhotPlayerList = true
    this.$nextTick(() => {
        this.$refs.hotPlayerList.init()
    })
}
```

---

## 组件核心逻辑

### data
```js
{
    visible: false,
    loading: false,
    list: [],        // GET 接口返回的热门球员列表
    showResource: false
}
```

### 方法

| 方法 | 说明 |
|------|------|
| `init()` | 父组件调用入口，打开弹框并拉取列表 |
| `getList()` | 调用 GET 接口，结果存入 `list` |
| `addPlayer()` | 打开 searchResource，设置 sportId=2 gameId=0 |
| `setPlayerObj(obj)` | 单选回调，调用 handleUpdateHotPlayer(obj.id, 1) |
| `setPlayerList(list)` | 多选回调（已注释，待后续实现） |
| `deleteHotPlayer(player_id)` | 删除前 $confirm 确认，再调用 handleUpdateHotPlayer |
| `handleUpdateHotPlayer(player_id, add)` | 统一调用 POST 接口，成功后刷新列表 |
| `handleClose()` | 关闭弹框，emit close |

---

## 关键实现细节

1. **权限控制**：添加按钮和删除按钮均用 `v-if="hasPwer('basketball_update_hot_player')"` 控制
2. **searchResource 打开方式**：需通过 `$nextTick` 手动设置 `sportId=2 gameId=0 dialogVisible=true`
3. **删除需二次确认**：`deleteHotPlayer` 用 `$confirm` 包裹，防止误操作
4. **列表布局**：外层 `el-card` 限高 600px + `overflow-y: scroll`，内部 flex 换行，每项宽 270px

---

## 可复用模式

**searchResource 打开方式（篮球 sport_id=2）**：
```js
addPlayer() {
    this.showResource = true
    this.$nextTick(() => {
        this.$refs.searchResourceDialog.sportId = 2
        this.$refs.searchResourceDialog.gameId = 0
        this.$refs.searchResourceDialog.dialogVisible = true
    })
}
```

**统一增删接口调用模式**：
```js
handleUpdateHotPlayer(player_id, add) {
    basketball_update_hot_player({player_id: player_id, add: add})
        .then(res => {
            if (res.code == 0) {
                this.$message.success(res.msg || (add == 1 ? '添加成功' : '取消成功'))
                this.getList()
            }
        })
        .catch(() => {})
}
```
