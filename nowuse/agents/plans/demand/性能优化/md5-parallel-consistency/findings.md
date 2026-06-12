# findings.md — MD5 并行一致性修复

## 原方法算法特征

```javascript
// 标准 SparkMD5 增量计算
const spark = new SparkMD5.ArrayBuffer()
// 按 2MB 顺序读取，逐片 append
spark.append(chunk)  // × N 次
spark.end()          // → 标准 MD5（与 md5sum 命令一致）
```

关键：MD5 是流式算法，最终结果取决于**所有字节按顺序处理**，不是各分片哈希的组合。

## 新方法的问题

```javascript
// parallel-hash.js 当前做法：
// 1. 各 Worker 计算各分片的 SHA-256（不是 MD5）
// 2. 拼接所有 SHA-256 字符串：hash0 + "|" + hash1 + ...
// 3. 对拼接结果做 MD5 → 这是"SHA-256 摘要的 MD5"，不是文件的 MD5
```

结果与原方法**完全不同**，因为：
1. SHA-256 ≠ MD5 分片
2. "分片哈希的哈希" ≠ "整体的哈希"（Merkle tree 结构，非标准 MD5）

## 修复关键约束

### 约束 1：SparkMD5 无法在 Worker 内使用
- Web Worker 用的是 `new Worker(blobUrl)` 动态创建，代码是字符串，无法 import SparkMD5
- SparkMD5 必须在主线程使用

### 约束 2：MD5 必须顺序处理
- `spark.append()` 必须按字节顺序调用，不能乱序
- Worker 只能做"并行读取"，主线程做"顺序 append"

## 修复方案详细设计

```
┌─────────────────────────────────────────────────────────┐
│ 主线程                                                    │
│  1. 按 2MB 分片，派发 N 个 Worker 并行读取               │
│  2. 每个 Worker 读完后 postMessage({index, buffer})       │
│  3. 主线程收到后放入 results[index]                      │
│  4. 当 completed === total 时，按 index 顺序 append       │
│     spark.append(results[0])                             │
│     spark.append(results[1])                             │
│     ...                                                  │
│     resolve(spark.end())                                 │
└─────────────────────────────────────────────────────────┘
```

### Worker 代码（简化）

```javascript
self.onmessage = function(e) {
    var reader = new FileReader()
    reader.onload = function(ev) {
        // 只传回 ArrayBuffer，不做任何哈希计算
        self.postMessage({ index: e.data.index, buffer: ev.target.result }, [ev.target.result])
    }
    reader.readAsArrayBuffer(e.data.file.slice(e.data.start, e.data.end))
}
```

### 主线程汇总

```javascript
// 所有 buffer 收齐后，顺序 append
const spark = new SparkMD5.ArrayBuffer()
for (let i = 0; i < results.length; i++) {
    spark.append(results[i])
}
resolve(spark.end())
```

## 性能分析

- **原方法**：串行读取，单线程 I/O，CPU 也串行
- **新方法（修复后）**：并行读取（I/O 并行），顺序 append（CPU 开销极低）
- 实际瓶颈通常是 I/O，并行读取有意义，尤其是大文件

## ali-oss.js 调用逻辑验证

```javascript
// ali-oss.js:147
let md5name = await calculateFileMD5(fileInfo.raw, !useDirect)
// useDirect=true  → isParallel=false → 串行（直传用，生成文件名标识）
// useDirect=false → isParallel=true  → 并行（SDK分片用，生成文件名标识）
```

两种场景都用 MD5 作文件名，所以必须保持一致。
