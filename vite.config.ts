/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

/**
 * Tailwind v4의 @supports (color-mix) 블록에 대한 rgba 폴백 생성.
 * 구형 Android 브라우저(color-mix 미지원)에서 투명도 유틸리티가 작동하도록 한다.
 */
function colorMixFallback(): Plugin {
  return {
    name: 'color-mix-fallback',
    apply: 'build',
    generateBundle(_, bundle) {
      for (const [, asset] of Object.entries(bundle)) {
        if (asset.type !== 'asset' || !asset.fileName.endsWith('.css')) continue;

        const css = asset.source as string;

        // 1. CSS 변수에서 색상 맵 구축
        const colorMap = new Map<string, string>();
        const varRegex = /--color-([a-z]+-?[0-9]*):(#[0-9a-fA-F]{3,6})/g;
        let m;
        while ((m = varRegex.exec(css)) !== null) {
          colorMap.set(`--color-${m[1]}`, m[2]);
        }

        // 2. @supports 블록에서 단순 color-mix 패턴 추출 → rgba 폴백 생성
        const fallbacks: string[] = [];
        const supportsRe =
          /@supports\s*\(color:color-mix\(in lab,\s*red,\s*red\)\)\{([^}]*\{[^}]*\})\}/g;

        while ((m = supportsRe.exec(css)) !== null) {
          const inner = m[1];
          const ruleMatch = inner.match(
            /([^{]+)\{([^:]+):color-mix\(in oklab,\s*var\((--color-[a-z]+-?[0-9]*)\)\s+([0-9]+)%,\s*transparent\)/,
          );
          if (!ruleMatch) continue;

          const [, selector, property, colorVar, pct] = ruleMatch;
          const hex = colorMap.get(colorVar);
          if (!hex) continue;

          const rgb = hexToRgb(hex);
          if (!rgb) continue;

          const alpha = parseInt(pct) / 100;
          fallbacks.push(`${selector}{${property}:rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})}`);
        }

        if (fallbacks.length === 0) continue;

        // 3. 첫 @supports 블록 바로 앞에 폴백 삽입
        const idx = css.indexOf('@supports (color:color-mix(');
        if (idx >= 0) {
          asset.source = css.slice(0, idx) + fallbacks.join('') + css.slice(idx);
        }
      }
    },
  };
}

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
    plugins: [react(), tailwindcss(), colorMixFallback(), injectEnvIntoServiceWorker(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'es2022',
      cssMinify: 'lightningcss',
      cssTarget: ['chrome100', 'safari14', 'ios14'],
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
