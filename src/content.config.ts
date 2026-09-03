import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from 'astro/loaders';
import siteConfig from "@lib/site-config";

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    section: z.enum(siteConfig.categories as [string, ...string[]]),
    tags: z.array(z.string()).optional(),
    legacyPath: z.string(),
    draft: z.boolean().optional(),
    cover: z.string().optional(),
  }),
});

export const collections = { blog };
