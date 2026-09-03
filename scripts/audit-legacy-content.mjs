import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

const SOURCE_POSTS_DIR = "/Users/jackzhu/projects/blog/source/_posts";
const SOURCE_LINK_YAML = "/Users/jackzhu/projects/blog/source/_data/link.yml";
const PUBLIC_DIR = "/Users/jackzhu/projects/blog/public";
const OUT_DIR = path.join(repoRoot, "migration");

const FOUR_SECTIONS = ["技术与工程", "学习与研究", "思考与随笔", "经历与记录"];

// 第一版四分类草稿，由逐篇阅读标题 + description + 正文前段后人工归档。
// 后续用户审核确认后，此处与 Phase D 批量迁移保持一致。
const SECTION_BY_FILENAME = {
  "Agent上下文工程：从Token管理到终身记忆.md": "技术与工程",
  "Codex造零件Hermes养系统.md": "技术与工程",
  "HRNet.md": "学习与研究",
  "Hexo博客配置Github Actions和仓库分支存储实现自动化编译部署.md": "技术与工程",
  "SkillEvolver自进化实验复盘.md": "技术与工程",
  "Ubuntu 20.04下深度学习环境搭建以及常用工具配置.md": "技术与工程",
  "hermes-self-evolving-blog-engine.md": "技术与工程",
  "ubuntu的使用.md": "技术与工程",
  "今日随笔.md": "思考与随笔",
  "华为暑期实习面试分享.md": "经历与记录",
  "学术交流分享ActionFormer.md": "学习与研究",
  "当文明踩下加速踏板之后.md": "思考与随笔",
  "我的生活.md": "思考与随笔",
  "数据挖掘报告——MIMC数据集的预处理.md": "学习与研究",
  "服务器常见技术问题与技巧.md": "技术与工程",
  "机器学习上机报告——聚类分析.md": "学习与研究",
  "机器学习报告——数据分类的实现.md": "学习与研究",
  "机器学习报告——高光谱遥感特征选择.md": "学习与研究",
  "机器学习课程报告——波士顿房价预测.md": "学习与研究",
  "浅谈《原神》游戏的理解.md": "思考与随笔",
  "淘天暑期实习面试分享.md": "经历与记录",
  "现代的包管理工具uv.md": "技术与工程",
  "秋招上海银行面试分享.md": "经历与记录",
  "秋招中兴面试分享.md": "经历与记录",
  "秋招中金所面试分享.md": "经历与记录",
  "秋招华为面试分享.md": "经历与记录",
  "秋招合肥安迅精密技术面试分享.md": "经历与记录",
  "秋招广联达面试分享.md": "经历与记录",
  "秋招得物面试分享.md": "经历与记录",
  "秋招快手面试分享.md": "经历与记录",
  "秋招招联面试分享.md": "经历与记录",
  "秋招拼多多面试分享.md": "经历与记录",
  "秋招提前批百度面试分享.md": "经历与记录",
  "秋招携程面试分享.md": "经历与记录",
  "秋招比亚迪面试分享.md": "经历与记录",
  "秋招淘天面试分享.md": "经历与记录",
  "秋招滴滴面试分享.md": "经历与记录",
  "秋招理想面试分享.md": "经历与记录",
  "秋招百信银行面试分享.md": "经历与记录",
  "秋招科大讯飞面试分享.md": "经历与记录",
  "秋招美团面试分享.md": "经历与记录",
  "秋招荣耀面试分享.md": "经历与记录",
  "秋招蔚来面试分享.md": "经历与记录",
  "秋招虾皮面试分享.md": "经历与记录",
  "秋招蚂蚁面试分享.md": "经历与记录",
  "秋招金山面试分享.md": "经历与记录",
  "秋招面试总结分享.md": "经历与记录",
  "腾讯AI Lab暑实面试分享.md": "经历与记录",
  "计算智能导论作业——FCM 聚类的实现.md": "学习与研究",
  "计算智能导论作业——感知器实现二分类.md": "学习与研究",
  "计算智能导论作业——遗传算法的实现.md": "学习与研究",
  "记录第一次搭博客.md": "经历与记录",
  "钉钉和淘天机器学习捞暑期实习面试分享.md": "经历与记录",
  "阿里国际暑实面试分享.md": "经历与记录",
};

