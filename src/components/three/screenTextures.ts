import * as THREE from 'three'

/* ── shared helpers ───────────────────────────────────────────────────────── */

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return { canvas, ctx, texture }
}

/* ── code editor: types out a self-healing retry helper ────────────────────── */

const CODE = `// aerospike/withRetry.ts
export async function withRetry<T>(op: () => Promise<T>) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await op()
    } catch (err) {
      if (!isTransient(err) || attempt > MAX_RETRIES) throw err
      newrelic.recordCustomEvent('AerospikeRetry', { attempt })
      await client.reconnectIfNeeded()
      await sleep(backoff(attempt)) // 50ms → 800ms
    }
  }
}

// orders.service.ts
const order = await withRetry(() =>
  orders.upsert({ key: idempotencyKey, ...payload }),
)`

const KEYWORDS = new Set(['export', 'async', 'function', 'for', 'let', 'try', 'return', 'await', 'catch', 'if', 'throw', 'const'])

type Token = { text: string; color: string }
const C = {
  bg: '#0d1224',
  gutter: '#4b5675',
  text: '#d6deeb',
  keyword: '#e879f9',
  string: '#a3e635',
  comment: '#64748b',
  number: '#fbbf24',
  fn: '#22d3ee',
}

function tokenize(line: string): Token[] {
  const out: Token[] = []
  const commentAt = line.indexOf('//')
  const code = commentAt >= 0 ? line.slice(0, commentAt) : line
  const re = /('[^']*'|\d+(?:ms)?|[A-Za-z_]\w*|\s+|.)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(code))) {
    const t = m[0]
    let color = C.text
    if (t.startsWith("'")) color = C.string
    else if (/^\d/.test(t)) color = C.number
    else if (KEYWORDS.has(t)) color = C.keyword
    else if (/^[A-Za-z_]/.test(t) && code[re.lastIndex] === '(') color = C.fn
    out.push({ text: t, color })
  }
  if (commentAt >= 0) out.push({ text: line.slice(commentAt), color: C.comment })
  return out
}

const LINES = CODE.split('\n').map(tokenize)
const TOTAL_CHARS = CODE.length

export function createCodeScreen() {
  const W = 1024
  const H = 600
  const { ctx, texture } = makeCanvas(W, H)
  const fontSize = 22
  const lineH = 31
  ctx.font = `${fontSize}px "JetBrains Mono", ui-monospace, monospace`

  let shown = -1
  const draw = (t: number, animate: boolean) => {
    // ~38 chars/s, then hold 3s and loop
    const cycle = TOTAL_CHARS / 38 + 3
    const chars = animate ? Math.min(TOTAL_CHARS, Math.floor((t % cycle) * 38)) : TOTAL_CHARS
    const blink = Math.floor(t * 2) % 2 === 0
    const key = chars * 2 + (blink ? 1 : 0)
    if (key === shown) return
    shown = key

    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, W, H)
    // title bar
    ctx.fillStyle = '#151b33'
    ctx.fillRect(0, 0, W, 40)
    ;['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.arc(24 + i * 22, 20, 7, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.fillStyle = '#94a3b8'
    ctx.font = `600 17px "Inter", sans-serif`
    ctx.fillText('withRetry.ts — orders-platform', 104, 26)
    ctx.font = `${fontSize}px "JetBrains Mono", ui-monospace, monospace`

    let remaining = chars
    let cursor = { x: 70, y: 70 }
    LINES.forEach((tokens, i) => {
      const y = 70 + i * lineH
      ctx.fillStyle = C.gutter
      ctx.fillText(String(i + 1).padStart(2, ' '), 14, y)
      let x = 70
      for (const tok of tokens) {
        if (remaining <= 0) break
        const piece = tok.text.slice(0, remaining)
        ctx.fillStyle = tok.color
        ctx.fillText(piece, x, y)
        x += ctx.measureText(piece).width
        remaining -= piece.length
      }
      if (remaining > 0) remaining -= 1 // newline
      if (remaining >= 0) cursor = { x, y }
    })
    if (blink) {
      ctx.fillStyle = '#22d3ee'
      ctx.fillRect(cursor.x + 2, cursor.y - fontSize + 4, 11, fontSize + 2)
    }
    // status bar
    ctx.fillStyle = '#0e7490'
    ctx.fillRect(0, H - 30, W, 30)
    ctx.fillStyle = '#e0f2fe'
    ctx.font = `600 16px "JetBrains Mono", monospace`
    ctx.fillText('main  ✓ 0 errors   TypeScript   Ln 9, Col 42', 16, H - 10)
    ctx.font = `${fontSize}px "JetBrains Mono", ui-monospace, monospace`
    texture.needsUpdate = true
  }
  draw(0, false)
  return { texture, draw }
}

/* ── live orders dashboard ─────────────────────────────────────────────────── */

