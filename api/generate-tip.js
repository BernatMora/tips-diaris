import { GoogleGenAI } from '@google/genai'
import { CATEGORIES, buildPrompt } from '../src/utils/categories.js'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY })

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
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })
    const tip = result.text.trim()
    return res.status(200).json({ tip })
  } catch (err) {
    console.error('Google AI error:', err.message || err)
    return res.status(500).json({ error: 'Error generant el tip' })
  }
}
