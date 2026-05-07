'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

const COLORS = {
  bg: '#E8DFCB',
  ink: '#1F1B16',
  inkSoft: '#3A322A',
  inkMute: '#6A5F52',
  terracotta: '#C5694F',
  terracottaSoft: '#D89A87',
  promptBg: '#DCD2BC',
  textareaBg: '#F1EAD9',
  yellow: '#E8D78A',
  blue: '#A9C7E0',
  green: '#B8D6B0',
  orange: '#E5B09A',
} as const

const FONTS = {
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
  serif: 'Georgia, "Times New Roman", serif',
} as const

const STAGE_W = 1200
const STAGE_H = 1200
const DURATION = 20

const T = {
  frameIn: [0.0, 0.6],
  fadeOut: [19.4, 20.0],

  beat1In: [0.4, 1.0],
  beat1Out: [6.6, 7.4],

  hl1: { start: 1.4, underlineEnd: 1.9, fillEnd: 2.3, dotAt: 1.9 },
  hl2: { start: 2.2, underlineEnd: 2.7, fillEnd: 3.1, dotAt: 2.7 },
  hl3: { start: 3.0, underlineEnd: 3.5, fillEnd: 3.9, dotAt: 3.5 },
  hl4: { start: 3.8, underlineEnd: 4.3, fillEnd: 4.7, dotAt: 4.3 },
  hl5: { start: 4.6, underlineEnd: 5.1, fillEnd: 5.5, dotAt: 5.1 },

  beat2In: [7.0, 7.6],
  beat2Out: [13.0, 13.8],

  promptIn: [7.4, 8.0],
  textareaIn: [7.8, 8.4],
  typing: [8.4, 12.6],
  buttonIn: [8.2, 8.8],
  buttonClick: [12.8, 13.4],

  beat3In: [13.4, 14.0],
  beat3Out: [18.8, 19.4],
} as const

type Window2 = readonly [number, number]
type HighlightBeat = { start: number; underlineEnd: number; fillEnd: number; dotAt: number }

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const Easing = {
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInCubic: (t: number) => t * t * t,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
}

const TimeContext = createContext(0)
const useTime = () => useContext(TimeContext)

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`
}

function Highlight({
  children,
  beat,
  color,
  time,
}: {
  children: React.ReactNode
  beat: HighlightBeat
  color: string
  time: number
}) {
  const { start, underlineEnd, fillEnd } = beat
  const ulProg = clamp((time - start) / (underlineEnd - start), 0, 1)
  const fillProg = clamp((time - underlineEnd) / (fillEnd - underlineEnd), 0, 1)
  const ul = Easing.easeInOutCubic(ulProg)
  const fill = Easing.easeOutCubic(fillProg)
  const fillBg = `rgba(${hexToRgb(color)}, 0.65)`
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(${fillBg}, ${fillBg}), linear-gradient(${color}, ${color})`,
        backgroundSize: `${fill * 100}% 100%, ${ul * 100}% 2px`,
        backgroundPosition: '0 0, 0 100%',
        backgroundRepeat: 'no-repeat, no-repeat',
        padding: '2px 4px',
        WebkitBoxDecorationBreak: 'clone',
        boxDecorationBreak: 'clone',
      }}
    >
      {children}
    </span>
  )
}

function Beat({
  inWindow,
  outWindow,
  drift = 24,
  children,
}: {
  inWindow: Window2
  outWindow: Window2
  drift?: number
  children: React.ReactNode
}) {
  const time = useTime()
  const inProg = clamp((time - inWindow[0]) / (inWindow[1] - inWindow[0]), 0, 1)
  const outProg = clamp((time - outWindow[0]) / (outWindow[1] - outWindow[0]), 0, 1)
  const inE = Easing.easeOutCubic(inProg)
  const outE = Easing.easeInCubic(outProg)
  const opacity = inE * (1 - outE)
  const ty = (1 - inE) * drift - outE * drift * 0.6
  if (time < inWindow[0] - 0.05) return null
  if (time > outWindow[1] + 0.05) return null
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '120px 110px 110px',
        opacity,
        transform: `translateY(${ty}px)`,
      }}
    >
      {children}
    </div>
  )
}

