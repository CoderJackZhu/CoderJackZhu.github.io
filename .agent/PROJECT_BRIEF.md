# Project Brief

## Project Goal

把现有 Hexo + Butterfly 博客（54 篇，六年）迁移为基于 Astro Micro 的克制现代独立博客，替换线上唯一站点 `www.jackzhu.top`，保留全部旧文章日期型 URL、公开身份信息与订阅地址。

## Current Stage

准备阶段已完成（脚手架 + 配置约束 + 文档）。下一步进入实施阶段，小步可验证推进；本地完全验证并用户批准前不 push、不部署。

## Target User

- 公开读者（技术博客读者、简历来访者）
- 用户本人（长期写作档案）

## Core Requirements

- 文章优先，不是作品集/仪表盘
- 公开身份只署 `Jack` / `Jack's Blog`，不写真名
- 54 篇全部迁移，保留原日期型永久链接
- 页脚保留建站年份、ICP 备案号、又拍云说明、百度统计
- 友链 11 个原样保留；社交链接保留 GitHub/知乎/B站/RSS
- 不设评论、独立归档、标签云、Projects/Publications
- 本地完全验证后，经用户批准才 push 上线

## Non-goals

当前阶段不做：

- 不建 Projects / Proof of Work / Publications
- 不恢复音乐、电影、相册等旧主题功能
- 不做 AI 聊天、RAG、llms.txt、JSON 内容 API
- 不切换 GitHub Pages 发布模式（artifact 模式）
- 不重构分类体系（仅有限映射到四类）
- 不自动 git commit / 不自动 push / 不自动 deploy / publish

## Technical Preferences

- 优先小步实现、每步可验证
- 优先保留旧 URL 与既有结构
- 优先可运行、可测试、可回滚
- 避免过早抽象、避免过度工程化
- 新增依赖前说明理由
- Node 22（≥22.12），Astro Micro 锁 commit `af69926c87341719846fe0e7a415483deb4e05ee`

## Working Rules for Agent

1. 每次开始前先读 `.agent/PROJECT_BRIEF.md`、`.agent/CURRENT_STATE.md`、`.agent/TASKS.md`。
2. `TASKS.md` 是唯一任务源，不使用内部 todo 工具。
3. 每轮只执行一个明确任务。
4. 修改代码前说明：本轮任务、计划检查/修改的文件、是否偏离项目目标。
5. 发现任务需扩大范围，先停止并询问。
6. 完成后：总结修改、运行验证命令、更新 `.agent/CURRENT_STATE.md` 与 `.agent/TASKS.md`。
7. 公开署名只写 `Jack`；不引入真名、公司履历、非公开项目细节。
8. 迁移期间只读旧内容，不改动 `main` 工作树的源 Markdown（正文改动另立编辑任务）。

## Done Criteria

- 功能可运行或变更可验证
- 没有破坏既有行为
- 已更新 `.agent/CURRENT_STATE.md` 与 `.agent/TASKS.md`
