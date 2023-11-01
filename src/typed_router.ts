import { type Static, type TObject, type TProperties, type TSchema, Type, TNot, TOptional, TString, TExclude, TRequired, ReadonlyUnwrapType, Optional, AssertType, Assert, IntersectType, TKind, TAnySchema, UnionToIntersect, UnionType, UnionResolve, TKeyOf, DecodeType, StaticDecode, TBoolean, TInteger } from '@sinclair/typebox'
import { TypeCheck, TypeCompiler } from '@sinclair/typebox/compiler'
import { Value } from '@sinclair/typebox/value'
import { createRouter, toRouteMatcher } from 'radix3'
import { spec, createRouteSchema } from './openapi_gen'

export type TypedRouter = ReturnType<typeof typedRouter>

type ToLower<T extends readonly string[]> = { [K in keyof T]: Lowercase<T[K]> }

const methodsUpper = ['GET', 'POST', 'PUT', 'DELETE'] as const
const methodsLower = methodsUpper.map((v) => v.toLowerCase()) as unknown as ToLower<
   typeof methodsUpper
>

export type HttpMethods = typeof methodsLower[number]

// Creates a string union of route path segments. Effectively splitting at each
//   `/` where each split is a member of the union. `/`s are removed.
type TakeSegments<P extends string> = P extends `/${infer Path}`
   ? Path extends `${infer Segment}/${infer Rest}`
      ? Segment | TakeSegments<`/${Rest}`>
   : Path
   : never

type TakeSlug<P extends string> = P extends `{${infer Slug}}` ? Slug : never

type Slugs<P extends string> = TakeSlug<TakeSegments<P>>

type InferAndReplace<T, U> = never extends T ? U : T

type PathStart = `/${string}`

type AllowedTypes = 
   | TString
   | TBoolean
   | TInteger

export type BaseApiDescription = {
   docs: {
      title: string,
      desc: string
   }
}

type ParamApiDescription<Schema> = {
   params: Schema
} & BaseApiDescription


// TODO: Path parameters are not allowed to be optional as per OpenAPI spec, enforce that here on the `params` object; hard and afraid of another 50 hours of TypeScript golfing.
type TypedRoutes = {
   [M in HttpMethods]: <
      Path extends PathStart,
      Validation extends TProperties,
   >(
      path: Path,
      // If slugs are present then so must be the params key with said slugs types.
      api: [Slugs<Path>] extends [never]
         ? BaseApiDescription
         : ParamApiDescription<InferAndReplace<Validation, Record<Slugs<Path>, AllowedTypes>>>,
      handler: (
         ctx: {
            // If there are no slugs params is empty (and not TProperties' default).
            params: [Slugs<Path>] extends [never] ? null : Static<NonNullable<TObject<Validation>>>
            request?: Request
         },
      ) => Response,
      // TODO: Have it return a typed router for chained routes?
   ) => void
}

// Runtime executed request validation function. Executes before user-provided
//   `handler` (from TypedRoutes).
type RequestValidationHandler = (
   request: Request,
   params: Record<string, string> | undefined,
) => void

// Return type of `radix3.lookup`.
type RouteLookup = { proc: RequestValidationHandler }

// TODO: Type the return for route lookup to the ENCASED handler.

// Our slugs are of the form `/foo/{bar}/baz` where `{bar}` is a slug. Radix3
//   expects the form `/foo/:bar/baz` where `:bar` is a slug. This does the
//   conversion for the entire path.
function toRadix3Slug (path: string) {
   return path.replaceAll(/{(\w+)}/g, ':$1')
}

function validatedParams<ParamsSchema> (
   cdt: TypeCheck<TObject>,
   params: unknown,
): params is ParamsSchema {
   if (cdt.Check(params)) {
      return true
   } else {
      return false
   }
}


