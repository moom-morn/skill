/**
 * 从本地仓库同步规则和技能到 Cursor 配置目录
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
    console.log("开始同步本地到 Cursor（rules + skillFile）");
    console.log("==============================================\n");

    // 加载配置文件 skill-sync.config.json
    const config = await loadConfig(rootDir);
    
    // 获取所有目录的绝对路径：
    // directories.localRulesDir = /Users/chenwen/办公/skill/rules
    // directories.cursorRulesDir = /Users/<用户名>/.cursor/rules
    // directories.localSkillRootDir = /Users/chenwen/办公/skill/skillFile
    // directories.cursorSkillsRootDir = /Users/<用户名>/.cursor/skills
    const directories = getDirectories(rootDir, config);

    // 确保本地的 rules 和 skillFile 目录存在（这些目录由用户在本地维护）
    await assertDirectoryExists(directories.localRulesDir, "本地 rules 目录");
    await assertDirectoryExists(directories.localSkillRootDir, "本地 skillFile 目录");

    // 如果 Cursor 目录不存在则创建（递归创建）
    await fs.mkdir(directories.cursorRulesDir, {recursive: true});
    await fs.mkdir(directories.cursorSkillsRootDir, {recursive: true});

    // 创建 rules 目录的文件映射关系
    // 将 /Users/chenwen/办公/skill/rules/ 下的所有 .mdc 文件映射到 ~/.cursor/rules/
    const rulesMappings = await createRulesMappings(
        directories.localRulesDir,       // 源目录：/Users/chenwen/办公/skill/rules
        directories.cursorRulesDir,      // 目标目录：~/.cursor/rules
        "rules"                          // 相对路径前缀（用于日志显示）
    );

    // 创建 skills 目录的文件映射关系
    // 将 /Users/chenwen/办公/skill/skillFile/<skillName>/ 下的 SKILL.md、reference.md、checklist.md 
    // 映射到 ~/.cursor/skills/<skillName>/
    const skillMappings = await createSkillMappings(
        directories.localSkillRootDir,   // 源目录：/Users/chenwen/办公/skill/skillFile
        directories.cursorSkillsRootDir, // 目标目录：~/.cursor/skills
        config.skillFiles,               // 需要同步的文件列表：["SKILL.md", "reference.md", "checklist.md"]
        "skillFile"                      // 相对路径前缀（用于日志显示）
    );

    console.log("准备同步到 Cursor rules 目录：" + directories.cursorRulesDir);
    // 执行 rules 文件的复制操作（从本地 -> Cursor）
    await copyMappings(rulesMappings, "本地项目 -> Cursor rules");

    console.log("准备同步到 Cursor skills 目录：" + directories.cursorSkillsRootDir);
    // 执行 skill 文件的复制操作（从本地 -> Cursor）
    await copyMappings(skillMappings, "本地项目 -> Cursor skills");

    console.log("同步完成，rules 与所有 Skill 已写入 Cursor 目录。\n");
}

// 当直接运行此脚本时执行 main 函数
if (require.main === module) {
    main().catch(error => {
        console.error("【失败】同步到 Cursor 目录出错：" + error.message);
        process.exitCode = 1;
    });
}

module.exports = {
    main
};
