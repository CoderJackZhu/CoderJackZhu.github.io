# Blog Astro Migration

## Goal

把 Hexo + Butterfly 博客（54 篇，六年）迁移为基于 Astro Micro 的克制现代独立博客，替换线上唯一站点 `www.jackzhu.top`，保留全部旧文章日期型 URL、公开身份信息与订阅地址。已于 2026-09-04 上线（PR #26 merged）。

## Stack & Commands

- Astro 6.4.8 + @astrojs/mdx 5.x + @astrojs/rss 4.0.19 + @astrojs/markdown-remark（供 `unified()`）
- Node 22（≥22.12）；Astro Micro 锁 commit `af69926c87341719846fe0e7a415483deb4e05ee`
- 安装：`npm ci`
- 构建：`npm run build`（astro check + 构建 + Pagefind 索引）
- 静态审计：`npm run test`（10 用例，`scripts/verify-build.mjs`）
- E2E：`npm run test:e2e`（13 用例，Playwright 矩阵 360/390/768/1440px）

## Conventions & Gotchas

- 工作目录：`/Users/jackzhu/projects/blog-astro-migration`（branch `migration/astro`）
- 设计事实来源：`docs/design-spec.md`（唯一）
- 视觉参考 Demo（已批准）：`/Users/jackzhu/Documents/blog-style-demos/jack-blog-recommended-demo.html`
- 原站源码（只读）：`/Users/jackzhu/projects/blog`（main），文章 `source/_posts/*.md`
- 迁移计划（7 阶段）：`/Users/jackzhu/projects/blog/.hermes/plans/2026-09-03_195621-astro-blog-migration.md`
- 部署：GitHub Pages artifact 模式，CI `astro_build_deploy.yml`（仅 main，dist→html 分支）

## Project Rules

1. 公开署名只写 `Jack` / `Jack's Blog`，不写真名、公司履历、非公开项目细节。
2. 不自动 git commit / push / deploy / publish——本地验证 + 用户批准后才 push。
3. 迁移期间只读旧内容 `main` 工作树的源 Markdown（正文改动另立编辑任务）。
4. 文章优先，不是作品集/仪表盘；不设评论、独立归档、标签云、Projects/Publications。

## Continuation

每次继续前先读 `.agent/TASKS.md` 和 `.agent/CURRENT_STATE.md`。
