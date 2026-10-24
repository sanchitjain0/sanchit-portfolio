# Sanchit Jain — Portfolio

Full-stack engineer portfolio with interactive 3D scenes, a Claude-ready AI assistant and a light/dark theme.

- **Hero – 3D developer room**: drag to orbit (or use the ⟲ ⟳ buttons), objects glow on hover. The monitor types out code, the second screen is a live orders dashboard, the rack blinks. Click to fly the camera in and jump to a section: monitor → Projects, dashboard → Experience, rack → Architecture, bookshelf → Notes, poster → About, laptop → TagHawk, mug → Contact. The **floor lamp switches day/night**, the **boxes "ship an order"** (the dashboard counter ticks up) and the chair spins. Furniture props are downloaded CC0 models (see Credits).
- **TagHawk – 3D phone showcase**: a draggable phone runs the marketplace UI (community feed, anonymous chat, escrow checkout, movers), with the API call behind each screen. The feed data comes from `GET /taghawk/listings`.
- **Restaurant tech – 3D orders globe**: a dot-matrix globe facing MENA & Central Asia with order arcs from the Dubai hub and live order packets in brand colours. Orbiting CC0 food models (chicken, pizza, burger, fries, donut) and brand chips filter the orders; click a city for details. Brand **names and colours only, no logos**, plus a non-affiliation note.
- **Architecture – 3D board**: tiers laid out as lanes (clients → edge → services → events → consumers, data lane in front, observability behind) with arched connections and flowing packets; phones get a vertical layout. **Send a test order** calls `POST /demo/orders` and animates the returned trace.
- **Skills – 3D logo globe**: drag to spin; hovering a logo highlights the skill.
- **AI – orbit + "Ask my portfolio"**: AI tool logos orbit a core; the chat calls `POST /ai/ask`, which your backend answers with the Claude API (snippet in `docs/API.md`). Until then it answers locally from `portfolio.ts`.
- **Theme switch** in the navbar: follows the OS on first visit, then remembers the choice. Both 3D scenes re-light for the theme (night neon vs. daylight).
- Hidden terminal: press `~` (or the `~ $` button in the footer).

**Stack:** React 19 · Vite · TypeScript · Tailwind CSS v4 · three.js · React Three Fiber / drei · postprocessing · zustand

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build → dist/
npm run preview   # serve the production build
npm run lint
```

## Edit your content

Everything lives in **`src/data/portfolio.ts`**: profile, stats, about, skills, experience, projects (problem → what I did → impact), engineering notes, contact. Lines marked `VERIFY` are assumptions; fix or delete them.

The galaxy is described in **`src/data/architecture.ts`** (nodes, edges and the test-order path). Keep it high level; no internal details.

Replace `public/Sanchit_Jain_Resume.pdf` with your current resume (keep the file name or update `resumeUrl`).

## Theme colours

Defined once as CSS variables in `src/index.css` (`[data-theme='dark']` / `[data-theme='light']`) and exposed to Tailwind as `bg-bg`, `text-fg`, `text-accent`, `border-line`, etc. The 3D palettes are in `PALETTE` (`DevRoom.tsx`) and `KIND_COLORS` (`ServicesGalaxy.tsx`).

## Backend API

All network calls live in `src/lib/api.ts`; the contract is in **[docs/API.md](docs/API.md)**:
`GET /health`, `POST /contact`, `POST /demo/orders`, `POST /ai/ask`, `GET /taghawk/listings`.

Until the backend exists, `VITE_API_BASE_URL` is the placeholder `https://api.example.com/v1`. The UI then runs on built-in mock data and says "mock" next to each response. When the BE is deployed:

```bash
# .env (local) or Vercel → Settings → Environment Variables
VITE_API_BASE_URL=https://your-backend.example/v1
```

Requests time out after 4 s and fall back to the mock; 4xx responses are shown to the user (e.g. contact form validation).

## Deploy (Vercel, free Hobby plan) & CI

The pipeline: **push to GitHub → GitHub Actions runs lint + type-check + build → Vercel builds and deploys**.
Every pull request gets its own preview URL, and `main` goes to production.

1. Create an empty **public** repo on GitHub (no README), then:
   ```bash
   git remote add origin https://github.com/<you>/sanchit-portfolio.git
   git push -u origin main
   ```
2. On [vercel.com](https://vercel.com) → **Add New → Project → Import** the repo. Everything is read from `vercel.json` (Vite, `npm run build`, `dist`), so just click **Deploy**.
3. Later, when the backend exists: Vercel → Project → Settings → Environment Variables → `VITE_API_BASE_URL`, then redeploy.

Staying at $0:
- It's a static site with no serverless functions, so it uses no compute; Hobby includes 100 GB/month of bandwidth.
- Docs- or README-only commits skip the Vercel build (`ignoreCommand`) and the CI run (`paths-ignore`).
- Don't enable paid add-ons (Speed Insights / Web Analytics beyond the free tier, Pro trial).
- The Hobby plan is for personal, non-commercial use, which covers a portfolio.

Speed: hashed JS/CSS are cached for a year at Vercel's edge, the 3D models for a week, and every 3D scene is lazy-loaded.

## Performance & accessibility

- First load is React + page content (~85 KB gzip JS). three.js/R3F (~270 KB gzip) and the 36 KB meshopt-compressed props load after first paint; the phone, galaxy and logo globe load only when their section is near the viewport.
- Each 3D scene sits in an error boundary: if WebGL or a chunk fails it shows a fallback instead of breaking the page (and a failed chunk after a redeploy triggers one reload).
- If 3D ever stops loading during `npm run dev` after installing/removing packages, restart the dev server (Vite re-optimises dependencies).
- Each canvas stops rendering when it is off-screen or the tab is hidden. Phones/touch get no shadows and no bloom; `dpr` is capped.
- `prefers-reduced-motion`: no camera parallax or fly-ins, static screens and packets, no reveal animations.
- No WebGL: the hero shows a pre-rendered image of the room (`public/room-dark.png` / `room-light.png`), and the architecture section stays usable through its node buttons.
- Semantic landmarks, skip link, visible focus rings, an accessible theme switch (`role="switch"`), and every 3D interaction has a regular link/button equivalent.
- To re-render the fallback images after changing the room: run `npm run dev`, open `http://localhost:5173/?capture` (transparent page with only the room), and screenshot it in each theme.

## Credits

- Furniture props: [Kenney Furniture Kit](https://kenney.nl/assets/furniture-kit) (CC0), merged and meshopt-compressed into `public/models/props.glb` with glTF-Transform.
- Food models: [Kenney Food Kit](https://kenney.nl/assets/food-kit) (CC0) → `public/models/food.glb`.
- Tech & AI logos: [Simple Icons](https://simpleicons.org) (CC0), generated into `src/data/techIcons.ts` / `aiIcons.ts`. Logos are trademarks of their owners.
- Globe land dots: [Natural Earth](https://www.naturalearthdata.com) (public domain) via [world-atlas](https://github.com/topojson/world-atlas), generated into `src/data/landDots.ts`.
- Restaurant brand names belong to their owners; they're used only to describe client work.
