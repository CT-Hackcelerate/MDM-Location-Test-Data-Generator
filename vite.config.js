import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
 * CORS FIX — Dev Proxy
 * --------------------
 * The frontend NEVER fetches the davita.com hosts directly. Instead it calls
 * relative proxy paths, and Vite forwards them server-side (no CORS preflight):
 *
 *   /proxy/mdmace/<env>/...  ->  https://mdmace-<env>.davita.com/...
 *   /proxy/kafka/<env>/...   ->  https://intgkafka-<env>-rest-apis.int-svcs-np.davita.com/...
 *   /proxy/soap/<env>/...    ->  https://mdm-<env>.davita.com:443/...
 *
 * `router` resolves the environment (dev/qa/uat) from the URL at request time,
 * so a single proxy entry covers every environment.
 */

function stripPrefix(prefix) {
  // /proxy/mdmace/dev/Location/... -> /Location/...
  return (path) => path.replace(new RegExp(`^${prefix}/[^/]+`), '')
}

export default defineConfig({
  plugins: [react()],
  base: '/MDM-Location-Test-Data-Generator/',
  server: {
    port: 5173,
    proxy: {
      '/proxy/mdmace': {
        target: 'https://mdmace-dev.davita.com',
        changeOrigin: true,
        secure: false,
        router: (req) => {
          const env = req.url.split('/')[3] || 'dev'
          return `https://mdmace-${env}.davita.com`
        },
        rewrite: stripPrefix('/proxy/mdmace'),
      },
      '/proxy/kafka': {
        target: 'https://intgkafka-dev-rest-apis.int-svcs-np.davita.com',
        changeOrigin: true,
        secure: false,
        router: (req) => {
          const env = req.url.split('/')[3] || 'dev'
          return `https://intgkafka-${env}-rest-apis.int-svcs-np.davita.com`
        },
        rewrite: stripPrefix('/proxy/kafka'),
      },
      '/proxy/soap': {
        target: 'https://mdm-dev.davita.com:443',
        changeOrigin: true,
        secure: false,
        router: (req) => {
          const env = req.url.split('/')[3] || 'dev'
          return `https://mdm-${env}.davita.com:443`
        },
        rewrite: stripPrefix('/proxy/soap'),
      },
    },
  },
})
