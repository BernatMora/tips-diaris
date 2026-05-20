const SECTIONS = [
  { key: 'consell', marker: '**Consell:**' },
  { key: 'exemple', marker: '**Exemple pràctic:**' },
  { key: 'repte', marker: '**Repte del dia:**' },
]

export function parseTip(raw) {
  const indices = SECTIONS.map(({ marker }) => raw.indexOf(marker))
  if (indices.some((i) => i === -1)) return { plain: raw }

  return SECTIONS.reduce((acc, { key, marker }, i) => {
    const start = indices[i] + marker.length
    const end = i + 1 < SECTIONS.length ? indices[i + 1] : raw.length
    acc[key] = raw.slice(start, end).trim()
    return acc
  }, {})
}
