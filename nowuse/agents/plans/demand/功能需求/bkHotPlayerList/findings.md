# findings - 热门球员弹框

## API 文件位置
- `src/api/matchapi/ball/basketball.js`，共 561 行
- 通过 `src/api/match.js` 统一 re-export（`export * from "@/api/matchapi/ball/basketball"`）
- 组件只需 `import { xxx } from '@/api/match'` 即可使用

## 现有 GET 接口示例（参考）
```js
// 队伍赛季（GET + query param）
export function basketball_team_season(id) {
    return request({
        url: "/v1/admin/match/basketball/basketball_team_season?team_id=" + id,
        method: "get"
    })
}
```

## 组件文件
- `bkHotPlayerList.vue` 当前为空文件（1行）
- 组件位于 `src/views/match/basketball/components/`

## 项目 API 编写约定
- POST 接口：`export function xxx(data) { return request({ url, method:'post', data }) }`
- GET 接口（无参）：`return request({ url, method:'get' })`
- GET 接口（有参）：url 拼接 query string（非 params 对象）
- 文件内含 try/catch（由 request 封装层统一处理，不在函数内单独写）
