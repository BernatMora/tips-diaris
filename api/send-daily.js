import webpush from 'web-push'
import Anthropic from '@anthropic-ai/sdk'
import { list, put, del } from '@vercel/blob'
import { CATEGORIES } from '../src/utils/categories.js'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
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

  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
  const prompt = category.prompts['intermediate']

  let tip
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })
    tip = message.content[0].text.trim()
  } catch (err) {
    console.error('Anthropic error:', err)
    return res.status(500).json({ error: 'Error generant el tip diari' })
  }

  const payload = JSON.stringify({
    title: `${category.icon} Tip de ${category.nom}`,
    body: tip,
    url: '/',
  })

  const validSubs = []
  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payload)
        validSubs.push(sub)
      } catch (err) {
        if (err.statusCode !== 410) validSubs.push(sub) // keep if not expired
        throw err
      }
    })
  )

  await saveSubscriptions(validSubs)

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.length - sent
  return res.status(200).json({ ok: true, sent, failed })
}
