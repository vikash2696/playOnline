const fs = require('fs');
const path = require('path');

const workerCode = `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    try {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404 && !pathname.startsWith('/api')) {
        return env.ASSETS.fetch(new Request(new URL('/index.html', url)));
      }
      return response;
    } catch (e) {
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};`;

const distPath = path.join(__dirname, 'frontend', 'dist', '_worker.js');
const distDir = path.dirname(distPath);

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the worker file
fs.writeFileSync(distPath, workerCode);
console.log('✅ Created frontend/dist/_worker.js');
