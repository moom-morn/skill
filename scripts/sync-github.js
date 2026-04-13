/**
 * 将本地项目（rules + skillFile）同步到 GitHub 仓库
 * 
 * 执行流程：
 * 1. 获取当前 Git 分支名称
 * 2. 从远程拉取最新代码（避免冲突）
 * 3. 将所有变更添加到暂存区
 * 4. 检查是否有待提交的变更（如无变更则跳过）
 * 5. 提交变更（自动生成包含时间戳的 commit message）
 * 6. 推送到远程仓库
 * 
 * 注意：此脚本假设已经配置了 Git 远程仓库（origin）
 */
const path = require("path");
const util = require("util");
const execFile = util.promisify(require("child_process").execFile);

/**
 * 执行 Git 命令并输出日志
 * @param {string} rootDir - 项目根目录
 * @param {string[]} args - Git 命令参数数组
 * @param {string} description - 操作描述（用于日志显示）
 */
async function runGit(rootDir, args, description) {
    console.log(">>> " + description);

    try {
        const result = await execFile("git", args, {cwd: rootDir});
        const stdout = (result.stdout || "").trim();
        const stderr = (result.stderr || "").trim();

        if (stdout) {
            console.log(stdout);
        }

        if (stderr) {
            console.log(stderr);
        }

        console.log("--- " + description + " 完成 ---\n");
        return result;
    } catch (error) {
        const stdout = error.stdout ? String(error.stdout).trim() : "";
        const stderr = error.stderr ? String(error.stderr).trim() : "";
        const detail = stderr || stdout || error.message;
        throw new Error(description + "失败：" + detail);
    }
}

/**
 * 生成提交消息（包含当前时间戳）
 * @returns {string} 格式化的 commit message
 */
function createCommitMessage() {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const second = String(now.getSeconds()).padStart(2, "0");
    return "chore: sync rules and skills (" + year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second + ")";
}

async function main() {
    // 解析项目根目录路径：/Users/chenwen/办公/skill
    const rootDir = path.resolve(__dirname, "..");

    console.log("==============================================");
    console.log("开始同步本地项目（rules + skillFile）到 GitHub");
    console.log("==============================================\n");

    // 获取当前 Git 分支名称
    const branchResult = await runGit(rootDir, ["branch", "--show-current"], "读取当前分支");
    const currentBranch = branchResult.stdout.trim();

    if (!currentBranch) {
        throw new Error("未能识别当前分支，请先切换到一个有效分支后再同步。");
    }

    console.log("当前分支：" + currentBranch + "\n");

    // 步骤 1：从远程仓库拉取最新代码，避免推送时发生冲突
    await runGit(rootDir, ["pull", "origin", currentBranch], "从 GitHub 拉取远端更新");
    
    // 步骤 2：将所有文件变更添加到 Git 暂存区
    await runGit(rootDir, ["add", "."], "添加本地变更到暂存区");

    // 步骤 3：检查是否有待提交的变更
    const statusResult = await runGit(rootDir, ["status", "--short"], "检查是否存在待提交变更");
    const statusOutput = statusResult.stdout.trim();

    if (!statusOutput) {
        console.log("没有检测到新的本地变更，本次无需提交或推送。\n");
        return;
    }

    // 步骤 4：提交变更（使用自动生成的 commit message）
    await runGit(rootDir, ["commit", "-m", createCommitMessage()], "提交本地变更");
    
    // 步骤 5：推送到远程仓库
    await runGit(rootDir, ["push", "origin", currentBranch], "推送本地变更到 GitHub");

    console.log("**********************************************");
    console.log("GitHub 同步完成（rules + skillFile）");
    console.log("**********************************************\n");
}

// 当直接运行此脚本时执行 main 函数
if (require.main === module) {
    main().catch(error => {
        console.error("【失败】GitHub 同步出错：" + error.message);
        process.exitCode = 1;
    });
}

module.exports = {
    main
};
