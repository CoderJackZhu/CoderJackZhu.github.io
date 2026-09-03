import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";

export interface NavItemConfig {
  label: string;
  href: string;
}

export interface SocialLinkConfig {
  name: string;
  href: string;
}

export interface FriendLinkConfig {
  name: string;
  link: string;
  descr: string;
}

export interface FooterLinkConfig {
  label: string;
  href: string;
}

export interface HomePageConfig {
  eyebrow: string;
  heading: string;
  subtitle: string;
  more: string;
}

export interface BlogPageConfig {
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  sectionHeading: string;
  postsLabel: string;
}

export interface AboutPageConfig {
  title: string;
  eyebrow: string;
  heading: string;
  subtitle: string;
}

export interface LinkPageConfig {
  title: string;
  eyebrow: string;
  heading: string;
}

export interface PhotosPageConfig {
  title: string;
  eyebrow: string;
  heading: string;
  subtitle: string;
}

export interface NotFoundPageConfig {
  title: string;
  eyebrow: string;
  heading: string;
}

export interface SiteConfig {
  site: {
    title: string;
    description: string;
    numPostsOnHomepage: number;
    numPostsPerPage: number;
  };
  nav: NavItemConfig[];
  socials: SocialLinkConfig[];
  friendLinks: FriendLinkConfig[];
  footer: {
    author: string;
    since: string;
    icp: string;
    icpUrl: string;
    cdnNote: string;
    cdnUrl: string;
    showRuntime: boolean;
    showVisitor: boolean;
  };
  footerLinks: FooterLinkConfig[];
  about: {
    paragraphs: string[];
  };
  linkSubtitle: string;
  pages: {
    home: HomePageConfig;
    blog: BlogPageConfig;
    about: AboutPageConfig;
    link: LinkPageConfig;
    photos: PhotosPageConfig;
    notFound: NotFoundPageConfig;
  };
  photos: string[];
}

const configPath = path.resolve(process.cwd(), "site.config.yaml");
const raw = fs.readFileSync(configPath, "utf8");
const config = load(raw) as SiteConfig;

export default config;
