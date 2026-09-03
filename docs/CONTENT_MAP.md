# 站点修改速查表

## 一句话：想改内容，改根目录的 `site.config.yaml` 就行

所有「经常改」的内容都集中在一个文件：**`site.config.yaml`**（仓库根目录）。
改完提交并 push 到 `main`，GitHub Actions 自动部署，几分钟后线上生效。

### `site.config.yaml` 里能改什么

| 想改 | 位置（site.config.yaml 里） |
|---|---|
| 站点名 / 副标题 | `site.title` / `site.description` |
| 首页显示文章数 | `site.numPostsOnHomepage` |
| 全部文章每页条数 | `site.numPostsPerPage` |
| 社交链接（GitHub/知乎/B站/RSS） | `socials` |
| 友链（朋友） | `friendLinks` |
| 页脚：建站日期 | `footer.since` |
| 页脚：ICP 备案号 | `footer.icp` |
| 页脚：是否显示运行时长 | `footer.showRuntime` |
| 页脚：是否显示访问统计 | `footer.showVisitor` |
| 关于页文案 | `about.paragraphs`（每段一行） |
| 友链页副标题 | `linkSubtitle` |

### 结构性内容（一般不常改，仍在代码里）

| 想改 | 文件 |
|---|---|
| 四个分类名 | `src/consts.ts`（`CATEGORIES`）+ `src/content.config.ts`（schema） |
| 顶部导航菜单项 | `src/components/Header.astro` |
| 页脚社交链接行 | `src/components/Footer.astro` |
| 站点图标 | `public/favicon.png` 等 |

### 文章

| 想做的事 | 方法 |
|---|---|
| 加一篇文章 | 在 `src/content/blog/` 下新建目录，放 `index.md`（frontmatter 照抄现有任意一篇） |
| 改某篇文章 | 编辑 `src/content/blog/<文章目录>/index.md` |
| 文章封面图 | frontmatter 的 `cover:` 字段 |

### 照片墙

`/photos/` 页自动收集所有文章的封面图并去重，无需手动维护——新增文章带 `cover:` 就会自动出现。

## 验证与发布

```bash
npm run build          # 本地构建（报错会停在这里）
npm run preview        # 本地预览 http://127.0.0.1:4321
npm run test           # 静态审计（10 项）
npm run test:e2e       # 浏览器端到端（13 项）
```

上线：commit → push `main`（自动部署）。或者直接告诉 Hermes「把某处改成什么」，我来改。
