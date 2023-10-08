import { Static, TObject, TPickProperties, TProperties, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { Value } from '@sinclair/typebox/value'
import { Handler, Params, Router } from '@stricjs/router'

// TODO: Maybe this can be a macro.
const methodsUpper = ['GET', 'POST', 'PUT', 'DELETE'] as const
const methodsLower = methodsUpper.map((v) => v.toLowerCase()) as unknown as ToLower<
   typeof methodsUpper
>
// END TODO

type ToLower<T extends readonly string[]> = { [K in keyof T]: Lowercase<T[K]> }

type HttpMethods = typeof methodsLower[number]

type TypedRoutes = {
   [M in HttpMethods]: <
      Path extends string,
      // ParamsSchema extends Ensure<TProperties>,
      ParamsSchema extends TProperties,
      Schema = Static<TObject<ParamsSchema>>,
      ParamsKeys = Params<Path>,
   >(
      path: Path,
      params: TPickProperties<
         ParamsSchema,
         keyof Exclude<ParamsKeys, ParamsKeys & keyof Schema>
      >,
      handler: (ctx: Schema, ser: string) => Response,
   ) => TypedRoutes
}

type IndexedTypeRoutes = { [K in keyof TypedRoutes]: TypedRoutes[K] }

export interface TypedRouter extends TypedRoutes {}

export class TypedRouter {
   // private router: Router
   // TODO: type this
   record: any[][]

   constructor () {
      // this.router = new Router()
      this.record = []

      // Dynamically add HTTP-verbs methods to concrete object (so they can be
      //   called). There's an interface with a type API specified `TypedRoutes`
      //   but here is where that is actually _runtime created_.
      const methods = methodsLower.reduce((acc, cur) => {
         // TypeScript cannot assert that a function is _defined_ with required
         //   parameters as per it's type definition so be careful editing here.
         acc[cur] = (path, paramsSchema, handler) => {
            // TODO: Even better would be to globally cache it or something but that's
            //       a micro optimisation.
            // Methods are pre-compiled so this is only done once.
            const CDT = TypeCompiler.Compile(Type.Object(paramsSchema))

            // Encased handler is invoked at runtime upon each request to its
            //   route. If any request slugs/query-values/body-content fails to
            //   validate a default error response is returned, otherwise the
            //   provided inner handler is invoked at which point said request
            //   types are guaranteed to be correct.
            const encasedHandler: Handler<typeof path> = (ctx, ser) => {
               const paramsConverted = Value.Convert(
                  Type.Object(paramsSchema),
                  ctx.params,
               )

               if (CDT.Check(paramsConverted)) {
                  // Passed, set converted params and call handler.
                  // TODO: Types
                  ctx.params = paramsConverted
                  return handler(ctx, ser)
               } else {
                  // TODO: Better response formats both HTML and JSON similarly to how
                  //       we respond to valid requests.
                  console.log(Array.from(CDT.Errors(paramsConverted)))
                  return new Response(
                     JSON.stringify([
                        { reason: 'MALFORMED REQUEST' },
                        ...CDT.Errors(paramsConverted),
                     ]),
                     {
                        status: 400,
                        headers: {
                           'content-type': 'application/json',
                        },
                     },
                  )
               }
            }

            this.record.push([cur, path, encasedHandler])
            return this
         }

         return acc
      }, <IndexedTypeRoutes>{})

      Object.assign(this, methods)
   }

   plugin (app: Router) {
      for (const item of this.record) {
         app[item[0]](...item.slice(1))
      }
   }
}
