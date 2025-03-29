export default function handler(req, res) {
  const { session } = req.query;

  const clientId = process.env.TWITCH_CLIENT_ID;
  // Hard-code the redirect URI to ensure it's exactly correct
  const redirectUri = "https://twitch-oauth-backend.vercel.app/api/callback-direct";

  // Log the exact value we're using
  console.log('=== DIRECT AUTH STARTED ===');
  console.log('Session:', session);
  console.log('Using redirectUri:', redirectUri);

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
  
  const scopes = [
    "user:read:email",
    "channel:edit:commercial",
    "channel:manage:predictions",
    "channel:read:predictions"
  ];
  const scope = encodeURIComponent(scopes.join(" "));
  
  // Use the session as state
  const state = session || 'default';
  const stateParam = encodeURIComponent(state);
  
  const twitchUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=${scope}&state=${stateParam}&force_verify=true`;
  
  console.log('Redirecting to Twitch with:');
  console.log('- Full URL:', twitchUrl);
  console.log('=== END DIRECT AUTH DEBUG ===');
  
  res.redirect(twitchUrl);
} 