function pad2(value) {
  return String(value).padStart(2, "0");
}

function toLocalDate(value) {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();
  if (!text) return null;

  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(text)) {
    const [year, month, day] = text.split("/");
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  if (/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.test(text)) {
    const [, year, month, day, hour, minute, second] =
      /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(text);
    const parsed = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
      ),
    );
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(parsed);
    const get = (type) => parts.find((part) => part.type === type)?.value;
    return `${get("year")}-${get("month")}-${get("day")}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw);
  if (!match) {
    throw new Error("Post is missing YAML frontmatter.");
  }

  const data = parseYaml(match[1]);
  return {
    frontmatter: data && typeof data === "object" ? data : {},
    body: raw.slice(match[0].length),
  };
}

function asStringArray(value) {
  if (value === null || value === undefined) return [];
  const values = Array.isArray(value) ? value : String(value).split(/[,，]/);
  return values
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function normalizeForMatch(value) {
  return String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function walkFiles(dir) {
  const result = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkFiles(full));
    } else if (entry.isFile()) {
      result.push(full);
    }
  }
  return result;
}

function readPublicArticlePaths() {
  const pattern =
    /^(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)\/index\.html$/;
  const articles = [];

  for (const file of walkFiles(PUBLIC_DIR)) {
    const relative = path.relative(PUBLIC_DIR, file).split(path.sep).join("/");
    const match = pattern.exec(relative);
    if (!match) continue;

    const [, year, month, day, slug] = match;
    articles.push({
      file,
      relative,
      year,
      month,
      day,
      slug,
      legacyPath: `/${year}/${month}/${day}/${slug}/`,
    });
  }

  return articles;
}

function matchLegacyPath(source, publicArticles) {
  const sameDate = publicArticles.filter(
    (article) => article.year && `${article.year}-${article.month}-${article.day}` === source.date,
  );

  if (sameDate.length === 0) {
    throw new Error(`No public path for date ${source.date}: ${source.filename}`);
  }

  const stem = source.filename.replace(/\.md$/i, "");
  const exact = sameDate.filter((article) => article.slug === stem);
  if (exact.length === 1) return exact[0];

  const normalizedStem = normalizeForMatch(stem);
  const byStem = sameDate.filter(
    (article) => normalizeForMatch(article.slug) === normalizedStem,
  );
  if (byStem.length === 1) return byStem[0];

  const normalizedTitle = normalizeForMatch(source.title);
  const byTitle = sameDate.filter(
    (article) => normalizeForMatch(article.slug) === normalizedTitle,
  );
  if (byTitle.length === 1) return byTitle[0];

  throw new Error(
    `Unable to uniquely match public path for ${source.filename} on ${source.date}. ` +
      `Candidates: ${sameDate.map((article) => article.slug).join(", ")}`,
  );
}

function stripFencedCode(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ");
}

function stripInlineCode(text) {
  return text.replace(/`[^`\r\n]*`/g, " ");
}

