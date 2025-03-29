export default function handler(req, res) {
    const { session } = req.query;
  
    const clientId = process.env.TWITCH_CLIENT_ID;
    // Hard-code the redirect URI to ensure it's exactly correct
    const redirectUri = "https://twitch-oauth-backend.vercel.app/api/callback";

    // Log the exact value we're using
    console.log('=== REDIRECT URI DEBUG ===');
    console.log('Using hard-coded redirectUri:', redirectUri);

    // Check if required environment variables are set
    if (!clientId) {
        console.error('Missing environment variables:', {
            hasClientId: !!clientId
        });
        return res.status(500).json({ 
            error: 'Server configuration error',
            message: 'Missing required environment variables'
        });
    }
  
    const redirect = encodeURIComponent(redirectUri);
    console.log('After encodeURIComponent:', redirect);
    console.log('=== END REDIRECT URI DEBUG ===');

    const scopes = [
        "user:read:email",
        "channel:edit:commercial",
        "channel:manage:predictions",
        "channel:read:predictions"
    ];
    const scope = encodeURIComponent(scopes.join(" "));
  
    // Make sure to use precise state parameter
    const stateParam = encodeURIComponent(session || 'default');
    
    const twitchUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=${scope}&state=${stateParam}&force_verify=true`;
    
    console.log('Redirecting to Twitch with:');
    console.log('- clientId:', clientId);
    console.log('- redirectUri:', redirectUri);
    console.log('- state:', stateParam);
    console.log('- Full URL:', twitchUrl);
    
    res.redirect(twitchUrl);
}
  