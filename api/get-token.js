import { tokens } from './callback.js';

export default function handler(req, res) {
  try {
    // Set CORS headers to allow your frontend to call this API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const { session } = req.query;

    if (!session) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing session parameter' 
      });
    }

    if (tokens[session]) {
      console.log('Returning tokens for session:', session);
      
      // Return the token data
      return res.json({
        success: true,
        ...tokens[session]
      });
    } else {
      console.log('No tokens found for session:', session);
      return res.status(404).json({ 
        success: false,
        error: 'No tokens found for this session' 
      });
    }
  } catch (error) {
    console.error('Error in get-token handler:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
}
