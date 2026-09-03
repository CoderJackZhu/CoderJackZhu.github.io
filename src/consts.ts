import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "Jack's Blog",
  DESCRIPTION: "记录技术实践、学习过程，以及对一些长期问题的思考。",
  NUM_POSTS_ON_HOMEPAGE: 6,
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

export const SOCIALS: Socials = [
  {
    NAME: "GitHub",
    HREF: "https://github.com/CoderJackZhu",
  },
  {
    NAME: "知乎",
    HREF: "https://www.zhihu.com/people/zhu-yijie-51",
  },
  {
    NAME: "哔哩哔哩",
    HREF: "https://space.bilibili.com/355295657",
  },
  {
    NAME: "RSS",
    HREF: "/atom.xml",
  },
];
