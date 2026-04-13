/**
 * 文件同步核心工具库
 * 
 * 提供以下功能：
 * - 路径解析（支持 ~ 开头的用户主目录缩写）
 * - 配置文件加载和验证
 * - 目录存在性检查
 * - 递归文件列表遍历
 * - 创建文件映射关系（rules 和 skills）
 * - 执行文件复制操作
 */
const fs = require("fs").promises;
const os = require("os");
const path = require("path");

/**
 * 展开以 ~ 开头的路径为用户主目录的完整路径
 * @param {string} inputPath - 输入路径（可能是 ~/xxx 格式）
 * @returns {string} 展开后的绝对路径
 * 
 * 示例：
 * - "~" => "/Users/用户名"
 * - "~/.cursor/rules" => "/Users/用户名/.cursor/rules"
 */
function expandHomePath(inputPath) {
    if (!inputPath) {
        return inputPath;
    }

    if (inputPath === "~") {
        return os.homedir();
    }

    if (inputPath.indexOf("~/") === 0) {
        return path.join(os.homedir(), inputPath.slice(2));
    }

    return inputPath;
}

/**
 * 解析配置路径为绝对路径
 * @param {string} rootDir - 项目根目录
 * @param {string} configuredPath - 配置中的路径（可能是相对路径或 ~ 开头）
 * @returns {string} 解析后的绝对路径
 * 
 * 处理逻辑：
 * 1. 先展开 ~ 为用户主目录
 * 2. 如果已经是绝对路径则直接返回
 * 3. 否则相对于 rootDir 解析为绝对路径
 */
function resolveConfiguredPath(rootDir, configuredPath) {
    const expandedPath = expandHomePath(configuredPath);

    if (path.isAbsolute(expandedPath)) {
        return expandedPath;
    }

    return path.resolve(rootDir, expandedPath);
}

/**
 * 检查路径是否存在
 * @param {string} targetPath - 目标路径
 * @returns {Promise<boolean>} 路径是否存在
 */