function assertTypedSlugs (path:string, schema: {}) {
   const pathSlugs = [...path.matchAll(/{(\w+)}/g)].map((e) => e[1])
   const schemaKeys = Object.keys(schema)

   console.log('path slugs', pathSlugs)
   console.log('schema keys', schemaKeys)

   if (pathSlugs.length != schemaKeys.length) {
      // TODO: Proper 'compiler' style error
      console.log('ERROR: path slugs and schema key length mismatch')
      return false
   }

   const allPresent = pathSlugs.every((cur) => Object.hasOwn(schema, cur))
   console.log('all present', allPresent)
}

export function typedRouter () {
   // `createRouter` generic specifies return type of `rdx.lookup`.
   const rdx = createRouter<RouteLookup>()

   const wtf = toRouteMatcher(rdx)

   const routes = methodsLower.reduce((methods, m) => {
      // Immediate outer-function defined here is executed only once (useful for
      //   TypeBox type JIT compilation).
      // TODO: Cache ^^
      // TODO: Given distributed route definition in source code (i.e. different
      //       files) add a _warning_ here when it sees a route with the same
      //       path and method being defined as this will help guard against
      //       accidentally redefining a route which shouldn't happen.
      // TODO: Add grouping for things like v1, v2, v3 etc.
      
      methods[m] = (path, rawApiSchema, handler) => {
         console.log('Adding route')

         // Normalise API schema, if the input schema has a `params` key that
         //   will overwrite the default `{ params: {} }` we're setting here
         //   since `params` is only required if the URL has slugs for DX.
         const apiSchema = Object.assign({ params: {} }, rawApiSchema)

         // TODO: Print proper error message in assertTypedSlugs.
         // assertTypedSlugs(path, validationSchema?.params ?? {})
         assertTypedSlugs(path, apiSchema.params)
         const tbValidation = Type.Object(apiSchema.params)
         const CDT = TypeCompiler.Compile(tbValidation)

         // This function's scope is executed at runtime per request.
         const requestValidationHandler: RequestValidationHandler = (
            request,
            params,
         ) => {
            console.log('Input params:', params)
            const paramsConverted = Value.Convert(tbValidation, params)
            console.log('TypeBox converted:', paramsConverted)

            if (
               validatedParams<Parameters<typeof handler>[0]['params']>(
                  CDT,
                  paramsConverted,
               )
            ) {
               const handlerContext = {
                  params: paramsConverted,
                  request,
               } as const

               return handler(handlerContext)
            } else {
               // TODO: Proper error response
               return new Response('yeah not good enough hey mate')
            }
         }

         // Create OpenAPI schema for this route.
         createRouteSchema(m, path, tbValidation, apiSchema.docs)//handler)

         // `rdx.lookup` strictly returns an object with parameterised values
         //   (slugs), so assigning a handle to a key when adding the route
         //   means it wont be erased when returned.
         rdx.insert(`/${m.toUpperCase()}${toRadix3Slug(path)}`, {
            proc: requestValidationHandler,
         })
         // console.log('ctx', toRouteMatcher(rdx).ctx.table)
      }

      return methods
   }, <TypedRoutes>{})

   const match = (path: PathStart) => rdx.lookup(path)

   return {
      ...routes,
      match: match,
      spec: spec,
   }
}

// `sstur/nbit` has a nice parallel to multi-file routing: https://github.com/sstur/nbit?tab=readme-ov-file#splitting-routes-into-multiple-files
// TODO: This is the end-game API here, but will do for now. Ideally merge two
//       radix trees into one such that API routes in other files (to save
//       having a single giga-file) can be imported and added to the router
//       in index.ts which is the central (and thus easy to understand)
//       location for route definition. However, besides implementing the
//       merging of the trees im not sure if this is the best approach as
//       you wouldn't be able to see the route anyway and it's effectively
//       a layer of indirection. This way the whole application shares a single
//       router (this isn't meant to be super general purpose but specific to
//       defining and implementing reference REST APIs so...).
export const router = typedRouter()
