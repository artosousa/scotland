# Scotland Trip Itinerary

Shared trip calendar deployed on Netlify with **Netlify Functions + Blobs** for storage.

## Features

- Calendar and list views
- Drag-and-drop reorder (with edit key)
- Add / remove events (with edit key)
- Changes saved for everyone via Netlify Blobs
- Auto-refresh every 30s when someone else updates

## Deploy on Netlify

1. Push this repo to GitHub (or connect the folder in Netlify).
2. Netlify will detect `netlify.toml` — no build command needed.
3. In **Site settings → Environment variables**, add:
   - `EDIT_KEY` — a secret password for editing (e.g. a long random string)
4. Deploy.

## URLs

- **View only:** `https://your-site.netlify.app/`
- **Edit mode:** `https://your-site.netlify.app/?edit=YOUR_EDIT_KEY`

Share the view URL with everyone. Only share the edit URL with people who should rearrange or add events.

## Local development

```bash
npm install
npx netlify dev
```

Open `http://localhost:8888`. Set `EDIT_KEY` in a `.env` file or pass it when running:

```bash
EDIT_KEY=your-secret npx netlify dev
```

Then visit `http://localhost:8888/?edit=your-secret`.

## API

- `GET /api/itinerary` — load itinerary (returns default on first visit)
- `PUT /api/itinerary` — save itinerary (requires `X-Edit-Key` header when `EDIT_KEY` is set)

## Files

| File | Purpose |
|------|---------|
| `index.html` | Frontend |
| `data/default-itinerary.json` | Seed data / reset source |
| `netlify/functions/itinerary.mjs` | API + Blobs read/write |
| `netlify.toml` | Netlify config |
