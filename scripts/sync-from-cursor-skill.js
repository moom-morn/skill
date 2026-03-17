const path = require("path");
const {
    assertDirectoryExists,
    copyMappings,
    createMappings,
    getDirectories,
    loadConfig
} = require("./lib/file-sync");

async function main() {
    const rootDir = path.resolve(__dirname, "..");
    const config = await loadConfig(rootDir);
    const directories = getDirectories(rootDir, config);

    await assertDirectoryExists(directories.cursorSkillDir, "Cursor Skill 目录");
    await assertDirectoryExists(directories.localSkillDir, "本地 Skill 目录");

    const mappings = createMappings(
        config.files,
        directories.cursorSkillDir,
        directories.localSkillDir
    );

    console.log("准备从 Cursor Skill 目录回写: " + directories.cursorSkillDir);
    await copyMappings(mappings, "Cursor Skill -> 本地项目");
    console.log("回写完成，本地项目已获得最新 Skill 内容。\n");
}

if (require.main === module) {
    main().catch(error => {
        console.error("【失败】从 Cursor Skill 回写出错: " + error.message);
        process.exitCode = 1;
    });
}

module.exports = {
    main
};
