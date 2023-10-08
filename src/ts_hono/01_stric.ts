import { createPublicClient, http, stringify, hexToNumber, hexToBigInt, hexToString } from 'viem'
import { mainnet } from 'viem/chains'
import { wrap, Context, Handler, ResponseBody, Router, RouterMethods, Wrapper, Params } from '@stricjs/router'
import fastJson from 'fast-json-stringify'
import { ApiType, TU256 } from './u256.ts'
import { Assert, Evaluate, JsonTypeBuilder, Kind, RequiredPropertyKeys, Static, StaticDecode, TExtends, TKeyOf, TKeyOfProperties, TObject, TPickProperties, TProperties, TSchema, TString, Type, TypeGuard, UnionResolve } from '@sinclair/typebox'
import { TypeCheck, TypeCompiler } from '@sinclair/typebox/compiler'
import { Value } from '@sinclair/typebox/value'
import { Foo } from './02_stric_class.ts'

const GetNetType = Type.Object({
  peers: Type.Integer(),
  chain: ApiType.U256(),
  listening: Type.Boolean(),
})

const C = TypeCompiler.Compile(GetNetType)

// TODO: Get hostname by configuration.
// const app = new Router({ base: 'http://localhost:3000' })
const app = new Router()
const foo = new Foo()
const GetNetRequest = Type.String()

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

function StrictRecord<K extends TSchema, T extends TSchema>(K: K, T: T) {
  return Type.Record(K, T, { additionalProperties: false })
}

const HttpMethods = Type.Union([
  Type.Literal('get'),
  Type.Literal('post'),
  Type.Literal('put'),
])

type HttpMethodsT = Static<typeof HttpMethods>

// Required route fields
const RouteRequired = Type.Object({
  path: Type.String(),
})

// const QueryParameterTypes = Type.Union([ApiType.U256(), Type.String()])
// const QueryParameterTypes = Type.Union([Type.String()])
// const QPT_C = TypeCompiler.Compile(QueryParameterTypes).Check
// const Wat22 = Type.Function([Type.String()], Type.Intersect([QueryParameterTypes]))

// Type.Pick(JsonTypeBuilder, 'String')
// const adsdsa = typeof TypeDefBuilder

// const RouteQuery = <T extends TSchema>(t: T) => Type.Object({
const RouteQuery = Type.Object({
  // TODO: Valid slug formatting.
  slug: Type.String(),
  // schema: Type.Function([t], ),
  schema: Type.Unknown(),
})

const HttpVerbs = StrictRecord(
  Type.Optional(HttpMethods),
  Type.Object({
    // query: Type.Array(RouteQuery(ApiType.U256())),
    query: Type.Array(RouteQuery),
  }),
  // Type.Object({
  //   query:
  // })
)

const RouteSchema = Type.Union(
  [RouteRequired, HttpVerbs],
  { unevaluatedProperties: false }
)

export type Route = StaticDecode<typeof RouteSchema>

// const FooRoute: Route = {
//   path: '/foo',
//   get: {
//     query: [{
//       slug: 'id',
//       schema: TypeCompiler.Compile(ApiType.U256()),
//     }],
//     // If the request also has a body:
//     // body: ...
//   }
// }

// foo.specialRoute(FooRoute, (ctx, res) => {
//   console.log('blah') 
// })

// start works example
type XYZ = TObject<{ id5: TString }>

// const somePath = '/foo/:id'
const someObj: XYZ = Type.Object({
  id5: Type.String()
})
// end works example

// how to infer params from a string?
const somePath = '/foo/:id/:bar'
type inferParams = Params<typeof somePath>
type pathParams = keyof Params<typeof somePath>
// end how to infer

// Need to make sure that all keys in somePath are present in someParams
//   else provide an error.

const someParams = {
  // idx: Type.String(),
  idx: Type.Integer(),
  id: Type.Integer(),
  // bar: Type.String(),
}

type asdsaddasdsa = typeof someParams

// type typedParamsKeys = Pick<typeof someParams, pathParams>
// type typedParamsKeys = Pick<pathParams, typeof someParams>

type nakedObj = TPickProperties<typeof someParams, keyof inferParams>
type nakedObj22 = TObject<typeof someParams>
type nakedObj33 = TObject<TPickProperties<typeof someParams, keyof inferParams>>
type wat123 = Evaluate<nakedObj22>
type wat123123 = Assert<pathParams, keyof typeof someParams>
// type wat123123_2 = TExtends<keyof typeof someParams, pathParams>
// type wat123123_2 = TKeyOfProperties<nakedObj22>
type wat123123_2 = TKeyOf<nakedObj22>
// type adshjkasdhjkas = UnionResolve<[wat123123_2, TKeyOf<nakedObj33>]>
type allIn<T, C> = {
  [Property in keyof T]: Property extends keyof C ? true : false
}
type unionMatch<T, C> = allIn<T, C> extends allIn<C, T> ? true : false

type maybe123 = allIn<inferParams, typeof someParams>
type maybe456 = unionMatch<inferParams, typeof someParams>
// type unionAssert = Assert<'id', 'idx'>

type someParamsType<Schema extends TSchema | undefined> = Schema extends undefined
  ? unknown
  : Schema extends TSchema
  ? Static<NonNullable<Schema>>
  : unknown

type mahWat = someParamsType<nakedObj22>

// type mahParams = someParamsType<TObject<someParams>>


// foo.get(
foo.specialRoute(
  '/foo/:id',
  {
    id: Type.String(),
  },
  (ctx, res) => {
    console.log('`/foo/:id` called')
    return new Response('hi from /foo/:id')
  }
)

// function guardHandle(a, b, c) {
//   console.log('a', a)
//   console.log('b', b)
//   console.log('c', c)

//   return '55'
// }

// app.guard('/', async (ctx, ser) => {
//   console.log('guard got:', ctx)
//   console.log('path:', ctx.params)
//   ctx.response = 'bing bong'
//   // ctx.set.body = 'bing bong'
//   // return new Response('bad')
//   // ctx.signal = '123'
//   return true
// })

// const mockedData = {
//   peers: 123,
//   chain: 1n,
//   listening: '123a',
// }

// app.get('/validated/:id', (ctx, ser) => {
//   // console.log('`/validated/:id` called', req)

//   console.log('ctx res', ctx.response)

//   // const wat = ctx.set.body
//   // ctx.set.body = 'yolo'

//   return mockedData
// }).wrap('/', muhHandle)

app.plug(foo)

export default app
// start works example (but not usefulc os only TSchem)
// type XYZ_22 = TSchema
// const somePath_22 = '/foo/:id'
// const someObj_22: XYZ_22 = Type.Object({
//   id: Type.String()
// })
// end works example TSchema
