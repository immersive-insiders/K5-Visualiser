import { useEffect, useRef, useMemo, CSSProperties } from 'react'
import { Reality, World, Sphere, Material } from '@webspatial/react-sdk'

type Props = { depth: number }

type Pt = { x: number; y: number; z: number }

const IS_XR =
  typeof navigator !== 'undefined' && /WebSpatial/.test(navigator.userAgent)

// K5 vertices: a tetrahedron plus a center vertex — crossing-free in 3D
const S = 0.95
const P3: number[][] = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [0, 0, 0],
].map((p) => p.map((c) => c * S))

// flat regular-pentagon layout: the classic drawing where edges must cross
const P2: number[][] = []
for (let i = 0; i < 5; i++) {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5
  P2.push([Math.cos(a) * 1.35, Math.sin(a) * 1.35, 0])
}

// all 10 edges of the complete graph on 5 vertices
const E: [number, number][] = []
for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) E.push([i, j])

const rot = (p: number[], ax: number, ay: number): number[] => {
    const x = p[0]
    const y = p[1]
    const z = p[2]
    const cy = Math.cos(ay)
    const sy = Math.sin(ay)
    const x1 = x * cy + z * sy
    const z1 = -x * sy + z * cy
    const cx = Math.cos(ax)
    const sx = Math.sin(ax)
    const y1 = y * cx - z1 * sx
    const z2 = y * sx + z1 * cx
    return [x1, y1, z2]
  }

const UNIT_M = 0.085 // overall size in meters (lower if it overlaps the slider)
const Z_PUSH = 0.09 // shove the graph toward the viewer (raise = more "out")
const EDGE_DOTS = 100 // beads per edge (raise for a more solid-looking line)

function buildXRScene(t: number, ax: number, ay: number) {
  // 5 node positions (reuses your P3/P2/rot, just scaled to meters)
  const nodes = P3.map((_, i) => {
    const p = [
      (1 - t) * P3[i][0] + t * P2[i][0],
      (1 - t) * P3[i][1] + t * P2[i][1],
      (1 - t) * P3[i][2] + t * P2[i][2],
    ]
    const r = rot(p, ax, ay)
    return { x: r[0] * UNIT_M, y: r[1] * UNIT_M, z: r[2] * UNIT_M + Z_PUSH }
  })
  // each edge = a short string of small spheres between its two nodes
  const dots: typeof nodes = []
  E.forEach(([a, b]) => {
    for (let k = 1; k <= EDGE_DOTS; k++) {
      const f = k / (EDGE_DOTS + 1)
      dots.push({
        x: nodes[a].x + (nodes[b].x - nodes[a].x) * f,
        y: nodes[a].y + (nodes[b].y - nodes[a].y) * f,
        z: nodes[a].z + (nodes[b].z - nodes[a].z) * f,
      })
    }
  })
  return { nodes, dots }
}

function K5Reality3D({ depth }: Props) {
  const t = 1 - depth / 100
  const damp = 1 - t // tilt fades out so the flat pentagon faces you at the 2D end
  const scene = useMemo(() => buildXRScene(t, -0.45 * damp, 0.7 * damp), [t, damp])

  return (
    <Reality
      className="k5-canvas"
      style={
        {
          width: '100%',
          height: '340px',
          display: 'block',
          '--xr-depth': '900px',
        } as CSSProperties
      }
    >
      <Material type="unlit" id="node-mat" color="#1d9e75" />
      <Material type="unlit" id="edge-mat" color="#5f5e5a" />
      <World>
        {scene.nodes.map((n, i) => (
          <Sphere key={`n${i}`} radius={0.010} materials={['node-mat']} position={n} />
        ))}
        {scene.dots.map((d, i) => (
          <Sphere key={`d${i}`} radius={0.001} materials={['edge-mat']} position={d} />
        ))}
      </World>
    </Reality>
  )
}

function K5Canvas2D({ depth }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // keep the latest depth value readable from inside the animation loop
  // without restarting the effect on every change
  const depthRef = useRef(depth)
  depthRef.current = depth

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let COL_EDGE = ''
    let COL_NODE = ''
    let COL_NODETXT = ''
    let COL_HALO = ''
    const readColors = () => {
      const s = getComputedStyle(document.documentElement)
      const g = (n: string, f: string) => s.getPropertyValue(n).trim() || f
      COL_EDGE = g('--edge', '#5F5E5A')
      COL_NODE = g('--node', '#378ADD')
      COL_NODETXT = g('--node-text', '#ffffff')
      COL_HALO = g('--bg-primary', '#ffffff')
    }
    readColors()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', readColors)

  
    let rx = -0.35
    let ryAuto = 0
    let dragRX = 0
    let dragRY = 0
    let dragging = false
    let lx = 0
    let ly = 0

    const resize = () => {
      const d = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * d
      canvas.height = canvas.clientHeight * d
      ctx.setTransform(d, 0, 0, d, 0, 0)
    }
    window.addEventListener('resize', resize)
    resize()

    const onDown = (e: PointerEvent) => {
      dragging = true
      canvas.style.cursor = 'grabbing'
      lx = e.clientX
      ly = e.clientY
      canvas.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      dragRY += (e.clientX - lx) * 0.01
      dragRX += (e.clientY - ly) * 0.01
      lx = e.clientX
      ly = e.clientY
    }
    const onUp = () => {
      dragging = false
      canvas.style.cursor = 'grab'
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)

    let raf = 0
    const draw = () => {
      const t = 1 - depthRef.current / 100
      if (!dragging) ryAuto += 0.006
      const damp = 1 - t // settle face-on as it flattens
      const ax = (rx + dragRX) * damp
      const ay = (ryAuto + dragRY) * damp
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const cx = w / 2
      const cy = h / 2
      const s = Math.min(w, h) * 0.34
      ctx.clearRect(0, 0, w, h)

      const pts: Pt[] = []
      for (let i = 0; i < 5; i++) {
        const p = [
          (1 - t) * P3[i][0] + t * P2[i][0],
          (1 - t) * P3[i][1] + t * P2[i][1],
          (1 - t) * P3[i][2] + t * P2[i][2],
        ]
        const r = rot(p, ax, ay)
        pts.push({ x: cx + r[0] * s, y: cy - r[1] * s, z: r[2] })
      }

      // sort edges far -> near so nearer edges' halos cut over/under gaps
      const edges = E.map((e) => ({ a: e[0], b: e[1], z: (pts[e[0]].z + pts[e[1]].z) / 2 }))
      edges.sort((p, q) => p.z - q.z)
      edges.forEach((e) => {
        const A = pts[e.a]
        const B = pts[e.b]
        ctx.strokeStyle = COL_HALO
        ctx.lineWidth = 7
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(A.x, A.y)
        ctx.lineTo(B.x, B.y)
        ctx.stroke()
        ctx.strokeStyle = COL_EDGE
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(A.x, A.y)
        ctx.lineTo(B.x, B.y)
        ctx.stroke()
      })

      pts.forEach((p, i) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 11, 0, Math.PI * 2)
        ctx.fillStyle = COL_NODE
        ctx.fill()
        ctx.fillStyle = COL_NODETXT
        ctx.font = '500 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(i + 1), p.x, p.y)
      })

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      mq.removeEventListener('change', readColors)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
    }
  }, [])

  return <canvas ref={canvasRef} className="k5-canvas" />
}

export default function K5Canvas(props: Props) {
  return IS_XR ? <K5Reality3D {...props} /> : <K5Canvas2D {...props} />
}
