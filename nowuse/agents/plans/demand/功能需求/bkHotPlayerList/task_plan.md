# 热门球员弹框功能规划

## 目标
在 `src/views/match/basketball/components/bkHotPlayerList.vue` 中实现热门球员弹框，支持查看、新增、删除热门球员。

## 接口信息
| 接口 | 方法 | 说明 |
|------|------|------|
| `/v1/admin/match/basketball/basketball_hot_player` | GET | 获取热门球员列表 |
| `/v1/admin/match/basketball/basketball_update_hot_player` | POST | 编辑热门球员（添加/取消） |

### POST 参数
```json
{
  "player_id": 123,   // integer($int64) 球员ID
  "add": 1            // 1:添加  0:取消
}
```

## 当前状态
- `bkHotPlayerList.vue` 文件存在但内容为空（待实现）
- API 函数尚未在 `basketball.js` 中定义

## 阶段规划

### 阶段 1 - 规划 GET API（当前阶段，待用户确认）
**任务 1.1** — 在 `src/api/matchapi/ball/basketball.js` 末尾添加 GET 接口函数
- 文件：`src/api/matchapi/ball/basketball.js`（当前 561 行，追加在末尾）
- 函数名：`basketball_hot_player`
- 方法：GET，无参数（或后续补充查询参数）
- 验证：函数可被组件正常 import 调用

**待确认问题：**
- GET 接口是否有查询参数？（如 comp_id、page 等）目前文档未提供，暂按无参数规划
- 弹框内容布局（用户说"先待定"）

### 阶段 2 - 规划 POST API（待用户确认执行后进行）
- 添加 `basketball_update_hot_player` POST 函数

### 阶段 3 - 实现弹框 UI（待弹框内容确认后进行）
- 实现 `bkHotPlayerList.vue` 组件完整逻辑

## 决策记录
- 2026-05-12：GET API 函数命名沿用项目约定 `basketball_hot_player`（与 URL 保持一致）
- API 文件追加位置：`basketball.js` 第 561 行之后

## 验证标准（阶段 1）
- [ ] `basketball.js` 末尾出现 `basketball_hot_player` 函数
- [ ] 函数使用 GET 方法
- [ ] 可被组件 import 并调用
