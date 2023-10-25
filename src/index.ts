import { Type } from '@sinclair/typebox'
import { fetchHandler } from './fetch_handler'
import { typedRouter, router } from './typed_router'
// import { v1_networkInfo } from './api/info'

// Routes
import './api/info'

router.get('/foo/{bar}/lorem/{ipsum}/{dolor}', {
   bar: Type.Integer(),
   ipsum: Type.Optional(Type.String()),
   dolor: Type.Boolean(),
   // extra: Type.String(),
}, (ctx) => {
   console.log('ctx:\n', ctx)
   ctx.params
   ctx.params.bar
   const abc = ctx.params.ipsum ?? 'foo'
   ctx.params.dolor

   console.log('hello from handler')
   return new Response('Foo bar')
})

const app = fetchHandler(router)

export default app

// router.get('/info/net', {}, (ctx) => {
//    return new Response('wadda do')
// })


// router.get('/another', v1_networkInfo())

// import { createRouter, toRouteMatcher } from 'radix3'

// const abc = toRouteMatcher(router.foo)
// console.log('asddsa')
// console.log(abc)
// const xyz = createRouter({ routes: abc })
// console.log('bingbong')
// console.log(xyz)
// console.log('assadad')
// console.log(router.foo.ctx)
// console.log(router.foo.ctx.rootNode)
// console.log('matcher object shite')
// for (const p in abc) {
//    console.log('a', abc[p])
// }

// const h = foo.match('/get/foo/12345/lorem/TWO_STRING/false')
// // const h = foo.match('/get/blah')
// console.log('lookup', h)

