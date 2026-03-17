const {main: syncToCursorSkill} = require("./sync-to-cursor-skill");
const {main: syncGitHub} = require("./sync-github");

async function main() {
    await syncToCursorSkill();
    await syncGitHub();
}

if (require.main === module) {
    main().catch(error => {
        console.error("【失败】发布同步出错: " + error.message);
        process.exitCode = 1;
    });
}

module.exports = {
    main
};
