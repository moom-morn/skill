/**
 * 从 Cursor 配置目录同步规则和技能回本地仓库
 * 
 * 目录说明：
 * - 工作区根目录：/Users/chenwen/办公/skill (通过 __dirname + ".." 解析)
 * - 本地 rules 目录：/Users/chenwen/办公/skill/rules (从配置文件读取)
 * - 本地 skillFile 目录：/Users/chenwen/办公/skill/skillFile (从配置文件读取)
 * - Cursor rules 目录：~/.cursor/rules (用户主目录下的 Cursor 规则目录)
 * - Cursor skills 目录：~/.cursor/skills (用户主目录下的 Cursor 技能目录)
 */
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
    // 解析项目根目录路径：/Users/chenwen/办公/skill
    const rootDir = path.resolve(__dirname, "..");

    console.log("==============================================");
    console.log("开始从 Cursor 回写到本地（rules + skillFile）");
    console.log("==============================================\n");

    // 加载配置文件 skill-sync.config.json
    const config = await loadConfig(rootDir);
    
    // 获取所有目录的绝对路径：
    // directories.localRulesDir = /Users/chenwen/办公/skill/rules
    // directories.cursorRulesDir = /Users/<用户名>/.cursor/rules
    // directories.localSkillRootDir = /Users/chenwen/办公/skill/skillFile
    // directories.cursorSkillsRootDir = /Users/<用户名>/.cursor/skills
    const directories = getDirectories(rootDir, config);

    // 确保 Cursor 的规则和技能目录存在（这些目录由 Cursor 创建）
    await assertDirectoryExists(directories.cursorRulesDir, "Cursor rules 目录");
    await assertDirectoryExists(directories.cursorSkillsRootDir, "Cursor skills 根目录");

    // 如果本地目录不存在则创建（递归创建）
    await fs.mkdir(directories.localRulesDir, {recursive: true});
    await fs.mkdir(directories.localSkillRootDir, {recursive: true});

    // 创建 rules 目录的文件映射关系
    // 将 ~/.cursor/rules/ 下的所有 .mdc 文件映射到 /Users/chenwen/办公/skill/rules/
    const rulesMappings = await createRulesMappings(
        directories.cursorRulesDir,      // 源目录：~/.cursor/rules
        directories.localRulesDir,       // 目标目录：/Users/chenwen/办公/skill/rules
        "rules"                          // 相对路径前缀（用于日志显示）
    );

    // 创建 skills 目录的文件映射关系
    // 将 ~/.cursor/skills/<skillName>/ 下的 SKILL.md、reference.md、checklist.md 
    // 映射到 /Users/chenwen/办公/skill/skillFile/<skillName>/
    const skillMappings = await createSkillMappings(
        directories.cursorSkillsRootDir, // 源目录：~/.cursor/skills
        directories.localSkillRootDir,   // 目标目录：/Users/chenwen/办公/skill/skillFile
        config.skillFiles,               // 需要同步的文件列表：["SKILL.md", "reference.md", "checklist.md"]
        "skillFile"                      // 相对路径前缀（用于日志显示）
    );

    console.log("准备从 Cursor rules 目录回写：" + directories.cursorRulesDir);
    // 执行 rules 文件的复制操作（从 Cursor -> 本地）
    await copyMappings(rulesMappings, "Cursor rules -> 本地项目");

    console.log("准备从 Cursor skills 目录回写：" + directories.cursorSkillsRootDir);
    // 执行 skill 文件的复制操作（从 Cursor -> 本地）
    await copyMappings(skillMappings, "Cursor skills -> 本地项目");

    console.log("回写完成，rules 与所有 Skill 已回写到本地。\n");
}

// 当直接运行此脚本时执行 main 函数
if (require.main === module) {
    main().catch(error => {
        console.error("【失败】从 Cursor 目录回写出错：" + error.message);
        process.exitCode = 1;
    });
}

module.exports = {
    main
};
