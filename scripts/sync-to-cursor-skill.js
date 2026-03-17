const fs = require("fs/promises");
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

    await assertDirectoryExists(directories.localSkillDir, "本地 Skill 目录");
    await fs.mkdir(directories.cursorSkillDir, {recursive: true});

    const mappings = createMappings(
        config.files,
        directories.localSkillDir,
        directories.cursorSkillDir
    );

    console.log("准备同步到 Cursor Skill 目录: " + directories.cursorSkillDir);
    await copyMappings(mappings, "本地项目 -> Cursor Skill");
    console.log("同步完成，可直接在 Cursor 中使用该 Skill。\n");
}

if (require.main === module) {
    main().catch(error => {
        console.error("【失败】同步到 Cursor Skill 出错: " + error.message);
        process.exitCode = 1;
    });
}

module.exports = {
    main
};
