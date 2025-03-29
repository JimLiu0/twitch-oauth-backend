let tokens = {};

export default async function handler(req, res) {
  try {
    // Add logging to see what parameters are being received
    console.log('Callback received query params:', JSON.stringify(req.query));
    
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
    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing environment variables:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasRedirectUri: !!redirectUri
      });
      return res.status(500).send('❌ Server configuration error.');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
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
      tokens[session] = data;
      
      // Include a simple script to show the session ID for retrieval
      return res.send(`
        <html>
          <head>
            <title>Twitch Authentication Successful</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
              .success { color: green; font-weight: bold; }
              .session { margin: 20px; padding: 10px; background: #f0f0f0; display: inline-block; }
            </style>
          </head>
          <body>
            <h1 class="success">✅ Twitch login successful!</h1>
            <p>Your session ID is:</p>
            <div class="session">${session}</div>
            <p>You'll need this ID to retrieve your tokens.</p>
            <p>You can now close this tab.</p>
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
