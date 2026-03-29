// @ts-check
import { defineConfig } from 'astro/config';
// 1. Importa l'integrazione
import icon from 'astro-icon';

const isGithubPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  // 2. Aggiungila all'array integrations
  integrations: [
    icon(),
  ],
  // URL finale su Netlify o quello di GitHub
  site: isGithubPages 
    ? 'https://micheleocchidesign.github.io' 
    : 'https://micheleocchi.com',
  
  // Base path: '/portfolio' solo su GitHub, vuoto ovunque altrove (Netlify/Locale)
  base: isGithubPages ? '/portfolio' : '',
  
  trailingSlash: 'always',
  
  build: {
    format: 'directory',
    assets: 'assets'
  }
});