function SectionHeader({
  index,
  label,
  caption,
}: {
  index: string
  label: string
  caption: string
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, marginBottom: 14 }}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 18,
            letterSpacing: '0.08em',
            color: COLORS.inkMute,
          }}
        >
          {index}
        </div>
        <div style={{ flex: 1, height: 1, background: 'rgba(31,27,22,0.18)' }} />
      </div>
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 22,
          letterSpacing: '0.06em',
          color: COLORS.terracotta,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 16,
          letterSpacing: '0.04em',
          color: COLORS.inkSoft,
          textTransform: 'uppercase',
        }}
      >
        {caption}
      </div>
    </div>
  )
}

function LegendDot({
  color,
  label,
  dotAt,
  time,
}: {
  color: string
  label: string
  dotAt: number
  time: number
}) {
  const baseProg = clamp((time - 0.6) / 0.8, 0, 1)
  const baseEased = Easing.easeOutCubic(baseProg)
  const popProg = clamp((time - dotAt) / 0.35, 0, 1)
  const scale = popProg > 0 && popProg < 1 ? 1 + 0.6 * Math.sin(popProg * Math.PI) : 1
  const dotOp = baseEased * (0.35 + 0.65 * popProg)
  const labelOp = baseEased * (0.55 + 0.45 * popProg)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          background: color,
          opacity: dotOp,
          transform: `scale(${scale})`,
          boxShadow: popProg > 0 && popProg < 1 ? `0 0 16px ${color}` : 'none',
        }}
      />
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 20,
          letterSpacing: '0.06em',
          color: COLORS.ink,
          opacity: labelOp,
        }}
      >
        {label}
      </div>
    </div>
  )
}

function Legend({ time }: { time: number }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 36px' }}>
      <LegendDot color={COLORS.yellow} label="STRUCTURE" dotAt={T.hl4.dotAt} time={time} />
      <LegendDot color={COLORS.blue} label="VOICE" dotAt={T.hl1.dotAt} time={time} />
      <LegendDot color={COLORS.green} label="IMAGERY" dotAt={T.hl2.dotAt} time={time} />
      <LegendDot color={COLORS.orange} label="PACING" dotAt={T.hl3.dotAt} time={time} />
    </div>
  )
}

function Beat1Read() {
  const time = useTime()
  return (
    <Beat inWindow={T.beat1In} outWindow={T.beat1Out}>
      <SectionHeader
        index="01"
        label="EXTRACT — WOOLF"
        caption="Craft highlights — segments tagged by category"
      />
      <div style={{ position: 'relative', paddingLeft: 28, marginTop: 36, marginBottom: 44 }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 6,
            bottom: 6,
            width: 3,
            background: COLORS.terracotta,
          }}
        />
        <div
          style={{
            fontFamily: FONTS.serif,
            fontStyle: 'italic',
            fontSize: 44,
            lineHeight: 1.45,
            color: COLORS.ink,
            letterSpacing: '-0.005em',
          }}
        >
          &ldquo;She had a{' '}
          <Highlight beat={T.hl1} color={COLORS.blue} time={time}>
            perpetual sense
          </Highlight>
          , as she{' '}
          <Highlight beat={T.hl2} color={COLORS.green} time={time}>
            watched the taxi cabs
          </Highlight>
          , of being{' '}
          <Highlight beat={T.hl3} color={COLORS.orange} time={time}>
            out
          </Highlight>
          ,{' '}
          <Highlight beat={T.hl4} color={COLORS.yellow} time={time}>
            out, far out
          </Highlight>{' '}
          to sea and{' '}
          <Highlight beat={T.hl5} color={COLORS.orange} time={time}>
            alone
          </Highlight>{' '}
          …&rdquo;
        </div>
      </div>
      <Legend time={time} />
    </Beat>
  )
}

