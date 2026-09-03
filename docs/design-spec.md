# Jack's Blog 设计规范（Design Spec）

> 本文件是迁移目标站点的唯一设计事实来源，实施前以本文件为准。
> 状态：已批准（2026-09-03）。与迁移实施计划冲突时，以本文件为准。

## 1. 定位

文章优先的现代独立博客。不是作品集、个人仪表盘、履历主页或研究者/评测专家形象。

- 站名：`Jack's Blog`
- 作者署名：`Jack`（不出现中文真名或 "Jack Zhu" 署名；域名 `jackzhu.top` 与 GitHub 用户名 `CoderJackZhu` 属既有公开标识，不在本次改名）
- 首页定位语（已批准，逐字使用）：

> 记录技术实践、学习过程，以及对一些长期问题的思考。

## 2. 页面架构（路由）

主导航固定为：`Jack's Blog｜文章｜关于｜搜索｜深浅色切换`。站名点击回首页；不设"首页"文字入口；分类不入主导航。

| 路由 | 页面 | 说明 |
|---|---|---|
| `/` | 首页 | 定位语 + 最近 6 篇（标题/日期/摘要/分类）+ "查看全部文章" |
| `/blog/` | 文章列表 | 全部 54 篇，按发布日期倒序，每页 12 篇 |
| `/blog/[page]/` | 文章分页 | 第 2 页起 |
| `/about/` | 关于 | `Jack，一名算法工程师` + 写作范围 + 旧文章时效说明 + 社交链接 |
| `/link/` | 友链 | 11 个友链（9 友情 + 2 网站）原样保留 |
| `/categories/[category]/` | 分类结果页 | 四个公开分类的静态列表 |
| `/[year]/[month]/[day]/[slug]/` | 文章页 | 保留旧日期型永久链接 |
| `/atom.xml` | Atom 订阅 | 保留旧订阅地址，不改成 rss.xml |
| `/404` | 404 | |

**明确不做：** 独立归档栏目（旧 `/archives/` 直接 404，不建兼容页）、标签云、Now/Uses、Projects、Proof of Work、Publications、首页友链墙、作者信息卡片。

## 3. 公开分类（四类，单选）

`技术与工程`｜`学习与研究`｜`思考与随笔`｜`经历与记录`

54 篇逐一映射到上述四类之一。`Archive` 不是文章分类。原 Hexo 分类与标签只保留在迁移清单（`migration/taxonomy-map.json`）中供审计，不原样生成公开标签云；逗号拼接的标签需拆分、去重。

## 4. 内容模型（frontmatter schema）

`src/content.config.ts` 的 blog 集合：

```ts
{
  title: string;
  description: string;
  date: Date;
  updated?: Date;
  section: "技术与工程" | "学习与研究" | "思考与随笔" | "经历与记录";
  tags?: string[];
  legacyPath: string;   // 例如 "/2026/08/29/当文明踩下加速踏板之后/"
  draft?: boolean;
  cover?: string;
}
```

规则：

- `legacyPath` 唯一，是文章 canonical URL；路由日期直接取 `legacyPath`，不得受 Node/构建机时区漂移影响。
- 54 篇文章全部保留原日期型 URL，不做一次性 URL 重构。
- `date` 保留原发布日期；`updated` 仅在原文有明确更新时间时保留，不用迁移日期覆盖。
- `description` 缺失时人工补写，不自动生成空泛摘要。
- 17 篇标题与源文件名不同；旧 URL 从现有生成路径取，不从新标题重算。
- 删除模板 projects 集合；删除 Giscus 评论组件与配置。

## 5. 视觉规范（克制的现代独立刊物风格）

> 视觉参考 Demo（用户已批准）：`/Users/jackzhu/Documents/blog-style-demos/jack-blog-recommended-demo.html`（URL 参数 `?view=home|blog|article|about|link`、`?theme=dark`）。实现时以该 Demo 的观感为准，颜色/字体/布局 token 见本节。

### 颜色

浅色（默认）：

