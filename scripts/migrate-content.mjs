import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

const SOURCE_POSTS_DIR = "/Users/jackzhu/projects/blog/source/_posts";
const PUBLIC_DIR = "/Users/jackzhu/projects/blog/public";
const MIGRATION_DIR = path.join(repoRoot, "migration");
const BLOG_DIR = path.join(repoRoot, "src/content/blog");

const MANIFEST_FILE = path.join(MIGRATION_DIR, "content-manifest.json");
const TAXONOMY_FILE = path.join(MIGRATION_DIR, "taxonomy-map.json");
const URL_MANIFEST_FILE = path.join(MIGRATION_DIR, "url-manifest.json");

// §4 七篇缺失 description 的简洁一行描述（由标题与正文提炼）。
const FALLBACK_DESCRIPTIONS = {
  "数据挖掘报告——MIMC数据集的预处理.md":
    "利用 MySQL 与 Python 对 MIMC 数据集进行提取、缺失值与离群点处理、去噪与插值的数据预处理实验记录。",
  "机器学习报告——数据分类的实现.md":
    "使用 logistic 回归、神经网络、高斯判别分析与贝叶斯方法对 Sonar 数据集进行分类的实现与比较。",
  "计算智能导论作业——遗传算法的实现.md":
    "实现遗传算法求解最优化问题，并分析编码、适应度函数与遗传算子的实验报告。",
  "机器学习报告——高光谱遥感特征选择.md":
    "基于 KSC 高光谱遥感数据集，用 Filter 与 Wrapper 方法进行波段特征选择并比较优缺点。",
  "计算智能导论作业——感知器实现二分类.md":
    "实现感知器算法，并在多组二维数据与 Sonar 高维数据集上完成二分类实验。",
  "计算智能导论作业——FCM 聚类的实现.md":
    "实现模糊 C 均值（FCM）聚类算法，并在 Iris 数据集上完成聚类实验。",
  "机器学习课程报告——波士顿房价预测.md":
    "实现波士顿房价预测，比较神经网络模型与线性回归模型的效果。",
};

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
  const seen = new Set();
  const result = [];
  for (const item of values) {
    const text = String(item).trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    result.push(text);
  }
  return result;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return undefined;
}

function slugFromLegacyPath(legacyPath) {
  const segments = legacyPath.split("/").filter(Boolean);
  const raw = segments[segments.length - 1];
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function convertHexoRawTags(body) {
  return body
    .replace(/^[ \t]*\{% raw %\}[ \t]*\r?\n/gm, "")
    .replace(/^[ \t]*\{% endraw %\}[ \t]*\r?\n/gm, "");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function ensureNoJackZhu(text) {
  if (/Jack\s+Zhu/i.test(text)) {
    throw new Error(`Found forbidden "Jack Zhu" string in migrated frontmatter.`);
  }
}

function main() {
  const contentManifest = readJson(MANIFEST_FILE);
  const taxonomy = readJson(TAXONOMY_FILE);
  const urlManifest = readJson(URL_MANIFEST_FILE);

  if (!Array.isArray(contentManifest)) {
    throw new Error("content-manifest.json must be an array.");
  }
  if (contentManifest.length !== 54) {
    throw new Error(`Expected 54 manifest entries, got ${contentManifest.length}.`);
  }

  const taxonomyByFilename = new Map(
    taxonomy.mapping.map((entry) => [entry.filename, entry.section]),
  );
  const legacyPathSet = new Set(urlManifest.legacyPaths);

  const manifestByFilename = new Map(
    contentManifest.map((entry) => [entry.filename, entry]),
  );

  const sourceFiles = fs
    .readdirSync(SOURCE_POSTS_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

  if (sourceFiles.length !== 54) {
    throw new Error(`Expected 54 source posts, got ${sourceFiles.length}.`);
  }

  // 幂等：清空并重建输出目录（作用域仅限 src/content/blog）。
  fs.rmSync(BLOG_DIR, { recursive: true, force: true });
  fs.mkdirSync(BLOG_DIR, { recursive: true });

  const usedIds = new Set();
  const report = [];

  for (const filename of sourceFiles) {
    const raw = fs.readFileSync(path.join(SOURCE_POSTS_DIR, filename), "utf8");
    const { frontmatter, body: originalBody } = parseFrontmatter(raw);

    const manifestEntry = manifestByFilename.get(filename);
    if (!manifestEntry) {
      throw new Error(`Missing manifest entry for ${filename}.`);
    }

    const section = taxonomyByFilename.get(filename);
    if (!section) {
      throw new Error(`Missing taxonomy section for ${filename}.`);
    }

    const legacyPath = manifestEntry.legacyPath;
    if (!legacyPath || !legacyPathSet.has(legacyPath)) {
      throw new Error(`legacyPath not found in url-manifest for ${filename}.`);
    }

    // 从 public/ 目录结构校验（只读校验，绝不重算）。
    const publicDir = path.join(PUBLIC_DIR, legacyPath.replace(/^\//, ""));
    if (!fs.existsSync(publicDir)) {
      throw new Error(`Public directory missing for ${filename}: ${legacyPath}`);
    }

    const title = firstNonEmpty(frontmatter.title, manifestEntry.title);
    if (!title) {
      throw new Error(`Missing title for ${filename}.`);
    }

    const date = manifestEntry.date;
    if (!date) {
      throw new Error(`Missing date for ${filename}.`);
    }

    const updated = manifestEntry.updated || null;

    const tags = asStringArray(frontmatter.tags);

    let description = firstNonEmpty(frontmatter.description);
    if (!description) {
      description = FALLBACK_DESCRIPTIONS[filename];
    }
    if (!description) {
      throw new Error(`Missing description and no fallback for ${filename}.`);
    }

    const cover = firstNonEmpty(frontmatter.top_img, frontmatter.cover);

    const frontmatterOut = {
      title,
      date,
    };
    if (updated) frontmatterOut.updated = updated;
    frontmatterOut.section = section;
    if (tags.length > 0) frontmatterOut.tags = tags;
    frontmatterOut.description = description;
    frontmatterOut.legacyPath = legacyPath;
    if (cover) frontmatterOut.cover = cover;

    ensureNoJackZhu(
      JSON.stringify({ ...frontmatterOut, description, title }),
    );

    // Hexo `{% raw %}` 标签：去掉包裹，保留内部 $$...$$ 数学公式。
    const body = convertHexoRawTags(originalBody);

    let id = slugFromLegacyPath(legacyPath);
    if (usedIds.has(id)) {
      id = `${id}-${date.replace(/-/g, "")}`;
    }
    if (usedIds.has(id)) {
      throw new Error(`Duplicate output id after date suffix: ${id}`);
    }
    usedIds.add(id);

    const outDir = path.join(BLOG_DIR, id);
    fs.mkdirSync(outDir, { recursive: true });

    const yamlString = stringifyYaml(frontmatterOut, { lineWidth: 0 });
    const output = `---\n${yamlString}---\n${body}`;

    fs.writeFileSync(path.join(outDir, "index.md"), output, "utf8");

    report.push({
      filename,
      id,
      title,
      legacyPath,
      section,
      bodyLength: originalBody.length,
    });
  }

  const dirs = fs
    .readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory()).length;

  console.log(
    JSON.stringify(
      {
        migrated: report.length,
        outputDirectories: dirs,
        hexoTagConverted:
          report.find((entry) => entry.filename === "计算智能导论作业——感知器实现二分类.md")
            ?.filename ?? null,
      },
      null,
      2,
    ),
  );
}

main();
