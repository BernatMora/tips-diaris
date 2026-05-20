import { put, list, del } from '@vercel/blob'

const BLOB_NAME = 'saved-tips.json'

async function loadTips() {
  const { blobs } = await list({ prefix: BLOB_NAME })
  if (!blobs.length) return []
  const res = await fetch(blobs[0].url)
  return res.json()
}

async function persistTips(tips) {
  const { blobs } = await list({ prefix: BLOB_NAME })
  await Promise.all(blobs.map((b) => del(b.url)))
  await put(BLOB_NAME, JSON.stringify(tips), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  })
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const tips = await loadTips()
    return res.status(200).json(tips)
  }

  if (req.method === 'POST') {
    const { action, tip, category, difficulty, id } = req.body || {}
    const tips = await loadTips()

    if (action === 'save') {
      if (!tip) return res.status(400).json({ error: 'Falta el tip' })
      const filtered = tips.filter((t) => t.tip !== tip)
      const entry = { id: Date.now(), tip, category, difficulty, date: new Date().toISOString() }
      const updated = [entry, ...filtered].slice(0, 50)
      await persistTips(updated)
      return res.status(200).json(updated)
    }

    if (action === 'remove') {
      if (!id) return res.status(400).json({ error: 'Falta el id' })
      const updated = tips.filter((t) => t.id !== id)
      await persistTips(updated)
      return res.status(200).json(updated)
    }

    if (action === 'clear') {
      await persistTips([])
      return res.status(200).json([])
    }

    return res.status(400).json({ error: 'Acció desconeguda' })
  }

  return res.status(405).json({ error: 'Mètode no permès' })
}
