import { defineCollection, z } from 'astro:content';

export interface Post {
  title: string;
  description: string;
  pubDate: Date;
  tags?: string[];
  category?: string;
  pin?: boolean;
}

const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    pin: z.boolean().optional(),
  }),
});

export const collections = {
  posts
};