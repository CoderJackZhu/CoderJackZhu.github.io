import type { Site, Socials } from "@types";
import siteConfig from "@lib/site-config";

export const SITE: Site = {
  TITLE: siteConfig.site.title,
  DESCRIPTION: siteConfig.site.description,
  NUM_POSTS_ON_HOMEPAGE: siteConfig.site.numPostsOnHomepage,
};

export const CATEGORIES: string[] = siteConfig.categories;

export type Category = string;

export const SOCIALS: Socials = siteConfig.socials.map((s) => ({
  NAME: s.name,
  HREF: s.href,
}));
