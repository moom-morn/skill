/**
 * 技能库整理与自动同步脚本
 * 环境: Node 20.x (利用 async/await 特性)
 * 规范: 禁止链式结构，逻辑平铺，包含详细中文注释
 */

// 引入子进程模块的 promise 版本
const util = require("util")
const exec = util.promisify(require("child_process").exec)

/**
 * 通用的执行函数
 * @param {string} command 待执行的终端命令
 * @param {string} description 当前步骤的描述
 */
async function runStep(command, description) {
    console.log(">>> 正在启动步骤: " + description)

    try {
        // 执行命令并等待结果
        const {stdout, stderr} = await exec(command)

        // 打印标准输出
        if (stdout) {
            console.log("执行结果: " + stdout)
        }

        // 打印 Git 的提示信息
        if (stderr) {
            console.log("系统反馈: " + stderr)
        }

        console.log("<<< 步骤完成: " + description + "\n")
        return true
    } catch (error) {
        console.error("【运行出错】" + description + " 失败: " + error.message)
        // 抛出错误以停止后续流程
        throw error
    }
}

/**
 * 主程序逻辑
 */
async function main() {
    console.log("----------------------------------------------")
    console.log("开始执行技能库同步 (Node 20 模式)")
    console.log("----------------------------------------------\n")

    try {
        // 步骤 1: 将所有新文件夹及文件添加到暂存区
        await runStep("git add .", "添加新文件夹及文件到暂存区")

        // 步骤 2: 准备提交信息
        const now = new Date()
        const commitTime = now.toLocaleString()
        const commitMessage = "feat: 重新整理技能库目录结构并更新文件 (" + commitTime + ")"
        // 使用转义双引号确保 commit 信息安全
        const gitCommitCmd = 'git commit -m "' + commitMessage + '"'

        await runStep(gitCommitCmd, "提交本地仓库更新")

        // 步骤 3: 推送至 GitHub
        // 基于你之前配置的 Fine-grained Token，此处应能直接推送
        await runStep("git push origin main", "同步推送到 GitHub 远程仓库")

        // 最终成功提示
        console.log("**********************************************")
        console.log("  同步操作圆满成功！")
        console.log("  1. 文件已完成归类整理")
        console.log("  2. 云端仓库已同步更新")
        console.log("**********************************************")
    } catch (err) {
        console.log("\n[终止] 同步流程因错误中断，请检查后再试。")
    }
}

// 启动程序
main()
