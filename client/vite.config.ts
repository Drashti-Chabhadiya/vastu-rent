import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    TanStackRouterVite(),
    viteReact(),
    devtools(),
    tailwindcss(),
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
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  assetsInclude: ['**/*.apk'],
})

export default config
