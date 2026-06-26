import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import url from 'url';

// Vite plugin to run Vercel serverless functions in api/ directory locally
function vercelApiPlugin() {
  return {
    name: 'vercel-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) {
          return next();
        }

        try {
          const parsedUrl = url.parse(req.url, true);
          let pathname = parsedUrl.pathname;

          let handlerPath = null;
          let queryParams = { ...parsedUrl.query };

          // Try exact matches first
          let potentialPaths = [
            path.join(process.cwd(), pathname + '.js'),
            path.join(process.cwd(), pathname, 'index.js')
          ];

          for (const p of potentialPaths) {
            if (fs.existsSync(p)) {
              handlerPath = p;
              break;
            }
          }

          // Dynamic routing check (e.g. api/products/[id].js)
          if (!handlerPath) {
            const parts = pathname.split('/').filter(Boolean);
            if (parts.length >= 3) {
              const dir = path.join(process.cwd(), parts[0], parts[1]);
              const dynamicFile = path.join(dir, '[id].js');
              if (fs.existsSync(dynamicFile)) {
                handlerPath = dynamicFile;
                queryParams.id = parts[2];
              }
            }
          }

          if (!handlerPath) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Not found: ${pathname}` }));
            return;
          }

          const fileUrl = url.pathToFileURL(handlerPath).href;
          // Clear cache by adding timestamp since it's dev mode
          const module = await import(`${fileUrl}?t=${Date.now()}`);
          const handler = module.default;

          req.query = queryParams;

          if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const data = Buffer.concat(buffers).toString();
            try {
              req.body = data ? JSON.parse(data) : {};
            } catch {
              req.body = data;
            }
          } else {
            req.body = {};
          }

          const vercelRes = {
            statusCode: 200,
            headers: {},
            setHeader(name, value) {
              this.headers[name] = value;
              res.setHeader(name, value);
              return this;
            },
            status(code) {
              this.statusCode = code;
              res.statusCode = code;
              return this;
            },
            json(jsonObj) {
              if (!this.headers['Content-Type']) {
                this.setHeader('Content-Type', 'application/json');
              }
              res.statusCode = this.statusCode;
              res.end(JSON.stringify(jsonObj));
              return this;
            },
            end(data) {
              res.statusCode = this.statusCode;
              res.end(data);
              return this;
            }
          };

          await handler(req, vercelRes);

        } catch (error) {
          console.error('API Handler Error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), vercelApiPlugin()],
});
