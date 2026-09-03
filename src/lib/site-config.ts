import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";

export interface SocialLinkConfig {
  name: string;
  href: string;
}

export interface FriendLinkConfig {
  name: string;
  link: string;
  descr: string;
}

export interface SiteConfig {
  site: {
    title: string;
    description: string;
    numPostsOnHomepage: number;
    numPostsPerPage: number;
  };
  socials: SocialLinkConfig[];
  friendLinks: FriendLinkConfig[];
  footer: {
    since: string;
    icp: string;
    icpUrl: string;
    showRuntime: boolean;
    showVisitor: boolean;
  };
  about: {
    paragraphs: string[];
  };
  linkSubtitle: string;
}

const configPath = path.resolve(process.cwd(), "site.config.yaml");
const raw = fs.readFileSync(configPath, "utf8");
const config = load(raw) as SiteConfig;

export default config;
