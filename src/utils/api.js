export async function generateTip(categoryId, difficulty) {
  const res = await fetch('/api/generate-tip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categoryId, difficulty }),
  })
  if (!res.ok) throw new Error('Error generant el tip')
  const data = await res.json()
  return data.tip
}

export async function getVapidPublicKey() {
  const res = await fetch('/api/vapid-public-key')
  if (!res.ok) throw new Error('Error obtenint la clau VAPID')
  const data = await res.json()
  return data.publicKey
}

export async function saveSubscription(subscription) {
  const res = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription }),
  })
  if (!res.ok) throw new Error('Error desant la subscripció')
  return res.json()
}

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}