function extractImages(markdown, filename) {
  const text = stripFencedCode(markdown);
  const found = [];

  const markdownImage =
    /!\[[^\]]*\]\(\s*([^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g;
  let match;
  while ((match = markdownImage.exec(text))) {
    found.push(match[1]);
  }

  const htmlImage = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi;
  while ((match = htmlImage.exec(text))) {
    found.push(match[1]);
  }

  return found.map((url) => ({ url: url.trim(), referencedBy: filename }));
}

function extractLinks(markdown, filename) {
  const text = stripInlineCode(stripFencedCode(markdown));
  const found = [];

  const markdownLink =
    /(?<!!)\[[^\]]*\]\(\s*([^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g;
  let match;
  while ((match = markdownLink.exec(text))) {
    found.push(match[1].trim());
  }

  const htmlLink = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  while ((match = htmlLink.exec(text))) {
    found.push(match[1].trim());
  }

  return found.filter(Boolean).map((url) => ({ url, referencedBy: filename }));
}

function urlDomain(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function classifyLink(url) {
  if (/^(mailto:|tel:|#)/i.test(url)) return "special";
  if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
    return "internal";
  }

  try {
    const host = new URL(url).hostname.toLowerCase();
    if (
      host === "jackzhu.top" ||
      host === "www.jackzhu.top" ||
      host === "coderjackzhu.github.io"
    ) {
      return "internal";
    }
  } catch {
    return "external";
  }

  return "external";
}

function groupReferencedLinks(items) {
  const map = new Map();
  for (const item of items) {
    if (!map.has(item.url)) {
      map.set(item.url, new Set());
    }
    map.get(item.url).add(item.referencedBy);
  }

  return [...map.entries()]
    .map(([url, files]) => ({
      url,
      referencedBy: [...files].sort(),
    }))
    .sort((a, b) => a.url.localeCompare(b.url));
}

async function headCheck(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    return {
      httpStatus: response.status,
      reachable: response.status < 500,
    };
  } catch {
    return {
      httpStatus: null,
      reachable: false,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function workerLoop() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => workerLoop()),
  );
  return results;
}

function collectIndexPathsUnder(rootDir, urlPrefix) {
  const prefix = urlPrefix.endsWith("/") ? urlPrefix.slice(0, -1) : urlPrefix;
  const found = [];

  if (!fs.existsSync(rootDir)) return found;

  function visit(dir, urlBase) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(full, `${urlBase}/${entry.name}`);
      } else if (entry.isFile() && entry.name === "index.html") {
        found.push(`${urlBase}/`);
      }
    }
  }

  visit(rootDir, prefix);
  return found.sort();
}

function buildStaticUrls() {
  const fixed = [
    "/",
    "/404.html",
    "/CNAME",
    "/about/",
    "/atom.xml",
    "/baidu_verify_codeva-pcll7x0O4y.html",
    "/blog/",
    "/google327efbcfd1c87180.html",
    "/link/",
    "/robots.txt",
    "/sitemap.txt",
    "/sitemap.xml",
  ];

  const categoryUrls = collectIndexPathsUnder(
    path.join(PUBLIC_DIR, "categories"),
    "/categories",
  );

  return [...new Set([...fixed, ...categoryUrls])].sort();
}

function buildLegacyAggregatePaths() {
  const groups = ["archives", "tags", "music", "movies", "photos", "page", "Gallery"];
  const paths = [];

  for (const group of groups) {
    const full = path.join(PUBLIC_DIR, group);
    if (!fs.existsSync(full)) continue;
    const groupPaths = collectIndexPathsUnder(full, `/${group}`);
    paths.push(...groupPaths);
  }

  return [...new Set(paths)].sort().map((path) => ({
    path,
    disposition: "移除/404",
  }));
}

function buildFriendLinks() {
  if (!fs.existsSync(SOURCE_LINK_YAML)) {
    throw new Error(`Friend links file not found: ${SOURCE_LINK_YAML}`);
  }

  const groups = parseYaml(fs.readFileSync(SOURCE_LINK_YAML, "utf8"));
  if (!Array.isArray(groups)) {
    throw new Error("Friend links YAML must be a list.");
  }

  const links = [];
  for (const group of groups) {
    if (!Array.isArray(group.link_list)) continue;
    for (const item of group.link_list) {
      links.push({
        name: item.name ?? "",
        link: item.link ?? "",
        avatar: item.avatar ?? "",
        descr: item.descr ?? "",
        group: group.class_name ?? "",
      });
    }
  }

  return links;
}

function verifySectionCoverage(posts) {
  const missing = posts
    .filter((post) => !SECTION_BY_FILENAME[post.filename])
    .map((post) => post.filename);
  if (missing.length > 0) {
    throw new Error(`Missing section mapping for: ${missing.join(", ")}`);
  }

  for (const post of posts) {
    if (!FOUR_SECTIONS.includes(SECTION_BY_FILENAME[post.filename])) {
      throw new Error(`Invalid section for ${post.filename}`);
    }
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const publicArticles = readPublicArticlePaths();
  if (publicArticles.length !== 54) {
    throw new Error(
      `Expected 54 article paths under public/, found ${publicArticles.length}.`,
    );
  }

  const postFiles = fs
    .readdirSync(SOURCE_POSTS_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

  if (postFiles.length !== 54) {
    throw new Error(`Expected 54 source posts, found ${postFiles.length}.`);
  }

  const posts = postFiles.map((filename) => {
    const raw = fs.readFileSync(path.join(SOURCE_POSTS_DIR, filename), "utf8");
    const { frontmatter, body } = parseFrontmatter(raw);
    const date = toLocalDate(frontmatter.date);
    if (!date) {
      throw new Error(`Cannot parse date for ${filename}`);
    }

    const title = String(frontmatter.title ?? "").trim();
    const description =
      frontmatter.description === null ||
      frontmatter.description === undefined ||
      String(frontmatter.description).trim() === ""
        ? null
        : String(frontmatter.description).trim();

    return {
      filename,
      title,
      date,
      updated: toLocalDate(frontmatter.updated),
      description,
      categories: asStringArray(frontmatter.categories),
      tags: asStringArray(frontmatter.tags),
      copyright_author: frontmatter.copyright_author
        ? String(frontmatter.copyright_author)
        : null,
      hasDescription: description !== null,
      flags: {
        mathjax:
          frontmatter.mathjax === true || /\$\$|\\\(/.test(body),
        html: /<(div|span|table|figure|video|iframe|center|font|style|script|details|summary|pre|blockquote|img|br|hr|p|h1|h2|h3|h4|h5|h6|a|ul|ol|li|code|kbd|s|del|u|sub|sup|small|strong|em|section|article|aside|header|footer|nav|main|picture|source|audio|object|embed|svg|math)(\s|>|\/)/i.test(body),
        code: /```|~~~/.test(body),
        hexoTag: /\{%[^%]*%\}/.test(body),
      },
      body,
    };
  });

  for (const post of posts) {
    const publicArticle = matchLegacyPath(post, publicArticles);
    post.legacyPath = publicArticle.legacyPath;
    post.publicRelative = publicArticle.relative;
  }

  const usedLegacyPaths = new Set();
  for (const post of posts) {
    if (usedLegacyPaths.has(post.legacyPath)) {
      throw new Error(`Duplicate legacyPath: ${post.legacyPath}`);
    }
    usedLegacyPaths.add(post.legacyPath);
  }

  const publicLegacyPaths = publicArticles.map((article) => article.legacyPath);
  for (const publicPath of publicLegacyPaths) {
    if (!usedLegacyPaths.has(publicPath)) {
      throw new Error(`Unmatched public path: ${publicPath}`);
    }
  }

  verifySectionCoverage(posts);

  const contentManifest = posts
    .map(({ filename, title, date, updated, legacyPath, description, categories, tags, flags, copyright_author, hasDescription }) => ({
      filename,
      title,
      date,
      updated,
      legacyPath,
      description,
      categories,
      tags,
      flags,
      copyright_author,
      hasDescription,
    }))
    .sort((a, b) => {
      const byDate = a.date.localeCompare(b.date);
      return byDate !== 0 ? byDate : a.filename.localeCompare(b.filename, "zh-Hans-CN");
    });

  const taxonomyMap = {
    mapping: posts
      .map((post) => ({
        filename: post.filename,
        title: post.title,
        legacyPath: post.legacyPath,
        section: SECTION_BY_FILENAME[post.filename],
      }))
      .sort((a, b) => a.filename.localeCompare(b.filename, "zh-Hans-CN")),
  };

  const imageItems = [];
  const linkItems = [];
  for (const post of posts) {
    imageItems.push(...extractImages(post.body, post.filename));
    linkItems.push(...extractLinks(post.body, post.filename));
  }

  const imageGrouped = groupReferencedImages(imageItems);
  const headChecks = await runWithConcurrency(
    imageGrouped.filter((image) => image.domain !== "cdn.noedgeai.com"),
    5,
    async (image) => ({
      image,
      check: await headCheck(image.url),
    }),
  );

  const headByUrl = new Map();
  for (const { image, check } of headChecks) {
    headByUrl.set(image.url, check);
  }

  const images = imageGrouped.map((image) => {
    const isBrokenDomain = image.domain === "cdn.noedgeai.com";
    if (isBrokenDomain) {
      return {
        ...image,
        httpStatus: null,
        status: "broken",
        disposition: "待恢复",
      };
    }

    const check = headByUrl.get(image.url) ?? { httpStatus: null, reachable: false };
    const reachable = check.reachable;
    const isGcore = image.domain === "gcore.jsdelivr.net";
    const status = reachable ? "ok" : "unknown";
    const disposition = isGcore
      ? "保留"
      : reachable
        ? "保留"
        : "unknown";

    return {
      ...image,
      httpStatus: check.httpStatus,
      status,
      disposition,
    };
  });

  const internalLinks = [];
  const externalLinks = [];
  const specialLinks = [];

  for (const item of groupReferencedLinks(linkItems)) {
    const kind = classifyLink(item.url);
    if (kind === "internal") internalLinks.push(item);
    else if (kind === "special") specialLinks.push(item);
    else externalLinks.push(item);
  }

  const friendLinks = buildFriendLinks();
  const legacyAggregatePaths = buildLegacyAggregatePaths();

  const outputs = [
    {
      file: "content-manifest.json",
      data: contentManifest,
    },
    {
      file: "url-manifest.json",
      data: {
        legacyPaths: contentManifest
          .map((post) => post.legacyPath)
          .sort((a, b) => a.localeCompare(b, "zh-Hans-CN")),
        preservedStaticUrls: buildStaticUrls(),
      },
    },
    {
      file: "image-audit.json",
      data: {
        images,
        summary: {
          total: images.length,
          broken: images.filter((image) => image.status === "broken").length,
          ok: images.filter((image) => image.status === "ok").length,
          unknown: images.filter((image) => image.status === "unknown").length,
        },
      },
    },
    {
      file: "link-audit.json",
      data: {
        internalLinks,
        externalLinks,
        specialLinks,
        friendLinks,
        legacyAggregatePaths,
      },
    },
    {
      file: "taxonomy-map.json",
      data: taxonomyMap,
    },
  ];

  for (const output of outputs) {
    fs.writeFileSync(
      path.join(OUT_DIR, output.file),
      `${JSON.stringify(output.data, null, 2)}\n`,
      "utf8",
    );
  }

  const counts = {
    posts: posts.length,
    mathjax: posts.filter((post) => post.flags.mathjax).length,
    html: posts.filter((post) => post.flags.html).length,
    code: posts.filter((post) => post.flags.code).length,
    hexoTag: posts.filter((post) => post.flags.hexoTag).length,
  };

  console.log(JSON.stringify(counts, null, 2));
  console.log(`Wrote ${outputs.length} files to ${OUT_DIR}`);
}

function groupReferencedImages(items) {
  const map = new Map();
  for (const item of items) {
    if (!map.has(item.url)) {
      map.set(item.url, new Set());
    }
    map.get(item.url).add(item.referencedBy);
  }

  return [...map.entries()]
    .map(([url, files]) => ({
      url,
      domain: urlDomain(url),
      referencedBy: [...files].sort(),
    }))
    .sort((a, b) => {
      const byDomain = a.domain.localeCompare(b.domain);
      return byDomain !== 0 ? byDomain : a.url.localeCompare(b.url);
    });
}

await main();
