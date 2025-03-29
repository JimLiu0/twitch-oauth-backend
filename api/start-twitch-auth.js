export default function handler(req, res) {
    const { session, auto_redirect } = req.query;
  
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
  
    // Use the session as state (possibly with a prefix if auto_redirect is true)
    const state = auto_redirect === 'true'
        ? `auto_${session || 'default'}`  // Prefix with "auto_" for auto-redirect sessions
        : session || 'default';
    
    const stateParam = encodeURIComponent(state);
    
    const twitchUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=${scope}&state=${stateParam}&force_verify=true`;
    
    console.log('Redirecting to Twitch with:');
    console.log('- clientId:', clientId);
    console.log('- redirectUri:', redirectUri);
    console.log('- state:', state);
    console.log('- auto_redirect:', auto_redirect === 'true');
    console.log('- Full URL:', twitchUrl);
    
    res.redirect(twitchUrl);
}
  