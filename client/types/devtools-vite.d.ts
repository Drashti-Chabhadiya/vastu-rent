// filepath: /workspaces/new-vastu-rent/client/types/devtools-vite.d.ts
// Local declaration to satisfy TypeScript when @tanstack/devtools-vite is not installed
declare module '@tanstack/devtools-vite' {
  import type { Plugin } from 'vite'

  // The package exports a factory function which may return a single Plugin
  // or an array of Plugin. Keep the input type loose to remain flexible.
  export function devtools(opts?: any): Plugin | Plugin[]

  // Also export a default for consumers that import the module as default
  const _default: { devtools: typeof devtools }
  export default _default
}
