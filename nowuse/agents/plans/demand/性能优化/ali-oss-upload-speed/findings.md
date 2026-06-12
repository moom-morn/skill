# findings.md — ali-oss 分片上传速度慢分析

## 定位文件

`src/utils/ali-oss.js`

---

## 问题根因分析

### 🔴 根因 1：每次上传前都重复计算整个文件的 MD5（最严重）

**位置：** `formatOssPath()` → 调用 `calculateFileMD5()`（第123行）

**问题：**
- `calculateFileMD5` 用 FileReader **串行逐片**读取整个文件计算 MD5
- 每次上传都会执行一次，视频文件动辄几百MB / 几GB
- FileReader 是单线程串行操作，一个2GB视频光MD5计算就可能耗时10~30秒
- 计算完才开始上传，用户体验上就是"点了上传按钮很久没反应"

**代码证据：**
```js
// calculateFileMD5 逐片串行读取（第28-56行）
const chunkSize = 2097152 // 2MB
reader.onload = e => {
    spark.append(e.target.result)
    currentChunk++
    if (currentChunk < chunks) {
        loadNextChunk()  // ← 串行，必须等上一片读完才读下一片
    }
}
```

---

### 🟡 根因 2：OSS 客户端单例不刷新 Token，可能导致重新初始化

**位置：** `fetchOssClient()`（第159-179行）

**问题：**
- `ossInstance` 单例在 Token 过期后不会自动销毁重建
- 虽然配置了 `refreshSTSToken`，但单例本身不会感知 Token 已过期
- Token 过期时 OSS SDK 内部会抛错并重试，造成额外延迟
- 极端情况下整个上传任务因 Token 刷新失败而中断重试

---

### 🟡 根因 3：分片策略并发数偏保守

**位置：** `OSS_CONFIG.SHARD_STRATEGY`（第69-73行）

**现状：**
```js
MID:   { size: 5MB,  parallel: 4 }  // <1G
LARGE: { size: 10MB, parallel: 6 }  // 1G-5G
XL:    { size: 20MB, parallel: 6 }  // >5G
```

**问题：**
- 现代浏览器支持同域名 6 个 HTTP/1.1 连接，HTTP/2 下可更多
- parallel: 4~6 对于视频上传来说偏低，实际可提升至 8~10
- 分片大小 5MB 对大文件来说分片数过多，每片的 HTTP 握手开销累积显著

---

### 🟢 根因 4：进度回调频率过高（轻微）

**位置：** `multipartUpload` options.progress（第345-349行）

**问题：**
- 每个分片上传完都触发 `onProgress` 回调
- 回调里有 `Number((p * 100).toFixed(2))` 格式化，触发频率过高时影响渲染性能
- 对速度影响极小，但影响 UI 流畅度

---

## 方案建议

### 方案一（推荐）：跳过上传前 MD5 计算，改为异步后台计算

**思路：**
- 上传时不等 MD5 计算完，直接用 `时间戳 + 随机数` 生成临时文件名
- MD5 计算改为**后台异步**，仅用于秒传去重判断（如有需要）
- 或改用 Web Worker 并行计算，不阻塞主线程

**改动点：**
- `formatOssPath()` 中的 `calculateFileMD5` 调用改为非阻塞
- `calculateFileMD5` 改用 Web Worker（适合大文件）

**预期收益：** 消除上传前 10~30s 的等待，直接体感提升最大

---

### 方案二：提升并发数 + 分片大小

**思路：**
- MID 策略并发从 4 → 8，分片从 5MB → 8MB
- LARGE 策略并发从 6 → 8，分片从 10MB → 16MB
- XL 策略并发维持 6（受浏览器连接数限制）

**改动点：** 仅修改 `OSS_CONFIG.SHARD_STRATEGY` 的数值，风险极低

**预期收益：** 理论吞吐提升 30~50%

---

### 方案三：OSS 客户端 Token 过期检测

**思路：**
- 在 `fetchOssClient()` 中增加 Token 有效期判断
- Token 即将过期（如剩余 < 5分钟）时主动销毁 `ossInstance = null` 并重建

**改动点：** `fetchOssClient()` 函数，约 5~10 行

**预期收益：** 避免因 Token 过期导致的重试延迟

---

## 优先级建议

| 优先级 | 方案 | 收益 | 风险 |
|--------|------|------|------|
| 🔴 P0 | 方案一：跳过/异步 MD5 | 体感最大 | 文件名改变，需确认业务影响 |
| 🟡 P1 | 方案二：提升并发+分片 | 吞吐+30~50% | 极低 |
| 🟢 P2 | 方案三：Token 过期检测 | 避免偶发延迟 | 低 |
