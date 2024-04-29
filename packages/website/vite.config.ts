import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['0g'],
    include: ['react/jsx-runtime', 'react', 'react-dom'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    conditions:
      mode === 'production'
        ? ['production', 'import', 'module', 'browser', 'default']
        : ['development', 'import', 'module', 'browser', 'default'],
  },
  server: {
    port: 4006,
  },
  build: {
    sourcemap: true,
  },
}));
