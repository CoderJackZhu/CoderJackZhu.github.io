import {
  expect,
  test as base,
  type Locator,
  type Page,
} from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

type ManifestEntry = {
  title: string;
  date: string;
  legacyPath: string;
};

const distDir = new URL("../../dist/", import.meta.url).pathname;
const contentDir = fileURLToPath(new URL("../../src/content/blog/", import.meta.url));
const staticFallback = process.env.CODEX_SANDBOX === "seatbelt";

function readSourcePosts() {
  return readdirSync(contentDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const source = readFileSync(join(contentDir, entry.name, "index.md"), "utf8");
      const title = source.match(/^title:\s*(.+?)\s*$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, "") ?? "";
      const date = source.match(/^date:\s*(.+?)\s*$/m)?.[1]?.trim() ?? "";
      const legacyPath =
        source.match(/^legacyPath:\s*(.+?)\s*$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, "") ?? "";
      return { title, date, legacyPath };
    });
}

const manifest = readSourcePosts() as ManifestEntry[];
const postsPerPage = 24;
const totalPages = Math.ceil(manifest.length / postsPerPage);

const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

function staticFile(pathname: string) {
  const decoded = decodeURIComponent(pathname).replace(/^\/+/, "");
  if (decoded.split("/").includes("..")) return undefined;
  const direct = join(distDir, decoded);
  const candidates = pathname.endsWith("/")
    ? [join(direct, "index.html")]
    : [direct, `${direct}.html`, join(direct, "index.html")];
  return candidates.find((path) => existsSync(path) && statSync(path).isFile());
}

const sandboxTest = base.extend({
  page: async ({ playwright }, use) => {
    const browser = await playwright.chromium.launch({
      args: ["--single-process", "--no-zygote"],
    });
    const context = await browser.newContext({ baseURL: "http://127.0.0.1:4321" });
    const page = await context.newPage();
    await page.route("http://127.0.0.1:4321/**", async (route) => {
      const path = staticFile(new URL(route.request().url()).pathname);
      if (path) {
        await route.fulfill({
          body: readFileSync(path),
          contentType: mimeTypes[extname(path)] ?? "application/octet-stream",
          status: 200,
        });
        return;
      }
      const notFound = join(distDir, "404.html");
      await route.fulfill({
        body: readFileSync(notFound),
        contentType: mimeTypes[".html"],
        status: 404,
      });
    });

    await use(page);
    await context.close().catch(() => undefined);
    await browser.close().catch(() => undefined);
  },
});

const test = staticFallback ? sandboxTest : base;
const newestPosts = [...manifest].sort(
  (left, right) => right.date.localeCompare(left.date) || right.title.localeCompare(left.title, "zh-CN"),
);

type Rectangle = { left: number; right: number; top: number; bottom: number; width: number };

function overlaps(left: Rectangle, right: Rectangle) {
  return !(
    left.right <= right.left ||
    right.right <= left.left ||
    left.bottom <= right.top ||
    right.bottom <= left.top
  );
}

async function rect(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box, `元素 ${await locator.getAttribute("class")} 应可见`).not.toBeNull();
  return {
    left: box!.x,
    right: box!.x + box!.width,
    top: box!.y,
    bottom: box!.y + box!.height,
    width: box!.width,
  };
}

