import { useEffect, useRef, useState, useMemo } from 'react'
import { motion } from 'framer-motion'

/* ════════════════════════════════════════════════════════════════════
   HERMES OS — Signature futuristic visual components
   Matches the Stitch design language (globe / topography / node graph)
   ════════════════════════════════════════════════════════════════════ */

/* ─── GLOBAL LIQUIDITY MAP — rotating wireframe globe ──────────────── */
export function LiquidityGlobe({ active = false, size = 360 }: { active?: boolean; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2, cy = size / 2
    const R = size * 0.40
    // generate lat/long dot grid
    const dots: { lat: number; lon: number; hot: boolean }[] = []
    for (let lat = -80; lat <= 80; lat += 10) {
      const count = Math.max(6, Math.round(Math.cos((lat * Math.PI) / 180) * 36))
      for (let i = 0; i < count; i++) {
        dots.push({ lat, lon: (i / count) * 360, hot: Math.random() > 0.92 })
      }
    }
    let rot = 0

    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      rot += active ? 0.006 : 0.002

      // outer glow ring
      ctx.beginPath()
      ctx.arc(cx, cy, R + 6, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(0,229,255,0.15)'
      ctx.lineWidth = 1
      ctx.stroke()

      // meridian/parallel wireframe
      ctx.strokeStyle = 'rgba(0,229,255,0.10)'
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath()
        const ry = R * Math.cos((lat * Math.PI) / 180)
        const yy = cy - R * Math.sin((lat * Math.PI) / 180)
        ctx.ellipse(cx, yy, ry, ry * 0.32, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // dots
      for (const d of dots) {
        const latR = (d.lat * Math.PI) / 180
        const lonR = ((d.lon + rot * 57.3) * Math.PI) / 180
        const x3 = Math.cos(latR) * Math.sin(lonR)
        const z3 = Math.cos(latR) * Math.cos(lonR)
        const y3 = Math.sin(latR)
        if (z3 < -0.1) continue // back face cull
        const px = cx + x3 * R
        const py = cy - y3 * R
        const depth = (z3 + 1) / 2
        const r = d.hot ? 1.8 : 0.9 + depth * 0.8
        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        if (d.hot && active) {
          ctx.fillStyle = `rgba(236,72,153,${0.5 + depth * 0.5})`
          ctx.shadowColor = '#ec4899'
          ctx.shadowBlur = 8
        } else {
          ctx.fillStyle = `rgba(0,229,255,${0.15 + depth * 0.6})`
          ctx.shadowBlur = 0
        }
        ctx.fill()
        ctx.shadowBlur = 0
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [size, active])

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
      <div className="absolute inset-0 pointer-events-none rounded-full"
           style={{ background: `radial-gradient(circle, transparent 55%, rgba(2,8,23,0.6) 80%)` }} />
    </div>
  )
}

/* ─── WEIGHT MATRIX TOPOGRAPHY — animated dot heatmap ─────────────── */
export function WeightTopography({ active = false, cols = 24, rows = 12 }: {
  active?: boolean; cols?: number; rows?: number
}) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setTick(t => t + 1), 120)
    return () => clearInterval(id)
  }, [active])

  const weights = useMemo(() => {
    const arr: number[] = []
    for (let i = 0; i < cols * rows; i++) {
      const base = Math.sin(i * 0.5) * 0.5 + 0.5
      arr.push(base)
    }
    return arr
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols, rows])

  return (
    <div className="grid gap-1.5 w-full" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {weights.map((w, i) => {
        const phase = active ? (Math.sin(tick * 0.3 + i * 0.4) * 0.5 + 0.5) : w * 0.4
        const intensity = phase
        const isPurple = (i + Math.floor(i / cols)) % 3 === 0
        const color = isPurple ? '139,92,246' : '0,229,255'
        return (
          <div key={i} className="aspect-square rounded-full"
            style={{
              background: `rgba(${color},${0.12 + intensity * 0.7})`,
              boxShadow: intensity > 0.6 ? `0 0 ${intensity * 8}px rgba(${color},${intensity})` : 'none',
              transform: `scale(${0.6 + intensity * 0.6})`,
              transition: 'all 0.2s ease',
            }} />
        )
      })}
    </div>
  )
}

