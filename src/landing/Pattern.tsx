import { useEffect, useMemo, useState } from 'react'

const COLS = 32
const LAYERS = 8
const PER_LAYER = 4
const EPOCHS = 10
const BLANK = '    '

function hash(a: number, b: number, c: number) {
  let h = (a * 374761393 + b * 668265263 + c * 1442695041) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
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

function render(tick: number, rows: number, mx: number, my: number) {
  const step = Math.floor(tick / 2)
  const inEpoch = step % (2 * LAYERS)
  const epoch = Math.floor(step / (2 * LAYERS)) % EPOCHS
  const run = Math.floor(step / (2 * LAYERS * EPOCHS))
  const forward = inEpoch < LAYERS
  const front = forward ? inEpoch : 2 * LAYERS - 1 - inEpoch
  const t = run * 2.3 + tick * 0.004
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
      const err = 1.3 * Math.exp(-k * 0.5)
      const guess = hash(x, y, run * 97 + k) - 0.5
      const pred = s + guess * 2 * err
      const r = hash(x, y, tick + x * 3)
      const tok = Math.min(9.99, Math.max(0, pred * 7 + r * 3)).toFixed(2)
      const dx = (u - mx) * 1.6
      const dy = v - my
      const lens = dx * dx + dy * dy < 0.01
      const reached = epoch > 0 || !forward || layer <= front
      let n = tok
      let a = BLANK
      let b = BLANK
      if (layer === front && (pred > 0.35 || r > 0.7)) {
        if (forward) a = tok
        else b = tok
        n = BLANK
      } else if ((reached && pred > 0.5) || (lens && s > 0.5)) {
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
  const [mouse, setMouse] = useState({ x: -9, y: -9 })

  useEffect(() => {
    const onResize = () => setRows(rowCount())
    window.addEventListener('resize', onResize)
    const timer = setInterval(() => setTick((n) => n + 1), 90)
    return () => {
      window.removeEventListener('resize', onResize)
      clearInterval(timer)
    }
  }, [])

  const { noise, sig, grad } = useMemo(
    () => render(tick, rows, mouse.x, mouse.y),
    [tick, rows, mouse.x, mouse.y],
  )

  return (
    <div
      className="pattern"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        const lh = (r.width / 100.2) * 1.3
        setMouse({
          x: (e.clientX - r.left) / r.width,
          y: (e.clientY - r.top) / lh / (rows - 1 || 1),
        })
      }}
      onMouseLeave={() => setMouse({ x: -9, y: -9 })}
    >
      <div className="pattern-layers" aria-hidden="true">
        <pre className="pattern-noise">{noise}</pre>
        <pre className="pattern-signal">{sig}</pre>
        <pre className="pattern-grad">{grad}</pre>
      </div>
      <div className="pattern-name">Adam</div>
      <h1 className="pattern-title">
        Finding
        <br />
        the pattern<span>.</span>
      </h1>
    </div>
  )
}
