# Claude Code 双配置方案

## 配置文件

### 配置 A：直连 DeepSeek 官方

文件路径：
~/.claude/settings.deepseek.json

文件内容：

{
  "env": {
    "ANTHROPIC_BASE_URL":
      "https://api.deepseek.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN":
      "你的DeepSeek官方密钥",
    "ANTHROPIC_MODEL":
      "deepseek-v4-pro"
  }
}

### 配置 B：通过 cc 分发器

文件路径：
~/.claude/settings.cc.json

文件内容：

{
  "env": {
    "ANTHROPIC_BASE_URL":
      "你的cc分发器地址",
    "ANTHROPIC_AUTH_TOKEN":
      "你的cc分发器密钥",
    "ANTHROPIC_MODEL":
      "deepseek-v4-pro"
  }
}

## 添加别名（Mac Zsh）

执行以下命令：

echo 'alias claude-a="CLAUDE_CONFIG_FILE=' >> ~/.zshrc
echo '~/.claude/settings.deepseek.json claude"' >> ~/.zshrc

echo 'alias claude-b="CLAUDE_CONFIG_FILE=' >> ~/.zshrc
echo '~/.claude/settings.cc.json claude"' >> ~/.zshrc

source ~/.zshrc

## 使用

claude-a
claude-b

---

如果这次仍然截断，请告知。我可以将内容分为
两个连续的回复，您拼接起来就是完整的。