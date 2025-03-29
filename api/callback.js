// Using global object for immediate availability but also write to temp storage
let tokens = {};

export default async function handler(req, res) {
  try {
    // Add logging to see what parameters are being received
    console.log('Callback received query params:', JSON.stringify(req.query));
    
    // Check for Twitch error parameters
    if (req.query.error) {
      console.error('Twitch returned an error:', req.query.error, req.query.error_description);
      
      // Handle redirect_mismatch error specifically
      if (req.query.error === 'redirect_mismatch') {
        return res.status(400).send(`
          <html>
            <head>
              <title>Redirect URI Mismatch</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }
                .error { color: red; font-weight: bold; }
                .code { background: #f0f0f0; padding: 10px; margin: 20px; display: inline-block; }
                .instructions { text-align: left; max-width: 600px; margin: 0 auto; }
              </style>
            </head>
            <body>
              <h1 class="error">❌ Redirect URI Mismatch</h1>
              <p>Your Twitch app's registered redirect URI doesn't match the one you're using.</p>
              
              <div class="instructions">
                <h2>How to fix this:</h2>
                <ol>
                  <li>Go to the <a href="https://dev.twitch.tv/console/apps" target="_blank">Twitch Developer Console</a></li>
                  <li>Find your application and click "Manage"</li>
                  <li>Under "OAuth Redirect URLs", add the following URL <strong>exactly</strong>:</li>
                  <div class="code">https://twitch-oauth-backend.vercel.app/api/callback</div>
                  <li>Click "Save" at the bottom of the page</li>
                  <li><a href="/api/start-twitch-auth?session=test123">Try the authentication again</a></li>
                </ol>
                
                <p>Error Details: ${req.query.error_description}</p>
              </div>
            </body>
          </html>
        `);
      }
      
      // Handle other errors
      return res.status(400).send(`
        <html>
          <head>
            <title>Twitch Authentication Error</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }
              .error { color: red; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1 class="error">❌ Authentication Error</h1>
            <p>Twitch returned an error: ${req.query.error}</p>
            <p>Error Description: ${req.query.error_description || 'No description provided'}</p>
            <p><a href="/api/start-twitch-auth?session=test123">Try again</a></p>
          </body>
        </html>
      `);
    }
    
    const { code, state } = req.query;
    const session = state; // Twitch returns our session as 'state'
    
    // More detailed check for each parameter
    if (!code) {
      console.error('Missing code parameter');
      return res.status(400).send('❌ Missing code parameter from Twitch. Please try again.');
    }
    
    if (!state) {
      console.error('Missing state parameter');
      return res.status(400).send('❌ Missing state parameter from Twitch. Please try again.');
    }

    console.log('Received code from Twitch with session:', session);

    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    const redirectUri = process.env.REDIRECT_URI;

    // Check for required environment variables
    if (!clientId || !clientSecret) {
      console.error('Missing environment variables:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret
      });
      return res.status(500).send('❌ Server configuration error.');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: "https://twitch-oauth-backend.vercel.app/api/callback",
    });

    console.log('Exchanging code for token...');
    
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    const data = await response.json();

    if (data.access_token) {
      console.log('Successfully received access token for session:', session);
      
      // Store tokens in memory (temporary)
      tokens[session] = data;
      
      // Create a direct download token file
      const jsonData = JSON.stringify(data, null, 2);
      const filename = `twitch-token-${session}.json`;
      
      return res.send(`
        <html>
          <head>
            <title>Twitch Authentication Successful</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
              .success { color: green; font-weight: bold; }
              .session { margin: 20px; padding: 10px; background: #f0f0f0; display: inline-block; }
              .instructions { text-align: left; max-width: 600px; margin: 20px auto; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
              .button { display: inline-block; background: #9147ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px; }
              pre { text-align: left; background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto; max-height: 300px; }
            </style>
            <script>
              // Store token in localStorage
              function saveTokens() {
                try {
                  const tokenData = ${JSON.stringify(data)};
                  localStorage.setItem('twitch_tokens_${session}', JSON.stringify(tokenData));
                  document.getElementById('storage-status').innerHTML = '✅ Tokens saved to your browser storage!';
                  return true;
                } catch(e) {
                  console.error('Error saving tokens:', e);
                  document.getElementById('storage-status').innerHTML = '❌ Error saving tokens: ' + e.message;
                  return false;
                }
              }
              
              // Create file download
              function downloadTokens() {
                const tokenData = ${JSON.stringify(data)};
                const dataStr = JSON.stringify(tokenData, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', '${filename}');
                linkElement.click();
              }
              
              // Run on page load
              window.onload = function() {
                // Try to auto-save
                saveTokens();
              };
            </script>
          </head>
          <body>
            <h1 class="success">✅ Twitch login successful!</h1>
            
            <div class="instructions">
              <p id="storage-status">Saving tokens to browser storage...</p>
              
              <h2>Option 1: Save tokens to your browser</h2>
              <p>We've automatically saved your tokens to your browser's local storage.</p>
              <p>To manually save them again, click:</p>
              <button onclick="saveTokens()" class="button">Save Tokens to Browser</button>
              
              <h2>Option 2: Download tokens as file</h2>
              <p>Download your tokens as a JSON file:</p>
              <button onclick="downloadTokens()" class="button">Download Tokens</button>

              <h2>Your Session ID</h2>
              <p>For future reference, your session ID is:</p>
              <div class="session">${session}</div>
              
              <h2>Token Information</h2>
              <pre>${JSON.stringify(data, null, 2)}</pre>
            </div>
          </body>
        </html>
      `);
    } else {
      console.error('Failed to get token:', data);
      return res.status(400).send(`
        <html>
          <head>
            <title>Twitch Authentication Failed</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
              .error { color: red; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1 class="error">❌ Login failed</h1>
            <p>Error: ${data.message || 'Unknown error'}</p>
            <p>Please try again.</p>
          </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Error in callback handler:', error);
    return res.status(500).send(`
      <html>
        <head>
          <title>Server Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            .error { color: red; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1 class="error">❌ Server Error</h1>
          <p>Something went wrong. Please try again later.</p>
          <p>Error: ${error.message || 'Unknown error'}</p>
        </body>
      </html>
    `);
  }
}

export { tokens };
