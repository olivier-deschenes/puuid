import { createFileRoute } from '@tanstack/react-router'

import { DomainCarousel } from '#/components/domain-carousel'
import { ROOT_DOMAIN, sites } from '#/lib/sites'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden
        className="grid-wash pointer-events-none absolute inset-0 -z-10"
      />

      <header className="flex items-center justify-between px-6 py-6 font-mono text-xs tracking-tight sm:px-10">
        <span className="text-foreground">{ROOT_DOMAIN}</span>
        <span className="text-muted-foreground">{sites.length} sites</span>
      </header>

      <div className="flex flex-1 items-center px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-4xl">
          <DomainCarousel />
        </div>
      </div>

      <footer className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 px-6 py-6 font-mono text-xs sm:px-10">
        <span>
          <kbd className="text-foreground">↑</kbd>{' '}
          <kbd className="text-foreground">↓</kbd> to browse ·{' '}
          <kbd className="text-foreground">↵</kbd> to open
        </span>
        <span>Olivier Deschênes</span>
      </footer>
    </main>
  )
}
