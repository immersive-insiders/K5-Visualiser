import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps asset paths relative so the build works whether it is
// served from the domain root or from a GitHub Pages subpath
// (https://<user>.github.io/<repo>/). If you prefer absolute paths, set
// base to '/<repo>/' instead.
export default defineConfig({
  plugins: [react()],
  base: './',
})
