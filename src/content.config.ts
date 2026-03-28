import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const works = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/works" }),
  schema: ({ image }) => z.object({
    order: z.number().default(999),
    title: z.string(),
    description: z.string().optional(), // Aggiunte le parentesi per renderlo opzionale correttamente
    category: z.string(),
    client: z.string(),
    role: z.string(),
    agency: z.string().optional(),
    agencyUrl: z.string().url().optional(), // <--- AGGIUNTO QUI!
    
    extraInfo: z.array(z.object({
      label: z.string(),
      value: z.string()
    })).optional(),
    
    bgImg: image(), 
    previewImg: image(),
    liveUrl: z.string().optional(),
    // Invece di .any(), potresti definire meglio i moduli, ma per ora va bene così
    modules: z.array(z.any()).optional(), 
    externalLink: z.string().url().optional(),
  }),
});

export const collections = { works };