import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

// Validate environment variables at build time
import './src/env'

const config = defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    devtools(),
    nitro(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  ssr: {
    noExternal: ["@convex-dev/better-auth"]
  },
  optimizeDeps: {
    // @daveyplate/better-auth-ui is only imported by the lazy-loaded auth route.
    // Without explicit inclusion, Vite discovers it on first visit and triggers
    // a second esbuild optimization run — creating a separate copy of the chunk
    // that contains AuthUIContext, separate from the copy already bundled with
    // @daveyplate/better-auth-ui/tanstack (from providers.tsx).
    // Two context instances = empty auth forms.
    // Explicitly including both packages guarantees they land in the same initial
    // esbuild run so they share a single AuthUIContext chunk.
    include: [
      '@daveyplate/better-auth-ui',
      '@daveyplate/better-auth-ui/tanstack',
    ],
  },
})

export default config
