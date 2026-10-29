# Jack’s Blog

Jack 的个人网站：AI Agent 实践、独立软件、技术视频与写作。线上地址为 [www.jackzhu.top](https://www.jackzhu.top/)，由 Astro 构建并部署至 GitHub Pages。项目起源于 Astro Micro，当前页面与样式为定制实现。

## 本地使用

使用 Node 22（至少 22.12.0）。

```sh
npm ci
npm run dev
npm run build
npm test
npm run test:e2e
```

`build` 包含 Astro 类型检查、静态构建和 Pagefind 索引。`npm test` 审计旧文章 URL、内部链接、canonical、RSS、站点验证文件等；E2E 检查 360、390、768、1440px 布局、导航、主题、搜索及作品入口。预览构建产物使用 `npm run preview`，开发服务不提供完整 Pagefind 索引。

## 内容结构

- `/`：简短介绍、精选文章、代表项目、最近写作和关注入口。
- `/works/`：公开作品，按 `order` 排序；不设空分类或待完成占位。
- `/works/<id>/`：作品详情，包含截图或封面、外部入口、正文和相关文章。
- `/blog/`：全部文章与分页，保留现有日期型文章 URL。
- `/about/`：专业方向、作品与社交链接。照片和友链仍可从关于页与页脚访问。

导航、站点介绍、首页文案、关于页、社交链接等集中维护在 `site.config.yaml`。没有改变现有文章文件、RSS 地址或部署流程。

## 新增作品

在 `src/content/works/` 下新增 Markdown 文件，文件名就是稳定 URL 的末段。参照现有的 `thingary.md` 与 `on-policy-distillation.md` 填写元数据：

- `title`、`description`、`kind`：名称、摘要和作品形式。
- `year`（字符串）、`status`：作品年份与明确状态，不展示未经核实的成绩。
- `cover`、`coverAlt`、`coverWidth`、`coverHeight`：本地封面路径、说明与原始尺寸；`caption` 可选。
- `order`：作品列表的手动顺序；`featured: true` 表示在首页与关于页展示。
- `draft: true`：从全部公开入口和详情路由排除，默认 false。
- `tags`：少量可理解的特点；`links`：真实外部地址与按钮文案，第一项也显示在列表卡片上。
- `relatedPosts`：相关文章的既有 `legacyPath`，构建时检查文章是否公开且存在。

正文使用 Markdown 的二级标题，详情页自动生成页内目录。优先复用当前模板；只有出现现有模板无法表达的内容时再扩展。

图片放在 `public/works/`。媒体来源记录在 [媒体说明](docs/WORK_MEDIA.md)，只放可公开内容；不把大型视频文件或私人资料复制进仓库。作品详情使用各自封面作为分享图，并纳入站内搜索。

## 首页精选与文章

`pages.home.featuredPosts` 用稳定的文章路径选择精选，`note` 写推荐阅读的理由，`summary` 写简短摘要。最近写作按发布日期倒序排列，并排除已经精选的文章；条数由 `site.numPostsOnHomepage` 决定。不影响全部文章页的排序和 RSS。

既有文章仍放在 `src/content/blog/<slug>/index.md`，保留 `title`、`description`、`date`、`section`、`legacyPath` 等字段。不要为修改标题而改变历史地址。

## 发布

本地验证通过后由维护者决定提交、推送和发布。`main` 的推送会触发现有 GitHub Actions 部署流程，本地完成不表示线上已更新。
