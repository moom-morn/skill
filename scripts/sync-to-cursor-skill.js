const fs = require("fs").promises;
const path = require("path");
const {
    assertDirectoryExists,
    copyMappings,
    createRulesMappings,
    createSkillMappings,
    getDirectories,
    loadConfig
} = require("./lib/file-sync");

async function main() {
    const rootDir = path.resolve(__dirname, "..");
    const config = await loadConfig(rootDir);
    const directories = getDirectories(rootDir, config);

    await assertDirectoryExists(directories.localRulesDir, "本地 rules 目录");
    await assertDirectoryExists(directories.localSkillRootDir, "本地 skillFile 目录");

    await fs.mkdir(directories.cursorRulesDir, {recursive: true});
    await fs.mkdir(directories.cursorSkillsRootDir, {recursive: true});

    const rulesMappings = await createRulesMappings(
        directories.localRulesDir,
        directories.cursorRulesDir,
        "rules"
    );

    const skillMappings = await createSkillMappings(
        directories.localSkillRootDir,
        directories.cursorSkillsRootDir,
        config.skillFiles,
        "skillFile"
    );

    console.log("准备同步到 Cursor rules 目录: " + directories.cursorRulesDir);
    await copyMappings(rulesMappings, "本地项目 -> Cursor rules");

    console.log("准备同步到 Cursor skills 目录: " + directories.cursorSkillsRootDir);
    await copyMappings(skillMappings, "本地项目 -> Cursor skills");

    console.log("同步完成，rules 与所有 Skill 已写入 Cursor 目录。\n");
}

if (require.main === module) {
    main().catch(error => {
        console.error("【失败】同步到 Cursor 目录出错: " + error.message);
        process.exitCode = 1;
    });
}

module.exports = {
    main
};
