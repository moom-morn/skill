const {main: syncFromCursorSkill} = require("./sync-from-cursor-skill");
const {main: syncGitHub} = require("./sync-github");

async function main() {
    await syncFromCursorSkill();
    await syncGitHub();
}

if (require.main === module) {
    main().catch(error => {
        console.error("【失败】拉取 Skill 同步出错: " + error.message);
        process.exitCode = 1;
    });
}

module.exports = {
    main
};