/* ─── NEURAL NODE GRAPH — decision nexus ──────────────────────────── */
interface GraphNode { id: string; x: number; y: number; label: string; color: string; r: number }
export function NeuralNodeGraph({ active = false, height = 300 }: { active?: boolean; height?: number }) {
  const nodes: GraphNode[] = [
    { id: 'in1', x: 12, y: 30, label: 'INPUT_1', color: '#00e5ff', r: 6 },
    { id: 'in2', x: 12, y: 70, label: 'INPUT_2', color: '#00e5ff', r: 6 },
    { id: 'nexus', x: 50, y: 50, label: 'DECISION_NEXUS', color: '#ec4899', r: 14 },
    { id: 'h1', x: 50, y: 18, label: 'H_1', color: '#a855f7', r: 5 },
    { id: 'h2', x: 50, y: 82, label: 'H_2', color: '#a855f7', r: 5 },
    { id: 'out1', x: 88, y: 35, label: 'OUTPUT_1', color: '#22c55e', r: 6 },
    { id: 'out2', x: 88, y: 68, label: 'OUTPUT_2', color: '#22c55e', r: 6 },
  ]
  const edges: [string, string][] = [
    ['in1', 'nexus'], ['in2', 'nexus'], ['in1', 'h1'], ['in2', 'h2'],
    ['h1', 'nexus'], ['h2', 'nexus'], ['nexus', 'out1'], ['nexus', 'out2'],
    ['h1', 'out1'], ['h2', 'out2'],
  ]
  const pos = (id: string) => nodes.find(n => n.id === id)!

  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="nexusGlow">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </radialGradient>
      </defs>
      {edges.map(([a, b], i) => {
        const pa = pos(a), pb = pos(b)
        const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2 - 8
        const d = `M${pa.x},${pa.y} Q${mx},${my} ${pb.x},${pb.y}`
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="rgba(0,229,255,0.18)" strokeWidth="0.4" />
            {active && (
              <motion.path d={d} fill="none" stroke="#00e5ff" strokeWidth="0.6"
                strokeDasharray="3 14" strokeLinecap="round"
                initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: -34 }}
                transition={{ duration: 1.6 + (i % 3) * 0.4, repeat: Infinity, ease: 'linear', delay: i * 0.2 }}
                style={{ filter: 'drop-shadow(0 0 1px #00e5ff)' }} />
            )}
          </g>
        )
      })}
      {nodes.map(n => (
        <g key={n.id}>
          {n.id === 'nexus' && <circle cx={n.x} cy={n.y} r={n.r + 8} fill="url(#nexusGlow)" />}
          <motion.circle cx={n.x} cy={n.y} r={n.r} fill={n.color}
            animate={active ? { opacity: [0.7, 1, 0.7] } : { opacity: 0.6 }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ filter: `drop-shadow(0 0 ${n.r / 2}px ${n.color})` }} />
          <text x={n.x} y={n.y + n.r + 4} fontSize="2.6" fill="#64748b" textAnchor="middle"
            style={{ fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.05em' }}>{n.label}</text>
        </g>
      ))}
    </svg>
  )
}

/* ─── PERFORMANCE GAUGE — circular metric ─────────────────────────── */
export function MiniGauge({ value, label, color, size = 64 }: {
  value: number; label: string; color: string; size?: number
}) {
  const r = size / 2 - 6
  const circ = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth="4" />
          <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
            transition={{ duration: 1 }} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold font-mono" style={{ color }}>{value.toFixed(0)}%</span>
        </div>
      </div>
      <span className="text-[7px] tracking-wider font-hud text-slate-500">{label}</span>
    </div>
  )
}

/* ─── HYPERPARAMETER SLIDER (display) ─────────────────────────────── */
export function HyperParam({ label, value, display, color = '#a855f7' }: {
  label: string; value: number; display: string; color?: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[8px] tracking-wider font-hud text-slate-500">{label}</span>
        <span className="text-[9px] font-mono font-bold" style={{ color }}>{display}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 0.8 }} style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
    </div>
  )
}

/* ─── BUY PROBABILITY — vertical bars ─────────────────────────────── */
export function ProbabilityBars({ values, color = '#00e5ff' }: { values: number[]; color?: string }) {
  return (
    <div className="flex items-end gap-1 h-16">
      {values.map((v, i) => (
        <motion.div key={i} className="flex-1 rounded-t" initial={{ height: 0 }} animate={{ height: `${v}%` }}
          transition={{ duration: 0.6, delay: i * 0.04 }}
          style={{ background: `linear-gradient(180deg, ${color}, ${color}40)`, minWidth: 3, boxShadow: `0 0 6px ${color}40` }} />
      ))}
    </div>
  )
}
