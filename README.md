# sanchit-portfolio

My personal site: https://sanchit-portfolio-chi.vercel.app

I'm a backend engineer (Node.js, TypeScript, microservices), so I wanted the portfolio to show some of that instead of being another list of cards. A few things on it:

- a small 3D room in the hero you can drag around. Clicking things in the room takes you to sections (monitor → projects, server rack → architecture, etc.), the floor lamp switches dark/light mode and the boxes "ship" an order on the dashboard screen
- a 3D globe with the markets I work on (restaurant ordering in MENA and Central Asia)
- an architecture board of the kind of ordering platform I work on, where you can send a fake order through the services and watch it move
- a phone mock-up for TagHawk, one of my older projects
- an "ask my portfolio" chat, a guestbook, likes on projects and a hidden terminal (press `~`)

Everything that needs a server talks to my other repo, [portfolio-api](https://github.com/sanchitjain0/portfolio-api). If that API is asleep or not configured, the site falls back to local data so nothing breaks.

## Stack

React 19, TypeScript, Vite, Tailwind v4, three.js with React Three Fiber/drei, zustand. Hosted on Vercel, CI on GitHub Actions.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

To point it at the API, create `.env` with:

```
VITE_API_BASE_URL=http://localhost:8080/v1
```

Without that variable it uses a placeholder URL and mock responses, which is fine for working on the UI.

## Where to change things

- `src/data/portfolio.ts`: all the text (profile, experience, projects, skills). I keep it in sync with my resume.
- `src/data/architecture.ts`: nodes and connections for the architecture board.
- `src/index.css`: colours for both themes (CSS variables at the top).
- `public/Sanchit_Jain_Resume.pdf`: the resume behind the download button.

The 3D bits live in `src/components/three/`. Each scene is lazy loaded and only renders while it's on screen, so the first load stays small (around 85 KB of JS before three.js comes in).

## Deploying

Vercel picks up `vercel.json`, so importing the repo is enough. Pushes to `main` go to production and PRs get preview links. The only environment variable is `VITE_API_BASE_URL`, pointing at the Render URL of portfolio-api, e.g. `https://<service>.onrender.com/v1`.

## Credits

- Furniture and food models from [Kenney](https://kenney.nl) (CC0)
- Tech logos from [Simple Icons](https://simpleicons.org) (CC0); the logos belong to their owners
- Globe outlines from [Natural Earth](https://www.naturalearthdata.com) via world-atlas (public domain)
- Restaurant brand names are used only to describe client work. This site isn't affiliated with any of them.
