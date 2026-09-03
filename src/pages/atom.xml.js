import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@consts";

export async function GET() {
  const posts = (await getCollection("blog"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: "Jack's Blog",
    description: SITE.DESCRIPTION,
    site: "https://www.jackzhu.top",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `https://www.jackzhu.top${post.data.legacyPath}`,
      pubDate: post.data.date,
    })),
  });
}
