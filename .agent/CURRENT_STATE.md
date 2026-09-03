# Current State

## Current Focus

已修复桌面 Header 收缩导致的导航重叠，导航改为文字链接与 SVG 图标两组，
并用真实 `J` 矢量 favicon 替换模板显微镜。`npm run build` 与 favicon/Header
静态验收通过（67 pages）。下一步继续 Phase H 本地完整验证。

## Last Updated

2026-09-04

## Done

- 建立隔离分支 `migration/astro` 与 worktree `/Users/jackzhu/projects/blog-astro-migration`
- 从 Astro Micro 锁 commit `af69926` 拷入模板（保留 MIT LICENSE）
- 保留 CNAME、robots.txt、百度/Google 站点验证文件到 `public/`，新增 `public/.nojekyll`
- 配置 astro.config.mjs（site=https://www.jackzhu.top）、package.json（engines ≥22.12）、.nvmrc、.editorconfig、.gitignore
- CI：astro_ci.yml（PR 只构建）+ astro_build_deploy.yml（仅 main，dist→html）
- 文档：docs/design-spec.md、.agent/ 三件套、AGENTS.md/CLAUDE.md
- **裁剪模板**：blog 单集合新 schema、consts/types 对齐、删示例/项目/giscus/tags/rss.xml
- **建页面与路由**：文章日期 URL `[year]/[month]/[day]/[...slug]`（legacyPath 解析）、首页/列表+分页/关于/友链/分类/atom.xml/404、ArrowCard/PostNavigation 走 legacyPath、zh-CN
- **视觉样式**（Codex+Deepseek，Hermes 复验+定点修复）：
  - `src/styles/global.css` 重写为 Demo 的设计系统（CSS 变量浅/深两套 + 语义 class），深色映射到 `.dark`
  - Header/Footer/ArrowCard/TableOfContents/文章页/首页/列表/关于/友链/分页/Container 全部按 Demo 观感重写
  - 字体换 Inter+PingFang SC 栈，移除 Geist 引入；Shiki 深底浅字保留
  - 主题 toggle 精简为单个 ◐/◑ 按钮
  - **Hermes 定点修复**：① 默认主题从「跟随系统」改为浅色默认（design-spec §5）；② 首页 title 从「Jack's Blog | Jack's Blog」去重为「Jack's Blog」
- **迁移脚本与清单（Phase B）**：
  - `scripts/audit-legacy-content.mjs`：扫描 54 篇 source/_posts + 54 个 public 日期型 URL，做 frontmatter 解析、legacyPath 匹配、特殊语法/图片/链接审计，生成 5 个 JSON
  - `migration/content-manifest.json`：54 条，legacyPath 全部唯一且与 public 目录一一对应；7 篇 description 缺失已标记 `hasDescription:false`
  - `migration/url-manifest.json`：54 legacyPath + 32 个保留静态 URL（含 `/blog/`、`/categories/*`、验证文件等）
  - `migration/image-audit.json`：127 个唯一图片源；`cdn.noedgeai.com` 66 条 broken，`gcore.jsdelivr.net` 56 条保留，`cdn.nlark.com` 5 条 unknown
  - `migration/link-audit.json`：37 条外部链接、11 条友链、69 条旧聚合页/分页移除清单
  - `migration/taxonomy-map.json`：54 篇四分类（技术与工程 9 / 学习与研究 10 / 思考与随笔 4 / 经历与记录 31），**已获用户批准**
- 特殊语法计数与基线吻合：mathjax 18 / html 8 / code 20 / hexoTag 1
- 无新增 npm 依赖（复用 node_modules 中由 Astro/Tailwind 传递安装的 `yaml`）
- **批量迁移 54 篇（Phase D）**：
  - 新增 `scripts/migrate-content.mjs`（确定性、可重复、幂等；正文原样，仅 1 篇 hexo `{% raw %}` 标签做合法转换）
  - 输出 54 篇到 `src/content/blog/<slug>/index.md`，frontmatter 为 title/date/section/tags/description/legacyPath/cover（updated 与 draft 缺省不写，丢弃 Butterfly 字段）
  - 7 篇缺失 description 已补齐一行描述
  - 新增数学依赖 `remark-math` + `rehype-katex` + `katex`（唯一新增依赖，用于 `$...$` / `$$...$$` 渲染）
  - `astro.config.mjs` 加 remark/rehype 插件，`Head.astro` 引入 katex CSS
  - 修复 `TableOfContents.astro` 的 `buildToc`：忽略 h1、容错跳级标题，避免深度 1 标题导致构建崩溃
  - `npm run build` 通过：67 pages、54 个日期型 legacyPath URL 全部生成、Pagefind 索引 69 pages
