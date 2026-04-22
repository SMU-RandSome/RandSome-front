/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function injectEnvIntoServiceWorker(env: Record<string, string>): Plugin {
  return {
    name: 'inject-env-service-worker',
    apply: 'build',
    closeBundle() {
      const get = (key: string): string =>
        env[key] ?? (process.env[key] as string | undefined) ?? '';
      const swPath = resolve('dist/firebase-messaging-sw.js');
      let content = readFileSync(swPath, 'utf-8');
      content = content
        .replace('__VITE_FIREBASE_API_KEY__', get('VITE_FIREBASE_API_KEY'))
        .replace('__VITE_FIREBASE_AUTH_DOMAIN__', get('VITE_FIREBASE_AUTH_DOMAIN'))
        .replace('__VITE_FIREBASE_PROJECT_ID__', get('VITE_FIREBASE_PROJECT_ID'))
        .replace('__VITE_FIREBASE_STORAGE_BUCKET__', get('VITE_FIREBASE_STORAGE_BUCKET'))
        .replace('__VITE_FIREBASE_MESSAGING_SENDER_ID__', get('VITE_FIREBASE_MESSAGING_SENDER_ID'))
        .replace('__VITE_FIREBASE_APP_ID__', get('VITE_FIREBASE_APP_ID'));
      writeFileSync(swPath, content);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss(), injectEnvIntoServiceWorker(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'es2022',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-router': ['react-router-dom'],
            'vendor-motion': ['motion'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-icons': ['lucide-react'],
            'vendor-firebase': ['firebase/app', 'firebase/messaging'],
            'vendor-axios': ['axios'],
            'vendor-qrcode': ['html5-qrcode'],
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
    },
  };
});
