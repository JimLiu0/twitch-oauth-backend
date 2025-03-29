export default function handler(req, res) {
  return res.send(`
    <html>
      <head>
        <title>Retrieve Twitch Tokens</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; }
          h1 { color: #9147ff; }
          .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .button { display: inline-block; background: #9147ff; color: white; padding: 10px 20px; 
                   text-decoration: none; border-radius: 5px; border: none; cursor: pointer; font-size: 16px; }
          .result { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px; 
                   white-space: pre-wrap; word-break: break-all; }
          .input { padding: 10px; font-size: 16px; border-radius: 5px; border: 1px solid #ddd; width: 100%; box-sizing: border-box; }
          .row { display: flex; margin-bottom: 10px; }
          .row .input { flex: 1; margin-right: 10px; }
          .hidden { display: none; }
          .success { color: green; font-weight: bold; }
          .error { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Retrieve Your Twitch Tokens</h1>
          
          <div class="card">
            <h2>Option 1: Retrieve from Browser Storage</h2>
            <p>Enter the session ID you used during authentication:</p>
            <div class="row">
              <input type="text" id="session-id" class="input" placeholder="e.g., test123" />
              <button onclick="retrieveFromStorage()" class="button">Retrieve</button>
            </div>
            <div id="storage-result" class="result hidden"></div>
          </div>
          
          <div class="card">
            <h2>Option 2: Upload Token File</h2>
            <p>If you downloaded the token file, upload it here:</p>
            <input type="file" id="token-file" accept=".json" />
            <button onclick="loadFromFile()" class="button">Load File</button>
            <div id="file-result" class="result hidden"></div>
          </div>
          
          <div class="card">
            <h2>Option 3: Paste Token JSON</h2>
            <p>Paste the JSON content of your token:</p>
            <textarea id="token-json" class="input" style="height: 100px;" placeholder='{"access_token": "your_token_here", ...}'></textarea>
            <button onclick="parseJson()" class="button">Parse JSON</button>
            <div id="json-result" class="result hidden"></div>
          </div>
          
          <div id="token-display" class="hidden card">
            <h2>Your Token Information</h2>
            <div id="token-details"></div>
            <p>Use this token in your application to authenticate with Twitch's API.</p>
          </div>
        </div>
        
        <script>
          function retrieveFromStorage() {
            const sessionId = document.getElementById('session-id').value.trim();
            if (!sessionId) {
              alert('Please enter a session ID');
              return;
            }
            
            try {
              const storageKey = 'twitch_tokens_' + sessionId;
              const storedData = localStorage.getItem(storageKey);
              
              if (!storedData) {
                document.getElementById('storage-result').innerHTML = 
                  '<span class="error">❌ No tokens found for this session ID</span>';
                document.getElementById('storage-result').classList.remove('hidden');
                return;
              }
              
              const tokenData = JSON.parse(storedData);
              displayTokenData(tokenData);
              
              document.getElementById('storage-result').innerHTML = 
                '<span class="success">✅ Tokens retrieved successfully!</span>';
              document.getElementById('storage-result').classList.remove('hidden');
            } catch (e) {
              document.getElementById('storage-result').innerHTML = 
                '<span class="error">❌ Error: ' + e.message + '</span>';
              document.getElementById('storage-result').classList.remove('hidden');
            }
          }
          
          function loadFromFile() {
            const fileInput = document.getElementById('token-file');
            const file = fileInput.files[0];
            
            if (!file) {
              alert('Please select a file');
              return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
              try {
                const content = e.target.result;
                const tokenData = JSON.parse(content);
                displayTokenData(tokenData);
                
                document.getElementById('file-result').innerHTML = 
                  '<span class="success">✅ File loaded successfully!</span>';
                document.getElementById('file-result').classList.remove('hidden');
              } catch (e) {
                document.getElementById('file-result').innerHTML = 
                  '<span class="error">❌ Error parsing file: ' + e.message + '</span>';
                document.getElementById('file-result').classList.remove('hidden');
              }
            };
            
            reader.readAsText(file);
          }
          
          function parseJson() {
            const jsonInput = document.getElementById('token-json').value.trim();
            if (!jsonInput) {
              alert('Please enter JSON data');
              return;
            }
            
            try {
              const tokenData = JSON.parse(jsonInput);
              displayTokenData(tokenData);
              
              document.getElementById('json-result').innerHTML = 
                '<span class="success">✅ JSON parsed successfully!</span>';
              document.getElementById('json-result').classList.remove('hidden');
            } catch (e) {
              document.getElementById('json-result').innerHTML = 
                '<span class="error">❌ Error parsing JSON: ' + e.message + '</span>';
              document.getElementById('json-result').classList.remove('hidden');
            }
          }
          
          function displayTokenData(data) {
            document.getElementById('token-display').classList.remove('hidden');
            
            // Format the expiration time
            let expiryDate = 'Unknown';
            if (data.expires_in) {
              const expiryTimestamp = new Date().getTime() + (data.expires_in * 1000);
              expiryDate = new Date(expiryTimestamp).toLocaleString();
            }
            
            let html = '<table style="width:100%; border-collapse: collapse;">';
            html += '<tr><th style="text-align:left; padding:8px; border-bottom:1px solid #ddd;">Property</th><th style="text-align:left; padding:8px; border-bottom:1px solid #ddd;">Value</th></tr>';
            
            if (data.access_token) {
              html += '<tr><td style="padding:8px; border-bottom:1px solid #ddd;"><strong>Access Token</strong></td>';
              html += '<td style="padding:8px; border-bottom:1px solid #ddd;"><code>' + data.access_token + '</code></td></tr>';
            }
            
            if (data.refresh_token) {
              html += '<tr><td style="padding:8px; border-bottom:1px solid #ddd;"><strong>Refresh Token</strong></td>';
              html += '<td style="padding:8px; border-bottom:1px solid #ddd;"><code>' + data.refresh_token + '</code></td></tr>';
            }
            
            if (data.expires_in) {
              html += '<tr><td style="padding:8px; border-bottom:1px solid #ddd;"><strong>Expires In</strong></td>';
              html += '<td style="padding:8px; border-bottom:1px solid #ddd;">' + data.expires_in + ' seconds (approximately ' + expiryDate + ')</td></tr>';
            }
            
            if (data.token_type) {
              html += '<tr><td style="padding:8px; border-bottom:1px solid #ddd;"><strong>Token Type</strong></td>';
              html += '<td style="padding:8px; border-bottom:1px solid #ddd;">' + data.token_type + '</td></tr>';
            }
            
            if (data.scope) {
              html += '<tr><td style="padding:8px; border-bottom:1px solid #ddd;"><strong>Scope</strong></td>';
              html += '<td style="padding:8px; border-bottom:1px solid #ddd;">' + data.scope + '</td></tr>';
            }
            
            html += '</table>';
            
            document.getElementById('token-details').innerHTML = html;
          }
          
          // Try to auto-check for token in URL
          window.onload = function() {
            const urlParams = new URLSearchParams(window.location.search);
            const sessionId = urlParams.get('session');
            if (sessionId) {
              document.getElementById('session-id').value = sessionId;
              retrieveFromStorage();
            }
          };
        </script>
      </body>
    </html>
  `);
} 