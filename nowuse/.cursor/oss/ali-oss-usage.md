# ali-oss.js 使用分析文档

> 文件路径：`src/utils/ali-oss.js`

## 一、模块职责

OSS 文件上传工具类，提供两种上传模式（Web 直传 / SDK 分片），支持并发控制、任务取消与进度追踪。

## 二、导出 API

| 导出 | 类型 | 说明 |
|------|------|------|
| `batchUploadFiles` | 函数 | **主入口**，批量上传文件，内部调用 `uploadFiles` |
| `uploadFiles` | 函数 | 底层批量上传，支持串行/并行 |
| `cancelSingleUpload` | 函数 | 取消单个上传任务 |
| `stopAllUploads` | 函数 | 停止控制器关联的所有任务 |
| `activeUploadTasks` | 对象 | 活跃任务池，key 为 taskId |

## 三、函数签名

### batchUploadFiles

```javascript
batchUploadFiles(files, dir, progressCallback, success, controller, limit, fail)
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| files | `Array<File>` / `Array<{file, taskId}>` | 是 | 文件列表 |
| dir | `Object{module, modulePath}` | 是 | OSS 目录配置 |
| progressCallback | `Function(total, statesMap)` | 否 | 进度回调 |
| success | `Function(result)` | 否 | 单文件成功回调 |
| controller | `Object` | 否 | 上传控制器 |
| limit | `Number` | 否 | 并发数，默认 1（串行） |
| fail | `Function(failItem)` | 否 | 单文件失败回调 |

**返回值**：`Promise<Array>` — 成功结果数组，附带 `.failures` 属性（失败列表）

### cancelSingleUpload

```javascript
cancelSingleUpload(taskId, controller)
```

取消指定 taskId 的上传。未开始的加入黑名单，进行中的物理中止。

### stopAllUploads

```javascript
stopAllUploads(controller)
```

中止控制器关联的所有任务，标记 `controller.isAborted = true`。

## 四、controller 控制器结构

调用方需要在 data 中声明并传入：

```javascript
uploadController: {
    isAborted: false,          // 全局中止标记
    more: true,                // 是否并行模式（由 uploadFiles 自动设置）
    activeTaskId: [],          // 当前活跃任务 ID（并行=数组，串行=字符串）
    manualAbortedTaskNames: [] // 预取消黑名单
    // fileTaskMap: {}         // 由 uploadFiles 内部写入：{ fileName → taskId }
}
```

## 五、上传模式判断

| 文件类型 | 模式 | 判断逻辑 |
|---------|------|---------|
| APK | SDK 分片 | `ext === "apk"` |
| 视频 | SDK 分片 | `mime` 以 `video/` 开头，或 ext 在 VIDEO_EXTS 白名单 |
| 其余所有 | Web 直传 | 默认走 `getWebUploadPolicy` + `ossWebUpdate` |

### 分片策略

| 文件大小 | 分片大小 | 并发数 |
|---------|---------|--------|
| < 1GB | 5MB | 4 |
| 1GB ~ 5GB | 10MB | 6 |
| > 5GB | 20MB | 6 |

## 六、回调数据结构

### success 回调参数

```javascript
{
    success: true,
    path: "apk/2026/03/20/xxx.apk",      // SDK 分片模式有值
    result: {                              // Web 直传或 SDK 返回的合并数据
        key: "group/attachments/...",
        bucket: "leisuimg",
        etag: "...",
        size: "5020",
        mimeType: "image/png",
        width: "228",                      // 仅图片
        height: "162",                     // 仅图片
        format: "png"                      // 仅图片
    },
    taskId: "uuid-xxx",
    name: "file.png"
}
```

### fail 回调参数

```javascript
{
    success: false,
    error: Error,              // 原始错误对象
    taskId: "uuid-xxx",
    name: "file.png",
    isAborted: true/false      // 是否为手动取消
}
```

### progressCallback 参数

```javascript
progressCallback(
    75,                          // total: 总体进度百分比 0-100
    { "tid-1": 100, "tid-2": 50 } // statesMap: 各任务进度
)
```

## 七、调用方清单

### 1. `src/components/uploadPhoto/indexnew.vue`（主要调用方）

**引入**：`batchUploadFiles`, `stopAllUploads`

**场景 A — 单文件上传**（`getUploadToken` 方法）

```javascript
batchUploadFiles(
    [file],               // 单文件包装为数组
    dir,                  // this.dirName（来自 props/mixin）
    self.buildProgressCb(),
    res => self.handleUploadResult(file, res),
    self.uploadController,
    3                     // limit=3（单文件场景实际无并发意义）
)
```

**场景 B — 批量上传**（`onChangeMultiple` 方法）

```javascript
await batchUploadFiles(
    validFiles,           // 过滤后的文件数组
    this.dirName,
    self.buildProgressCb(),
    function(res) { self.handleUploadResult(null, res) },
    self.uploadController,
    3                     // 3 并发
)
```

**取消链路**：`showUploadProgress` watcher 检测弹窗关闭 → `stopAllUploads(this.uploadController)`

**进度映射**：`buildProgressCb()` 内部通过 `controller.fileTaskMap` 反转 `{taskId→fileName}` 来更新 `uploadFiles[fileName].percentage`

### 2. `src/views/app_set/components/eidt_version.vue`

**引入**：`batchUploadFiles`, `stopAllUploads`

```javascript
// 单文件串行上传 APK（未传 limit，默认 1）
await batchUploadFiles(file, this.dir_list.apk, onProgress, onSuccess, this.uploadController)

