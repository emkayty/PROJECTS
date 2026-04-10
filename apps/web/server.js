// Hisah Tech - Express Server for cPanel
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files with caching
app.use('/_next/static', express.static('.next/static', { 
  maxAge: '1y',
  fallthrough: false
}));

app.use('/public', express.static('public', { 
  maxAge: '1h',
  fallthrough: false
}));

// Serve the build output
app.use(express.static('.next/server/app', { 
  maxAge: '1h',
  fallthrough: false
}));

// Try to find and serve HTML page
function servePage(req, res) {
  const urlPath = req.path === '/' ? '/index' : req.path;
  
  // Try different paths
  const possiblePaths = [
    `.next/server/app${urlPath}.html`,
    `.next/server/app${urlPath}/index.html`,
    `.next/server/app/index.html`,
  ];
  
  for (const pagePath of possiblePaths) {
    if (fs.existsSync(pagePath)) {
      return res.sendFile(path.resolve(pagePath));
    }
  }
  
  // If no HTML, try to execute API or return 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API not available in static mode' });
  }
  
  // Show a basic page
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head><title>Hisah Tech</title></head>
    <body>
      <h1>Hisah Tech Forum</h1>
      <p>Page not found: ${req.path}</p>
    </body>
    </html>
  `);
}

// Home page
app.get('/', servePage);

// All other routes
app.get('*', servePage);

// Start server
app.listen(port, () => {
  console.log(`Hisah Tech running on http://localhost:${port}`);
  console.log(`Visit: http://hisahtech.com:${port}/`);
});