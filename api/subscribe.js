// In-memory storage — resets on cold start.
// For production, replace with Vercel KV: https://vercel.com/docs/storage/vercel-kv
const subscriptions = []

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Mètode no permès' })
  }

  const { subscription } = req.body || {}
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Subscripció invàlida' })
  }

  // Avoid duplicates
  const exists = subscriptions.some((s) => s.endpoint === subscription.endpoint)
  if (!exists) {
    subscriptions.push(subscription)
  }

  return res.status(200).json({ ok: true, total: subscriptions.length })
}

export { subscriptions }
