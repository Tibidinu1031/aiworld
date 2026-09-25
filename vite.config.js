import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Source lives in src/ (src/index.html is the development entry).
// `npm run build` writes ONE self-contained index.html to the repository root, so:
// - GitHub Pages can serve it with "Deploy from a branch: main / (root)",
// - and it also runs by double-clicking it (no server needed).
export default defineConfig({
  root: 'src',
  base: './',
  publicDir: false,
  plugins: [viteSingleFile()],
  build: {
    outDir: '..',
    emptyOutDir: false, // never wipe the repository; the build only writes index.html
    target: 'es2020',
    chunkSizeWarningLimit: 5000,
  },
  server: { port: 5173 },
});
