import { useEffect, useMemo, useState, type CSSProperties } from 'react'

const COLS = 32
const LAYERS = 8
const PER_LAYER = 4
const EPOCHS = 10
const BLANK = '    '
const TICK_MS = 130
const STEP_DIV = 3
const TIME_SCALE = 0.0025
const FOUND_TICK = (EPOCHS - 1) * 2 * LAYERS * STEP_DIV
const PILE_AT = 80
const FLAT_AT = 3200
const DATA_AT = 5200
const DOC_COUNT = 72
const TITLE_LINES = ['FINDING THE PATTERN']
const GLYPH_ROWS = 6
const LINE_PITCH = 6
const CELL_W = 12
const CELL_H = 22

type Stage = 'empty' | 'pile' | 'flat' | 'data'

function hash(a: number, b: number, c: number) {
  let h = (a * 374761393 + b * 668265263 + c * 1442695041) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function docsPile(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const r = (k: number) => hash(i, k, 31)
    return {
      left: -4 + r(1) * 98,
      top: -8 + r(2) * 96,
      rot: (r(3) - 0.5) * 50,
      dx: (r(4) - 0.5) * 30,
      dy: -40 - r(5) * 80,
      order: r(6),
      w1: Math.round(60 + r(7) * 40),
      w2: Math.round(40 + r(8) * 50),
      w3: Math.round(70 + r(9) * 30),
    }
  })
}

function suckedIn(d: { left: number; top: number; rot: number }) {
  const x = `calc(${50 - d.left}vw - 3.75vw)`
  const y = `calc(${50 - d.top}vh - 5.2vw)`
  return `translate(${x}, ${y}) rotate(${d.rot * 2}deg) scale(0.03)`
}

function docStyle(d: ReturnType<typeof docsPile>[number], stage: Stage): CSSProperties {
  let transform: string
  let opacity: number
  let delay: number
  let fade: number
  if (stage === 'empty') {
    transform = `translate(${d.dx}px, ${d.dy}px) rotate(${d.rot * 1.4}deg) scale(1.15)`
    opacity = 0
    delay = 0
    fade = 0
  } else if (stage === 'pile') {
    transform = `rotate(${d.rot}deg)`
    opacity = 1
    delay = d.order * 2.2
    fade = delay
  } else if (stage === 'flat') {
    transform = suckedIn(d)
    opacity = 1
    delay = d.order * 0.5
    fade = 0
  } else {
    transform = suckedIn(d)
    opacity = 0
    delay = 0
    fade = 0
  }
  return {
    left: `${d.left}%`,
    top: `${d.top}%`,
    transform,
    opacity,
    transition: `transform 1.3s cubic-bezier(0.7, 0, 0.2, 1) ${delay}s, opacity 0.7s ease ${fade}s`,
  }
}

function target(u: number, v: number, t: number) {
  const g = (cx: number, cy: number, s: number) =>
    Math.exp(-(((u - cx) * 1.8) ** 2 + (v - cy) ** 2) / s)
  const c1 = g(0.2 + 0.1 * Math.sin(t * 1.3), 0.3 + 0.1 * Math.cos(t), 0.007)
  const c2 = g(0.66 + 0.08 * Math.cos(t * 0.9), 0.22 + 0.08 * Math.sin(t * 1.7), 0.005)
  const c3 = g(0.45 + 0.12 * Math.sin(t * 0.7), 0.68 + 0.08 * Math.cos(t * 1.1), 0.009)
  const ry = 0.48 + 0.18 * Math.sin(u * (6 + (t % 3)) + t * 2) + 0.06 * Math.sin(u * 19 - t)
  const ribbon = Math.exp(-((v - ry) ** 2) / 0.0014)
  return Math.max(c1, c2, c3, ribbon)
}

function lineHeight() {
  return (window.innerWidth / 100.2) * 1.3
}

function rowCount() {
  return Math.min(160, Math.ceil(window.innerHeight / lineHeight()) + 1)
}

function glyphGrid() {
  const rows = TITLE_LINES.length * LINE_PITCH
  const size = (GLYPH_ROWS * CELL_H) / 0.7
  const family = `800 ${size}px 'Archivo', sans-serif`
  const probe = document.createElement('canvas').getContext('2d')
  if (!probe) return { cols: 0, rows, cells: new Uint8Array(0) }
  probe.font = family
  const widest = Math.max(...TITLE_LINES.map((line) => probe.measureText(line).width))
  const cols = Math.ceil(widest / CELL_W) + 2
  const w = cols * CELL_W
  const h = rows * CELL_H
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const cells = new Uint8Array(cols * rows)
  if (!ctx) return { cols, rows, cells }
  ctx.font = family
  ctx.fillStyle = '#000'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  TITLE_LINES.forEach((line, i) => {
    ctx.fillText(line, w - CELL_W, (i * LINE_PITCH + GLYPH_ROWS) * CELL_H)
  })
  const data = ctx.getImageData(0, 0, w, h).data
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let covered = 0
      for (let py = 0; py < CELL_H; py += 2) {
        for (let px = 0; px < CELL_W; px += 2) {
          if (data[((y * CELL_H + py) * w + x * CELL_W + px) * 4 + 3] > 127) covered++
        }
      }
      if (covered / ((CELL_H / 2) * (CELL_W / 2)) > 0.5) cells[y * cols + x] = 1
    }
  }
  return { cols, rows, cells }
}

