#!/bin/bash
# 按关键词搜索历史需求规划
# 用法：./search-plans.sh "关键词"

if [ -z "$1" ]; then
    echo "用法：./search-plans.sh \"关键词\""
    echo "示例：./search-plans.sh \"自定义事件\""
    exit 1
fi

SEARCH_DIR="$(cd "$(dirname "$0")/.." && pwd)/archive"
KEYWORD="$1"

echo "🔍 搜索关键词：$KEYWORD"
echo "📁 搜索路径：$SEARCH_DIR"
echo "----------------------------------------"

if [ ! -d "$SEARCH_DIR" ]; then
    echo "❌ archive 目录不存在，尚无归档需求"
    exit 0
fi

# 搜索 archive 下所有 .md 文件
RESULTS=$(grep -rl "$KEYWORD" "$SEARCH_DIR"/*/  2>/dev/null | grep -E "(task_plan|findings|progress)\.md$")

if [ -z "$RESULTS" ]; then
    echo "❌ 未找到匹配的需求"
    exit 0
fi

echo "✅ 找到以下匹配的需求："
echo ""

# 提取需求文件夹名称并去重
UNIQUE_DIRS=$(echo "$RESULTS" | xargs dirname | sort -u)

echo "$UNIQUE_DIRS" | while read -r PLAN_DIR; do
    PLAN_NAME=$(basename "$PLAN_DIR")
    
    # 提取核心方案（如果存在）
    SOLUTION=$(grep -F "**核心方案**" "$PLAN_DIR/task_plan.md" 2>/dev/null | head -1 | sed 's/.*：//' | sed 's/^- //' | sed 's/^[[:space:]]*//')
    
    # 提取标签（如果存在）
    TAGS=$(grep -F "**标签**" "$PLAN_DIR/task_plan.md" 2>/dev/null | head -1 | sed 's/.*：//' | sed 's/^[[:space:]]*//')
    
    # 提取完成日期（如果存在）
    COMPLETED=$(grep -F "**完成日期**" "$PLAN_DIR/task_plan.md" 2>/dev/null | head -1 | sed 's/.*：//' | sed 's/^[[:space:]]*//')
    
    echo "📦 $PLAN_NAME"
    if [ -n "$COMPLETED" ]; then
        echo "   完成：$COMPLETED"
    fi
    if [ -n "$SOLUTION" ]; then
        echo "   方案：$SOLUTION"
    fi
    if [ -n "$TAGS" ]; then
        echo "   标签：$TAGS"
    fi
    echo "   路径：$PLAN_DIR"
    echo ""
done
