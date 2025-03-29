export default function handler(req, res) {
    const { session } = req.query;
  
    const clientId = process.env.TWITCH_CLIENT_ID;
    const redirect = encodeURIComponent(process.env.REDIRECT_URI);
    const scope = encodeURIComponent("user:read:email");
  
    const twitchUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=${scope}&state=${session}`;
  
    res.status(200).send("Start Twitch Auth endpoint is live!");
    res.redirect(twitchUrl);
  }
  