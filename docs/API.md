# Portfolio API contract

Implemented in the companion repo **portfolio-api** (Fastify + MongoDB, deployed on Render). The `/ai/ask` endpoint answers from a knowledge base managed in its admin dashboard; the Claude snippet at the bottom is an optional future upgrade.

The frontend calls these endpoints on `VITE_API_BASE_URL` (default placeholder `https://api.example.com/v1`).
While the URL is the placeholder, or a request fails or times out, the UI falls back to built-in mock data and shows a small **mock** badge. Any 4xx response is shown to the user as a real error.

All bodies are JSON. Errors use `{ "error": { "code": "VALIDATION_ERROR", "message": "…" } }`.
CORS must allow the site origin (e.g. `https://your-domain.vercel.app`) for `GET, POST` with `Content-Type`.

| Method | Path | Used by | Request | Response `200/201` |
| --- | --- | --- | --- | --- |
| `GET` | `/health` | Footer status dot | – | `{ "status": "ok", "version": "1.0.0", "uptimeSec": 1234 }` |
| `POST` | `/contact` | Contact form | `{ "name": "Jane", "email": "jane@co.com", "message": "Hi…" }` | `201 { "id": "msg_123", "receivedAt": "2026-10-23T10:00:00Z" }` |
| `POST` | `/demo/orders` | Architecture → "Send a test order" | `{ "source": "kiosk", "city": "Almaty" }` | `201 { "orderId": "ord_123", "status": "PAID", "trace": [{ "service": "gateway", "message": "rate limit ok", "ms": 3 }] }` |
| `POST` | `/ai/ask` | AI section → "Ask my portfolio" | `{ "question": "What is his stack?", "history": [{ "role": "user", "content": "…" }] }` | `{ "answer": "…", "model": "claude-opus-5-5" }` |
| `GET` | `/public/config` | Hero availability, "now →" line, top banner | – | `{ "available": true, "availabilityText": "…", "currentlyWorkingOn": "…", "banner": { "text": "…", "link": null } \| null, "guestbookEnabled": true }` |
| `GET` / `POST` | `/guestbook` | Guestbook section | `{ "name": "Ana", "message": "Nice site!" }` | `{ "items": [{ "id", "name", "message", "createdAt" }] }` / `201 { "status": "pending" }` |
| `GET` / `POST` | `/reactions` | ❤ buttons on projects | `{ "project": "taghawk" }` (toggle) | `{ "counts": { "taghawk": 3 }, "mine": ["taghawk"] }` / `{ "project", "liked", "count" }` |
| `POST` | `/events` | Anonymous analytics | `{ "type": "page_view" \| "section_view" \| "resume_download" \| "theme_toggle" \| "room_click" \| "outbound_click", "label"?, "path"?, "referrer"?, "device"? }` | `202` |
| `GET` | `/taghawk/listings?community=…&limit=4` | TagHawk showcase phone | – | `{ "items": [{ "id": "l1", "title": "IKEA desk", "price": 45, "currency": "USD", "community": "Boston University" }] }` |

`trace[].service` should be one of the node ids in `src/data/architecture.ts`
(`kiosk, web, gateway, cart, order, payment, kafka, rabbit, pos, delivery, menu, tenant, aerospike, mongo, redis, observe`) so the 3D graph can animate the packet along the path.

### Suggested validation for `/contact`

- `name`: 2–80 chars · `email`: valid address · `message`: 10–5000 chars
- Rate limit per IP (e.g. 5/hour) and return `429` with an error message.
- Reject bodies with an extra `website` field. That's the honeypot.

### Switching the frontend to the real API

```bash
# .env (local) – or Vercel → Settings → Environment Variables
VITE_API_BASE_URL=https://your-backend.example/v1
```

No code changes are needed. Rebuild and redeploy.

### Implementing `POST /ai/ask` with the Claude API (Node.js / TypeScript)

Keep the API key on the server (`ANTHROPIC_API_KEY`); the browser only talks to your backend.

```ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic() // reads ANTHROPIC_API_KEY

// Put your portfolio facts here (or load portfolio.ts as JSON). Stable text first, so it caches.
const SYSTEM = `You answer questions about Sanchit Jain's portfolio for recruiters.
Only use the facts below. If something isn't covered, say so and suggest emailing sanchitj439@gmail.com.
Keep answers under 80 words.

<facts>
...portfolio data...
</facts>`

export async function ask(question: string, history: Anthropic.MessageParam[] = []) {
  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    output_config: { effort: 'low' }, // short chat answers: low effort is fast and cheap
    cache_control: { type: 'ephemeral' }, // cache the long system prompt
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default', // if a request is declined, the API retries on a fallback model
    system: SYSTEM,
    messages: [...history.slice(-6), { role: 'user', content: question }],
  })
  if (response.stop_reason === 'refusal') return { answer: "I can't help with that one.", model: response.model }
  const text = response.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('')
  return { answer: text, model: response.model }
}
```

Validate `question` (1–500 chars), rate limit per IP (e.g. 20/hour), and return `{ answer, model }`.