function renderGlyphs(tick: number, grid: ReturnType<typeof glyphGrid>) {
  let out = ''
  for (let y = 0; y < grid.rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      out += grid.cells[y * grid.cols + x] ? Math.floor(hash(x, y, tick) * 10) : ' '
    }
    out += '\n'
  }
  return out
}

function render(tick: number, rows: number, found: boolean) {
  const shape = Math.min(tick, FOUND_TICK)
  const step = Math.floor(shape / STEP_DIV)
  const inEpoch = step % (2 * LAYERS)
  const epoch = Math.floor(step / (2 * LAYERS)) % EPOCHS
  const run = Math.floor(step / (2 * LAYERS * EPOCHS))
  const forward = inEpoch < LAYERS
  const front = forward ? inEpoch : 2 * LAYERS - 1 - inEpoch
  const t = run * 2.3 + shape * TIME_SCALE
  const aspect = rows - 1 || 1
  let noise = ''
  let sig = ''
  let grad = ''
  for (let y = 0; y < rows; y++) {
    const v = y / aspect
    for (let x = 0; x < COLS; x++) {
      const layer = Math.floor(x / PER_LAYER)
      const u = x / COLS
      const s = target(u, v, t)
      let k = epoch
      if (!forward && layer >= front) k += 1
      const err = 1.15 * Math.exp(-k * 0.62)
      const guess = hash(x, y, run * 97 + k) - 0.5
      const pred = s + guess * 2 * err
      const r = hash(x, y, tick + x * 3)
      const tok = Math.min(9.99, Math.max(0, pred * 7 + r * 2.2)).toFixed(2)
      const reached = epoch > 0 || !forward || layer <= front
      let n = tok
      let a = BLANK
      let b = BLANK
      if (!found && layer === front && (pred > 0.35 || r > 0.7)) {
        if (forward) a = tok
        else b = tok
        n = BLANK
      } else if (reached && pred > 0.5) {
        a = tok
        n = BLANK
      }
      const sep = x % PER_LAYER === PER_LAYER - 1 && x < COLS - 1 ? '  ' : ' '
      noise += n + sep
      sig += a + sep
      grad += b + sep
    }
    noise += '\n'
    sig += '\n'
    grad += '\n'
  }
  return { noise, sig, grad }
}

export default function Pattern() {
  const [tick, setTick] = useState(0)
  const [rows, setRows] = useState(() => rowCount())
  const [stage, setStage] = useState<Stage>('empty')
  const docs = useMemo(() => docsPile(DOC_COUNT), [])
  const introDone = stage === 'data'
  const found = tick >= FOUND_TICK
  const [fontsReady, setFontsReady] = useState(false)
  const glyphs = useMemo(() => (fontsReady ? glyphGrid() : null), [fontsReady])

  useEffect(() => {
    const onResize = () => setRows(rowCount())
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    void document.fonts.load("800 100px 'Archivo'").then(() => setFontsReady(true))
  }, [])

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage('pile'), PILE_AT),
      setTimeout(() => setStage('flat'), FLAT_AT),
      setTimeout(() => setStage('data'), DATA_AT),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (!introDone) return
    const timer = setInterval(() => setTick((n) => n + 1), TICK_MS)
    return () => clearInterval(timer)
  }, [introDone])

  const { noise, sig, grad } = useMemo(() => render(tick, rows, found), [tick, rows, found])
  const glyphText = useMemo(() => (glyphs ? renderGlyphs(tick, glyphs) : ''), [tick, glyphs])

  return (
    <div className={`pattern ${introDone ? 'pattern--ready' : 'pattern--intro'}`}>
      <div className="pattern-docs" aria-hidden="true">
        {docs.map((d, i) => (
          <div key={i} className="pattern-doc" style={docStyle(d, stage)}>
            <span className="pattern-doc-title" />
            <span style={{ width: `${d.w1}%` }} />
            <span style={{ width: `${d.w2}%` }} />
            <span style={{ width: `${d.w3}%` }} />
            <span className="pattern-doc-grid" />
            <span style={{ width: `${d.w2}%` }} />
            <span style={{ width: `${d.w1}%` }} />
          </div>
        ))}
      </div>
      <div className="pattern-layers" aria-hidden="true">
        <pre className="pattern-noise">{noise}</pre>
        <pre className="pattern-signal">{sig}</pre>
        <pre className="pattern-grad">{grad}</pre>
      </div>
      <pre className="pattern-text" aria-label="Finding the pattern">
        {glyphText}
      </pre>
      <div className="pattern-name">Adam</div>
    </div>
  )
}
