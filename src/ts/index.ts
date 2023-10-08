import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { createPublicClient, http, stringify, hexToNumber, hexToBigInt, hexToString } from 'viem'
import { mainnet } from 'viem/chains'
import { Optional } from '@sinclair/typebox'
import { net } from './schema'

/*
curl https://mainnet.infura.io/v3/e9e4d77cf4614a3ea8226e934e97d178 \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"net_peerCount","params": [],"id":1}'
*/

// interface BigInt {
//   toJSON: () => string
// }
BigInt.prototype.toJSON = function () {
  return this.toString()
  // return BigInt.asUintN(this)
}

// function replacer(key, value) {
//   if (typeof value === 'bigint') {
//     return {
//       type: 'bigint',
//       value: value.toString()
//     };
//   } else {
//     return value;
//   }
// }

const get_netVersionSchema = {
  200: t.Object({
    block: t.Optional(t.String()),
    peers: t.String(),
  })
}

// console.log(get_netVersionSchema)
// console.log()
// console.log(JSON.stringify(get_netVersionSchema))

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://mainnet.infura.io/v3/e9e4d77cf4614a3ea8226e934e97d178'),
})


const getBlockNumber = async () => {
  const bn = await client.getBlockNumber()
  const bn2 = stringify(bn)
  const foo = await client.request({ method: 'net_peerCount' })
  console.log('foo is:', foo)

  return { block: bn2, peers: foo }
}


const clampy = (n: bigint) => {
  // n > Number.MAX_SAFE_INTEGER ? console.log('cannae do it') : console.log('is:', BigInt.asUintN(53, n))
  if (n > Number.MAX_SAFE_INTEGER) {
    console.log('cannae do it')
    return BigInt(123)
  } else {
    console.log('is:', BigInt.asUintN(53, n))
    // return Number(BigInt.asUintN(53, n))
    return BigInt.asUintN(53, n)
  }
}

const getNet = async () => {
  // const p = hexToNumber(await client.request({ method: 'net_peerCount' }))
  // const p = hexToBigInt(await client.request({ method: 'net_peerCount' }))
  const p = hexToNumber(await client.request({ method: 'net_peerCount' }))
  // const nid = hexToBigInt(await client.request({ method: 'eth_chainId' }))
  const nid = hexToBigInt(await client.request({ method: 'eth_chainId' }))
  // const nid = hexToNumber(await client.request({ method: 'eth_chainId' }))

  console.log('nid:', nid)
  console.dir(nid)
  const lis = await client.request({ method: 'net_listening' })

  return {
    peers: p,
    chain: nid,
    // chain: clampy(nid),
    listening: lis,
  }
}

net.netVersion

const app = new Elysia()
  .use(swagger())
  .get('/', () => {
    console.log('received request')

    fetch('https://mainnet.infura.io/v3/e9e4d77cf4614a3ea8226e934e97d178', {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'net_peerCount',
        params: [],
        id: 1,
      }),
    })
      .then((res) => {
        console.log('infura response:', res)
        res.json().then(foo => {
          console.log('json???:', foo)
          return new Response(foo)
        })
        // const a = res.blob()
        // const j = JSON.parse(a)
        // console.dir('json?', j)
        // const j = JSON.parse(res.body)
        // return new Response(res.body.result)
        // return new Response('blah blah')
      })
  })
  .get('/baz', async () => getNet(),
    {
      response: net.netVersion,
  //     // response: get_netVersionSchema,
  //     // response: {
  //     //   200: t.Object({
  //     //     block: t.Optional(t.String()),
  //     //   })
  //     // }
    }
  )
  .listen(5882)

console.log('running')
