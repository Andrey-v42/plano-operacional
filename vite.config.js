import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
  base: '/plano-operacional/',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: '_redirects', dest: '' },
        { src: '.nojekyll', dest: ''}
      ]
    })
  ],
})
