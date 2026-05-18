# Tips Diaris

PWA de tips diaris personalitzats amb IA en 6 categories. Construïda amb React + Vite i desplegada a Vercel.

## Característiques

- 6 categories: Guitarra Elèctrica, Salut, Tecnologia, Huerto Ecològic, Estructures Metàl·liques, IA
- 3 nivells de dificultat: Bàsic, Intermedi, Avançat
- Notificacions push diàries a les 8:00h (Vercel Cron)
- PWA instal·lable a iOS i Android
- Mode offline amb l'últim tip guardat
- Tota la interfície en Català

## Configuració local

### 1. Instal·lar dependències

```bash
npm install
```

### 2. Variables d'entorn

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Omple les variables:

**ANTHROPIC_API_KEY** — Obtén-la a [console.anthropic.com](https://console.anthropic.com/)

**Claus VAPID** — Genera-les amb:

```bash
npx web-push generate-vapid-keys
```

Copia la clau pública a `VAPID_PUBLIC_KEY` i la privada a `VAPID_PRIVATE_KEY`.  
Posa el teu email a `VAPID_EMAIL` (format: `mailto:email@exemple.com`).

### 3. Arrancar en mode desenvolupament

```bash
npm run dev
```

## Desplegament a Vercel

### 1. Instal·lar Vercel CLI

```bash
npm i -g vercel
```

### 2. Desplegar

```bash
vercel
```

### 3. Afegir variables d'entorn

Al dashboard de Vercel → Settings → Environment Variables, afegeix:

- `ANTHROPIC_API_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL`

### 4. Cron job

El fitxer `vercel.json` ja configura el cron per enviar el tip diari a les 8:00h UTC.  
Vercel crida `/api/send-daily` automàticament cada dia.

> **Nota sobre el pla de Vercel:** Els Cron Jobs requereixen el pla Pro o superior per a execucions diàries. Al pla gratuït, pots activar-los manualment des del dashboard o cridar `/api/send-daily` directament.

## Estructura del projecte

```
├── api/
│   ├── generate-tip.js      # Genera un tip amb Claude
│   ├── subscribe.js         # Guarda subscripcions push
│   ├── send-daily.js        # Cron: genera i envia el tip diari
│   └── vapid-public-key.js  # Retorna la clau VAPID pública
├── public/
│   ├── manifest.json        # Manifest de la PWA
│   ├── sw.js                # Service Worker (push + offline)
│   └── icons/               # Icones de l'app (192x192, 512x512)
├── src/
│   ├── components/          # Components React
│   ├── hooks/               # Hooks personalitzats
│   ├── utils/               # Utilitats (categories, api)
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── vercel.json
└── vite.config.js
```

## Icones

Afegeix les icones de l'app a `public/icons/`:
- `icon-192.png` (192×192 px)
- `icon-512.png` (512×512 px)

Pots generar-les a [realfavicongenerator.net](https://realfavicongenerator.net/).

## Nota sobre el model

Aquesta app utilitza `claude-sonnet-4-6`. L'alias `claude-sonnet-4-20250514` que potser has vist en documentació antiga es retirarà el 15 de juny del 2026.

## Persistència de subscripcions

Les subscripcions push es guarden en memòria. A Vercel, cada instància serverless pot tenir la seva pròpia còpia. Per a producció real, utilitza [Vercel KV](https://vercel.com/docs/storage/vercel-kv):

```bash
npm install @vercel/kv
```

I modifica `api/subscribe.js` i `api/send-daily.js` per llegir/escriure a `kv`.