- **图片处置实现（Phase E 第二步）**：
  - 按 `migration/manual-review.md` 处置 8 篇课程报告共 66 条失效 `cdn.noedgeai.com` 图引用（全部 `note`）
  - 删除失效图引用，图题统一追加「（原图已失效）」；`src/content/blog` 已无 `cdn.noedgeai.com` 引用
  - `npm run build` 通过：67 pages、Pagefind 索引 69 pages
- **8 篇课程报告历史格式错误修复**：
  - 7 篇有目录的课程报告 TOC 改为 markdown 列表，逐行显示
  - 正文中 `\(...\)`/`\[...\]` 公式分隔符改为 `$...$`/`$$...$$`（不碰 frontmatter）
  - FCM、MIMC 两篇未围栏 Python 代码补上 ```python 围栏
  - `npm run build` 通过：67 pages、Pagefind 索引 69 pages
- **Header 与 favicon 修复**：
  - `.site-header` 在 1080px 上限内明确占满可用宽度，导航拆为三个文字链接与两个 SVG 图标按钮
  - 820px 以下品牌与导航分两行；图标按钮点击区统一为 32×32px
  - 新增透明底深色 `J` 的 `public/favicon.svg`，删除模板 `favicon.ico` 与全部旧引用
  - 清理 Head 中 light/dark/system 三按钮死代码，保留浅色默认与单按钮 localStorage 切换
  - `npm run build` 与静态验收通过；沙箱禁止本地端口且无法联网获取 Playwright CLI，浏览器矩阵留 Phase H 在可运行环境复验

## In Progress

- 无（Phase E 第二步完成，待进入 Phase E 剩余静态资源与 Phase F）

## Next Recommended Task

Phase E 剩余：`cdn.nlark.com` 5 条 unknown 复核；随后 Phase F 旧 URL/SEO/订阅兼容。

## Known Issues

- `/atom.xml` 用 `@astrojs/rss` 输出 RSS 2.0 非严格 Atom；URL 已保留。格式对齐属 Phase F 评估项
- About 文案为草稿，用户逐字审阅（Phase G）
- 文章页视觉尚未实审，待 Phase H 按 Demo 文章页核对（54 篇已迁入）
- 像素级视觉/响应式/可访问性验证留 Phase H（Playwright 矩阵 360/390/768/1440px）
- `@fontsource/geist-mono`、`@fontsource/geist-sans` 仍在 package.json（src 已不引用），待 Phase J 清理
- `npm install` 报告 17 个依赖漏洞，不阻塞，待评估
- 全部产出未提交，计划按里程碑提交
- Phase B 图片 HTTP HEAD 在当前沙箱网络不可达，`gcore` 按已知有效保留、`cdn.nlark.com` 标 unknown；上线前如需可在可联网环境重跑审计脚本
- 当前沙箱网络不可达 npm registry，`remark-math`/`rehype-katex`/`katex` 由 npm 本地缓存 tarball 手动解包进 `node_modules` 并同步 `package.json`/`package-lock.json`；上线环境请以可联网 `npm ci` 复验

## Important Context

- 工作目录：`/Users/jackzhu/projects/blog-astro-migration`（branch `migration/astro`）
- 迁移计划（7 阶段）：`/Users/jackzhu/projects/blog/.hermes/plans/2026-09-03_195621-astro-blog-migration.md`
- 设计规范：`docs/design-spec.md`（唯一设计事实来源）
- 视觉参考 Demo（已批准）：`/Users/jackzhu/Documents/blog-style-demos/jack-blog-recommended-demo.html`
- 原站源码（只读）：`/Users/jackzhu/projects/blog`（main），文章 `source/_posts/*.md`（54 篇）
- Node 22.22.3 已验证可构建 Astro 6.1.3
- 实施 worker：Codex CLI（Deepseek `deepseek-v4-pro`）。Hermes 负责范围控制/diff 审查/测试复验

## Verification

Last verified at: 2026-09-04
Command: `npm run build` + favicon/Header 静态检查
Result: pass — Astro check 0 errors，67 page(s) built，Pagefind 索引 69 pages；无 `favicon.ico` 引用，SVG 合法，Header 三链接与两按钮/id 齐全。