async function pathExists(targetPath) {
    try {
        await fs.access(targetPath);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * 加载并验证配置文件 skill-sync.config.json
 * @param {string} rootDir - 项目根目录
 * @returns {Promise<Object>} 配置对象
 * 
 * 必需字段：
 * - localRulesDir: 本地 rules 目录
 * - cursorRulesDir: Cursor rules 目录
 * - localSkillRootDir: 本地 skillFile 目录
 * - cursorSkillsRootDir: Cursor skills 目录
 * - skillFiles: 需要同步的技能文件列表（非空数组）
 */
async function loadConfig(rootDir) {
    const configPath = path.join(rootDir, "skill-sync.config.json");
    const content = await fs.readFile(configPath, "utf8");
    const config = JSON.parse(content);

    const requiredFields = [
        "localRulesDir",
        "cursorRulesDir",
        "localSkillRootDir",
        "cursorSkillsRootDir",
        "skillFiles"
    ];

    for (const fieldName of requiredFields) {
        if (!(fieldName in config)) {
            throw new Error("配置缺少字段：" + fieldName);
        }
    }

    if (!Array.isArray(config.skillFiles) || config.skillFiles.length === 0) {
        throw new Error("配置字段 skillFiles 必须是非空数组");
    }

    return config;
}

/**
 * 获取所有目录的绝对路径
 * @param {string} rootDir - 项目根目录
 * @param {Object} config - 配置对象
 * @returns {Object} 包含所有目录绝对路径的对象
 */
function getDirectories(rootDir, config) {
    return {
        // 本地 rules 目录（如：/Users/chenwen/办公/skill/rules）
        localRulesDir: resolveConfiguredPath(rootDir, config.localRulesDir),
        // Cursor rules 目录（如：/Users/chenwen/.cursor/rules）
        cursorRulesDir: resolveConfiguredPath(rootDir, config.cursorRulesDir),
        // 本地 skillFile 目录（如：/Users/chenwen/办公/skill/skillFile）
        localSkillRootDir: resolveConfiguredPath(rootDir, config.localSkillRootDir),
        // Cursor skills 目录（如：/Users/chenwen/.cursor/skills）
        cursorSkillsRootDir: resolveConfiguredPath(rootDir, config.cursorSkillsRootDir)
    };
}

/**
 * 断言目录存在，不存在则抛出错误
 * @param {string} directoryPath - 目录路径
 * @param {string} description - 目录描述（用于错误信息）
 */
async function assertDirectoryExists(directoryPath, description) {
    const exists = await pathExists(directoryPath);

    if (!exists) {
        throw new Error(description + "不存在：" + directoryPath);
    }
}

/**
 * 递归列出目录下所有文件
 * @param {string} rootDir - 根目录
 * @returns {Promise<string[]>} 所有文件的绝对路径数组
 */
async function listAllFilesRecursive(rootDir) {
    const result = [];

    async function walk(currentDir) {
        const entries = await fs.readdir(currentDir, {withFileTypes: true});

        for (const entry of entries) {
            const entryPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                await walk(entryPath);
                continue;
            }

            if (entry.isFile()) {
                result.push(entryPath);
            }
        }
    }

    await walk(rootDir);
    return result;
}

/**
 * 创建 rules 目录的文件映射关系
 * @param {string} sourceRulesDir - 源 rules 目录
 * @param {string} targetRulesDir - 目标 rules 目录
 * @param {string} relativePrefix - 相对路径前缀（用于日志显示）
 * @returns {Promise<Array>} 映射数组，每个元素包含源路径、目标路径和相对路径
 * 
 * 映射规则：
 * - 源目录下的所有文件（包括子目录）都会映射到目标目录的相同相对位置
 * - 例如：~/.cursor/rules/cursor-core.mdc -> /Users/chenwen/办公/skill/rules/cursor-core.mdc
 */
async function createRulesMappings(sourceRulesDir, targetRulesDir, relativePrefix) {
    const filePaths = await listAllFilesRecursive(sourceRulesDir);
    const mappings = [];

    for (const sourcePath of filePaths) {
        const relativePath = path.relative(sourceRulesDir, sourcePath);
        const targetPath = path.join(targetRulesDir, relativePath);

        mappings.push({
            sourceRelativePath: relativePrefix + "/" + relativePath,
            sourcePath,
            targetPath
        });
    }

    return mappings;
}

/**
 * 列出 skills 根目录下的所有技能名称（子目录名）
 * @param {string} skillRootDir - skills 根目录
 * @returns {Promise<string[]>} 技能名称数组
 */
async function listSkillNames(skillRootDir) {
    const entries = await fs.readdir(skillRootDir, {withFileTypes: true});
    const skillNames = [];

    for (const entry of entries) {
        if (entry.isDirectory()) {
            skillNames.push(entry.name);
        }
    }

    return skillNames;
}

/**
 * 创建 skills 目录的文件映射关系
 * @param {string} skillRootSourceDir - 源 skills 根目录
 * @param {string} skillRootTargetDir - 目标 skills 根目录
 * @param {string[]} skillFiles - 需要同步的技能文件名列表
 * @param {string} relativePrefix - 相对路径前缀（用于日志显示）
 * @returns {Promise<Array>} 映射数组
 * 
 * 映射规则：
 * - 仅同步指定的技能文件（SKILL.md、reference.md、checklist.md）
 * - 每个技能目录下的这些文件会映射到目标目录的对应位置
 * - 例如：~/.cursor/skills/newsearch/SKILL.md -> /Users/chenwen/办公/skill/skillFile/newsearch/SKILL.md
 */
async function createSkillMappings(skillRootSourceDir, skillRootTargetDir, skillFiles, relativePrefix) {
    const skillNames = await listSkillNames(skillRootSourceDir);
    const mappings = [];

    for (const skillName of skillNames) {
        for (const fileName of skillFiles) {
            mappings.push({
                sourceRelativePath: relativePrefix + "/" + skillName + "/" + fileName,
                sourcePath: path.join(skillRootSourceDir, skillName, fileName),
                targetPath: path.join(skillRootTargetDir, skillName, fileName)
            });
        }
    }

    return mappings;
}

/**
 * 执行文件复制操作
 * @param {Array} mappings - 文件映射数组（由 createRulesMappings 或 createSkillMappings 生成）
 * @param {string} actionLabel - 操作标签（用于日志显示）
 * @returns {Promise<number>} 已复制的文件数量
 * 
 * 复制逻辑：
 * - 遍历所有映射项
 * - 跳过源文件不存在的项
 * - 自动创建目标文件所在的目录（如果不存在）
 * - 执行文件复制
 */
async function copyMappings(mappings, actionLabel) {
    let copiedCount = 0;

    console.log("==============================================");
    console.log(actionLabel);
    console.log("==============================================");

    for (const item of mappings) {
        const sourceExists = await pathExists(item.sourcePath);

        if (!sourceExists) {
            continue;
        }

        // 确保目标目录存在
        await fs.mkdir(path.dirname(item.targetPath), {recursive: true});
        // 执行文件复制
        await fs.copyFile(item.sourcePath, item.targetPath);

        copiedCount += 1;
        console.log("[已同步] " + item.sourceRelativePath + " -> " + item.targetPath);
    }

    console.log("----------------------------------------------");
    console.log("本次共同步文件：" + copiedCount);
    console.log("----------------------------------------------\n");

    return copiedCount;
}

module.exports = {
    assertDirectoryExists,
    copyMappings,
    createRulesMappings,
    createSkillMappings,
    getDirectories,
    loadConfig,
    pathExists,
    resolveConfiguredPath
};
