// Import and initialize a more persistent token storage
import { tokens } from './token-storage.js';

export default function handler(req, res) {
  try {
    const { session, token_data } = req.query;
    
    if (!session || !token_data) {
      return res.status(400).json({
        success: false,
        error: 'Missing session or token_data parameter'
      });
    }
    
    try {
      // Parse and store the token data
      const tokenData = JSON.parse(decodeURIComponent(token_data));
      tokens[session] = tokenData;
      
      console.log(`Stored token for session: ${session}`);
      
      // Return success page
      return res.send(`
        <html>
          <head>
            <title>Tokens Saved</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
              .success { color: green; font-weight: bold; }
              .session { margin: 20px; padding: 10px; background: #f0f0f0; display: inline-block; }
              .button { display: inline-block; background: #9147ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px; }
            </style>
          </head>
          <body>
            <h1 class="success">✅ Tokens saved successfully!</h1>
            <p>Your tokens for session <span class="session">${session}</span> have been saved.</p>
            <p>You can now retrieve your tokens with:</p>
            <p><a href="/api/get-token?session=${session}" class="button">Get My Tokens</a></p>
            <p>Or access them programmatically at:</p>
            <div class="session">https://twitch-oauth-backend.vercel.app/api/get-token?session=${session}</div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error parsing token data:', error);
      return res.status(400).json({
        success: false,
        error: 'Invalid token data format'
      });
    }
  } catch (error) {
    console.error('Error in store-token handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
} 