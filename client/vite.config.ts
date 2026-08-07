import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

// ─── Plugin: Inject VITE_FIREBASE_* env vars into firebase-messaging-sw.js ───
// Service workers run outside the Vite module graph, so import.meta.env is
// unavailable. This plugin replaces %VITE_FIREBASE_*% tokens in the SW template
// with real values from .env at build time (and serves them in dev too).
function firebaseSwPlugin(env: Record<string, string>): Plugin[] {
  const swTemplatePath = path.resolve(
    __dirname,
    'public/firebase-messaging-sw.js',
  )

  function processTemplate(): string {
    let content = fs.readFileSync(swTemplatePath, 'utf-8')
    // Replace all %VITE_FIREBASE_*% tokens with actual env values
    content = content.replace(/%VITE_FIREBASE_([A-Z_]+)%/g, (_match, key) => {
      const envKey = `VITE_FIREBASE_${key}`
      return env[envKey] ?? ''
    })
    return content
  }

  return [
    // 1. Build-time: write the processed SW to dist/
    {
      name: 'firebase-sw-inject',
      apply: 'build',
      writeBundle() {
        const processed = processTemplate()
        const outPath = path.resolve(__dirname, 'dist/firebase-messaging-sw.js')
        fs.writeFileSync(outPath, processed, 'utf-8')
        console.log('✅ firebase-messaging-sw.js: env vars injected')
      },
    },
    // 2. Dev-time: serve the processed SW dynamically
    {
      name: 'firebase-sw-dev-server',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use('/firebase-messaging-sw.js', (_req, res) => {
          const processed = processTemplate()
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Service-Worker-Allowed', '/')
          res.end(processed)
        })
      },
    },
  ]
}

const config = defineConfig(async ({ mode }) => {
  // Load .env for the current mode (development / production)
  const env = loadEnv(mode, process.cwd(), '')

  const plugins: (Plugin | Plugin[])[] = [
    TanStackRouterVite(),
    viteReact(),
    tailwindcss(),
    // ── Firebase SW injection ──────────────────────────────────────────────
    ...firebaseSwPlugin(env),
    // ── APK MIME type for dev server ──────────────────────────────────────
    {
      name: 'apk-mime-type',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.endsWith('.apk')) {
            res.setHeader(
              'Content-Type',
              'application/vnd.android.package-archive',
            )
            res.setHeader(
              'Content-Disposition',
              'attachment; filename="VastuRent.apk"',
            )
          }
          next()
        })
      },
    },
  ]

  // Try to load the TanStack devtools plugin only in development and only if installed.
  try {
    if (mode === 'development') {
      // dynamic import avoids hard dependency during install/build on CI
      const mod = await import('@tanstack/devtools-vite').catch(() => undefined)
      if (mod?.devtools) {
        // The exported factory may return a single Plugin or an array of Plugin.
        // Cast to unknown first to avoid unsafe narrow conversion errors.
        const factory = mod.devtools as unknown as (
          ...args: any[]
        ) => Plugin | Plugin[]
        const result = await factory()
        if (Array.isArray(result)) {
          plugins.splice(2, 0, ...result)
        } else {
          plugins.splice(2, 0, result)
        }
      }
    }
  } catch {
    // devtools not available; continue without it
  }

  return {
    resolve: { tsconfigPaths: true },
    plugins,
    server: {
      host: '0.0.0.0',
      port: 3000,
    },
    assetsInclude: ['**/*.apk'],
  }
})

export default config
