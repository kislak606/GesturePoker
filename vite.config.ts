import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't delete main.js
    rollupOptions: {
      input: {
        renderer: path.resolve(__dirname, 'src/renderer.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        format: 'es',
      },
    },
    sourcemap: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
});
