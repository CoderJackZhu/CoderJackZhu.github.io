import type { Metadata, Site, Socials } from "@types";
import siteConfig from "@lib/site-config";

export const SITE: Site = {
  TITLE: siteConfig.site.title,
  DESCRIPTION: siteConfig.site.description,
  NUM_POSTS_ON_HOMEPAGE: siteConfig.site.numPostsOnHomepage,
};

export const CATEGORIES = ["技术与工程", "学习与研究", "思考与随笔", "经历与记录"] as const;

export type Category = (typeof CATEGORIES)[number];

export const HOME: Metadata = {
  TITLE: "Jack's Blog",
  DESCRIPTION: SITE.DESCRIPTION,
};

export const BLOG: Metadata = {
  TITLE: "文章",
  DESCRIPTION: "全部文章，按发布日期倒序排列。",
};

export const SOCIALS: Socials = siteConfig.socials.map((s) => ({
  NAME: s.name,
  HREF: s.href,
}));
