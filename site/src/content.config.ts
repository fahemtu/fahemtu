// Content collection « articles » (blog) — pipeline SEO en place dès maintenant.
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    // Couverture / og:image (chemin public, ex. /images/articles/xxx.png). Optionnel.
    cover: z.string().optional(),
  }),
});

export const collections = { articles };
