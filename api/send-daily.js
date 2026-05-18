import webpush from 'web-push'
import Anthropic from '@anthropic-ai/sdk'
import { CATEGORIES } from '../src/utils/categories.js'
import { subscriptions } from './subscribe.js'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  // Vercel cron sends GET; allow GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Mètode no permès' })
  }

  if (!subscriptions.length) {
    return res.status(200).json({ ok: true, sent: 0, message: 'Sense subscriptors' })
  }

  // Pick a random category and intermediate difficulty for the daily tip
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
  const difficulty = 'intermediate'
  const prompt = category.prompts[difficulty]

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

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(sub, payload).catch((err) => {
        // Remove invalid subscriptions (410 Gone)
        if (err.statusCode === 410) {
          const idx = subscriptions.indexOf(sub)
          if (idx !== -1) subscriptions.splice(idx, 1)
        }
        throw err
      })
    )
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.length - sent

  return res.status(200).json({ ok: true, sent, failed })
}
