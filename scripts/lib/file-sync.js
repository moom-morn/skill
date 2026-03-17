const fs = require("fs/promises");
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
    return JSON.parse(content);
}

function getDirectories(rootDir, config) {
    return {
        localSkillDir: resolveConfiguredPath(rootDir, config.localSkillDir),
        cursorSkillDir: resolveConfiguredPath(rootDir, config.cursorSkillDir)
    };
}

function createMappings(fileList, sourceDir, targetDir) {
    const mappings = [];

    for (const item of fileList) {
        mappings.push({
            sourceRelativePath: item.source,
            targetRelativePath: item.target,
            sourcePath: path.join(sourceDir, item.source),
            targetPath: path.join(targetDir, item.target)
        });
    }

    return mappings;
}

async function assertDirectoryExists(directoryPath, description) {
    const exists = await pathExists(directoryPath);

    if (!exists) {
        throw new Error(description + "不存在: " + directoryPath);
    }
}

async function copyMappings(mappings, actionLabel) {
    let copiedCount = 0;

    console.log("==============================================");
    console.log(actionLabel);
    console.log("==============================================");

    for (const item of mappings) {
        const sourceExists = await pathExists(item.sourcePath);

        if (!sourceExists) {
            throw new Error("源文件不存在: " + item.sourcePath);
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
    createMappings,
    getDirectories,
    loadConfig,
    pathExists,
    resolveConfiguredPath
};
