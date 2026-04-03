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

    console.log("==============================================");
    console.log("开始从 Cursor 回写到本地（rules + skillFile）");
    console.log("==============================================\n");

    const config = await loadConfig(rootDir);
    const directories = getDirectories(rootDir, config);

    await assertDirectoryExists(directories.cursorRulesDir, "Cursor rules 目录");
    await assertDirectoryExists(directories.cursorSkillsRootDir, "Cursor skills 根目录");

    await fs.mkdir(directories.localRulesDir, {recursive: true});
    await fs.mkdir(directories.localSkillRootDir, {recursive: true});

    const rulesMappings = await createRulesMappings(
        directories.cursorRulesDir,
        directories.localRulesDir,
        "rules"
    );

    const skillMappings = await createSkillMappings(
        directories.cursorSkillsRootDir,
        directories.localSkillRootDir,
        config.skillFiles,
        "skillFile"
    );

    console.log("准备从 Cursor rules 目录回写: " + directories.cursorRulesDir);
    await copyMappings(rulesMappings, "Cursor rules -> 本地项目");

    console.log("准备从 Cursor skills 目录回写: " + directories.cursorSkillsRootDir);
    await copyMappings(skillMappings, "Cursor skills -> 本地项目");

    console.log("回写完成，rules 与所有 Skill 已回写到本地。\n");
}

if (require.main === module) {
    main().catch(error => {
        console.error("【失败】从 Cursor 目录回写出错: " + error.message);
        process.exitCode = 1;
    });
}

module.exports = {
    main
};