const TYPED =
  'Her hands stayed still in her lap. The taxi window framed a strip of grey river, then a man in a brown coat, then nothing.'

function PromptCard({ time }: { time: number }) {
  const p = clamp((time - T.promptIn[0]) / (T.promptIn[1] - T.promptIn[0]), 0, 1)
  const e = Easing.easeOutCubic(p)
  return (
    <div
      style={{
        opacity: e,
        transform: `translateY(${(1 - e) * 10}px)`,
        background: COLORS.promptBg,
        padding: '22px 26px',
        marginTop: 32,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 18,
          letterSpacing: '0.06em',
          color: COLORS.terracotta,
          marginBottom: 12,
        }}
      >
        PROMPT
      </div>
      <div style={{ fontFamily: FONTS.mono, fontSize: 19, lineHeight: 1.6, color: COLORS.inkSoft }}>
        Rewrite this passage so the character&apos;s loneliness is conveyed entirely through
        concrete, physical detail — what the body does, what the senses register. Remove every
        abstraction.
      </div>
    </div>
  )
}

function TextareaCard({ time }: { time: number }) {
  const p = clamp((time - T.textareaIn[0]) / (T.textareaIn[1] - T.textareaIn[0]), 0, 1)
  const e = Easing.easeOutCubic(p)
  const [tStart, tEnd] = T.typing
  const typeProg = clamp((time - tStart) / (tEnd - tStart), 0, 1)
  const charsShown = Math.floor(typeProg * TYPED.length * 0.78)
  const typed = TYPED.slice(0, charsShown)
  const cursorOn = Math.floor(time * 2) % 2 === 0
  const showPlaceholder = time < tStart + 0.1

  return (
    <div
      style={{
        opacity: e,
        transform: `translateY(${(1 - e) * 10}px)`,
        position: 'relative',
        marginBottom: 22,
        borderLeft: `3px solid ${COLORS.terracotta}`,
      }}
    >
      <div
        style={{
          background: COLORS.textareaBg,
          padding: '28px 30px',
          minHeight: 200,
          fontFamily: FONTS.serif,
          fontStyle: 'italic',
          fontSize: 26,
          lineHeight: 1.55,
          color: showPlaceholder ? COLORS.inkMute : COLORS.ink,
        }}
      >
        {showPlaceholder ? (
          "Inspired by Woolf's passage, write your own version here…"
        ) : (
          <>
            <span style={{ fontStyle: 'normal' }}>{typed}</span>
            <span
              style={{
                display: 'inline-block',
                width: 2,
                height: '1.05em',
                marginLeft: 1,
                marginBottom: -3,
                background: COLORS.ink,
                opacity: cursorOn ? 1 : 0,
                verticalAlign: 'middle',
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}

function AnalyzeButton({ time }: { time: number }) {
  const p = clamp((time - T.buttonIn[0]) / (T.buttonIn[1] - T.buttonIn[0]), 0, 1)
  const e = Easing.easeOutCubic(p)
  const [cStart, cEnd] = T.buttonClick
  const cProg = clamp((time - cStart) / (cEnd - cStart), 0, 1)
  let scale = 1
  let glow = 0
  if (cProg > 0 && cProg < 1) {
    if (cProg < 0.4) {
      scale = 1 - 0.025 * (cProg / 0.4)
    } else if (cProg < 0.55) {
      scale = 0.975 + 0.06 * ((cProg - 0.4) / 0.15)
      glow = (cProg - 0.4) / 0.15
    } else {
      scale = 1.035 - 0.035 * Easing.easeOutCubic((cProg - 0.55) / 0.45)
      glow = 1 - (cProg - 0.55) / 0.45
    }
  }

  return (
    <div
      style={{
        opacity: e,
        transform: `translateY(${(1 - e) * 10}px) scale(${scale})`,
        transformOrigin: 'center',
        background: COLORS.terracottaSoft,
        padding: '28px 36px',
        textAlign: 'center',
        fontFamily: FONTS.mono,
        fontSize: 22,
        letterSpacing: '0.08em',
        color: '#FBF7EE',
        boxShadow:
          glow > 0
            ? `0 0 ${28 * glow}px ${glow * 0.4}px rgba(197,105,79,${0.5 * glow})`
            : 'none',
      }}
    >
      ANALYZE MY WRITING
    </div>
  )
}

function Beat2Write() {
  const time = useTime()
  return (
    <Beat inWindow={T.beat2In} outWindow={T.beat2Out}>
      <SectionHeader
        index="02"
        label="WRITE — YOUR TURN"
        caption="Inspired by Woolf, rewrite the passage"
      />
      <PromptCard time={time} />
      <TextareaCard time={time} />
      <AnalyzeButton time={time} />
    </Beat>
  )
}

const SCORES = [
  { label: 'STRUCTURE', color: COLORS.yellow, score: 0.78, note: 'Strong rhythm of short, declarative beats.' },
  { label: 'VOICE', color: COLORS.blue, score: 0.62, note: 'Restrained — could risk one image more.' },
  { label: 'IMAGERY', color: COLORS.green, score: 0.91, note: 'Specific, sensory: river, brown coat.' },
  { label: 'PACING', color: COLORS.orange, score: 0.84, note: '"Then nothing." lands the silence.' },
]

function ResultRow({
  label,
  color,
  score,
  note,
  rowDelay,
  time,
  panelStart,
}: {
  label: string
  color: string
  score: number
  note: string
  rowDelay: number
  time: number
  panelStart: number
}) {
  const localStart = panelStart + 0.4 + rowDelay
  const p = clamp((time - localStart) / 0.5, 0, 1)
  const e = Easing.easeOutCubic(p)
  const barProg = clamp((time - localStart - 0.15) / 0.85, 0, 1)
  const barEased = Easing.easeOutCubic(barProg)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '190px 1fr 76px',
        alignItems: 'center',
        columnGap: 22,
        rowGap: 8,
        opacity: e,
        transform: `translateY(${(1 - e) * 6}px)`,
        marginBottom: 26,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 13, height: 13, borderRadius: 6.5, background: color }} />
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 17,
            letterSpacing: '0.06em',
            color: COLORS.ink,
          }}
        >
          {label}
        </div>
      </div>
      <div style={{ height: 12, background: 'rgba(31,27,22,0.08)', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${barEased * score * 100}%`,
            background: color,
            opacity: 0.85,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 17,
          fontVariantNumeric: 'tabular-nums',
          color: COLORS.inkSoft,
          textAlign: 'right',
        }}
      >
        {Math.round(barEased * score * 100)}
      </div>
      <div
        style={{
          gridColumn: '2 / 4',
          fontFamily: FONTS.mono,
          fontSize: 14,
          color: COLORS.inkMute,
          opacity: barEased,
          lineHeight: 1.4,
        }}
      >
        {note}
      </div>
    </div>
  )
}

function EchoText({ time }: { time: number }) {
  const p = clamp((time - T.beat3In[0] - 1.6) / 0.6, 0, 1)
  const e = Easing.easeOutCubic(p)
  return (
    <div
      style={{
        marginTop: 28,
        paddingTop: 20,
        borderTop: '1px solid rgba(31,27,22,0.12)',
        fontFamily: FONTS.serif,
        fontStyle: 'italic',
        fontSize: 19,
        lineHeight: 1.55,
        color: COLORS.inkMute,
        opacity: e * 0.85,
      }}
    >
      <span
        style={{
          fontFamily: FONTS.mono,
          fontStyle: 'normal',
          fontSize: 13,
          letterSpacing: '0.06em',
          color: COLORS.terracotta,
          marginRight: 10,
        }}
      >
        YOUR TEXT
      </span>
      Her hands stayed still in her lap. The taxi window framed a strip of grey river, then a man
      in a brown coat, then nothing.
    </div>
  )
}

function Beat3Analyze() {
  const time = useTime()
  return (
    <Beat inWindow={T.beat3In} outWindow={T.beat3Out}>
      <SectionHeader
        index="03"
        label="ANALYSIS — VS. WOOLF"
        caption="How your version compares across four categories"
      />
      <div style={{ marginTop: 36 }}>
        {SCORES.map((s, i) => (
          <ResultRow
            key={s.label}
            label={s.label}
            color={s.color}
            score={s.score}
            note={s.note}
            rowDelay={i * 0.22}
            time={time}
            panelStart={T.beat3In[0]}
          />
        ))}
      </div>
      <EchoText time={time} />
    </Beat>
  )
}

function StepIndicator() {
  const time = useTime()
  let activeIdx = 0
  if (time >= T.beat1In[0] && time < T.beat1Out[0] + 0.4) activeIdx = 0
  else if (time >= T.beat2In[0] && time < T.beat2Out[0] + 0.4) activeIdx = 1
  else if (time >= T.beat3In[0]) activeIdx = 2

  let opacity = 1
  if (time < T.frameIn[1]) opacity = clamp(time / T.frameIn[1], 0, 1)
  else if (time > T.fadeOut[0]) {
    const t = clamp((time - T.fadeOut[0]) / (T.fadeOut[1] - T.fadeOut[0]), 0, 1)
    opacity = 1 - t
  }

  const labels = ['READ', 'WRITE', 'ANALYZE']

  return (
    <div
      style={{
        position: 'absolute',
        top: 64,
        right: 88,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 14,
        opacity,
        fontFamily: FONTS.mono,
      }}
    >
      <div style={{ fontSize: 16, letterSpacing: '0.08em', color: COLORS.inkMute }}>PROSELAB</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {labels.map((_, i) => (
          <div
            key={i}
            style={{
              width: 40,
              height: 4,
              background: i === activeIdx ? COLORS.terracotta : 'rgba(31,27,22,0.18)',
              transition: 'background 200ms',
            }}
          />
        ))}
      </div>
      <div
        style={{ fontSize: 18, letterSpacing: '0.06em', color: COLORS.ink }}
      >{`0${activeIdx + 1} · ${labels[activeIdx]}`}</div>
    </div>
  )
}

function FrameWrapper({ children }: { children: React.ReactNode }) {
  const time = useTime()
  let opacity = 1
  if (time < T.frameIn[1]) opacity = Easing.easeOutCubic(clamp(time / T.frameIn[1], 0, 1))
  else if (time > T.fadeOut[0]) {
    const t = clamp((time - T.fadeOut[0]) / (T.fadeOut[1] - T.fadeOut[0]), 0, 1)
    opacity = 1 - Easing.easeInCubic(t)
  }
  return (
    <div style={{ position: 'absolute', inset: 0, opacity, color: COLORS.ink }}>{children}</div>
  )
}

function ProseLabHero() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FrameWrapper>
        <StepIndicator />
        <Beat1Read />
        <Beat2Write />
        <Beat3Analyze />
      </FrameWrapper>
    </div>
  )
}

export function HeroAnimation() {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [reduceMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  const [time, setTime] = useState(() => (reduceMotion ? 2.0 : 0))
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)

  useEffect(() => {
    if (!wrapperRef.current) return
    const el = wrapperRef.current
    const measure = () => {
      const s = Math.min(el.clientWidth / STAGE_W, el.clientHeight / STAGE_H)
      setScale(Math.max(0.05, s))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    const step = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts
      setTime((t) => {
        const next = t + dt
        return next >= DURATION ? next % DURATION : next
      })
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTsRef.current = null
    }
  }, [reduceMotion])

  const ctxValue = useMemo(() => time, [time])

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: COLORS.bg,
      }}
      aria-label="ProseLab hero animation: read, write, analyze"
    >
      <div
        style={{
          width: STAGE_W,
          height: STAGE_H,
          background: COLORS.bg,
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          flexShrink: 0,
        }}
      >
        <TimeContext.Provider value={ctxValue}>
          <ProseLabHero />
        </TimeContext.Provider>
      </div>
    </div>
  )
}
