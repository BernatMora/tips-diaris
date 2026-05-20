import webpush from 'web-push'
import { list, put, del } from '@vercel/blob'
import { CATEGORIES, buildPrompt } from '../src/utils/categories.js'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free'
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
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Mètode no permès' })
  }

  const subs = await getSubscriptions()
  if (!subs.length) {
    return res.status(200).json({ ok: true, sent: 0, message: 'Sense subscriptors' })
  }

  // Assign a random (allowed) category to each subscriber
  const subAssignments = subs.map((sub) => {
    const allowed = sub.categories?.length
      ? CATEGORIES.filter((c) => sub.categories.includes(c.id))
      : CATEGORIES
    const cat = allowed[Math.floor(Math.random() * allowed.length)]
    return { sub, cat }
  })

  // Generate one tip per unique category needed
  const catIds = [...new Set(subAssignments.map((a) => a.cat.id))]
  const tipByCategory = {}
  await Promise.all(
    catIds.map(async (catId) => {
      const cat = CATEGORIES.find((c) => c.id === catId)
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            max_tokens: 2048,
            messages: [{ role: 'user', content: buildPrompt(cat, 'intermediate') }],
          }),
        })
        const data = await response.json()
        tipByCategory[catId] = data.choices[0].message.content.trim()
      } catch (err) {
        console.error('Error generant tip per', catId, err)
      }
    })
  )

  const validSubs = []
  const results = await Promise.allSettled(
    subAssignments.map(async ({ sub, cat }) => {
      const tip = tipByCategory[cat.id]
      if (!tip) throw new Error(`Sense tip per ${cat.id}`)
      const payload = JSON.stringify({
        title: `${cat.icon} Tip de ${cat.nom}`,
        body: tip,
        url: '/',
      })
      try {
        await webpush.sendNotification(sub, payload)
        validSubs.push(sub)
      } catch (err) {
        if (err.statusCode !== 410) validSubs.push(sub)
        throw err
      }
    })
  )

  await saveSubscriptions(validSubs)

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.length - sent
  return res.status(200).json({ ok: true, sent, failed })
}
