import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import path from "path";
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),
     monacoEditorPlugin.default({
      languageWorkers: ['editorWorkerService', 'css', 'html', 'json', 'typescript']
    }),
  ],
  server: {
    // This is the configuration you need to add
     allowedHosts: ['.ngrok-free.app'] ,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  
 
   resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})

