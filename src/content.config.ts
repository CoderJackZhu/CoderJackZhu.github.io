import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    section: z.enum(["技术与工程", "学习与研究", "思考与随笔", "经历与记录"]),
    tags: z.array(z.string()).optional(),
    legacyPath: z.string(),
    draft: z.boolean().optional(),
    cover: z.string().optional(),
  }),
});

export const collections = { blog };
