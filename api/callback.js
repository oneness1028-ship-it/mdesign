export default async function handler(req, res) {
  const { code } = req.query
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host  = req.headers.host

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id:     process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri:  `${proto}://${host}/api/callback`,
      }),
    })
    const data = await tokenRes.json()

    if (!data.access_token) {
      res.status(400).send('認証に失敗しました: ' + JSON.stringify(data))
      return
    }

    const token = JSON.stringify(data.access_token)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(`<!DOCTYPE html><html><body><script>
      (function() {
        var token = ${token};
        function cb(e) {
          window.opener.postMessage(
            'authorization:github:success:' + JSON.stringify({ token: token, provider: 'github' }),
            e.origin
          );
        }
        window.addEventListener('message', cb, false);
        window.opener.postMessage('authorizing:github', '*');
      })();
    <\/script></body></html>`)
  } catch (err) {
    res.status(500).send('サーバーエラー: ' + err.message)
  }
}
