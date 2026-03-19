const path = require("path");
const util = require("util");
const execFile = util.promisify(require("child_process").execFile);

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
        throw new Error(description + "失败: " + detail);
    }
}

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
    const rootDir = path.resolve(__dirname, "..");

    console.log("==============================================");
    console.log("开始同步本地项目（rules + skillFile）到 GitHub");
    console.log("==============================================\n");

    const branchResult = await runGit(rootDir, ["branch", "--show-current"], "读取当前分支");
    const currentBranch = branchResult.stdout.trim();

    if (!currentBranch) {
        throw new Error("未能识别当前分支，请先切换到一个有效分支后再同步。");
    }

    console.log("当前分支: " + currentBranch + "\n");

    await runGit(rootDir, ["pull", "origin", currentBranch], "从 GitHub 拉取远端更新");
    await runGit(rootDir, ["add", "."], "添加本地变更到暂存区");

    const statusResult = await runGit(rootDir, ["status", "--short"], "检查是否存在待提交变更");
    const statusOutput = statusResult.stdout.trim();

    if (!statusOutput) {
        console.log("没有检测到新的本地变更，本次无需提交或推送。\n");
        return;
    }

    await runGit(rootDir, ["commit", "-m", createCommitMessage()], "提交本地变更");
    await runGit(rootDir, ["push", "origin", currentBranch], "推送本地变更到 GitHub");

    console.log("**********************************************");
    console.log("GitHub 同步完成（rules + skillFile）");
    console.log("**********************************************\n");
}

if (require.main === module) {
    main().catch(error => {
        console.error("【失败】GitHub 同步出错: " + error.message);
        process.exitCode = 1;
    });
}

module.exports = {
    main
};
