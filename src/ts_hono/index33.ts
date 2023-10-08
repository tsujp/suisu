import { createPublicClient, http, stringify, hexToNumber, hexToBigInt, hexToString } from 'viem'
import { Elysia, t } from 'elysia'
import { mainnet } from 'viem/chains'
import fastJson from 'fast-json-stringify'
import { ApiType } from './u256.ts'
import { Type, Static } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ElysiaType } from 'elysia/custom-types'

// ElysiaType.Yew256 = ApiType.U256

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://mainnet.infura.io/v3/e9e4d77cf4614a3ea8226e934e97d178'),
})

// const GetNetType = Type.Object({
//   peers: Type.Integer(),
//   chain: ApiType.U256(),
//   listening: Type.Boolean(),
// })


const GetNetType = t.Object({
  peers: t.Integer(),
  chain: ApiType.U256(),
  listening: t.Boolean(),
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
//     // listening: true,
//   }
// }

const mockedData = {
  peers: 123,
  chain: 1n,
  listening: 'aaaa',
  // listening: null
}

const app = new Elysia()

app.get('/', (c) => {
  // const r = await getNet()
  const r = mockedData
  console.log('Raw response')
  console.log(r)
  // console.log('Valid?', C.Check(r))
  // console.log('Errors?', Array.from(C.Errors(r)))
  // const str = fastJson(JSON.stringify(GetNetType))
  const str = fastJson(GetNetType)
  const j = str(r)
  console.log('End response payload')
  console.log(j)
  // return new Response(j, { headers: { 'content-type': 'application/json'}})
  return r
// })
}, {
    afterHandle(ctx) {
      console.log(ctx.response)
      const str = fastJson(GetNetType)
      const j = str(ctx.response)
      return new Response(j, { headers: { 'content-type': 'application/json'}})
    },
    response: GetNetType,
})
//     response: GetNetType
// })

// }, { response: { 200: GetNetType }})

// TODO: That WinterCG or whatever standard export so anything can use it.
export default app
