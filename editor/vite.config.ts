import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'

const DATA_PATH = path.resolve(__dirname, '../src/202603.json')

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api',
      configureServer(server) {
        server.middlewares.use('/api/data', (req, res) => {
          res.setHeader('Content-Type', 'application/json')

          if (req.method === 'GET') {
            res.end(fs.readFileSync(DATA_PATH, 'utf-8'))
            return
          }

          if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: Buffer) => { body += chunk })
            req.on('end', () => {
              try {
                JSON.parse(body)
                fs.writeFileSync(DATA_PATH, body, 'utf-8')
                res.statusCode = 200
                res.end(JSON.stringify({ ok: true }))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: String(e) }))
              }
            })
            return
          }

          res.statusCode = 405
          res.end()
        })

        server.middlewares.use('/api/build', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
          res.setHeader('Content-Type', 'application/json')

          execFile('node', [path.resolve(__dirname, '../build.js')], (err, stdout, stderr) => {
            if (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: stderr || String(err) }))
            } else {
              res.end(JSON.stringify({ ok: true, message: stdout.trim() }))
            }
          })
        })
      },
    },
  ],
})
