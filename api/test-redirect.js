export default function handler(req, res) {
  const redirectUri = process.env.REDIRECT_URI;
  const host = req.headers.host || 'unknown';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const currentUrl = `${protocol}://${host}`;
  const correctRedirectUri = `${currentUrl}/api/callback`;
  const spaceInUrl = redirectUri.includes(' ');
  const trailingSpace = redirectUri.trim() !== redirectUri;
  
  return res.send(`
    <html>
      <head>
        <title>Redirect URI Test</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .section { margin-bottom: 30px; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
          .code { font-family: monospace; background: #f0f0f0; padding: 10px; border-radius: 5px; word-break: break-all; }
          .warning { color: orange; font-weight: bold; }
          .error { color: red; font-weight: bold; }
          .success { color: green; font-weight: bold; }
          .important { font-weight: bold; border: 1px solid #ccc; padding: 15px; margin: 15px 0; }
          .character { display: inline-block; padding: 2px 5px; margin: 1px; background: #eee; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <h1>Redirect URI Test</h1>
        
        <div class="section important">
          <h2>1. Current Redirect URI</h2>
          <p>Your current REDIRECT_URI environment variable is:</p>
          <div class="code">${redirectUri}</div>
          
          <p>Character by character analysis:</p>
          <div>
            ${[...redirectUri].map(char => {
              const code = char.charCodeAt(0);
              return `<span class="character" title="Character code: ${code}">${char === ' ' ? '␣' : char} (${code})</span>`;
            }).join('')}
          </div>
          
          ${spaceInUrl ? '<p class="error">⚠️ Space detected in URL! This can cause issues.</p>' : ''}
          ${trailingSpace ? '<p class="error">⚠️ Trailing or leading spaces detected! This can cause issues.</p>' : ''}
          
          <h2>2. Recommended Redirect URI</h2>
          <p>Based on your current request, the recommended redirect URI is:</p>
          <div class="code">${correctRedirectUri}</div>
          
          <p class="${redirectUri === correctRedirectUri ? 'success' : 'error'}">
            ${redirectUri === correctRedirectUri ? 
              '✅ Your redirect URI matches the recommended value!' : 
              '❌ Your redirect URI does not match the recommended value!'}
          </p>

          <h2>3. Fix Instructions</h2>
          <p>If you're seeing a mismatch:</p>
          <ol>
            <li>Go to <a href="https://vercel.com/dashboard" target="_blank">Vercel Dashboard</a></li>
            <li>Select your project (twitch-oauth-backend)</li>
            <li>Go to Settings > Environment Variables</li>
            <li>Update the REDIRECT_URI value to exactly: <strong>${correctRedirectUri}</strong></li>
            <li>Also make sure your Twitch Developer Console has the exact same URL</li>
          </ol>
          
          <h2>4. Test Your Fix</h2>
          <p>After updating, try the authentication again:</p>
          <p><a href="/api/start-twitch-auth?session=test123">Start Auth Flow</a></p>
        </div>
      </body>
    </html>
  `);
} 