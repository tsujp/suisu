import { createPublicClient, http, stringify, hexToNumber, hexToBigInt, hexToString } from 'viem'
import { mainnet } from 'viem/chains'
import { wrap, Context, Handler, ResponseBody, Router, RouterMethods, Wrapper } from '@stricjs/router'
import fastJson from 'fast-json-stringify'
import { ApiType } from './u256.ts'
import { Kind, Static, StaticDecode, TSchema, Type } from '@sinclair/typebox'
import { TypeCheck, TypeCompiler } from '@sinclair/typebox/compiler'
import { Value } from '@sinclair/typebox/value'
import { Server } from 'bun'

// const client = createPublicClient({
//   chain: mainnet,
//   transport: http('https://mainnet.infura.io/v3/e9e4d77cf4614a3ea8226e934e97d178'),
// })

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

// const getNet = async () => {
//   const p = hexToNumber(await client.request({ method: 'net_peerCount' }))
//   const nid = hexToBigInt(await client.request({ method: 'eth_chainId' }))
//   // const nid = await client.request({ method: 'eth_chainId' })
//   const lis = await client.request({ method: 'net_listening' })

//   return {
//     peers: p,
//     chain: nid,
//     listening: lis,
//     // listening: 'foobarbaz',
//   }
// }

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

// function StrictRecord<K extends TSchema, T extends TSchema>(K: K, T: T) {
//   return Type.Record(K, T, { additionalProperties: false })
// }

// type __httpMethodsT = 'get' | 'post' | 'put'

// type __objT = {
//   readonly [x in __httpMethodsT]?: number,
// }

// const __obj: __objT = {
//   get: 55,
//   get: 123,
// }

// const HttpMethods = Type.Union([
//   Type.Literal('get'),
//   Type.Literal('post'),
//   Type.Literal('put'),
// ])

// type HttpMethodsT = Static<typeof HttpMethods>

// const Wat = StrictRecord(HttpMethods, Type.Object({ x: Type.Number() }))
// type WatT = Static<typeof Wat>

// const Wat22 = Type.Union([Wat])
// type WatT22 = Static<typeof Wat22>

// const QueryT = StrictRecord(Type.String(), Type.Object({ x: Type.Number() }))
// type FooBar = Static<typeof QueryT>
// type FooBar22 = StaticDecode<typeof QueryT>

// const RouteA = Type.Object({
//   path: Type.String(),
// })

// const RouteSchema = Type.Union(
//   [RouteA, Wat],
//   // No additional properties; like `{ additionalProperties: false }` for a
//   //   Type.Record().
//   { unevaluatedProperties: false }
// )



// type Route = Static<typeof RouteSchema>

// const FooRoute: Route = {
//   path: '/foo/:id',
//   get: {
//     x: 55,
//   },
//   post: {
//     x: 123,
//   },
//   // query: [{
//   //   name: 
//   // }]
// }

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

  return new Response(fastJson(GetNetType)(r), jsonHeader)
  // return 'hi'
}


function guardHandle(a, b, c) {
  console.log('a', a)
  console.log('b', b)
  console.log('c', c)

  return '55'
}

app.guard('/', async (ctx, ser) => {
  console.log('guard got:', ctx)
  console.log('path:', ctx.params)
  ctx.response = 'bing bong baz' as string
  // return new Response('bad')
  // ctx.signal = '123'
  return true
})

const mockedData = {
  peers: 123,
  chain: 1n,
  listening: '123a',
}

app.get('/validated/:id', (ctx, ser) => {
  // console.log('`/validated/:id` called', req)

  const wat = ctx.response

  return mockedData
}).wrap('/', muhHandle)

export default app
