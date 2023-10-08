import { createPublicClient, http, stringify, hexToNumber, hexToBigInt, hexToString } from 'viem'
import { mainnet } from 'viem/chains'
import { wrap, Context, Handler, ResponseBody, Router, RouterMethods, Wrapper } from '@stricjs/router'
import fastJson from 'fast-json-stringify'
import { ApiType } from './u256.ts'
import { Kind, Static, StaticDecode, TSchema, Type } from '@sinclair/typebox'
import { TypeCheck, TypeCompiler } from '@sinclair/typebox/compiler'
import { Value } from '@sinclair/typebox/value'
import { Server } from 'bun'

//
  // record: {
  //   "/foo/:id": {
  //     GET: [Function: AsyncFunction]
  //   },
  //   "/": {
  //     WRAP: [Function]
  //   }
  // },
//

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

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://mainnet.infura.io/v3/e9e4d77cf4614a3ea8226e934e97d178'),
})

const GetNetType = Type.Object({
  peers: Type.Integer(),
  chain: ApiType.U256(),
  listening: Type.Boolean(),
})

// console.log('JSON Schema from TypeBox')
const C = TypeCompiler.Compile(GetNetType)
// console.log('-----------')
// console.log(GetNetType)
// console.log('-----------')
// console.log(JSON.stringify(GetNetType))
// console.log(TypeCompiler.Code(GetNetType))

const getNet = async () => {
  const p = hexToNumber(await client.request({ method: 'net_peerCount' }))
  const nid = hexToBigInt(await client.request({ method: 'eth_chainId' }))
  // const nid = await client.request({ method: 'eth_chainId' })
  const lis = await client.request({ method: 'net_listening' })

  return {
    peers: p,
    chain: nid,
    listening: lis,
    // listening: 'foobarbaz',
  }
}

// app.use('*', async (c, next) => {
//   await next()
//   console.log(c.newResponse)
//   console.log('handler response value seen as:', c.res)
//   console.log(await c.res.text())
//   return c.text('foo')
//   // console.log('what?', c, next)
// })

// api(REQUEST_SCHEMA, RESPONSE_SCHEMA, honos res and c)
//   e.g. api(GetNetRequest, GetNetResult, (result, c) => { ... })

// TODO: Get hostname by configuration.
// const app = new Router({ base: 'http://localhost:3000' })
const app = new Router()
const GetNetRequest = Type.String()

// const asyncWrap = async (b: ResponseBody) => new Response(b)
// const bingbong = {
//   asyncWrap: async (res, ctx, server) => new Response(res)
// }

// const asyncWrap: Wrapper = async (r) => {
//   console.log(' i have been called')
//  return await new Response(r)
// }
// async function asyncWrap(res, ctx, server) {
//   new Response(res)
// }

// app.use('WRAP', '/', bingbong.asyncWrap)
// app.use('WRAP', '/', asyncWrap)
// app.wrap('/', asyncWrap)



// Needs to:
//   - Take a route (and any params or body specified as TypeBox schemas)
//   - Take a response schema
//   - Do some async stuff (e.g. proxying request)
//   - Validate request can be coerced to the correct type
//   - Respond with valid data payload or raise internal server error

// TODO: Parameterised typebox typing?

// const c

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

// const Wat22 = Type.Union([Wat])
// type WatT22 = Static<typeof Wat22>

// const QueryT = StrictRecord(Type.String(), Type.Object({ x: Type.Number() }))
// type FooBar = Static<typeof QueryT>
// type FooBar22 = StaticDecode<typeof QueryT>

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




// const FooRoute = {
//   path: '/foo/:id',
//   query: {
//     name: 
//   }
// }

const jsonHeader = {
    headers: { 'Content-Type': 'application/json' }
}

// TODO: Receives GetNetType dynamically from caller.
// TODO: Receives information on whether or not to respond with JSON or HTML
//       from caller.
// Custom wrap handler.
function muhHandle(r: any, c: Context, s: Server) {
  // console.log('a', r)
  // console.log('b', c)
  // console.log('c', s)

  // return new Response(fastJson(GetNetType)(r), jsonHeader)
  return 'hi'
}


// function guardHandle(a, b, c) {
//   console.log('a', a)
//   console.log('b', b)
//   console.log('c', c)
//   return '55'
// }

// app.guard('/', async (ctx, ser) => {
//   console.log('guard got:', ctx)
//   console.log('path:', ctx.params)
//   // return new Response('bad')
//   ctx.signal = '123'
//   return null
// })

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

        this.record.push(['WRAP', path, handler]);
        // this.record[path] = { 'WRAP': handler }
        return this;
    }

      plugin(app: Router) {
    // console.log('app is', app)
        for (const item of this.record) app[item[0]](...item.slice(1));
        for (const item of this.wsRecord) app.ws(item[0], item[1]);
    }
}

const foo = new Foo()
foo.get('/validated/:id', (req) => {
  console.log('`/validated/:id` called', req)

  // return {
  //   peers: 123,
  //   chain: 1n,
  //   listening: '123',
  // }

  return new Response('foo')
})
//.wrap('/', muhHandle)

console.log('app before', app)
app.plug(foo)
console.log('app after', app)

// app.get('/foo/:id', async (req) => {
//   // res.callNotFound
//   console.log(req.params)

//   // const id = Value.Convert(Type.Integer(), req.params.id)
//   // console.log(id)

//   const teh = Type.Object({
//     id: Type.Integer()
//   })

//   const isValid = Value.Check(teh, req.params)
//   console.log(isValid)
//   const bing = Value.Convert(teh, req.params)
//   console.log(bing)

//   // return new Response(fastJson(GetNetType)(await getNet()))
//   // return fastJson(GetNetType)(await getNet())
//   return await getNet()

//   // console.log('Raw response')
//   // console.log(r)
//   // console.log('Valid?', C.Check(r))
//   // console.log('Errors?', Array.from(C.Errors(r)))
//   // const str = fastJson(JSON.stringify(GetNetType))
//   // const str = fastJson(GetNetType)
//   // const j = str(r)
//   // console.log('End response payload')
//   // console.log(j)
//   // return c
//   // return c.finalized

//   // const wat = c.var.valid(C, r)
//   // return c.text(wat ? 'true' : 'false')

//   // return c.text(c.var.valid(C, r))
//   // return new Response(j)
//   // console.log('got j', j)
//   // await j.then(Response.json)
// }, { chain: true }).wrap('/', muhHandle)


console.log('Plugins', app.plugins)

// TODO: That WinterCG or whatever standard export so anything can use it.
export default app
    // console.log('wrap has been called')