export function createDashboardScreen() {
  const W = 768
  const H = 480
  const { ctx, texture } = makeCanvas(W, H)
  const rps: number[] = Array.from({ length: 60 }, (_, i) => 0.55 + 0.2 * Math.sin(i / 5) + Math.random() * 0.1)
  let orders = 183_412
  let last = -1
  let flashUntil = 0

  const tile = (x: number, y: number, w: number, h: number, label: string, value: string, color: string) => {
    ctx.fillStyle = '#141a33'
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 12)
    ctx.fill()
    ctx.fillStyle = '#8b97b3'
    ctx.font = '600 16px "Inter", sans-serif'
    ctx.fillText(label, x + 16, y + 28)
    ctx.fillStyle = color
    ctx.font = '700 34px "Space Grotesk", "Inter", sans-serif'
    ctx.fillText(value, x + 16, y + 70)
  }

  const draw = (t: number, animate: boolean) => {
    const step = Math.floor(t * 4)
    if (step === last) return
    last = step
    if (animate) {
      orders += 2 + Math.floor(Math.random() * 6)
      rps.shift()
      rps.push(0.55 + 0.2 * Math.sin(step / 5) + Math.random() * 0.12)
    }
    ctx.fillStyle = '#0b1020'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#e2e8f0'
    ctx.font = '700 22px "Space Grotesk", "Inter", sans-serif'
    ctx.fillText('orders-platform · prod', 24, 40)
    ctx.fillStyle = '#28c840'
    ctx.beginPath()
    ctx.arc(W - 120, 33, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#86efac'
    ctx.font = '600 16px "Inter", sans-serif'
    ctx.fillText('healthy', W - 106, 39)

    const flash = performance.now() < flashUntil
    tile(24, 64, 230, 92, flash ? 'Order shipped! +1' : 'Orders today', orders.toLocaleString('en-US'), flash ? '#86efac' : '#22d3ee')
    tile(268, 64, 220, 92, 'p95 latency', `${280 + Math.round(Math.sin(step / 3) * 14)} ms`, '#e879f9')
    tile(502, 64, 242, 92, 'Services', '21 / 21 up', '#86efac')

    // requests/sec area chart
    const cx = 24
    const cy = 180
    const cw = W - 48
    const ch = H - cy - 28
    ctx.fillStyle = '#141a33'
    ctx.beginPath()
    ctx.roundRect(cx, cy, cw, ch, 12)
    ctx.fill()
    ctx.fillStyle = '#8b97b3'
    ctx.font = '600 16px "Inter", sans-serif'
    ctx.fillText('Requests / sec', cx + 16, cy + 28)
    const grad = ctx.createLinearGradient(0, cy + 40, 0, cy + ch)
    grad.addColorStop(0, 'rgba(34,211,238,0.55)')
    grad.addColorStop(1, 'rgba(34,211,238,0)')
    const px = (i: number) => cx + 12 + (i / (rps.length - 1)) * (cw - 24)
    const py = (v: number) => cy + ch - 14 - v * (ch - 60)
    ctx.beginPath()
    ctx.moveTo(px(0), cy + ch - 10)
    rps.forEach((v, i) => ctx.lineTo(px(i), py(v)))
    ctx.lineTo(px(rps.length - 1), cy + ch - 10)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()
    ctx.beginPath()
    rps.forEach((v, i) => (i ? ctx.lineTo(px(i), py(v)) : ctx.moveTo(px(i), py(v))))
    ctx.strokeStyle = '#22d3ee'
    ctx.lineWidth = 3
    ctx.stroke()
    texture.needsUpdate = true
  }
  /** a "ship order" interaction in the room bumps the live counter */
  const bump = () => {
    orders += 1
    flashUntil = performance.now() + 1600
    last = -1
  }
  draw(0, false)
  return { texture, draw, bump }
}

/* ── window: day sky or night sky with stars ───────────────────────────────── */

export function createSkyTexture(night: boolean) {
  const { canvas, ctx, texture } = makeCanvas(256, 256)
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  if (night) {
    g.addColorStop(0, '#060a1f')
    g.addColorStop(1, '#1b1f4a')
  } else {
    g.addColorStop(0, '#7cc4ff')
    g.addColorStop(1, '#d9f0ff')
  }
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  if (night) {
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.6})`
      ctx.fillRect(Math.random() * 256, Math.random() * 200, 2, 2)
    }
    ctx.fillStyle = '#fef9c3'
    ctx.beginPath()
    ctx.arc(190, 60, 18, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    for (const [x, y, r] of [
      [60, 80, 22],
      [85, 72, 26],
      [110, 84, 20],
      [180, 140, 18],
      [200, 132, 22],
    ]) {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  void canvas
  return texture
}

/* ── poster: initials card ────────────────────────────────────────────────── */

export function createPosterTexture(accent: string, accent2: string) {
  const { ctx, texture } = makeCanvas(256, 340)
  const g = ctx.createLinearGradient(0, 0, 256, 340)
  g.addColorStop(0, accent)
  g.addColorStop(1, accent2)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 340)
  ctx.fillStyle = 'rgba(11,16,32,0.85)'
  ctx.fillRect(14, 14, 228, 312)
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 96px "Space Grotesk", "Inter", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('SJ', 128, 170)
  ctx.font = '600 20px "JetBrains Mono", monospace'
  ctx.fillStyle = '#cbd5e1'
  ctx.fillText('{ full-stack }', 128, 220)
  ctx.fillText('about me →', 128, 290)
  return texture
}
