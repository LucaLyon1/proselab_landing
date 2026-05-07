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

const STAGE_W = 600
const STAGE_H = 600
const DURATION = 14

const T = {
  frameIn: [0.0, 0.5],
  fadeOut: [13.5, 14.0],

  beat1In: [0.3, 0.9],
  beat1Out: [4.4, 5.0],

  hl1: { start: 1.1, underlineEnd: 1.5, fillEnd: 1.85 },
  hl2: { start: 1.95, underlineEnd: 2.35, fillEnd: 2.7 },
  hl3: { start: 2.8, underlineEnd: 3.2, fillEnd: 3.55 },

  beat2In: [4.6, 5.2],
  beat2Out: [9.0, 9.6],

  promptIn: [4.9, 5.4],
  textareaIn: [5.3, 5.9],
  typing: [5.9, 8.4],
  buttonIn: [5.7, 6.2],
  buttonClick: [8.5, 9.0],

  beat3In: [9.2, 9.8],
  beat3Out: [13.2, 13.8],
} as const

type Window2 = readonly [number, number]
type HighlightBeat = { start: number; underlineEnd: number; fillEnd: number }

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
  const fillBg = `rgba(${hexToRgb(color)}, 0.7)`
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(${fillBg}, ${fillBg}), linear-gradient(${color}, ${color})`,
        backgroundSize: `${fill * 100}% 100%, ${ul * 100}% 2px`,
        backgroundPosition: '0 0, 0 100%',
        backgroundRepeat: 'no-repeat, no-repeat',
        padding: '1px 3px',
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
  drift = 16,
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
        justifyContent: 'flex-start',
        padding: '110px 44px 50px',
        opacity,
        transform: `translateY(${ty}px)`,
      }}
    >
      {children}
    </div>
  )
}

function PhaseHeader({ index, label }: { index: string; label: string }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 10 }}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 18,
            letterSpacing: '0.12em',
            color: COLORS.terracotta,
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
          letterSpacing: '0.08em',
          color: COLORS.ink,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
    </div>
  )
}

function Beat1Read() {
  const time = useTime()
  return (
    <Beat inWindow={T.beat1In} outWindow={T.beat1Out}>
      <PhaseHeader index="01 /" label="Study" />
      <div
        style={{
          position: 'relative',
          paddingLeft: 16,
          marginTop: 6,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 4,
            bottom: 4,
            width: 2,
            background: COLORS.terracotta,
          }}
        />
        <div
          style={{
            fontFamily: FONTS.serif,
            fontStyle: 'italic',
            fontSize: 32,
            lineHeight: 1.45,
            color: COLORS.ink,
            letterSpacing: '-0.005em',
          }}
        >
          &ldquo;She had a{' '}
          <Highlight beat={T.hl1} color={COLORS.blue} time={time}>
            perpetual sense
          </Highlight>{' '}
          of being{' '}
          <Highlight beat={T.hl2} color={COLORS.orange} time={time}>
            out, far out
          </Highlight>{' '}
          to sea and{' '}
          <Highlight beat={T.hl3} color={COLORS.green} time={time}>
            alone
          </Highlight>
          .&rdquo;
        </div>
      </div>
      <div style={{ display: 'flex', gap: 22, marginTop: 32, flexWrap: 'wrap' }}>
        <LegendChip color={COLORS.blue} label="VOICE" />
        <LegendChip color={COLORS.orange} label="PACING" />
        <LegendChip color={COLORS.green} label="IMAGERY" />
      </div>
    </Beat>
  )
}

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 11, height: 11, borderRadius: 5.5, background: color }} />
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 15,
          letterSpacing: '0.08em',
          color: COLORS.inkSoft,
        }}
      >
        {label}
      </div>
    </div>
  )
}

const TYPED = 'Her hands stayed still in her lap. The taxi window framed grey river, then nothing.'

function PromptCard({ time }: { time: number }) {
  const p = clamp((time - T.promptIn[0]) / (T.promptIn[1] - T.promptIn[0]), 0, 1)
  const e = Easing.easeOutCubic(p)
  return (
    <div
      style={{
        opacity: e,
        transform: `translateY(${(1 - e) * 8}px)`,
        background: COLORS.promptBg,
        padding: '14px 18px',
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 13,
          letterSpacing: '0.1em',
          color: COLORS.terracotta,
          marginBottom: 6,
        }}
      >
        PROMPT
      </div>
      <div style={{ fontFamily: FONTS.mono, fontSize: 16, lineHeight: 1.5, color: COLORS.inkSoft }}>
        Make her loneliness physical — concrete sensory detail.
      </div>
    </div>
  )
}

function TextareaCard({ time }: { time: number }) {
  const p = clamp((time - T.textareaIn[0]) / (T.textareaIn[1] - T.textareaIn[0]), 0, 1)
  const e = Easing.easeOutCubic(p)
  const [tStart, tEnd] = T.typing
  const typeProg = clamp((time - tStart) / (tEnd - tStart), 0, 1)
  const charsShown = Math.floor(typeProg * TYPED.length * 0.92)
  const typed = TYPED.slice(0, charsShown)
  const cursorOn = Math.floor(time * 2) % 2 === 0
  const showPlaceholder = time < tStart + 0.1

  return (
    <div
      style={{
        opacity: e,
        transform: `translateY(${(1 - e) * 8}px)`,
        marginBottom: 16,
        borderLeft: `2px solid ${COLORS.terracotta}`,
      }}
    >
      <div
        style={{
          background: COLORS.textareaBg,
          padding: '16px 18px',
          minHeight: 130,
          fontFamily: FONTS.serif,
          fontStyle: 'italic',
          fontSize: 20,
          lineHeight: 1.55,
          color: showPlaceholder ? COLORS.inkMute : COLORS.ink,
        }}
      >
        {showPlaceholder ? (
          'Write your version…'
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
        transform: `translateY(${(1 - e) * 8}px) scale(${scale})`,
        transformOrigin: 'center',
        background: COLORS.terracottaSoft,
        padding: '18px 22px',
        textAlign: 'center',
        fontFamily: FONTS.mono,
        fontSize: 16,
        letterSpacing: '0.12em',
        color: '#FBF7EE',
        boxShadow:
          glow > 0
            ? `0 0 ${22 * glow}px ${glow * 0.4}px rgba(197,105,79,${0.5 * glow})`
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
      <PhaseHeader index="02 /" label="Write" />
      <PromptCard time={time} />
      <TextareaCard time={time} />
      <AnalyzeButton time={time} />
    </Beat>
  )
}

const SCORES = [
  { label: 'STRUCTURE', color: COLORS.yellow, score: 0.78 },
  { label: 'VOICE', color: COLORS.blue, score: 0.62 },
  { label: 'IMAGERY', color: COLORS.green, score: 0.91 },
  { label: 'PACING', color: COLORS.orange, score: 0.84 },
]

function ScoreRow({
  label,
  color,
  score,
  rowDelay,
  time,
  panelStart,
}: {
  label: string
  color: string
  score: number
  rowDelay: number
  time: number
  panelStart: number
}) {
  const localStart = panelStart + 0.4 + rowDelay
  const p = clamp((time - localStart) / 0.45, 0, 1)
  const e = Easing.easeOutCubic(p)
  const barProg = clamp((time - localStart - 0.1) / 0.7, 0, 1)
  const barEased = Easing.easeOutCubic(barProg)
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr 50px',
        alignItems: 'center',
        columnGap: 14,
        opacity: e,
        transform: `translateY(${(1 - e) * 6}px)`,
        marginBottom: 22,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 11, height: 11, borderRadius: 5.5, background: color }} />
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 15,
            letterSpacing: '0.08em',
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
    </div>
  )
}

function Beat3Analyze() {
  const time = useTime()
  return (
    <Beat inWindow={T.beat3In} outWindow={T.beat3Out}>
      <PhaseHeader index="03 /" label="Analyze" />
      <div style={{ marginTop: 14 }}>
        {SCORES.map((s, i) => (
          <ScoreRow
            key={s.label}
            label={s.label}
            color={s.color}
            score={s.score}
            rowDelay={i * 0.18}
            time={time}
            panelStart={T.beat3In[0]}
          />
        ))}
      </div>
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

  return (
    <div
      style={{
        position: 'absolute',
        top: 38,
        left: 44,
        right: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity,
        fontFamily: FONTS.mono,
      }}
    >
      <div style={{ fontSize: 14, letterSpacing: '0.14em', color: COLORS.inkMute }}>PROSELAB</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 30,
              height: 3,
              background: i === activeIdx ? COLORS.terracotta : 'rgba(31,27,22,0.18)',
              transition: 'background 200ms',
            }}
          />
        ))}
      </div>
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

function MobileHero() {
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

export function HeroAnimationMobile() {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [reduceMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  const [time, setTime] = useState(() => (reduceMotion ? 1.5 : 0))
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)

  useEffect(() => {
    if (!wrapperRef.current) return
    const el = wrapperRef.current
    const measure = () => {
      const s = Math.min(el.clientWidth / STAGE_W, el.clientHeight / STAGE_H)
      setScale(Math.max(0.05, Math.min(1, s)))
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
      aria-label="ProseLab hero animation: study, write, analyze"
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
          <MobileHero />
        </TimeContext.Provider>
      </div>
    </div>
  )
}
