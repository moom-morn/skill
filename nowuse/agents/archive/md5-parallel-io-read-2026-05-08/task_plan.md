# 方案1：MD5 并行 I/O 读取（已被方案2替代）

## 完成日期
2026-05-08

## 项目类型
性能优化 / 中间过渡方案

## 背景
原串行 `calculateFileMD5` 在大文件上传前计算 MD5 耗时过长，尝试用 Web Worker 并行加速。

## 方案描述
- 多个 Worker 并行读取文件不同区域的 ArrayBuffer（I/O 并行）
- Worker 不做任何哈希计算，只返回 buffer
- 主线程收齐所有分片后按顺序 append 到 SparkMD5
- 结果与原串行方法完全一致（标准整文件 MD5）

## 核心代码（parallel-hash.js）

```javascript
// Worker 只读取 ArrayBuffer，不做哈希
const workerCode = `
    self.onmessage = function(e) {
        var reader = new FileReader();
        reader.onload = function(ev) {
            self.postMessage({ index: e.data.index, buffer: ev.target.result }, [ev.target.result]);
        };
        reader.readAsArrayBuffer(e.data.blob);
    };
`
// 主线程按顺序 append
const finish = () => {
    const spark = new SparkMD5.ArrayBuffer()
    for (let i = 0; i < totalChunks; i++) spark.append(results[i])
    resolve(spark.end())
}
```

## 提速预估
- < 10MB：无提速甚至略慢（Worker 开销 > I/O 收益）
- 10MB ~ 200MB：20%~50%
- > 200MB：40%~70%

## 为何被替代
- CPU 计算（SparkMD5.append）仍在主线程串行，未真正并行
- 方案2 实现了 CPU+I/O 全并行，提速更大

## 适用场景
需要与原串行方法结果完全一致（标准 MD5），且有其他端需要对比校验时使用此方案。
