let tokens = {};

export default async function handler(req, res) {
  const { code, state: session } = req.query;

  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: process.env.REDIRECT_URI,
  });

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  const data = await response.json();

  if (data.access_token) {
    tokens[session] = data;
    res.send("✅ Twitch login successful! You can close this tab.");
  } else {
    res.status(400).send("❌ Login failed.");
  }
}

export { tokens };
