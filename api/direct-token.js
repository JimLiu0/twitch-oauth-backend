export default function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const { token_data } = req.query;
    
    if (!token_data) {
      return res.status(400).json({
        success: false,
        error: "Missing token_data parameter"
      });
    }
    
    try {
      // Try to parse the token data
      const tokenData = JSON.parse(decodeURIComponent(token_data));
      
      // Return the token data
      return res.json({
        success: true,
        ...tokenData
      });
    } catch (error) {
      console.error("Error parsing token data:", error);
      return res.status(400).json({
        success: false,
        error: "Invalid token data format"
      });
    }
  } catch (error) {
    console.error("Error in direct-token handler:", error);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
} 