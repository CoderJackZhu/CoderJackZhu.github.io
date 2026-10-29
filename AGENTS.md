# Jack's Blog

## 概述

Jack 的个人博客，基于 Astro Micro 构建，部署到 www.jackzhu.top（GitHub Pages，`html` 分支）。

## 技术栈与命令

- Astro 6.4.8 + @astrojs/mdx 5.x + @astrojs/rss 4.0.19 + @astrojs/markdown-remark
- Node 22（≥22.12）
- 安装：`npm ci`
- 构建：`npm run build`（astro check + 构建 + Pagefind 索引）
- 静态审计：`npm run test`（`scripts/verify-build.mjs`）
- E2E：`npm run test:e2e`（Playwright 矩阵 360/390/768/1440px）

## 约定

- 工作目录：`/Volumes/DATA/Code/Content/CoderJackZhu.github.io`（branch `main`）
- 站点可改文案集中在 `site.config.yaml`（站点/导航/社交/友链/页脚/关于/各页文案/照片墙），由 `src/lib/site-config.ts` 用 js-yaml 加载。
- 文章在 `src/content/blog/<slug>/index.md`，frontmatter：`title` / `description` / `date` / `section` / `legacyPath` / `cover`（`updated`、`draft` 可选）。
- 文章 URL 由 `legacyPath` 决定，路由 `[year]/[month]/[day]/[...slug]`；改文章标题不改变 URL。
- 部署：GitHub Pages artifact 模式，CI `astro_build_deploy.yml`（仅 main，dist→html 分支）。

## 项目规则

1. 公开署名只写 `Jack` / `Jack's Blog`，不写真名、公司履历、非公开项目细节。
2. 不自动 git commit / push / deploy / publish——本地验证 + 用户批准后才 push。
3. 网站由个人首页、作品与文章组成。首页先展示最能证明工程能力的精选文章，再展示代表项目与最近写作；视频作为作品页的补充内容，不占据首页首屏。作品可以是软件、视频或其他已完成的公开内容。保留文章日期型 URL、搜索与 RSS；不设评论、标签云或空的作品占位。
4. 作品由 `src/content/works/*.md` 维护，首页精选文章由 `site.config.yaml` 的 `pages.home.featuredPosts` 指定。详细规则见 README。
5. 视频只链接 B站，不放抖音；不展示播放量作为作品评价。产品截图只用公开的虚构样例，个人站项目页介绍创作与工程取舍，下载与支持范围链接产品站。
