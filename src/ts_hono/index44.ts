import { createPublicClient, http, stringify, hexToNumber, hexToBigInt, hexToString } from 'viem'
import { mainnet } from 'viem/chains'
import { Hono, MiddlewareHandler } from 'hono'
import fastJson from 'fast-json-stringify'
import { ApiType } from './u256.ts'
import { Static, TSchema, Type } from '@sinclair/typebox'
import { TypeCheck, TypeCompiler } from '@sinclair/typebox/compiler'
import { logger } from 'hono/logger'

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://mainnet.infura.io/v3/e9e4d77cf4614a3ea8226e934e97d178'),
})

const GetNetType = Type.Object({
  peers: Type.Integer(),
  chain: ApiType.U256(),
  listening: Type.Boolean(),
})
console.log('JSON Schema from TypeBox')
const C = TypeCompiler.Compile(GetNetType)
console.log('-----------')
console.log(GetNetType)
console.log('-----------')
console.log(JSON.stringify(GetNetType))
console.log(TypeCompiler.Code(GetNetType))

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

const app = new Hono()
app.use('*', logger())

const validMiddleware: MiddlewareHandler<{
  Variables: {
    valid: <T extends TSchema>(type: TypeCheck<T>, value: unknown) => Static<T> & string
  }
}> = async (c, next) => {
  c.set('valid', (type, value) => {
    if (type.Check(value)) {
      return fastJson(GetNetType)(value)
    } else {
      return JSON.stringify(Array.from(type.Errors(value)))
    }
  })
  await next()
}

// app.use('*', validMiddleware)

// app.get('/', validMiddleware, async (c) => {
app.get('/', async (c) => {
  const r = await getNet()
  console.log('Raw response')
  console.log(r)
  console.log('Valid?', C.Check(r))
  console.log('Errors?', Array.from(C.Errors(r)))
  // const str = fastJson(JSON.stringify(GetNetType))
  // const str = fastJson(GetNetType)
  // const j = str(r)
  // console.log('End response payload')
  // console.log(j)
  // return c
  // return c.finalized

  // const wat = c.var.valid(C, r)
  // return c.text(wat ? 'true' : 'false')

  return c.text(c.var.valid(C, r))
})

// TODO: That WinterCG or whatever standard export so anything can use it.
export default app
