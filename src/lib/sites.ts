export interface Site {
  /** Subdomain label in front of `.puuid.com`. */
  prefix: string
  /** Product name as the site presents itself. */
  name: string
  /** One line on what it does. */
  description: string
  /** Standalone domain pointing at the same app, when there is one. */
  alias?: string
}

/**
 * Every `*.puuid.com` hostname, as configured in Cloudflare
 * (Workers custom domains on the puuid.com zone).
 */
export const sites: Array<Site> = [
  {
    prefix: 'barcodes',
    name: 'barcodes.page',
    description: 'Generate Code 128 barcodes. That is the whole site.',
    alias: 'barcodes.page',
  },
  {
    prefix: 'budget',
    name: 'Budget',
    description:
      'Track spending by category and follow recurring income and expenses.',
  },
  {
    prefix: 'cineplex',
    name: 'Cineplex',
    description:
      'Three days of premium-format seat availability across Montréal.',
  },
  {
    prefix: 'gas',
    name: 'Plein',
    description: 'Real-time gas prices across Québec, nearest to you first.',
  },
  {
    prefix: 'list',
    name: 'Top List',
    description:
      'Private group rankings — make a group, share the link, rate the places you go.',
  },
  {
    prefix: 'mapping',
    name: 'Typematch',
    description: 'Match and map values between data sources in a workspace.',
  },
  {
    prefix: 'metro',
    name: 'Transit Overlay',
    description:
      'Chrome extension that puts transit times on Marketplace and Centris listings.',
  },
  {
    prefix: 'patio',
    name: 'Patio Maker',
    description: 'Design layered patios and get the plank lengths in inches.',
  },
  {
    prefix: 'room',
    name: 'rmplnr',
    description:
      'Draw rooms to scale, place furniture, and see what fits before you move it.',
    alias: 'rmplnr.com',
  },
  {
    prefix: 'timeline',
    name: 'tlmkr',
    description:
      'Build layered timelines in the browser and export PNG, SVG or JSON.',
    alias: 'tlmkr.com',
  },
  {
    prefix: 'yard',
    name: 'Yardv2',
    // TODO: the app renders nothing without signing in — write the real line.
    description: 'A work in progress.',
    alias: 'yardv2.com',
  },
]

export const ROOT_DOMAIN = 'puuid.com'

export const siteUrl = (site: Site) => `https://${site.prefix}.${ROOT_DOMAIN}`
