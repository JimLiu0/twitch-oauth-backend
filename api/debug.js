export default function handler(req, res) {
  try {
    // Log all request information
    console.log('Debug endpoint hit');
    console.log('Query parameters:', JSON.stringify(req.query));
    console.log('Request headers:', JSON.stringify(req.headers));
    console.log('Request method:', req.method);
    
    // Return the information as HTML for easy viewing
    return res.send(`
      <html>
        <head>
          <title>Debug Information</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .section { margin-bottom: 20px; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <h1>Debug Information</h1>
          <div class="section">
            <h2>Query Parameters</h2>
            <pre>${JSON.stringify(req.query, null, 2)}</pre>
          </div>
          <div class="section">
            <h2>Headers</h2>
            <pre>${JSON.stringify(req.headers, null, 2)}</pre>
          </div>
          <div class="section">
            <h2>Environment Variables (masked)</h2>
            <pre>TWITCH_CLIENT_ID: ${process.env.TWITCH_CLIENT_ID ? '✅ Set' : '❌ Not set'}
TWITCH_CLIENT_SECRET: ${process.env.TWITCH_CLIENT_SECRET ? '✅ Set' : '❌ Not set'}
REDIRECT_URI: ${process.env.REDIRECT_URI ? '✅ Set' : '❌ Not set'}</pre>
          </div>
          <div class="section">
            <h2>Auth Test Links</h2>
            <p><a href="/api/start-twitch-auth?session=debug123" target="_blank">Start Auth Flow</a></p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in debug handler:', error);
    return res.status(500).send(`Error: ${error.message}`);
  }
} 