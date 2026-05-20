import { CATEGORIES, buildPrompt } from '../src/utils/categories.js'

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Mètode no permès' })
  }

  const { categoryId, difficulty, topic } = req.body || {}

  const category = CATEGORIES.find((c) => c.id === categoryId)
  if (!category) {
    return res.status(400).json({ error: 'Categoria invàlida' })
  }

  const validDifficulties = ['basic', 'intermediate', 'advanced']
  if (!validDifficulties.includes(difficulty)) {
    return res.status(400).json({ error: 'Dificultat invàlida' })
  }

  const prompt = buildPrompt(category, difficulty, topic || null)

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await response.json()
    if (!response.ok || data.error) {
      console.error('OpenRouter API error:', JSON.stringify(data))
      return res.status(500).json({ error: 'Error de l\'API: ' + (data.error?.message || response.status) })
    }
    const tip = data.choices[0].message.content.trim()
    return res.status(200).json({ tip })
  } catch (err) {
    console.error('OpenRouter error:', err.message || err)
    return res.status(500).json({ error: 'Error generant el tip' })
  }
}
