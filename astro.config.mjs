// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // L'indirizzo del tuo sito su GitHub Pages
  site: 'https://ilmaichi.github.io/',
  
  // Il nome della tua repository (fondamentale per i percorsi)
  base: '/mo',
  
  // Forza l'aggiunta dello slash finale per evitare errori 404
  trailingSlash: 'always',
  
  build: {
    // Organizza le pagine in sottocartelle (es. /works/index.html)
    format: 'directory',
    // Rinomina la cartella da "_astro" a "assets" per evitare blocchi di GitHub
    assets: 'assets'
  },
  
  vite: {
    server: {
      allowedHosts: [
        'maegan-uncinctured-untoxically.ngrok-free.dev' // Il tuo URL di Ngrok
      ]
    }
  }
});