#!/bin/bash
# 生成需求归档摘要
# 用法：./archive-summary.sh {需求文件夹路径}

if [ -z "$1" ]; then
    echo "用法：./archive-summary.sh {需求文件夹路径}"
    echo "示例：./archive-summary.sh ../custom_event_card_20260514"
    exit 1
fi

PLAN_DIR="$1"

if [ ! -d "$PLAN_DIR" ]; then
    echo "❌ 目录不存在：$PLAN_DIR"
    exit 1
fi

echo "# 归档摘要：$(basename "$PLAN_DIR")"
echo ""
echo "生成时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 提取基本信息
if [ -f "$PLAN_DIR/task_plan.md" ]; then
    echo "## 📋 基本信息"
    echo ""
    
    # 提取目标
    GOAL=$(grep -A 1 "^## Goal" "$PLAN_DIR/task_plan.md" | tail -1 | sed 's/^[[:space:]]*//')
    if [ -n "$GOAL" ]; then
        echo "**目标**：$GOAL"
    fi
    
    # 提取完成日期
    COMPLETED=$(grep "完成日期" "$PLAN_DIR/task_plan.md" | head -1 | sed 's/.*：//' | sed 's/^[[:space:]]*//')
    if [ -n "$COMPLETED" ]; then
        echo "**完成日期**：$COMPLETED"
    fi
    
    # 提取核心方案
    SOLUTION=$(grep "核心方案" "$PLAN_DIR/task_plan.md" | head -1 | sed 's/.*：//' | sed 's/^[[:space:]]*//')
    if [ -n "$SOLUTION" ]; then
        echo "**核心方案**：$SOLUTION"
    fi
    
    # 提取标签
    TAGS=$(grep "标签" "$PLAN_DIR/task_plan.md" | head -1 | sed 's/.*：//' | sed 's/^[[:space:]]*//')
    if [ -n "$TAGS" ]; then
        echo "**标签**：$TAGS"
    fi
    
    echo ""
    
    # 提取核心决策
    echo "## 🎯 核心决策"
    echo ""
    DECISIONS=$(sed -n '/^## Decisions Made/,/^## /p' "$PLAN_DIR/task_plan.md" | grep "|" | grep -v "Decision" | head -10)
    if [ -n "$DECISIONS" ]; then
        echo "$DECISIONS"
    else
        echo "_暂无决策记录_"
    fi
    echo ""
fi

# 提取可复用方案
if [ -f "$PLAN_DIR/findings.md" ]; then
    echo "## 💡 可复用方案"
    echo ""
    REUSABLE=$(sed -n '/^## 可复用方案$/,/^## /p' "$PLAN_DIR/findings.md" | grep "^-" | head -10)
    if [ -n "$REUSABLE" ]; then
        echo "$REUSABLE"
    else
        echo "_暂无可复用方案_"
    fi
    echo ""
    
    echo "## ⚠️ 踩坑记录"
    echo ""
    PITFALLS=$(sed -n '/^## 踩坑记录$/,/^## /p' "$PLAN_DIR/findings.md" | grep "^-" | head -10)
    if [ -n "$PITFALLS" ]; then
        echo "$PITFALLS"
    else
        echo "_暂无踩坑记录_"
    fi
    echo ""
    
    echo "## ✨ 最佳实践"
    echo ""
    BEST_PRACTICES=$(sed -n '/^## 最佳实践$/,/^---/p' "$PLAN_DIR/findings.md" | grep "^-" | head -10)
    if [ -n "$BEST_PRACTICES" ]; then
        echo "$BEST_PRACTICES"
    else
        echo "_暂无最佳实践_"
    fi
    echo ""
fi

# 提取错误记录
if [ -f "$PLAN_DIR/task_plan.md" ]; then
    echo "## 🐛 遇到的错误"
    echo ""
    grep -A 3 "| Error" "$PLAN_DIR/task_plan.md" | tail -n +2 | head -20
    echo ""
fi

echo "---"
echo "完整文档路径：$PLAN_DIR"
