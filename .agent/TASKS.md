# Tasks

## Now

- [x] 裁剪模板：删示例文章/项目/giscus/模板身份，改 `content.config.ts`（blog 单集合 + 新 schema）、`consts.ts`、`types.ts`
- [x] 建页面与路由：首页、`/blog/` 列表+分页、文章日期 URL `[year]/[month]/[day]/[...slug]`、关于、友链、分类结果、`atom.xml`、404
- [x] 视觉样式落到 Astro（克制现代刊物风格，浅色默认+深色，来自 `docs/design-spec.md` §5）
- [x] 迁移脚本与清单（Phase B）：`scripts/*.mjs` + `migration/*.json`（54 篇 → 四分类映射、URL 清单、图片审计、友链审计）
- [x] 批量迁移 54 篇（Phase D）：frontmatter 转换 + 清除 `Jack Zhu` 署名 + 特殊语法人工处理（含 remark-math/rehype-katex/katex 数学渲染）
- [x] 图片处置实现（Phase E 第二步）：8 篇课程报告 66 条失效 `cdn.noedgeai.com` 图引用全部按 `note` 删除并加注「（原图已失效）」，`npm run build` 通过
- [x] 修复 8 篇课程报告历史格式错误：7 篇 TOC 列表化、正文公式改 `$...$`/`$$...$$`、FCM/MIMC 未围栏代码补 ```python 围栏，`npm run build` 通过

## Next

- [x] 图片与静态资源（Phase E 剩余）：`cdn.nlark.com` 5 条实测 200 有效；gcore 56 张保留确认
- [x] 旧 URL/SEO/订阅兼容（Phase F）：百度统计入 head、robots→sitemap-index、canonical/sitemap/CNAME/.nojekyll/验证文件/atom.xml 全部验证通过
- [ ] 本地完整验证（Phase H）：`npm ci` + `npm run build` + Playwright 矩阵（360/390/768/1440px）

## Later

- [ ] GitHub 审阅与上线（Phase I，需用户二次批准）
- [ ] 稳定期清理（Phase J）
- [ ] 评估从 `html` 分支发布迁移到官方 Pages artifact 模式
- [ ] 新建 `/photos/` 极简摄影页（仅放用户自拍照片，不放文章插图；范围变更，需单独设计）。cover→og:image 已接线完成

## Backlog

- [ ] npm audit 17 个漏洞（1 low / 6 moderate / 10 high）评估与处置
