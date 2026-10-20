import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    section: z.string(),
    legacyPath: z.string(),
    draft: z.boolean().optional(),
    cover: z.string().optional(),
  }),
});

const works = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/works" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    kind: z.string(),
    year: z.string(),
    status: z.string(),
    cover: z.string(),
    coverAlt: z.string(),
    coverWidth: z.number().int().positive(),
    coverHeight: z.number().int().positive(),
    caption: z.string().optional(),
    order: z.number(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    tags: z.array(z.string()),
    links: z.array(
      z.object({ label: z.string(), href: z.url({ protocol: /^https?$/ }) }),
    ),
    relatedPosts: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, works };
