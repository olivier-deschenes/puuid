import { useCallback, useEffect, useRef, useState } from 'react'
import { IconArrowUpRight } from '@tabler/icons-react'

import { ROOT_DOMAIN, siteUrl, sites } from '#/lib/sites'
import { cn } from '#/lib/utils'

const ROTATE_MS = 4200
/** How many neighbours to keep mounted on each side of the active row. */
const WINDOW = 3
const START = Math.max(
  sites.findIndex((site) => site.prefix === 'gas'),
  0,
)
/** Widest prefix — it sizes the reel so the dot never shifts. */
const LONGEST = sites.reduce(
  (longest, site) =>
    site.prefix.length > longest.length ? site.prefix : longest,
  '',
)

const siteAt = (position: number) =>
  sites[((position % sites.length) + sites.length) % sites.length]

export function DomainCarousel() {
  // A monotonic position rather than an index, so the reel can spin past the
  // ends of the list in either direction without snapping back.
  const [position, setPosition] = useState(START)
  const [rotating, setRotating] = useState(true)
  const [hovering, setHovering] = useState(false)

  const positionRef = useRef(position)
  positionRef.current = position

  const step = useCallback(
    (delta: 1 | -1) => setPosition((current) => current + delta),
    [],
  )

  /** Spin the shortest way round to a given entry in the list. */
  const goTo = useCallback((slot: number) => {
    const current = positionRef.current
    const currentSlot = ((current % sites.length) + sites.length) % sites.length
    let delta = slot - currentSlot
    if (delta > sites.length / 2) delta -= sites.length
    if (delta < -sites.length / 2) delta += sites.length
    setPosition(current + delta)
  }, [])

  // Auto-rotate until the visitor takes over, and hold while hovered.
  useEffect(() => {
    if (!rotating || hovering) return
    const timer = window.setInterval(() => step(1), ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [rotating, hovering, step])

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

  const active = siteAt(position)
  const activeSlot = ((position % sites.length) + sites.length) % sites.length

  const rows = []
  for (let offset = -WINDOW; offset <= WINDOW; offset += 1) {
    rows.push(position + offset)
  }

  return (
    <div
      className="flex w-full flex-col items-start gap-8"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ ['--row' as string]: '1.24em' }}
    >
      <a
        href={siteUrl(active)}
        aria-label={`${active.prefix}.${ROOT_DOMAIN} — ${active.name}. ${active.description}`}
        className="group/link block w-full focus-visible:outline-none"
        onFocus={() => setHovering(true)}
        onBlur={() => setHovering(false)}
      >
        <h1
          className={cn(
            'font-mono leading-[1.05] font-medium tracking-tight',
            // Stacked on phones; one unbroken hostname from `sm` up, sized so
            // the longest prefix still fits on the line.
            'flex flex-col items-start',
            'sm:flex-row sm:flex-nowrap sm:items-center',
            'text-[clamp(2rem,11.5vw,3rem)] sm:text-[clamp(1.75rem,7.6vw,4.75rem)]',
          )}
        >
          {/* The reel: three rows tall, the neighbours showing through faintly
              above and below the one in play, fading out at the edges. */}
          <span
            className={cn(
              'relative block h-[calc(var(--row)*3)] overflow-hidden',
              '[mask-image:linear-gradient(to_bottom,transparent,black_28%,black_72%,transparent)]',
            )}
          >
            {/* Invisible, but it gives the reel the width of the longest prefix. */}
            <span aria-hidden className="invisible block">
              {LONGEST}
            </span>
            <span
              className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{
                transform: `translateY(calc(var(--row) * ${1 - position}))`,
              }}
            >
              {rows.map((row) => (
                <span
                  key={row}
                  aria-hidden={row !== position}
                  className={cn(
                    'absolute inset-x-0 h-[var(--row)] text-left leading-[var(--row)] sm:text-right',
                    'transition-opacity duration-500 motion-reduce:transition-none',
                    row === position
                      ? 'text-foreground opacity-100'
                      : 'text-foreground opacity-20',
                  )}
                  style={{ top: `calc(var(--row) * ${row})` }}
                >
                  {siteAt(row).prefix}
                </span>
              ))}
            </span>
          </span>
          <span className="inline-flex h-[var(--row)] items-center sm:h-[calc(var(--row)*3)]">
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
            const current = slot === activeSlot
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
                    'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
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
