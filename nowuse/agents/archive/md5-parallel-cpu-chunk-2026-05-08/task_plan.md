# 方案2：MD5 CPU+I/O 全并行（当前生产方案）

## 完成日期
2026-05-08

## 项目类型
性能优化 / 生产方案

## 背景
方案1 只做了 I/O 并行，CPU（SparkMD5.append）仍串行。方案2 将 SparkMD5 源码内联到 Worker，实现各分片 CPU+I/O 全并行。

## 方案描述
- 各 Worker 独立完成：读取分片 ArrayBuffer → SparkMD5 计算 → 返回分片 MD5 字符串
- 主线程收集所有分片 MD5 后按顺序拼接，再做一次 MD5 得到最终值
- 结果为"分片 MD5 合并值"，非标准整文件 MD5
- 仅适用于 OSS 文件名生成等唯一标识场景（仅后台使用，无跨端一致性要求）

## 文件结构

```
src/utils/
├── parallel-hash.js        # 主逻辑：分片调度、结果合并
└── chunk-md5.worker.js     # Worker 逻辑：读取分片 + 计算 SparkMD5（独立文件）
```

## 核心代码

### chunk-md5.worker.js
```javascript
// SparkMD5 源码由 parallel-hash.js 在运行时前置注入
self.onmessage = function(e) {
    var reader = new FileReader()
    reader.onload = function(ev) {
        var spark = new SparkMD5.ArrayBuffer()
        spark.append(ev.target.result)
        self.postMessage({index: e.data.index, md5: spark.end()})
    }
    reader.readAsArrayBuffer(e.data.blob)
}
```

### parallel-hash.js 关键逻辑
```javascript
import sparkMd5Source from "!!raw-loader!spark-md5/spark-md5.min.js"
import workerSource from "!!raw-loader!./chunk-md5.worker.js"

// SparkMD5 源码前置注入，Worker 可直接使用 SparkMD5 全局变量
const workerCode = sparkMd5Source + "\n" + workerSource

// 所有分片 MD5 收齐后合并
const finish = () => {
    resolve(SparkMD5.hash(results.join("|")))
}

// 线程数：取 CPU 核数与分片数的较小值
const threadCount = Math.min(navigator.hardwareConcurrency || 4, totalChunks)

// 超出线程数的分片轮询复用 Worker
worker = workers[i % threadCount]
```

## 技术要点
- `raw-loader` 将 SparkMD5 min 源码（10KB）内联到 Worker 字符串，无需 importScripts
- Worker 通过 Blob URL 动态创建，无需额外 webpack 配置
- 分片大小固定 2MB，保证同一文件每次结果稳定
- 线程复用：实际 Worker 数 = min(CPU核数, 分片数)，大文件多分片时轮询复用

## 提速预估
- 大文件（视频/APK）：60%~80%
- 相比方案1 额外提速约 20%~30%（CPU 计算也并行了）

## 注意事项
- 结果与原串行 MD5 **不同**，仅保证同文件稳定一致
- 仅用于 OSS 文件名生成，不可用于文件完整性校验
- 依赖 `raw-loader`（已在项目中安装）
