import { put, list, del } from '@vercel/blob'

const BLOB_NAME = 'subscriptions.json'

async function getSubscriptions() {
  const { blobs } = await list({ prefix: BLOB_NAME })
  if (!blobs.length) return []
  const res = await fetch(blobs[0].url)
  return res.json()
}

async function saveSubscriptions(subs) {
  const { blobs } = await list({ prefix: BLOB_NAME })
  await Promise.all(blobs.map((b) => del(b.url)))
  await put(BLOB_NAME, JSON.stringify(subs), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Mètode no permès' })
  }

  const { subscription, categories } = req.body || {}
  if (!subscription?.endpoint) {
    return res.status(400).json({ error: 'Subscripció invàlida' })
  }

  const subs = await getSubscriptions()
  const idx = subs.findIndex((s) => s.endpoint === subscription.endpoint)
  const record = { ...subscription, ...(categories?.length ? { categories } : { categories: null }) }

  if (idx === -1) {
    subs.push(record)
  } else {
    subs[idx] = { ...subs[idx], ...record }
  }

  await saveSubscriptions(subs)

  return res.status(200).json({ ok: true, total: subs.length })
}
