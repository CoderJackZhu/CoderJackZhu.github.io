import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";

const root = process.cwd();
const distDir = join(root, "dist");
const contentDir = join(root, "src/content/blog");
const expectedOrigin = "https://www.jackzhu.top";
const checks = [];
const failures = [];

function walk(directory, predicate = () => true) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path, predicate) : predicate(path) ? [path] : [];
  });
}

function check(name, run) {
  try {
    const detail = run();
    checks.push({ name, detail });
    console.log(`PASS ${name}${detail ? ` — ${detail}` : ""}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push({ name, message });
    console.error(`FAIL ${name}\n${message}`);
  }
}

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function equalLists(label, actual, expected) {
  const left = sorted(actual);
  const right = sorted(expected);
  const missing = right.filter((value) => !left.includes(value));
  const extra = left.filter((value) => !right.includes(value));
  ensure(
    left.length === right.length && missing.length === 0 && extra.length === 0,
    `${label} 不一致：missing=${JSON.stringify(missing)}, extra=${JSON.stringify(extra)}`,
  );
}

function distCandidates(urlPath) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(urlPath, expectedOrigin).pathname);
  } catch {
    pathname = urlPath;
  }
  const relativePath = pathname.replace(/^\/+/, "");
  ensure(!relativePath.split("/").includes(".."), `路径越界：${urlPath}`);
  if (!relativePath) return [join(distDir, "index.html")];
  if (pathname.endsWith("/")) return [join(distDir, relativePath, "index.html")];
  const direct = join(distDir, relativePath);
  return [direct, `${direct}.html`, join(direct, "index.html")];
}

function assertDistTarget(urlPath, source) {
  const candidates = distCandidates(urlPath);
  ensure(
    candidates.some((candidate) => existsSync(candidate) && statSync(candidate).isFile()),
    `${source}: ${urlPath} 未解析到 dist 文件（尝试 ${candidates
      .map((path) => relative(root, path))
      .join(", ")}）`,
  );
}

function decodeHtmlAttribute(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#38;", "&")
    .replaceAll("&#x2F;", "/");
}

function assertWellFormedXml(xml, label) {
  const withoutOpaqueSections = xml
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "");
  const stack = [];
  for (const match of withoutOpaqueSections.matchAll(/<\/?([A-Za-z_][\w:.-]*)\b[^>]*>/g)) {
    const token = match[0];
    const name = match[1];
    if (token.startsWith("</")) {
      const open = stack.pop();
      ensure(open === name, `${label}: XML 标签未闭合，期望 </${open}>，实际 </${name}>`);
    } else if (!token.endsWith("/>")) {
      stack.push(name);
    }
  }
  ensure(stack.length === 0, `${label}: XML 标签未闭合：${stack.join(" > ")}`);
}

function htmlFor(urlPath) {
  const path = distCandidates(urlPath).find((candidate) => existsSync(candidate));
  ensure(path, `${urlPath} 对应 HTML 不存在`);
  return readFileSync(path, "utf8");
}

ensure(existsSync(distDir), "dist 不存在；请先运行 npm run build");

const contentManifest = readJson(join(root, "migration/content-manifest.json"));
const urlManifest = readJson(join(root, "migration/url-manifest.json"));
const contentFiles = walk(contentDir, (path) => path.endsWith(`${sep}index.md`));
const htmlFiles = walk(distDir, (path) => path.endsWith(".html"));
const siteHtmlFiles = htmlFiles.filter((path) => /<!doctype html>/i.test(readFileSync(path, "utf8")));

check("内容、清单与 legacyPath 一致", () => {
  const sourceLegacyPaths = contentFiles.map((path) => {
    const source = readFileSync(path, "utf8");
    const match = source.match(/^legacyPath:\s*(.+?)\s*$/m);
    ensure(match, `${relative(root, path)} 缺少 legacyPath`);
    return match[1].trim().replace(/^['"]|['"]$/g, "");
  });
  ensure(contentFiles.length === 54, `source content 应为 54，实际 ${contentFiles.length}`);
  ensure(contentManifest.length === 54, `content manifest 应为 54，实际 ${contentManifest.length}`);
  ensure(new Set(sourceLegacyPaths).size === 54, "source legacyPath 不是 54 个唯一值");
  ensure(new Set(contentManifest.map((entry) => entry.legacyPath)).size === 54, "content manifest legacyPath 不唯一");
  ensure(new Set(urlManifest.legacyPaths).size === 54, "URL manifest legacyPath 不唯一");
  equalLists("source 与 content manifest", sourceLegacyPaths, contentManifest.map((entry) => entry.legacyPath));
  equalLists("source 与 URL manifest", sourceLegacyPaths, urlManifest.legacyPaths);
  return "54 source = 54 content manifest = 54 unique URL manifest";
});

check("全部 legacy URL 已构建", () => {
  for (const legacyPath of urlManifest.legacyPaths) assertDistTarget(legacyPath, "legacy URL");
  return `${urlManifest.legacyPaths.length} 个日期型 URL`;
});

check("内部绝对链接全部可解析", () => {
  const broken = [];
  let inspected = 0;
  for (const htmlPath of siteHtmlFiles) {
    const html = readFileSync(htmlPath, "utf8");
    for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
      const value = decodeHtmlAttribute(match[1].trim());
      if (!value.startsWith("/") || value.startsWith("//")) continue;
      const pathname = value.split("#", 1)[0].split("?", 1)[0];
      if (!pathname) continue;
      inspected += 1;
      try {
        assertDistTarget(pathname, relative(root, htmlPath));
      } catch (error) {
        broken.push(error.message);
      }
    }
  }
  ensure(broken.length === 0, broken.slice(0, 30).join("\n"));
  return `${inspected} 个 href/src`;
});

check("模板身份与非公开署名已清除", () => {
  const forbidden = [
    ["example.com", /example\.com/i],
    ["astro-micro.vercel.app", /astro-micro\.vercel\.app/i],
    ["Astro Micro", /Astro\s+Micro/i],
    ["template author", /trevor\s*(?:tyler\s*)?lee/i],
    ["Jack Zhu", /Jack\s+Zhu/i],
    ["朱一杰", /朱一杰/],
    ["zhuyijie", /zhuyijie/i],
  ];
  const hits = [];
  for (const htmlPath of htmlFiles) {
    const html = readFileSync(htmlPath, "utf8");
    for (const [label, pattern] of forbidden) {
      if (pattern.test(html)) hits.push(`${relative(root, htmlPath)}: ${label}`);
    }
  }
  ensure(hits.length === 0, hits.join("\n"));
  return `${htmlFiles.length} 个 HTML`;
});

check("favicon 与失效 CDN 引用正确", () => {
  ensure(existsSync(join(distDir, "favicon.svg")), "dist/favicon.svg 不存在");
  assertWellFormedXml(readFileSync(join(distDir, "favicon.svg"), "utf8"), "favicon.svg");
  const hits = [];
  for (const htmlPath of siteHtmlFiles) {
    const html = readFileSync(htmlPath, "utf8");
    if (/cdn\.noedgeai\.com/i.test(html)) hits.push(`${relative(root, htmlPath)}: cdn.noedgeai.com`);
    if (/\/favicon\.ico/i.test(html)) hits.push(`${relative(root, htmlPath)}: /favicon.ico`);
    const favicons = [...html.matchAll(/<link\b[^>]*\brel=["']icon["'][^>]*>/gi)].map((match) => match[0]);
    if (favicons.length !== 1 || !/\bhref=["']\/favicon\.svg["']/i.test(favicons[0] ?? "")) {
      hits.push(`${relative(root, htmlPath)}: favicon link 应唯一且指向 /favicon.svg`);
    }
  }
  ensure(hits.length === 0, hits.join("\n"));
  return `SVG 可解析，${siteHtmlFiles.length} 个站点页面引用唯一`;
});

check("部署与站点验证文件齐全", () => {
  ensure(readFileSync(join(distDir, "CNAME"), "utf8").trim() === "www.jackzhu.top", "dist/CNAME 内容错误");
  ensure(existsSync(join(distDir, ".nojekyll")), "dist/.nojekyll 不存在");
  const verificationFiles = readdirSync(join(root, "public")).filter((name) =>
    /^(?:baidu_verify|google).+\.html$/i.test(name),
  );
  ensure(verificationFiles.length >= 2, `public 中验证文件不足：${verificationFiles.join(", ")}`);
  for (const filename of verificationFiles) {
    ensure(existsSync(join(distDir, filename)), `dist/${filename} 不存在`);
  }
  return `CNAME、.nojekyll、${verificationFiles.length} 个验证文件`;
});

check("sitemap、订阅与 canonical 正确", () => {
  const xmlFiles = walk(distDir, (path) => /(?:sitemap.*\.xml|atom\.xml)$/.test(path));
  ensure(xmlFiles.some((path) => path.endsWith(`${sep}sitemap-index.xml`)), "sitemap-index.xml 不存在");
  ensure(xmlFiles.some((path) => path.endsWith(`${sep}atom.xml`)), "atom.xml 不存在");
  for (const xmlPath of xmlFiles) {
    const xml = readFileSync(xmlPath, "utf8");
    ensure(xml.trim().length > 0, `${relative(root, xmlPath)} 为空`);
    assertWellFormedXml(xml, relative(root, xmlPath));
  }
  const badCanonicals = [];
  for (const htmlPath of siteHtmlFiles) {
    const html = readFileSync(htmlPath, "utf8");
    const canonicals = [...html.matchAll(/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi)].map(
      (match) => match[1],
    );
    if (canonicals.length !== 1) {
      badCanonicals.push(`${relative(root, htmlPath)}: canonical 数量 ${canonicals.length}`);
      continue;
    }
    const canonical = canonicals[0];
    if (!canonical.startsWith(`${expectedOrigin}/`) || /^http:\/\//i.test(canonical) || /astro-micro|vercel\.app/i.test(canonical)) {
      badCanonicals.push(`${relative(root, htmlPath)}: ${canonical}`);
    }
  }
  ensure(badCanonicals.length === 0, badCanonicals.join("\n"));
  return `${xmlFiles.length} 个 XML，${siteHtmlFiles.length} 个 canonical`;
});

check("Pagefind 产物存在且非空", () => {
  const pagefindDir = join(distDir, "pagefind");
  const files = walk(pagefindDir);
  ensure(files.length > 0, "dist/pagefind 没有文件");
  const totalBytes = files.reduce((sum, path) => sum + statSync(path).size, 0);
  ensure(totalBytes > 0, "dist/pagefind 为空");
  ensure(files.some((path) => path.endsWith("pagefind.js")), "pagefind.js 不存在");
  return `${files.length} 个文件，${totalBytes} bytes`;
});

check("代表性文章渲染产物正确", () => {
  const math = htmlFor("/2021/04/08/数据挖掘报告——MIMC数据集的预处理/");
  ensure(/class=["'][^"']*katex/.test(math), "数学文章没有 KaTeX 产物");

  const code = htmlFor("/2021/05/30/计算智能导论作业——FCM 聚类的实现/");
  ensure(/<pre\b[^>]*class=["'][^"']*astro-code/.test(code) && /<code\b/.test(code), "代码文章没有高亮 pre/code");

  const rawHtml = htmlFor("/2021/04/28/机器学习报告——高光谱遥感特征选择/");
  ensure(/<table><thead><tr><th>Index<\/th>/.test(rawHtml), "原始 HTML table 结构未保留");

  const multiImage = htmlFor("/2026/08/29/当文明踩下加速踏板之后/");
  const imageCount = [...multiImage.matchAll(/<img\b/gi)].length;
  ensure(imageCount >= 4, `多图文章应至少有 4 个 img，实际 ${imageCount}`);
  return `KaTeX + 高亮代码 + 原始 table + ${imageCount} 张图片`;
});

check("tracked files 未发现疑似凭证", () => {
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root })
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
  const skipped = new Set(["package-lock.json", "scripts/verify-build.mjs"]);
  const textExtensions = new Set([".astro", ".css", ".html", ".js", ".json", ".md", ".mjs", ".ts", ".tsx", ".txt", ".xml", ".yml", ".yaml"]);
  const signatures = [
    ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
    ["OpenAI-style key", /\bsk-[A-Za-z0-9_-]{20,}\b/],
    ["GitHub token", /\bgithub_pat_[A-Za-z0-9_]{20,}\b|\bgh[pousr]_[A-Za-z0-9]{30,}\b/],
    ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
    [
      "assigned secret",
      /\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|secret[_-]?key|password)\b\s*[:=]\s*["']?([A-Za-z0-9+/_=-]{20,})/i,
    ],
  ];
  const placeholders = /^(?:example|placeholder|replace|your|test|dummy|process\.env|import\.meta\.env)/i;
  const hits = [];
  for (const filename of tracked) {
    if (skipped.has(filename) || (!textExtensions.has(extname(filename)) && !filename.startsWith(".env"))) continue;
    const absolute = resolve(root, filename);
    if (!existsSync(absolute) || statSync(absolute).size > 2_000_000) continue;
    const source = readFileSync(absolute, "utf8");
    for (const [label, pattern] of signatures) {
      const match = source.match(pattern);
      if (!match || placeholders.test(match[1] ?? "")) continue;
      const line = source.slice(0, match.index).split("\n").length;
      hits.push(`${filename}:${line}: ${label}`);
    }
  }
  ensure(hits.length === 0, `${hits.join("\n")}\n仅报告文件位置，未输出疑似凭证值。`);
  return `${tracked.length} 个 tracked path（跳过 lockfile 与审计脚本自检噪音）`;
});

console.log(`\nBuild audit: ${checks.length}/${checks.length + failures.length} PASS`);
if (failures.length > 0) {
  console.error(`失败项：${failures.map((failure) => failure.name).join("、")}`);
  process.exitCode = 1;
}
