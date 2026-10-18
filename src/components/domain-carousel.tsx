import { useCallback, useEffect, useRef, useState } from 'react'
import { IconArrowUpRight } from '@tabler/icons-react'

import { ROOT_DOMAIN, siteUrl, sites } from '#/lib/sites'
import { cn } from '#/lib/utils'

const ROTATE_MS = 4200
const FIRST = Math.max(
  sites.findIndex((site) => site.prefix === 'gas'),
  0,
)

export function DomainCarousel() {
  const [index, setIndex] = useState(FIRST)
  const [previous, setPrevious] = useState(FIRST)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [rotating, setRotating] = useState(true)
  const [hovering, setHovering] = useState(false)

  const indexRef = useRef(index)
  indexRef.current = index

  const goTo = useCallback((next: number, dir?: 1 | -1) => {
    const current = indexRef.current
    const target = (next + sites.length) % sites.length
    if (target === current) return
    setDirection(dir ?? (target > current ? 1 : -1))
    setPrevious(current)
    setIndex(target)
  }, [])

  const step = useCallback(
    (delta: 1 | -1) => goTo(indexRef.current + delta, delta),
    [goTo],
  )

  // Auto-rotate until the visitor takes over, and hold while hovered.
  useEffect(() => {
    if (!rotating || hovering) return
    const timer = window.setInterval(() => step(1), ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [rotating, hovering, step, index])

  // Up/down anywhere on the page moves the carousel.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      event.preventDefault()
      setRotating(false)
      step(event.key === 'ArrowDown' ? 1 : -1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [step])

  const active = sites[index]

  /** Where a slot sits in the vertical reel: in view, on its way out, or queued. */
  const slotOffset = (slot: number) => {
    if (slot === index) return 'translate-y-0 opacity-100'
    const leaving = slot === previous
    const up = direction === 1 ? leaving : !leaving
    return cn(
      up ? '-translate-y-full' : 'translate-y-full',
      'opacity-0',
      !leaving && 'duration-0',
    )
  }

  return (
    <div
      className="flex w-full flex-col items-start gap-8"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="w-full">
        <a
          href={siteUrl(active)}
          aria-label={`${active.prefix}.${ROOT_DOMAIN} — ${active.name}. ${active.description}`}
          className="group/link block focus-visible:outline-none"
          onFocus={() => setHovering(true)}
          onBlur={() => setHovering(false)}
        >
          <h1
            className={cn(
              'font-mono leading-[1.05] font-medium tracking-tight',
              // Stacked on phones; one unbroken hostname from `sm` up, sized so
              // the longest prefix still fits on the line.
              'flex flex-col items-start',
              'sm:flex-row sm:flex-nowrap sm:items-baseline',
              'text-[clamp(1.6rem,8.4vw,2.5rem)] sm:text-[clamp(1.5rem,5.9vw,3.6rem)]',
            )}
          >
            {/* The reel: every prefix stacked in one grid cell, so the cell is
                as wide as the longest one and the dot never moves. */}
            <span className="grid overflow-hidden py-[0.12em]">
              {sites.map((site, slot) => (
                <span
                  key={site.prefix}
                  aria-hidden={slot !== index}
                  className={cn(
                    'col-start-1 row-start-1 justify-self-start sm:justify-self-end',
                    'text-foreground transition-[translate,opacity] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
                    slotOffset(slot),
                  )}
                >
                  {site.prefix}
                </span>
              ))}
            </span>
            <span className="inline-flex items-center py-[0.12em]">
              <span className="text-muted-foreground whitespace-nowrap">
                .{ROOT_DOMAIN}
              </span>
              <IconArrowUpRight
                aria-hidden
                className="text-muted-foreground group-hover/link:text-foreground group-focus-visible/link:text-foreground ml-2 size-[0.4em] shrink-0 transition-[transform,color] duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 motion-reduce:transition-none"
                stroke={1.75}
              />
            </span>
          </h1>
        </a>

        {/* Rotation progress — restarts with each prefix. */}
        <div className="bg-border mt-4 h-px w-full max-w-md overflow-hidden">
          <div
            key={`${index}-${rotating}`}
            className={cn(
              'bg-foreground/50 h-px origin-left',
              rotating ? 'animate-[reel-progress_4200ms_linear]' : 'opacity-0',
              hovering && '[animation-play-state:paused]',
            )}
            style={{ animationFillMode: 'forwards' }}
          />
        </div>
      </div>

      <div className="min-h-[5.5rem] max-w-xl" aria-live="polite">
        <div className="flex items-baseline gap-3">
          <p className="text-base font-medium">{active.name}</p>
          {active.alias ? (
            <a
              href={`https://${active.alias}`}
              className="text-muted-foreground hover:text-foreground font-mono text-xs underline decoration-dotted underline-offset-4 transition-colors"
            >
              {active.alias}
            </a>
          ) : null}
        </div>
        <p className="text-muted-foreground mt-2 text-[0.95rem] leading-relaxed text-pretty">
          {active.description}
        </p>
      </div>

      <nav aria-label="All sites" className="w-full">
        <ul className="flex flex-wrap gap-x-1 gap-y-1">
          {sites.map((site, slot) => {
            const current = slot === index
            return (
              <li key={site.prefix}>
                <button
                  type="button"
                  aria-current={current ? 'true' : undefined}
                  onClick={() => {
                    setRotating(false)
                    goTo(slot)
                  }}
                  className={cn(
                    'rounded-full border px-3 py-1.5 font-mono text-xs transition-colors',
                    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
                    current
                      ? 'border-foreground text-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                  )}
                >
                  {site.prefix}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