// 取消
stopAllUploads(this.uploadController)
// 手动重置控制器状态
this.uploadController.isAborted = false
this.uploadController.activeTaskId = null
this.uploadController.manualAbortedTaskNames = []
```

### 3. `src/views/app_set/components/uploadVersionApk.vue`

**引入**：`batchUploadFiles`, `cancelSingleUpload`, `stopAllUploads`（三个 API 全用到）

```javascript
// 批量串行上传（limit=1）
await batchUploadFiles(filesToUpload, this.dir_list.apk, onProgress, onSuccess, this.uploadController, 1)

// 取消单个任务
await cancelSingleUpload(taskId, this.uploadController)

// 全部取消
await stopAllUploads(this.uploadController)
```

### 4. `src/components/uploadPhoto/index.vue`（旧版，未使用本模块）

旧版上传组件使用七牛/其他方案，**不依赖** `ali-oss.js`。

## 八、依赖关系

```
ali-oss.js
├── @/store              → ossToken/fetchOssToken（STS 临时凭证）
├── crypto-js            → MD5 生成文件名
├── @/utils/fileTypeDetector → getRealFileType（魔数检测真实 MIME）
├── @/api/misc           → ossWebUpdate（Web 直传请求）/ getWebUploadPolicy（获取直传策略）
├── @/utils/tool.js      → getUniqueId（taskId 生成）
└── ali-oss (npm)        → OSS SDK（分片上传）
```

## 九、数据流图

```
调用方
  │
  ├─ batchUploadFiles(files, dir, progress, success, controller, limit, fail)
  │     │
  │     └─ uploadFiles()
  │           │
  │           ├─ createUploadTask(file, dir, onProgress, taskId)
  │           │     │
  │           │     ├─ getNormalizedFile() → 真实 MIME 检测
  │           │     ├─ shouldUseMultipart() → 判断上传模式
  │           │     ├─ formatOssPath() → 构建路径
  │           │     │
  │           │     ├─ [Web 直传] getWebUploadPolicy → ossWebUpdate → success/fail 回调
  │           │     └─ [SDK 分片] fetchOssClient → multipartUpload → success/fail 回调
  │           │
  │           ├─ handleProgress() → progressCallback 回传给调用方
  │           └─ 并发控制（Promise.race + enqueue 递归）
  │
  ├─ cancelSingleUpload(taskId, controller)
  │     ├─ 未开始 → 加入 manualAbortedTaskNames 黑名单
  │     └─ 进行中 → abortMultipartUpload / cancelHandler
  │
  └─ stopAllUploads(controller)
        └─ 遍历所有活跃任务 → cancelSingleUpload
```
