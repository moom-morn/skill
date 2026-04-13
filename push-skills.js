/**
 * 兼容旧版入口：发布技能和规则到 Cursor 和 GitHub
 * 
 * 这是 sync-publish.js 的兼容版本，保持向后兼容性
 * 功能：本地 -> Cursor -> GitHub
 */
const {main} = require("./scripts/sync-publish");

// 执行发布流程（不捕获错误，让进程直接退出）
main();
