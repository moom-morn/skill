# progress.md — MD5 并行一致性修复

## 2026-05-08

### 阶段：规划

- [x] 读取 ali-oss.js 和 parallel-hash.js
- [x] 分析两种算法差异（SHA-256 Merkle vs 标准 MD5）
- [x] 确定修复方案（Worker 只读 buffer，主线程 SparkMD5 顺序 append）
- [x] 创建 3 件套文档

### 执行完成

- [x] 改写 parallel-hash.js（Worker 只读 buffer，主线程顺序 SparkMD5 append）
- [x] 处理空文件边界
- [x] 两阶段审查通过
- ali-oss.js 无需改动

---

## 修改文件预告

| 文件 | 改动 | 行数变化 |
|------|------|---------|
| `src/utils/parallel-hash.js` | Worker 改为只返回 buffer；主线程改为 SparkMD5 顺序 append | ~127 行（大幅简化） |
| `src/utils/ali-oss.js` | 无需改动 | 0 |
