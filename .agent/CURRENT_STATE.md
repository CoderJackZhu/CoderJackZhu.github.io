# Current State

## Current Focus

迁移已完成并上线（2026-09-04）。PR #26 已 merge，Astro 站点部署到 `html` 分支，
线上 https://www.jackzhu.top/ 已切换为新站并回归验证通过（首页/路由/旧 URL/静态资源/署名清除/Pagefind 全绿）。
剩余：Phase J 稳定期清理 + `/photos/` 摄影页（范围变更）。

## Last Updated

2026-09-04

## Done

- 建立隔离分支 `migration/astro` 与 worktree `/Users/jackzhu/projects/blog-astro-migration`
- 从 Astro Micro 锁 commit `af69926` 拷入模板（保留 MIT LICENSE）
- 保留 CNAME、robots.txt、百度/Google 站点验证文件到 `public/`，新增 `public/.nojekyll`
- 配置 astro.config.mjs（site=https://www.jackzhu.top）、package.json（engines ≥22.12）、.nvmrc、.editorconfig、.gitignore
- CI：astro_ci.yml（PR 只构建）+ astro_build_deploy.yml（仅 main，dist→html）
- 文档：docs/design-spec.md、.agent/ 三件套、AGENTS.md/CLAUDE.md
- 裁剪模板：blog 单集合新 schema、consts/types 对齐、删示例/项目/giscus/tags/rss.xml
- 建页面与路由：文章日期 URL、首页/列表+分页/关于/友链/分类/atom.xml/404、legacyPath 解析、zh-CN
- 视觉样式：Demo 设计系统（CSS 变量浅/深两套）、Header/Footer/文章页等按 Demo 观感重写、浅色默认
- 迁移脚本与清单（Phase B）：`scripts/*.mjs` + `migration/*.json`（54 篇四分类已批准）
- 批量迁移 54 篇（Phase D）：frontmatter 转换、清署名、数学三件套、build 通过
- 图片处置（Phase E）：66 条失效 `cdn.noedgeai.com` 图按 `note` 删除并加注；`cdn.nlark.com` 5 条实测 200 保留
- 旧 URL/SEO/订阅兼容（Phase F）：百度统计、robots→sitemap-index、canonical/CNAME/.nojekyll/验证文件/atom.xml
- 8 篇课程报告历史格式修复：目录列表化、公式 `$...$`/`$$...$$`、代码围栏+缩进恢复
- Header/favicon：`.site-header` 占满 1080px 防重叠、导航分文字组与图标组、`J` 矢量 `public/favicon.svg` 替换模板显微镜、删除三按钮死代码
- **Phase H 本地验证**：新增 `scripts/verify-build.mjs` 静态审计（10 类）与 Playwright E2E（13 用例），
  `npm ci` / `npm run build` / `npm run test` / `npm run test:e2e` 全绿
- 清理未引用依赖 `@fontsource/geist-mono`、`@fontsource/geist-sans`
- `npm audit fix`：兼容范围内降 17 → 5 项
- 站点图标替换为 bloggallery `art_favicon.webp`（1024×1024 webp）→ 本地 `favicon.png`(32)+`apple-touch-icon.png`(180)+`og-image.png`(1024)，移除自造 `favicon.svg`
- push `migration/astro` 到 origin，开 PR #26（CI build 通过）

## In Progress

- 无（迁移已完成上线）

## Next Recommended Task

- Phase J 稳定期清理（可选）：`migration/*.json`、`scripts/*.mjs` 是否保留/归档；npm audit 剩余 5 项是否升 Astro 7。
- `/photos/` 极简摄影页（范围变更，需单独设计）。

## Known Issues

- 剩余 5 项 npm 审计（1 low / 2 moderate / 2 high，无 critical）需 `npm audit fix --force`
  升级到 Astro 7（breaking change）。静态站点实际风险面受限，但不应在上线前无计划硬升；
  建议上线后单独评估 Astro 7 升级任务。
- `/atom.xml` 用 `@astrojs/rss` 输出 RSS 2.0 非严格 Atom；URL 已保留，格式对齐未做。
- About 文案为草稿，用户逐字审阅（Phase G 文案验收门）。
- 首页/关于/友链等页面结构与事实已自动验证，最终文案仍待用户本轮预览确认。
- `/photos/` 极简摄影页仍待单独设计（范围变更，非本轮核心迁移）。

## Important Context

- 工作目录：`/Users/jackzhu/projects/blog-astro-migration`（branch `migration/astro`）
- 迁移计划（7 阶段）：`/Users/jackzhu/projects/blog/.hermes/plans/2026-09-03_195621-astro-blog-migration.md`
- 设计规范：`docs/design-spec.md`（唯一设计事实来源）
- 视觉参考 Demo（已批准）：`/Users/jackzhu/Documents/blog-style-demos/jack-blog-recommended-demo.html`
- 原站源码（只读）：`/Users/jackzhu/projects/blog`（main），文章 `source/_posts/*.md`（54 篇）
- 当前依赖：astro 6.4.8、@astrojs/mdx 5.x、@astrojs/rss 4.0.19、@astrojs/markdown-remark（直接依赖，供 `unified()`）
- 实施 worker：Codex CLI；Hermes 负责范围控制/diff 审查/测试复验。本轮 Codex 曾挂死，余下定点修复与全量复验由 Hermes 直接完成。

## Verification

Last verified at: 2026-09-04

- `npm ci` → exit 0（5 vulnerabilities，需 Astro 7 的强制升级未做）
- `npm run build` → exit 0，astro check 0 errors，67 page(s) built，Pagefind 索引 69 pages，无 markdown/弃用告警
- `npm run test` → 10/10 PASS（54 篇一致、54 URL、1156 内链、署名清除、favicon、CNAME/验证文件、sitemap/atom/canonical、Pagefind、代表文章、无凭证）
- `npm run test:e2e` → 13/13 passed（360/390/768/1440 响应式、首页/分页/关于/友链/404、代码/数学/原始 HTML/多图、搜索、主题、键盘、360px 溢出、favicon）
