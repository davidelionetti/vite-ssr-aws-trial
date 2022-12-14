import type { CompatibilityEvent } from 'h3'
import { createCookies } from '@vueuse/integrations/useCookies'
import { CookieChangeOptions } from 'universal-cookie'
import { setCookie } from 'h3'

let universalCookies: ReturnType<typeof createCookies>

const useUniversalCookies = (params?: any, options?: any) => {
  return universalCookies(params, options)
}

const initCookiesPlugin = (event?: CompatibilityEvent) => {
  universalCookies = createCookies(event?.req)

  if (!import.meta.env.SSR || !event) {
    return
  }

  // this is a watcher to set the cookie from the server
  useUniversalCookies().addChangeListener((change: CookieChangeOptions) => {
    if (event.res!.headersSent) {
      return
    }

    if (change.value === undefined) {
      const unsetOptions = (<any>Object).assign({}, change.options)
      unsetOptions.maxAge = -1

      setCookie(event, change.name, '', change.options)
    } else {
      setCookie(event, change.name, change.value, change.options)
    }
  })
}

export default initCookiesPlugin

export { useUniversalCookies }
