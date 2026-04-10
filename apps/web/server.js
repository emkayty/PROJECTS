// Hisah Tech - Express Server for cPanel (FIXED)
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Get absolute path to app directory
const APP_DIR = __dirname;

console.log('========================================');
console.log('Hisah Tech Server Starting...');
console.log('App Directory:', APP_DIR);
console.log('========================================');

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files - use absolute paths
app.use('/_next/static', express.static(path.join(APP_DIR, '.next/static'), { 
  maxAge: '1y',
  fallthrough: false
}));

app.use('/public', express.static(path.join(APP_DIR, 'public'), { 
  maxAge: '1h',
  fallthrough: false
}));

// Serve the build output - use absolute path
app.use(express.static(path.join(APP_DIR, '.next/server/app'), { 
  maxAge: '1h',
  fallthrough: false
}));

// Function to find and serve HTML pages
function servePage(req, res) {
  let urlPath = req.path;
  
  // Handle root path
  if (urlPath === '/') {
    urlPath = '/index';
  }
  
  // Remove trailing slash (except for root)
  if (urlPath !== '/index' && urlPath.endsWith('/')) {
    urlPath = urlPath.slice(0, -1);
  }
  
  // Possible paths to check
  const possiblePaths = [
    path.join(APP_DIR, '.next/server/app', urlPath + '.html'),
    path.join(APP_DIR, '.next/server/app', urlPath, 'index.html'),
    path.join(APP_DIR, '.next/server/app/index.html'),
  ];
  
  // Debug log
  console.log('[' + req.method + '] Request: ' + req.path);
  
  for (const pagePath of possiblePaths) {
    if (fs.existsSync(pagePath)) {
      console.log('  -> Serving: ' + pagePath);
      return res.sendFile(pagePath);
    }
  }
  
  // Not found
  console.log('  -> 404 Not Found');
  
  // If API route, return JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API not available in static mode' });
  }
  
  // Return 404 HTML page
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head><title>Hisah Tech - 404</title></head>
    <body style="font-family: system-ui, sans-serif; padding: 40px; text-align: center; background: #f5f5f5;">
      <div style="max-width: 500px; margin: 50px auto; background: white; padding: 30px; border-radius: 10px;">
        <h1 style="color: #dc2626;">404 - Page Not Found</h1>
        <p style="color: #666;">The page "${req.path}" was not found.</p>
        <p><a href="/" style="color: #2563eb;">← Go to Home</a></p>
      </div>
    </body>
    </html>
  `);
}

// Handle all routes
app.get('*', servePage);

// Start server
app.listen(port, () => {
  console.log('========================================');
  console.log('Server running on http://localhost:' + port);
  console.log('Visit: http://hisahtech.com:' + port + '/');
  console.log('========================================');
});
