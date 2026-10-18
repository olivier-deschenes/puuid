import {
  createServerEntry,
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'

import { ROOT_DOMAIN } from '#/lib/sites'

const startHandler = createStartHandler(defaultStreamHandler)

const WWW_HOST = `www.${ROOT_DOMAIN}`

/**
 * The apex is canonical. `www` is attached to the same Worker purely so it can
 * send visitors one hop over, keeping the path and query intact.
 */
export default createServerEntry({
  fetch(request, opts) {
    const url = new URL(request.url)

    if (url.hostname === WWW_HOST) {
      url.hostname = ROOT_DOMAIN
      return Response.redirect(url.toString(), 301)
    }

    return startHandler(request, opts)
  },
})
