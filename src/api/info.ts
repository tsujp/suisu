import { Static, TObject, TProperties, Type } from '@sinclair/typebox'
import { router } from '../typed_router'

// Encompasses JSON-RPC:
//    - net_version (does not use this API)
//    - eth_chainId (what is used instead of net_version)
//    - net_peerCount
//    - net_listening
router.get('/info/net', {
  docs: {
   title: 'Basic client network information',
    desc: 'Returns the current chain ID, whether the client is listening for network connections, and the current number of connected peers.'
 },
 response: {
   200: {
    foo: Type.Integer()
   },
  100: {
    bar: Type.String(),
    boing: Type.Boolean()
  },
  }
}, (ctx) => {
    const returnData = {
      foo: 123
    }

    return {
      200: returnData,
      100: {
        bar: 'a string',
        boing: false
        // boing: 'what'
      }
    }
})

// Encompasses JSON-RPC:
//    - web3_clientVersion
//
// TODO: Still insure of whether structuring this by key is valuable enough.
// Aims to present information in a standard format, instead of:
//    `Geth/v1.12.1-stable/linux-amd64/go1.19.1`

// TODO: Helper type for objects so I can call o({ foo: Type.String() }) for
//       example.
// TODO: Then decide where I am putting the response type info, where it is now
//       or on the handler itself?

router.get('/info/client/{foo}', {
  params: {
    foo: Type.String()
  },
  docs: {
    title: 'Basic client information',
    desc: 'Returns the clients version information.',
    foo: 'bning'
  },
  response: {
    200: {
      name: Type.String(),
      version: Type.String(),
      architecture: Type.String(),
      // extra: Type.String()
      extra: Type.Integer()
    }
}}, (ctx) => {
    // Stub response payload
    const responseData = {
      name: 'foo',
      version: 'bar',
      architecture: 'baz',
      // extra: 'bong',
      extra: 13
    }

    return { 200: responseData }
  })
