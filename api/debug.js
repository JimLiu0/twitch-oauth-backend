export default function handler(req, res) {
  try {
    // Get current URL for reference
    const host = req.headers.host || 'twitch-oauth-backend.vercel.app';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const currentUrl = `${protocol}://${host}`;
    const correctRedirectUri = `${currentUrl}/api/callback`;
    
    // Log all request information
    console.log('Debug endpoint hit');
    console.log('Query parameters:', JSON.stringify(req.query));
    console.log('Request headers:', JSON.stringify(req.headers));
    console.log('Request method:', req.method);
    console.log('Detected URL:', currentUrl);
    console.log('Recommended redirect URI:', correctRedirectUri);
    
    // Return the information as HTML for easy viewing
    return res.send(`
      <html>
        <head>
          <title>Debug Information</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .section { margin-bottom: 30px; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
            .code { font-family: monospace; background: #f0f0f0; padding: 10px; border-radius: 5px; }
            .warning { color: orange; font-weight: bold; }
            .error { color: red; font-weight: bold; }
            .success { color: green; font-weight: bold; }
            .important { font-weight: bold; border: 1px solid #ccc; padding: 15px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <h1>Debug Information</h1>
          
          <div class="section important">
            <h2>Redirect URI Configuration</h2>
            <p>Your Twitch Developer Console OAuth Redirect URL should be set to:</p>
            <div class="code">${correctRedirectUri}</div>
            
            <p>Your current REDIRECT_URI environment variable is set to:</p>
            <div class="code">${process.env.REDIRECT_URI || 'Not set'}</div>
            
            <p class="${process.env.REDIRECT_URI === correctRedirectUri ? 'success' : 'error'}">
              ${process.env.REDIRECT_URI === correctRedirectUri ? 
                '✅ Your redirect URI is correctly configured!' : 
                '❌ Your redirect URI does not match the recommended value!'}
            </p>
            
            <p>If these don't match, you need to update either:</p>
            <ol>
              <li>Your <strong>Twitch Developer Console</strong> OAuth Redirect URL setting, or</li>
              <li>Your <strong>Vercel project's</strong> REDIRECT_URI environment variable</li>
            </ol>
          </div>
          
          <div class="section">
            <h2>Environment Variables</h2>
            <pre>TWITCH_CLIENT_ID: ${process.env.TWITCH_CLIENT_ID ? '✅ Set' : '❌ Not set'}
TWITCH_CLIENT_SECRET: ${process.env.TWITCH_CLIENT_SECRET ? '✅ Set' : '❌ Not set'}
REDIRECT_URI: ${process.env.REDIRECT_URI ? '✅ Set' : '❌ Not set'}</pre>
          </div>
          
          <div class="section">
            <h2>Request Information</h2>
            <p>Host: ${host}</p>
            <p>Protocol: ${protocol}</p>
          </div>

          <div class="section">
            <h2>Query Parameters</h2>
            <pre>${JSON.stringify(req.query, null, 2)}</pre>
          </div>
          
          <div class="section">
            <h2>Headers</h2>
            <pre>${JSON.stringify(req.headers, null, 2)}</pre>
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