async function expectNoDocumentOverflow(page: Page) {
  const dimensions = await page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const offenders = [...document.querySelectorAll("*")]
      .map((element) => {
        const box = element.getBoundingClientRect();
        return {
          element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${
            element.classList.length ? `.${[...element.classList].join(".")}` : ""
          }`,
          left: Math.round(box.left),
          right: Math.round(box.right),
          scrollWidth: element.scrollWidth,
        };
      })
      .filter((entry) => entry.left < -1 || entry.right > clientWidth + 1)
      .slice(0, 8);
    return { clientWidth, scrollWidth, offenders };
  });
  expect(
    dimensions.scrollWidth,
    `水平溢出元素：${JSON.stringify(dimensions.offenders)}`,
  ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

for (const width of [360, 390, 768, 1440]) {
  test(`首页 ${width}px 响应式布局`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expectNoDocumentOverflow(page);

    const header = page.locator(".site-header");
    const brand = page.locator(".brand");
    const nav = page.locator(".site-nav");
    const controls = [
      brand,
      nav.getByRole("link", { name: "文章", exact: true }),
      nav.getByRole("link", { name: "关于", exact: true }),
      nav.getByRole("link", { name: "友链", exact: true }),
      nav.getByRole("button", { name: "搜索" }),
      page.locator("#theme-toggle"),
    ];
    const boxes = await Promise.all(controls.map(rect));
    for (let left = 0; left < boxes.length; left += 1) {
      for (let right = left + 1; right < boxes.length; right += 1) {
        expect(overlaps(boxes[left], boxes[right]), `控件 ${left} 与 ${right} 不应重叠`).toBe(false);
      }
    }

    const brandBox = await rect(brand);
    const navBox = await rect(nav);
    if (width <= 820) {
      expect(navBox.top).toBeGreaterThanOrEqual(brandBox.bottom);
    } else {
      const headerBox = await rect(header);
      expect(headerBox.width).toBeGreaterThanOrEqual(1070);
      expect(headerBox.width).toBeLessThanOrEqual(1090);
      expect(navBox.left - brandBox.right).toBeGreaterThan(20);
    }
  });
}

test("首页展示定位语、最近六篇与完整入口", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "记录技术实践、学习过程，以及对一些长期问题的思考。",
  );
  const cards = page.locator(".post-list > li .post");
  await expect(cards).toHaveCount(6);
  for (let index = 0; index < 6; index += 1) {
    await expect(cards.nth(index)).toHaveAttribute("href", newestPosts[index].legacyPath);
    await expect(cards.nth(index)).toContainText(newestPosts[index].title);
  }
  await expect(page.getByRole("link", { name: `查看全部 ${manifest.length} 篇文章` })).toHaveAttribute(
    "href",
    "/blog/",
  );
});

test("文章列表分页、顺序与总数正确", async ({ page }) => {
  const listed = [];
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    await page.goto(pageNumber === 1 ? "/blog/" : `/blog/${pageNumber}/`);
    await expect(page.locator(".section-head")).toContainText(
      pageNumber === 1 ? `${manifest.length} posts` : `第 ${pageNumber} 页`,
    );
    await expect(page.locator(".post-list > li")).toHaveCount(
      Math.min(postsPerPage, manifest.length - (pageNumber - 1) * postsPerPage),
    );
    await expect(page.locator(".pagination")).toContainText(`第 ${pageNumber} / ${totalPages} 页`);
    if (pageNumber > 1) {
      await expect(page.getByRole("link", { name: "上一页" })).toHaveAttribute(
        "href",
        pageNumber === 2 ? "/blog/" : `/blog/${pageNumber - 1}`,
      );
    }
    listed.push(
      ...(await page.locator(".post-list .post").evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") ?? ""),
      )),
    );
  }
  const byPath = new Map(manifest.map((post) => [post.legacyPath, post]));
  expect(new Set(listed).size).toBe(manifest.length);
  expect(listed.every((href) => byPath.has(href))).toBe(true);
  const listedDates = listed.map((href) => byPath.get(href)!.date);
  expect(listedDates).toEqual([...listedDates].sort((left, right) => right.localeCompare(left)));
});

test("关于、友链与 404 页面可访问", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.getByRole("heading", { level: 1, name: "关于" })).toBeVisible();
  await expect(page.locator(".about-copy")).toContainText("Jack，一名 LLM Agent 工程师");

  await page.goto("/link/");
  await expect(page.getByRole("heading", { level: 1, name: "友链" })).toBeVisible();
  await expect(page.locator(".link-list li")).toHaveCount(9);

  const response = await page.goto("/this-route-does-not-exist/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("页面未找到");
});

test("代表文章保留普通内容、代码、数学、原始 HTML 与多图", async ({ page }) => {
  await page.goto("/2024/11/06/秋招金山面试分享/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("秋招金山面试分享");
  await expect(page.locator(".prose p").first()).toBeVisible();

  await page.goto("/2021/05/30/计算智能导论作业——FCM 聚类的实现/");
  await expect(page.locator(".prose pre.astro-code code").first()).toBeVisible();

  await page.goto("/2021/04/08/数据挖掘报告——MIMC数据集的预处理/");
  await expect(page.locator(".prose .katex").first()).toBeVisible();

  await page.goto("/2021/04/28/机器学习报告——高光谱遥感特征选择/");
  await expect(page.locator(".prose table thead th", { hasText: "Index" }).first()).toBeVisible();

  await page.goto("/2026/08/29/当文明踩下加速踏板之后/");
  expect(await page.locator(".prose img").count()).toBeGreaterThanOrEqual(4);
});

test("Pagefind 搜索可按标题与分类返回结果", async ({ page }) => {
  await page.goto("/");
  await page.locator("#magnifying-glass").click();
  const input = page.locator(".pagefind-ui__search-input");
  await expect(input).toBeVisible();

  await input.fill("现代化的包管理工具");
  await expect(page.locator(".pagefind-ui__result-link").first()).toContainText("现代化的包管理工具", {
    timeout: 10_000,
  });

  await input.fill("思考与随笔");
  await expect(page.locator(".pagefind-ui__result-link").first()).toBeVisible({ timeout: 10_000 });
});

test("主题默认浅色并可持久切换", async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem("theme"));
  await page.goto("/");
  const toggle = page.locator("#theme-toggle");
  await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  await expect(toggle).toHaveAttribute("aria-label", "切换为深色模式");

  await toggle.click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await expect(toggle).toHaveAttribute("aria-label", "切换为浅色模式");
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");

  await toggle.click();
  await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  await expect(toggle).toHaveAttribute("aria-label", "切换为深色模式");
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");
});

test("键盘可依序聚焦主导航控件且具可访问名称", async ({ page }) => {
  await page.goto("/");
  const expectedNames = ["Jack's Blog", "文章", "关于", "友链", "照片", "搜索", "切换为深色模式"];
  const names = [];
  for (let index = 0; index < expectedNames.length; index += 1) {
    await page.keyboard.press("Tab");
    names.push(
      await page.evaluate(() =>
        document.activeElement?.getAttribute("aria-label")?.trim() || document.activeElement?.textContent?.trim(),
      ),
    );
  }
  expect(names).toEqual(expectedNames);
});

test("360px 下代码块与表格不撑破文档且自身可滚动", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  for (const [url, selector] of [
    ["/2021/05/30/计算智能导论作业——FCM 聚类的实现/", ".prose pre"],
    ["/2021/04/28/机器学习报告——高光谱遥感特征选择/", ".prose table"],
  ] as const) {
    await page.goto(url);
    await expectNoDocumentOverflow(page);
    const overflow = await page.locator(selector).first().evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        overflowX: style.overflowX,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      };
    });
    if (overflow.scrollWidth > overflow.clientWidth) {
      expect(["auto", "scroll"]).toContain(overflow.overflowX);
    }
  }
});

test("favicon href 唯一且为 PNG", async ({ page }) => {
  await page.goto("/");
  const icons = page.locator('link[rel="icon"]');
  await expect(icons).toHaveCount(1);
  await expect(icons).toHaveAttribute("href", "/favicon.png");
});
