/**
 * 组合工作流：从本地推送到 Cursor，然后提交到 GitHub
 * 
 * 执行流程：
 * 1. 将本地 rules/ 和 skillFile/ 同步到 ~/.cursor/rules/ 和 ~/.cursor/skills/
 * 2. 将本地变更提交并推送到 GitHub 仓库
 * 
 * 使用场景：在本地编辑规则/技能后，需要发布到 Cursor 并备份到 GitHub
 */
const {main: syncToCursorSkill} = require("./sync-to-cursor-skill");
const {main: syncGitHub} = require("./sync-github");

async function main() {
    // 第一步：将本地规则和 skills 同步到 Cursor 目录
    await syncToCursorSkill();
    
    // 第二步：将本地变更提交并推送到 GitHub
    await syncGitHub();
}

// 当直接运行此脚本时执行 main 函数
if (require.main === module) {
    main().catch(error => {
        console.error("【失败】发布同步出错：" + error.message);
        process.exitCode = 1;
    });
}

module.exports = {
    main
};
