# task_plan.md — MD5 并行计算与原方法一致性修复

## 目标

确保 `calculateParallelHash`（parallel-hash.js）和 `calculateFileMD5` 串行版本对同一文件产生**完全相同**的 MD5 值。

## 背景

- **原方法**（`calculateFileMD5` 串行版）：使用 SparkMD5，按 2MB 分片顺序读取全文件，逐片 append，最终 `spark.end()` 得到标准 MD5。
- **新方法**（`calculateParallelHash`）：用 Web Worker 按 CPU 核数切片，各自算 SHA-256，最后把哈希字符串拼接后再 MD5。
- **问题**：两种算法本质不同，结果不可能一致。

## 调用链分析

```
formatOssPath(fileInfo, dirObj, useDirect)
  └── calculateFileMD5(fileInfo.raw, !useDirect)
        ├── useDirect=true  → isParallel=false → 串行 SparkMD5
        └── useDirect=false → isParallel=true  → calculateParallelHash(file)
```

- **直传（useDirect=true）**：文件名需标准 MD5，走串行，结果正确 ✅
- **SDK 分片（useDirect=false）**：文件名也需标准 MD5，但走了并行（SHA-256 汇总），结果不一致 ❌

## 修复方案（最小改动）

**将 `calculateParallelHash` 改为真正并行计算 SparkMD5**，即：
- 各 Worker 仍按 2MB 分片读取
- 但不计算 SHA-256，而是返回每块的 ArrayBuffer
- 主线程按顺序 append 到 SparkMD5 → `spark.end()` 得到标准 MD5

> 更优替代方案（推荐）：Worker 内使用 SparkMD5 的增量 API 计算各分片哈希，主线程按顺序合并（SparkMD5.ArrayBuffer 支持 append 模式，需所有分片按顺序处理）。

**实际可行且最简洁的方案**：
Worker 读取各分片 ArrayBuffer 后，直接 postMessage 回主线程，主线程按顺序 append 到 SparkMD5。并行加速体现在：多个 Worker 并行 **读取** 文件（I/O 并行），主线程顺序 append（CPU 串行但分片读取已并行）。

## 任务列表

| # | 任务 | 文件 | 行号 | 验证标准 |
|---|------|------|------|---------|
| 1 | 分析 SparkMD5 在 Worker 中的可用性 | parallel-hash.js | - | 确认 SparkMD5 能否在 Worker 内使用 |
| 2 | 改写 parallel-hash.js | parallel-hash.js | 全文 | 同一文件与串行结果一致 |
| 3 | 验证 ali-oss.js 调用逻辑正确 | ali-oss.js | 32-41 | isParallel 参数传递正确 |

## 验证标准

- 对同一个测试文件，`calculateFileMD5(file, false)` 和 `calculateFileMD5(file, true)` 返回值完全相同
- 通过浏览器控制台可手动验证

## 关键假设

- SparkMD5 库无法在 Web Worker 中 import（标准 Worker 不支持 ES module import）
- 需要改为：Worker 只负责读取 ArrayBuffer，主线程做 SparkMD5 计算

## 决策记录

- 2026-05-08：确认方案：Worker 并行读取分片 → 主线程顺序 append SparkMD5
