const fs = require("fs").promises;
const os = require("os");
const path = require("path");

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

function resolveConfiguredPath(rootDir, configuredPath) {
    const expandedPath = expandHomePath(configuredPath);

    if (path.isAbsolute(expandedPath)) {
        return expandedPath;
    }

    return path.resolve(rootDir, expandedPath);
}

async function pathExists(targetPath) {
    try {
        await fs.access(targetPath);
        return true;
    } catch (error) {
        return false;
    }
}

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
            throw new Error("配置缺少字段: " + fieldName);
        }
    }

    if (!Array.isArray(config.skillFiles) || config.skillFiles.length === 0) {
        throw new Error("配置字段 skillFiles 必须是非空数组");
    }

    return config;
}

function getDirectories(rootDir, config) {
    return {
        localRulesDir: resolveConfiguredPath(rootDir, config.localRulesDir),
        cursorRulesDir: resolveConfiguredPath(rootDir, config.cursorRulesDir),
        localSkillRootDir: resolveConfiguredPath(rootDir, config.localSkillRootDir),
        cursorSkillsRootDir: resolveConfiguredPath(rootDir, config.cursorSkillsRootDir)
    };
}

async function assertDirectoryExists(directoryPath, description) {
    const exists = await pathExists(directoryPath);

    if (!exists) {
        throw new Error(description + "不存在: " + directoryPath);
    }
}

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

        await fs.mkdir(path.dirname(item.targetPath), {recursive: true});
        await fs.copyFile(item.sourcePath, item.targetPath);

        copiedCount += 1;
        console.log("[已同步] " + item.sourceRelativePath + " -> " + item.targetPath);
    }

    console.log("----------------------------------------------");
    console.log("本次共同步文件: " + copiedCount);
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
