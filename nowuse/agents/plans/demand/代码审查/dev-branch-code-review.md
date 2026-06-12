---
name: dev分支代码审查（Bug&优化检测）
description: 检测dev分支暂存改动的bug、代码质量问题、可优化点
status: 进行中
date: 2026-04-22
---

## 任务概述
检测当前dev分支中的以下修改文件：
- api/misc.js
- components/ 中的多个Vue组件
- utils/ 中的工具函数
- views/ 中的页面组件

**目标**：
1. 识别潜在的bug
2. 发现代码质量问题
3. 提出可优化方案
4. 生成详细的审查报告

## 修改文件清单
- M  src/api/misc.js
- M  src/components/leisu/MyImgCut.vue
- M  src/components/leisu/corpper.vue
- D  src/components/leisu/peopleInfo/group/components/upload.vue
- D  src/components/uploadPhoto/components/createdCover.js
- M  src/components/uploadPhoto/components/createdCovernew.js
- D  src/components/uploadPhoto/index.vue
- M  src/components/uploadPhoto/indexnew.vue
- D  src/components/wangEditor/components/basketballTemplateStat.vue
- D  src/components/wangEditor/components/basketballTemplateStatRate.vue
- M  src/components/wangEditor/components/matchGifTc.vue
- M  src/components/wangEditor/components/scoreImgTc.vue
- D  src/components/watermark/MyImgCut.vue
- D  src/components/watermark/corpper.vue
- M src/main.js
- M  src/utils/compress.js
- M  src/utils/tool.js
- MM src/views/app_set/components/edit_ad.vue
- D  src/views/app_set/components/eidt_version  coyp1.vue
- M  src/views/intelligence/components/cover/drawCanvasBox.vue
- M  src/views/match/components/matchDeep/matchDeepTeam.vue
- M  src/views/member/components/survey_detail.vue
