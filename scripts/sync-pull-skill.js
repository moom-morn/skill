/**
 * 组合工作流：从 Cursor 拉取技能到本地，然后推送到 GitHub
 * 
 * 执行流程：
 * 1. 从 ~/.cursor/rules/ 和 ~/.cursor/skills/ 拉取到本地 rules/ 和 skillFile/
 * 2. 将本地变更提交并推送到 GitHub 仓库
 * 
 * 使用场景：在 Cursor 中编辑规则/技能后，需要回写到本地并备份到 GitHub
 */
const {main: syncFromCursorSkill} = require("./sync-from-cursor-skill");
const {main: syncGitHub} = require("./sync-github");

async function main() {
    // 第一步：从 Cursor 目录拉取规则和 skills 到本地
    await syncFromCursorSkill();
    
    // 第二步：将本地变更提交并推送到 GitHub
    await syncGitHub();
}

// 当直接运行此脚本时执行 main 函数
if (require.main === module) {
    main().catch(error => {
        console.error("【失败】拉取 Skill 同步出错：" + error.message);
        process.exitCode = 1;
    });
}

module.exports = {
    main
};
