const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Mètode no permès' })
  }

  const { tip, category, difficulty } = req.body || {}
  if (!tip || !category) {
    return res.status(400).json({ error: 'Falten dades: tip i category són obligatoris' })
  }

  const difficultyLabel = { basic: 'Bàsic', intermediate: 'Intermedi', advanced: 'Avançat' }[difficulty] || difficulty

  const prompt = `Ets un expert en ${category.nom} i un divulgador excepcional.

Un usuari ha rebut aquest consell (nivell ${difficultyLabel}):

"${tip}"

Ara explica-li en profunditat. Fes un article breu en Català amb aquestes seccions (respon només amb el format exacte, sense text addicional):

**Per què funciona:** [Explica la ciència, tècnica o principi darrere del consell en 3-5 frases. Dóna context i fonament.]

**Com aplicar-ho pas a pas:** [Guia detallada en 3-5 passos concrets i accionables]

**Errors comuns:** [Descriu 2-3 errors que la gent sol cometre i com evitar-los]

**Per aprendre'n més:** [Recomana 1-2 recursos concrets (llibres, canals, cursos, eines) per aprofundir en el tema]`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await response.json()
    if (!response.ok || data.error) {
      console.error('OpenRouter API error:', JSON.stringify(data))
      return res.status(500).json({ error: 'Error de l\'API: ' + (data.error?.message || response.status) })
    }
    const explanation = data.choices[0].message.content.trim()
    return res.status(200).json({ explanation })
  } catch (err) {
    console.error('OpenRouter error:', err.message || err)
    return res.status(500).json({ error: 'Error generant l\'explicació' })
  }
}