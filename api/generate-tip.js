import Anthropic from '@anthropic-ai/sdk'
import { CATEGORIES } from '../src/utils/categories.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Mètode no permès' })
  }

  const { categoryId, difficulty } = req.body || {}

  const category = CATEGORIES.find((c) => c.id === categoryId)
  if (!category) {
    return res.status(400).json({ error: 'Categoria invàlida' })
  }

  const validDifficulties = ['basic', 'intermediate', 'advanced']
  if (!validDifficulties.includes(difficulty)) {
    return res.status(400).json({ error: 'Dificultat invàlida' })
  }

  const prompt = category.prompts[difficulty]

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const tip = message.content[0].text.trim()
    return res.status(200).json({ tip })
  } catch (err) {
    console.error('Anthropic error:', err)
    return res.status(500).json({ error: 'Error generant el tip' })
  }
}
