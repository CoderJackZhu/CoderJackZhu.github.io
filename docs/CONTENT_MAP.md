# 站点内容速查表（想改哪里，看这里）

源码在 `/Users/jackzhu/projects/blog-astro-migration`（分支 `migration/astro`，已合并进 `main`）。

改完的发布流程：`npm run build` 本地验证 → 提交并推 `main` → GitHub Actions 自动部署到 `html` 分支 → 几分钟后线上生效。
（也可以直接告诉 Hermes「把某处改成什么」，我来定位文件和改。）

## 页面文案与配置

| 想改的内容 | 文件 |
|---|---|
| 站点名、副标题、首页显示文章数 | `src/consts.ts`（`SITE.TITLE` / `DESCRIPTION` / `NUM_POSTS_ON_HOMEPAGE`） |
| 四个分类名 | `src/consts.ts`（`CATEGORIES`） |
| 社交链接（GitHub/知乎/B站/RSS） | `src/consts.ts`（`SOCIALS`） |
| 首页内容 | `src/pages/index.astro` |
| 关于页文案 | `src/pages/about.astro` |
| 友链页副标题、分组标题 | `src/pages/link.astro` |
| 友链列表（朋友 + 推荐网站） | `src/data/links.ts`（`FRIEND_LINKS` / `SITE_LINKS`） |
| 全部文章每页条数 | `src/pages/blog/index.astro` 和 `src/pages/blog/[page].astro` 里的 `pageSize` |
| 顶部导航菜单项 | `src/components/Header.astro` |
| 页脚（ICP 备案、友链入口、社交） | `src/components/Footer.astro` |
| 网页 `<head>`（统计、favicon、SEO 标签） | `src/components/Head.astro` |
| 站点图标 | `public/favicon.png`、`public/apple-touch-icon.png`、`public/og-image.png` |
| 百度统计 ID | `src/components/Head.astro` 里 `hm.js?…` 那串 |

## 文章

| 想做的事 | 方法 |
|---|---|
| 加一篇文章 | 在 `src/content/blog/` 下新建一个目录，里面放 `index.md`（frontmatter 格式照抄现有任意一篇） |
| 改某篇文章 | 编辑 `src/content/blog/<文章目录>/index.md` |
| 文章封面图（og:image） | frontmatter 里的 `cover:` 字段 |

## 验证与发布

```bash
npm run build          # 本地构建（报错会停在这里）
npm run preview        # 本地预览 http://127.0.0.1:4321
npm run test           # 静态审计（10 项）
npm run test:e2e       # 浏览器端到端（13 项，需 Playwright）
```

上线：commit → push `main`（自动部署）。友链/文案这类内容改动 Hermes 会走 PR + merge，一样自动部署。
