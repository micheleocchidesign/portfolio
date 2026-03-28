// @ts-check
import { defineConfig } from 'astro/config';

const isGithubPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
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