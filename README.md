# Tips Diaris

PWA de tips diaris personalitzats amb IA en 15 categories. Construïda amb React + Vite i desplegada a Vercel.

## Característiques

- **15 categories**: Guitarra Elèctrica, Salut, Tecnologia, Huerto Ecològic, Estructures Metàl·liques, IA, Piano, Finances Personals, Cuina, Fitness, Fotografia, Productivitat, Idiomes, Disseny, Kitesurf
- **3 nivells de dificultat**: Bàsic, Intermedi, Avançat
- Temàtiques variades dins de cada categoria amb historial de tòpics vists (sense repetir fins a esgotar-los)
- Valoració de tips (m'agrada / no m'agrada) amb persistència local
- Tips desats al núvol (Vercel Blob) amb còpia local offline
- Notificacions push diàries (Vercel Cron) configurables per categoria
- PWA instal·lable a iOS i Android
- Mode offline: l'últim tip es guarda al localStorage, Service Worker amb cache d'offline
- Indicador visual de connexió offline
- Toast de confirmació per a accions (desar, valorar, compartir, esborrar)
- Categoria selector col·lapsable (mostra 6, "Mostra'n més" per a la resta)
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

**OPENROUTER_API_KEY** — Obtén-la a [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys)

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

### 4. (Opcional) Configurar Vercel Blob per a tips desats

Per persistir els tips desats al núvol, necessites un compte de Vercel i crear un token:

1. Ves a [vercel.com](https://vercel.com) → Storage → Create → Blob
2. Copia el `BLOB_READ_WRITE_TOKEN` al teu `.env.local`
3. El projecte ja inclou `@vercel/blob` com a dependència

> **Nota:** Sense Blob, els tips desats només es guarden localment al navegador.

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

- `OPENROUTER_API_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL`
- `BLOB_READ_WRITE_TOKEN` (per a persistència de tips desats)

### 4. Cron job

El fitxer `vercel.json` ja configura el cron per enviar el tip diari (a les 5:15 UTC i a les 19:00 UTC).  
Vercel crida `/api/send-daily` automàticament segons el schedule.

> **Nota sobre el pla de Vercel:** Els Cron Jobs requereixen el pla Pro o superior per a execucions diàries. Al pla gratuït, pots activar-los manualment des del dashboard o cridar `/api/send-daily` directament.

## Estructura del projecte

```
├── api/
│   ├── generate-tip.js      # Genera un tip amb OpenRouter
│   ├── subscribe.js         # Guarda subscripcions push
│   ├── saved-tips.js        # CRUD de tips desats (Vercel Blob)
│   ├── send-daily.js        # Cron: genera i envia el tip diari
│   └── vapid-public-key.js  # Retorna la clau VAPID pública
├── public/
│   ├── manifest.json        # Manifest de la PWA
│   ├── sw.js                # Service Worker (push + offline)
│   └── icons/               # Icones de l'app (192x192, 512x512)
├── src/
│   ├── components/
│   │   ├── CategorySelector.jsx   # Selector de categoria (col·lapsable)
│   │   ├── DifficultySelector.jsx # Selector de dificultat
│   │   ├── TipCard.jsx            # Targeta amb el tip i accions
│   │   ├── SavedTips.jsx          # Llista de tips desats
│   │   ├── NotificationSettings.jsx # Config. notificacions push
│   │   ├── InstallPrompt.jsx      # PWA install prompt
│   │   └── Toast.jsx              # Notificació emergent
│   ├── hooks/
│   │   ├── useOfflineStorage.js   # Cache local del darrer tip
│   │   ├── usePushNotifications.js # Gestió de notificacions push
│   │   ├── useSavedTips.js        # CRUD de tips desats (client)
│   │   ├── useTipRatings.js       # Valoracions de tips
│   │   └── useTopicHistory.js     # Historial de tòpics per evitar repeticions
│   ├── utils/
│   │   ├── api.js                 # Crides a l'API
│   │   ├── categories.js          # Categories, dificultats i tòpics
│   │   └── parseTip.js            # Parseig del text del tip (Consell, Exemple, Repte)
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── vercel.json
├── vite.config.js
└── README.md
```

## Icones

Afegeix les icones de l'app a `public/icons/`:
- `icon-192.png` (192×192 px)
- `icon-512.png` (512×512 px)

Pots generar-les a [realfavicongenerator.net](https://realfavicongenerator.net/).

## Nota sobre el model

Aquesta app utilitza `claude-sonnet-4-6` per defecte (model d'OpenRouter). Pots canviar-lo via la variable d'entorn `OPENROUTER_MODEL`.

## Persistència de subscripcions

Les subscripcions push es guarden en memòria. A Vercel, cada instància serverless pot tenir la seva pròpia còpia. Per a producció real, utilitza [Vercel KV](https://vercel.com/docs/storage/vercel-kv):

```bash
npm install @vercel/kv
```

I modifica `api/subscribe.js` i `api/send-daily.js` per llegir/escriure a `kv`.