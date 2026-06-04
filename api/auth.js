export default function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host  = req.headers.host
  const params = new URLSearchParams({
    client_id:    process.env.GITHUB_CLIENT_ID,
    redirect_uri: `${proto}://${host}/api/callback`,
    scope:        'repo,user',
  })
  res.redirect(`https://github.com/login/oauth/authorize?${params}`)
}
