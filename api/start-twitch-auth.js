export default function handler(req, res) {
    const { session } = req.query;
  
    const clientId = process.env.TWITCH_CLIENT_ID;
    const redirectUri = process.env.REDIRECT_URI;

    // Check if required environment variables are set
    if (!clientId || !redirectUri) {
        console.error('Missing environment variables:', {
            hasClientId: !!clientId,
            hasRedirectUri: !!redirectUri
        });
        return res.status(500).json({ 
            error: 'Server configuration error',
            message: 'Missing required environment variables'
        });
    }
  
    const redirect = encodeURIComponent(redirectUri);
    const scopes = [
        "user:read:email",
        "channel:edit:commercial",
        "channel:manage:predictions",
        "channel:read:predictions"
    ];
    const scope = encodeURIComponent(scopes.join(" "));
  
    const twitchUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=${scope}&state=${session}&force_verify=true`;
    
    console.log('Redirecting to:', twitchUrl);
    res.redirect(twitchUrl);
}
  