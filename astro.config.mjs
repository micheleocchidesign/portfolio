// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({  
  vite: {
    server: {
      allowedHosts: [
        'maegan-uncinctured-untoxically.ngrok-free.dev' // Incolla qui il tuo URL di Ngrok
      ]
    }
  }
});