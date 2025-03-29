export default function handler(req, res) {
  try {
    // Set CORS headers to allow cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const { access_token, refresh_token, format } = req.query;

    if (!access_token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing access_token parameter' 
      });
    }

    // Add the client ID from environment variable
    const clientId = process.env.TWITCH_CLIENT_ID;
    
    // Format specifically for plugin integration
    const responseData = {
      success: true,
      access_token: access_token,
      refresh_token: refresh_token || '',
      client_id: clientId,
      expires_in: 14400, // Default to 4 hours
      token_type: 'bearer',
    };

    // If raw format requested, just return the token and client ID
    if (format === 'raw') {
      return res.json({
        access_token: access_token,
        client_id: clientId
      });
    }

    // If minimal format requested, return just what's needed for basic API calls
    if (format === 'minimal') {
      return res.json({
        access_token: access_token,
        client_id: clientId,
        refresh_token: refresh_token || ''
      });
    }

    // Return the complete response by default
    return res.json(responseData);
  } catch (error) {
    console.error('Error in direct-plugin-token handler:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
} 