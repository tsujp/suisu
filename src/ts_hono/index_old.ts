import { createPublicClient, http, stringify, hexToNumber, hexToBigInt, hexToString } from 'viem'
import { mainnet } from 'viem/chains'
// import { Optional } from '@sinclair/typebox'
// import { net } from './schema'
import { Hono } from 'hono'
import { Static, Kind, TSchema, TypeRegistry, FormatRegistry, ValueGuard, SchemaOptions, Type, TInteger, TransformDecodeBuilder, TTransform, TString, Hint } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { TypeSystem } from '@sinclair/typebox/system'
import { TypeCompiler } from '@sinclair/typebox/compiler'
// const fastJson = require('fast-json-stringify')
import fastJson from 'fast-json-stringify'

const MAX_U256 = BigInt(2 ** 256)

// BigInt.prototype.toJSON = function () {
//   return this.toString().replace(/"/g, '')
//   // return BigInt.asUintN(this)
// }

// TypeRegistry.Set<{ min: bigint, max: bigint }>('U256', (schema, value) => {
// declare module '@sinclair/typebox' {
TypeRegistry.Set<U256Options>('U256', (schema, value) => {
  console.log('received', schema, value)
  console.log()
  console.dir(schema.min)
  // const wat = typeof value === 'bigint' && value >= schema.min && value >= 0n && value <= schema.max && value <= MAX_U256
  const wat = (typeof value === 'bigint' || typeof value === 'number') &&
    value >= 0n && (schema.min ? value >= schema.min : true) &&
    value <= MAX_U256 && (schema.max ? value <= schema.max : true)
  // console.log('type', typeof value === 'bigint')
  // console.log(typeof value)
  // console.log('schema min', schema.min ? value >= schema.min : true)
  // console.log('0n min', value >= 0n)
  // console.log('schema max', schema.max ? value <= schema.max : true)
  // console.log('MAX_U256 max', value <= MAX_U256)
  // console.log('schema good?', wat)
  console.log(
    'good?', wat, ' (',
    'got', typeof value, typeof value === 'bigint', ' / ',
    's. min', schema.min ? value >= schema.min : true, ' / ',
    '>0n', value >= 0n, ' / ',
    's. max', schema.max ? value <= schema.max : true, ' / ',
    '<MAX_U256', value <= MAX_U256, ')')

  return wat
})

interface TU256<T extends number | bigint = bigint> extends TSchema {
  [Kind]: 'U256',
  // static: number,
  // static: bigint,
  static: T,
  type: 'integer',
  min?: bigint,
  max?: bigint,
}

interface U256Options extends SchemaOptions {
  min?: bigint,
  max?: bigint,
}

function InBigIntRange(value: unknown, min_i: bigint, max_i: bigint): value is bigint {
  return typeof value === 'bigint' && min_i <= value && value <= max_i
}

// Creates a U256.
const U256 = <T extends number | bigint = bigint>(options?: U256Options) => {
  return {
    [Kind]: 'U256',
    type: 'integer',
    min: 0n,
    max: MAX_U256,
    ...options,
  } as TU256<T>
}

// const Y = Type.Transform(Type.Integer())
//   // Decode JSON Schema value into U256.
//   .Decode((value) => {
//     console.log('decode received:', value)
//     return BigInt(value)
//     // BigInt(value)
//   })
//   // Encode U256 into JSON Schema value.
//   .Encode(value => {
//     console.log('encode received:', value)
//     return Number(BigInt.asUintN(256, value))
//     // return value.toString()
//   })

// // console.log(Y)
// // console.dir(Y)

// // TODO: Want a type error here since it's not valid without the `n`.
// // const xx1 = Value.Decode(Y, 12345)
// const xx1 = Value.Decode(Y, Number.MAX_SAFE_INTEGER)
// console.log('decoded:', xx1)

// // const xx2 = Value.Encode(Y, 12345n)
// const xx2 = Value.Encode(Y, xx1)
// console.log('encoded:', xx2)

// // console.log(xx1)
// // console.log(xx2)

const TransformU256 = Type.Transform(U256<number>())
  // Decode JSON Schema value into U256.
  .Decode((value) => {
    console.log('decode received:', value)
    return BigInt(value)
    // BigInt(value)
  })
  // Encode U256 into JSON Schema value.
  .Encode(value => {
    console.log('encode received:', value)
    return Number(BigInt.asUintN(256, value))
    // return value.toString()
  })

// const yy1 = Value.Decode(TransformU256, Number.MAX_SAFE_INTEGER)
const yy1 = Value.Decode(TransformU256, 2**256)
// const yy1 = Value.Decode(TransformU256, 123)
console.log('decoded u256:', yy1)

const yy2 = Value.Encode(TransformU256, yy1)
console.log('encoded u256:', yy2)


const T = Type.Object({
  peers: Type.Integer({ minimum: 420 }),
  chain: U256(),
  // chain: U256({ min: -1n }),
  // chain: U256({ min: -1n }),
  // chain: U256({ min: 1n }),
  // chain: Y,
  // foo: t.Numeric(),
  // chain: t.BigInt({
  //   type: 'integer',
  //   minimum: 0n,
  //   maximum: MAX_U256,
  // }),
  listening: Type.Boolean(),
})

console.log(T)
console.dir(T)

const C = TypeCompiler.Compile(T)

type Foo = Static<typeof T>

console.log(BigInt(2**64).toString())
console.log(2**64)

// console.log(JSON.stringify(T, null, 2).replace(/"/g, ''))
// console.log(JSON.stringify(T, null, 2))
const fastString = fastJson(T)
console.log(fastString({
  peers: 1,
  chain: -1n,
  listening: false,
}))
// console.log(

// console.log('value check:', Value.Check(T, {
//   peers: 1,
//   chain: 69n,
//   listening: true,
// }))

// const muh_test = Type.Object({
//   peers: Type.Integer({ minimum: 420 }),
//   chain: U256(),
//   listening: Type.Boolean(),
// })

// console.log('muh_test', muh_test)

console.log('valid???????', C.Check({
  peers: 1,
  chain: 70n,
  listening: false,
}))

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://mainnet.infura.io/v3/e9e4d77cf4614a3ea8226e934e97d178'),
})

const getNet = async () => {
  // const p = hexToNumber(await client.request({ method: 'net_peerCount' }))
  // const p = hexToBigInt(await client.request({ method: 'net_peerCount' }))
  const p = hexToNumber(await client.request({ method: 'net_peerCount' }))
  // const nid = hexToBigInt(await client.request({ method: 'eth_chainId' }))
  // const nid = hexToBigInt(await client.request({ method: 'eth_chainId' }))
  const nid = await client.request({ method: 'eth_chainId' })
  // const nid = hexToNumber(await client.request({ method: 'eth_chainId' }))

  // console.log('nid:', nid)
  // console.dir(nid)
  const lis = await client.request({ method: 'net_listening' })

  return {
    peers: p,
    chain: nid,
    // chain: clampy(nid),
    listening: lis,
  }
}
const app = new Hono()

app.get('/', async (c) => {
  const r = await getNet()
  console.log(r)
  // console.dir(r)
  return c.json(r)
  // c.text('Foobar')
})
// app.get('/', getNet())


export default app

/*
curl https://mainnet.infura.io/v3/e9e4d77cf4614a3ea8226e934e97d178 \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"net_peerCount","params": [],"id":1}'
*/