- 背景 `#f6f7f9`，卡片/表面 `#ffffff`，正文 `#1a1d22`
- 次级 `#68717d`，弱化 `#9099a5`
- 分隔线 `#dce1e7`，强调分隔 `#c7ced7`
- 强调色 `#3f6384`（单一低饱和），强调浅底 `#eaf0f5`
- 代码块底 `#181b20`，代码字 `#e7ebef`

深色（阅读选项）：

- 背景 `#121417`，表面 `#181b1f`，正文 `#edf0f3`
- 次级 `#a4acb6`，弱化 `#7f8994`
- 分隔线 `#2d333a`，强调分隔 `#3b434d`
- 强调色 `#91b1cf`，强调浅底 `#202c37`
- 代码块底 `#0d0f12`

### 字体

- 正文：无衬线中文为主（Inter + PingFang SC + Hiragino Sans GB + Microsoft YaHei）
- 代码：等宽（SFMono / Menlo / Consolas），仅用于代码

### 布局

- 站点最大宽 1080px；文章正文阅读宽约 730px
- 首页少量留白，无夸张大 Hero
- 文章列表用分隔线分隔，不用大卡片
- 文章页标题左对齐、无巨型封面；元数据只留日期/分类/阅读时间
- 宽屏轻量目录（sticky），移动端折叠或隐藏
- 图片/代码块可适度突破正文宽度

### 禁用（AI 感元素一律不出现）

渐变光晕、玻璃面板、网格背景、终端元素、AI 标签、数据仪表盘、能力徽章墙、GitHub 数据面板、"我专注于……"关键词堆砌、超大 Hero、动效堆砌。

## 6. 文章页

标题、日期、分类、真实更新时间（若有）、阅读时间、桌面 TOC、移动折叠 TOC、代码复制按钮、上一篇/下一篇、返回文章列表。

## 7. 页脚与公开信息

- 建站年份 `2020`，版权行 `© 2020–2026 Jack`
- ICP 备案号 `陕ICP备2023003055号-1` → `https://beian.miit.gov.cn/`
- 又拍云加速说明「本网站由又拍云提供加速服务」+ 原 logo → `https://www.upyun.com/`
- 百度统计（`baidu_analytics`）同一 ID 迁入 `<head>`；不新增可见访客计数器
- 订阅：RSS / Atom
- 社交链接：GitHub（github.com/CoderJackZhu）、知乎（zhihu.com/people/zhu-yijie-51）、哔哩哔哩（space.bilibili.com/355295657）、RSS
- 不放：社交图标墙、邮箱、私人联系方式

## 8. 评论 / 其他栏目

- **评论**：第一版不设置；旧评论数据不迁移、不备份、不恢复；不复制 Butterfly 评论配置与凭据。
- **音乐 / 电影 / 相册**：空壳页面，直接忽略并允许 404，不做处理。
- **友链**：11 个全部原样保留（名称、链接、头像、简介），含当前已失效链接；不做健康过滤。

## 9. 部署（CI/CD）

- 源码分支 `main`，发布分支 `html`（GitHub Pages，legacy branch 模式，继续沿用）。
- `astro_ci.yml`：仅 PR / 手动触发，`npm ci` + `npm run build`，不部署。
- `astro_build_deploy.yml`：仅 `main` push / 手动触发，`npm ci` + `npm run build`，把 `dist/` 发布到 `html`。
- 触发条件只允许 `main`，feature 分支 / PR 不得触发部署（修复现有 workflow 的"任意非 html 分支都构建 main"缺陷）。
- 部署产物必须包含 `CNAME` 与 `.nojekyll`（避免 GitHub Pages 忽略 `/_astro/` 资源）。
- Node 统一 22（≥22.12.0），本地与 CI 一致；Astro Micro 锁定 commit `af69926c87341719846fe0e7a415483deb4e05ee`，保留 MIT LICENSE 与来源记录。
- 域名唯一正式域名 `www.jackzhu.top`；`jackzhu.top` 跳转到 www；canonical 一律 HTTPS + www。

## 10. 非目标

不建第二个生产站、不改域名、不切换 Pages artifact 模式、不建 Projects/PoW/Publications、不美化未完成项目、不补造数据、不恢复音乐/电影/相册、不做 AI 聊天/RAG/llms.txt/JSON API、不重写全部旧文章、不改变文章 URL、不在用户验收前 push/部署。
