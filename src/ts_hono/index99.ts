import { createPublicClient, http, stringify, hexToNumber, hexToBigInt, hexToString } from 'viem'
import { mainnet } from 'viem/chains'
import { wrap, Context, Handler, ResponseBody, Router, RouterMethods, Wrapper } from '@stricjs/router'
import fastJson from 'fast-json-stringify'
import { ApiType } from './u256.ts'
import { Kind, Static, StaticDecode, TSchema, Type } from '@sinclair/typebox'
import { TypeCheck, TypeCompiler } from '@sinclair/typebox/compiler'
import { Value } from '@sinclair/typebox/value'
import { Server } from 'bun'

// copied from: https://github.com/bunsvr/router/blob/main/src/core/constants.ts#L2
const methods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH', 'ALL', 'GUARD', 'REJECT'];
const methodsLowerCase = methods.map(v => v.toLowerCase());
const methodsUpper = methods.map(v => v)

function convert(path: string) {
    if (path.length < 2) return path;
    if (path.at(-1) === '/') return path.substring(0, path.length - 1);
    return path;
}
// end copy

const goodMockData = {
  peers: 123,
  chain: 1n,
  listening: true,
}

const GetNetType = Type.Object({
  peers: Type.Integer(),
  chain: ApiType.U256(),
  listening: Type.Boolean(),
})

const C = TypeCompiler.Compile(GetNetType)

const getNet = () => {
  // TODO: Random good or bad mock data return
  return goodMockData
}

// api(REQUEST_SCHEMA, RESPONSE_SCHEMA, honos res and c)
//   e.g. api(GetNetRequest, GetNetResult, (result, c) => { ... })

// TODO: Get hostname by configuration.
const app = new Router()
const GetNetRequest = Type.String()

// Needs to:
//   - Take a route (and any params or body specified as TypeBox schemas)
//   - Take a response schema
//   - Do some async stuff (e.g. proxying request)
//   - Validate request can be coerced to the correct type
//   - Respond with valid data payload or raise internal server error

function StrictRecord<K extends TSchema, T extends TSchema>(K: K, T: T) {
  return Type.Record(K, T, { additionalProperties: false })
}

type __httpMethodsT = 'get' | 'post' | 'put'

type __objT = {
  readonly [x in __httpMethodsT]?: number,
}

const __obj: __objT = {
  get: 55,
  get: 123,
}

const HttpMethods = Type.Union([
  Type.Literal('get'),
  Type.Literal('post'),
  Type.Literal('put'),
])

type HttpMethodsT = Static<typeof HttpMethods>

const Wat = StrictRecord(HttpMethods, Type.Object({ x: Type.Number() }))
type WatT = Static<typeof Wat>

const RouteA = Type.Object({
  path: Type.String(),
})

const RouteSchema = Type.Union(
  [RouteA, Wat],
  // No additional properties; like `{ additionalProperties: false }` for a
  //   Type.Record().
  { unevaluatedProperties: false }
)

type Route = Static<typeof RouteSchema>

const FooRoute: Route = {
  path: '/foo/:id',
  get: {
    x: 55,
  },
  post: {
    x: 123,
  },
  // query: [{
  //   name: 
  // }]
}

const jsonHeader = { headers: { 'Content-Type': 'application/json' } }

// TODO: Receives GetNetType dynamically from caller.
// TODO: Receives information on whether or not to respond with JSON or HTML
//       from caller.
// Custom wrap handler.
function muhHandle(r: any, c: Context, s: Server) {
  // console.log('a', r)
  // console.log('b', c)
  // console.log('c', s)

  // return new Response(fastJson(GetNetType)(r), jsonHeader)
  return new Response('hi')
}

interface Foo<R extends string> extends RouterMethods<R> {}
class Foo<R extends string = '/'> {
  private record: any[][];
    private wsRecord: any[][];

  constructor(public readonly root: R = '/') {
        if (root !== '/' && root.endsWith('/'))
            // @ts-ignore
            root = root.slice(0, -1);
        this.root = root;
        this.record = [];
        // this.record = {};
        this.wsRecord = [];

        // Looks like `app` now uses a dictionary instead of an array so redo this
        for (const method of methodsLowerCase) this[method] = (path: string, handler: Handler, opts: any) => {
            // Special cases
            if (this.root !== '/') path = this.root + path;
            path = convert(path);

            const args = [method, path, handler] as any[];
            if (opts) args.push(opts);

          console.log('hi')

            this.record.push(args);


        console.log('class print', this)
            return this;
        }

    
      //   for (const method of methodsLowerCase) this[method] = (path: string, handler: Handler, opts: any) => {
      //       // Special cases
      //       if (this.root !== '/') path = this.root + path;
      //       path = convert(path);

      //       const args = [method.toLocaleUpperCase(), path, handler] as any[];
      //       if (opts) args.push(opts);

      //     console.log('hi')

      //       this.record[path] = {
      //         [method.toLocaleUpperCase()]: handler
      // }


      //   console.log('class print', this)
      //       return this;
      //   }
    }


    specialRoute<R extends Route>(
      routeDef: R,
      callback: (ctx: string, res: number) => string)
    {
      // this.guard(path, (ctx) => {
      
      // })

      const aabb = (req: string) => {
        return new Response('It still works')
      }

      this.record.push(['get', '/foo', aabb])    

      // this.get(path, (ctx, ser) => {
      //   console.log('specialRoute registered route called')

      //   return new Response('Why howdy there')
      // })
    }


    /**
     * Use the default response wrapper for a group of subroutes
     */
    wrap(path: string): this;

    /**
     * Add a response wrapper for a group of subroutes
     */
    wrap(path: string, type: keyof typeof wrap): this;

    /**
     * Add a custom response wrapper for a group of subroutes
     */
    wrap(path: string, fn: Wrapper): this;

    /**
     * Wrap the response
     */
    wrap(path: string, handler: Wrapper | keyof typeof wrap = 'default') {
      console.log('wrap has been called', path, handler)

        if (typeof handler === 'string')
            handler = wrap[handler];

        if (this.root !== '/')
            path = this.root + path;
        path = convert(path);

        this.record.push(['wrap', path, handler]);
        // this.record[path] = { 'WRAP': handler }
        return this;
    }

      plugin(app: Router) {
    // console.log('app is', app)
        for (const item of this.record) {
          console.log('item:', item)
          app[item[0]](...item.slice(1));
        }
        for (const item of this.wsRecord) app.ws(item[0], item[1]);
    }
}

function guardHandle(ctx, ser) {
  console.log('guard handle called')
  console.log(ctx)
  console.log(ser)
}

const foo = new Foo()

foo.specialRoute('/validated/:id', )

// foo.guard('/validated', guardHandle)

// foo.get('/validated/:id', (req) => {
//   console.log('`/validated/:id` called', req)

//   // return new Response('foo')
//   return 'foo'
// })
// // .wrap('/', muhHandle)

// foo.get('/bingbong', (req) => {
//   return new Response('Howdy!')
// })
//.wrap('/', muhHandle)

// console.log('app before', app)
app.plug(foo)
// console.log('app after', app)

// console.log(app.fetch.toString())
// console.log()
// console.log(app.get.toString())
// console.log()
// console.log(app.all.toString())
// console.log()
// console.log(app.guard.toString())

console.log('Plugins', app.plugins)

export default app
