import { createServer } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createViteServer() {
  const server = await createServer({
    configFile: false,
    root: path.join(__dirname, 'client'),
    server: {
      host: '0.0.0.0',
      port: 5173,
      hmr: {
        port: 5173
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client/src'),
      },
    },
    plugins: [
      {
        name: 'react',
        async buildStart() {
          const react = await import('@vitejs/plugin-react')
          return react.default()
        }
      }
    ]
  })

  await server.listen()
  server.printUrls()
}

createViteServer().catch(console.error)