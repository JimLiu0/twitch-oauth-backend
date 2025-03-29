export default async function handler(req, res) {
  try {
    // Add logging to see what parameters are being received
    console.log('Direct callback received query params:', JSON.stringify(req.query));
    
    // Check for Twitch error parameters
    if (req.query.error) {
      console.error('Twitch returned an error:', req.query.error, req.query.error_description);
      return res.status(400).json({ 
        success: false, 
        error: req.query.error,
        description: req.query.error_description || 'Unknown error'
      });
    }
    
    const { code, state: session } = req.query;
    
    // Basic parameter validation
    if (!code) {
      console.error('Missing code parameter');
      return res.status(400).json({ success: false, error: 'Missing code parameter' });
    }
    
    console.log('Received code from Twitch with session:', session);

    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    // Check for required environment variables
    if (!clientId || !clientSecret) {
      console.error('Missing environment variables');
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: "https://twitch-oauth-backend.vercel.app/api/callback-direct",
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
      
      // Immediately redirect to the direct-plugin-token endpoint with the raw format
      const redirectUrl = `https://twitch-oauth-backend.vercel.app/api/direct-plugin-token?access_token=${data.access_token}&refresh_token=${data.refresh_token || ''}&format=raw`;
      
      console.log('Redirecting to raw token endpoint:', redirectUrl);
      return res.redirect(redirectUrl);
    } else {
      console.error('Failed to get token:', data);
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to get token',
        details: data
      });
    }
  } catch (error) {
    console.error('Error in direct callback handler:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
} 