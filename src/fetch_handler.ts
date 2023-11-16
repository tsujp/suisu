import { type ServeOptions, type UnixServeOptions } from 'bun'
import { type TypedRouter } from './typed_router'

export function fetchHandler (port: string, hostname: string, router: TypedRouter) {
   const fch: ServeOptions | UnixServeOptions = {
      port,
      hostname,
      fetch: (req, ser) => {
         const url = new URL(req.url)
         const route = `/${req.method}${url.pathname}` as const
         const h = router.match(route)

         // TODO: Proper 404.
         return h?.proc(req, h.params ?? {}) ?? new Response('404 not found')
      },
   }

   return fch
}
