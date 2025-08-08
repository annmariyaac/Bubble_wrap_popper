"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Check } from 'lucide-react'

type Pop = {
  id: number
  x: number
  y: number
  label: string
}

type BubbleWrapPopperProps = {
  rows?: number
  cols?: number
  bubbleSize?: number
  gap?: number
}

const sassLinesDefault = [
  "Pop goes the productivity!",
  "Ooh, that one was crispy!",
  "Yes, that was a clean pop!",
  "You’ve got the magic touch.",
  "Another one bites the bubble!",
  "Poppin’ and struttin’.",
  "Your popping game is elite.",
  "That was oddly satisfying.",
  "Now that’s how you pop with style.",
  "Sassy and satisfying.",
]

export default function BubbleWrapPopper({
  rows = 10,
  cols = 10,
  bubbleSize = 50,
  gap = 10,
}: BubbleWrapPopperProps) {
  const [popped, setPopped] = useState<boolean[]>(
    () => Array(rows * cols).fill(false)
  )
  const [totalPopped, setTotalPopped] = useState(0)
  const [sass, setSass] = useState("")
  const [pops, setPops] = useState<Pop[]>([])
  const nextPopId = useRef(1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const sassLines = useMemo(() => sassLinesDefault, [])

  // Load available voices for Web Speech API
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices()
      if (v && v.length) setVoices(v)
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return
      const synth = window.speechSynthesis
      try {
        const msg = new SpeechSynthesisUtterance(text)
        // Try to select a clear English voice similar to "Zira"/en-US/female
        const voice =
          voices.find((v) =>
            v.name.toLowerCase().includes("zira")
          ) ||
          voices.find((v) => v.lang?.toLowerCase().includes("en-us")) ||
          voices.find((v) => v.name.toLowerCase().includes("female")) ||
          voices[0]
        if (voice) msg.voice = voice
        msg.pitch = 1.4
        msg.rate = 1.1
        msg.volume = 1
        synth.speak(msg)
      } catch {
        // fail silently
      }
    },
    [voices]
  )

  const handlePop = useCallback(
    (index: number, clientX: number, clientY: number) => {
      setPopped((prev) => {
        if (prev[index]) {
          const line = "Already popped that one, champ."
          setSass(line)
          speak(line)
          // Add a subtle pop label even for already popped
          setPops((p) => [
            ...p,
            { id: nextPopId.current++, x: clientX, y: clientY - 12, label: "POP!" },
          ])
          setTimeout(() => {
            setPops((pNow) => pNow.slice(1))
          }, 800)
          return prev
        }
        const next = [...prev]
        next[index] = true

        const line = sassLines[Math.floor(Math.random() * sassLines.length)]
        setSass(line)
        speak(line)

        setTotalPopped((n) => n + 1)
        setPops((p) => [
          ...p,
          { id: nextPopId.current++, x: clientX - 10, y: clientY - 10, label: "POP!" },
        ])
        setTimeout(() => {
          setPops((pNow) => pNow.slice(1))
        }, 800)
        return next
      })
    },
    [sassLines, speak]
  )

  const resetAll = useCallback(() => {
    setPopped(Array(rows * cols).fill(false))
    setTotalPopped(0)
    const line = "Fresh sheet. Go pop crazy!"
    setSass(line)
    speak(line)
  }, [rows, cols, speak])

  const totalBubbles = rows * cols

  return (
    <div className="relative">
      {/* Keyframes for pop effect */}
      <style>{`
        @keyframes popFade {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(1.8) translateY(-40px); }
        }
      `}</style>

      <div className="flex flex-col items-center">
        {/* Grid */}
        <div
          role="grid"
          aria-label="Bubble wrap grid"
          className="mt-4"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, ${bubbleSize}px)`,
            gap: `${gap}px`,
          }}
        >
          {Array.from({ length: totalBubbles }).map((_, i) => {
            const isPopped = popped[i]
            return (
              <button
                key={i}
                role="gridcell"
                aria-pressed={isPopped}
                aria-label={isPopped ? "Bubble popped" : "Bubble not popped"}
                onClick={(e) => handlePop(i, e.clientX, e.clientY)}
                className={[
                  "flex items-center justify-center rounded-full border",
                  "transition-transform duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007acc]",
                  isPopped
                    ? "bg-[#007acc] text-white"
                    : "bg-white border-[#cce0ff]",
                ].join(" ")}
                style={{
                  width: bubbleSize,
                  height: bubbleSize,
                  boxShadow: isPopped
                    ? "0 0 10px #007acc, inset 0 0 5px #ffffff"
                    : "inset -3px -3px 8px rgba(0,0,0,0.10)",
                  transform: isPopped ? "scale(0.85) rotate(-10deg)" : "none",
                }}
              >
                {isPopped ? <Check aria-hidden="true" className="h-6 w-6" /> : null}
              </button>
            )
          })}
        </div>

        {/* Sass box */}
        <div
          id="sassBox"
          className="mt-6 min-h-[50px] text-center text-[1.15rem] font-semibold text-[#003366]"
          aria-live="polite"
        >
          {sass}
        </div>

        {/* Controls */}
        <div id="controls" className="mt-5 flex flex-wrap items-center gap-4">
          <Button
            id="resetBtn"
            onClick={resetAll}
            className="bg-[#004080] hover:bg-[#003366] text-white"
          >
            Reset All Bubbles
          </Button>
          <div id="counter" className="text-sm text-neutral-700">
            {`Total popped: ${totalPopped}`}
          </div>
        </div>
      </div>

      {/* Floating POP effects (full-screen fixed overlay) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 h-screen w-screen"
      >
        {pops.map((p) => (
          <div
            key={p.id}
            className="absolute select-none text-2xl font-bold text-[#004080]"
            style={{
              left: p.x,
              top: p.y,
              animation: "popFade 0.8s ease-out forwards",
              textShadow: "2px 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            {p.label}
          </div>
        ))}
      </div>
    </div>
  )
}
