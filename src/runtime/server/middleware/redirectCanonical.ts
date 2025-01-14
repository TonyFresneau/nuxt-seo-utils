import { useSiteConfig } from '#site-config/server/composables/useSiteConfig'
import { defineEventHandler, getRequestHost, sendRedirect, setHeader } from 'h3'
import { joinURL } from 'ufo'

export default defineEventHandler((e) => {
  const siteConfig = useSiteConfig(e)
  if (siteConfig.url) {
    const siteConfigHostName = new URL(e.path, siteConfig.url).host
    const host = getRequestHost(e, { xForwardedHost: true })
    // check for redirect header
    if (e.headers.get('x-nuxt-seo-redirected')) {
      return
    }
    // if origin doesn't match site, do a redirect
    // we need to avoid redirect loops so check if the origin is already a redirect
    if (host.split(':')[0] !== siteConfigHostName.split(':')[0]) {
      // set a header to avoid redirect loops
      setHeader(e, 'x-nuxt-seo-redirected', 'true')
      return sendRedirect(e, joinURL(siteConfig.url, e.path), 301)
    }
  }
})
