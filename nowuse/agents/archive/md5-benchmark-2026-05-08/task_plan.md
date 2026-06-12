# 方案3：MD5 性能对比测试（console 日志）

## 完成日期
2026-05-08

## 项目类型
调试工具 / 性能测试

## 背景
为对比原串行方法与新并行方法的实际耗时差异，在 `calculateFileMD5` 内加入计时日志。

## 实现位置
`src/utils/ali-oss.js` — `calculateFileMD5` 函数内

## 行为说明

| 场景 | 日志输出 |
|------|---------|
| 直传文件（isParallel=false） | `[MD5] 串行 xxx.jpg (2.1MB) → a1b2...  耗时: 45ms` |
| SDK分片文件（isParallel=true） | 串行和并行都跑，输出完整对比 |

## 对比日志格式（isParallel=true 时）

```
[MD5对比] video.mp4 (256.3MB)
  原串行: a1b2c3d4...   耗时: 1840ms
  新并行: e5f6a7b8...   耗时: 620ms
  提速: 66.3%
```

## 核心代码（ali-oss.js calculateFileMD5 内）

```javascript
if (isParallel && typeof Worker !== "undefined" && file.size > 1024 * 1024) {
    const t1 = performance.now()
    serialCompute().then(serialMd5 => {
        const serialCost = (performance.now() - t1).toFixed(0)
        const t2 = performance.now()
        calculateParallelHash(file).then(parallelMd5 => {
            const parallelCost = (performance.now() - t2).toFixed(0)
            console.log(
                `%c[MD5对比] ${file.name} (${fileSizeMB}MB)\n` +
                `  原串行: ${serialMd5}   耗时: ${serialCost}ms\n` +
                `  新并行: ${parallelMd5}   耗时: ${parallelCost}ms\n` +
                `  提速: ${((1 - parallelCost / serialCost) * 100).toFixed(1)}%`,
                "color:#1890ff;font-weight:bold"
            )
            resolve(parallelMd5)
        })
    })
}
```

## 使用方式
触发任意 SDK 分片上传（视频/APK），打开浏览器控制台查看对比日志。

## 测试完后清理
对比验证完毕后，将 `calculateFileMD5` 恢复为正常逻辑（去掉串行计时和对比输出，只保留并行调用）。
