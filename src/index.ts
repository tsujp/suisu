if (import.meta.path !== Bun.main) {
   console.error('Please only invoke this script via `bun run`.')
}

import { Roarr as log } from 'roarr'

import { type ServeOptions, type Server } from 'bun'
import { fetchHandler as apiHandler } from './fetch_handler'
import { fetchHandler as docHandler } from './doc'
import { api } from './api'
import { join } from 'path'
// XXX: Use Node's API until Bun has `mkdir` itself.
import { mkdir } from 'node:fs/promises'

const OUTPUT_DIR = 'dist'
const SPEC_OUTPUT_FILE = 'spec.json'

const API_PORT = Bun.env.SUISU_API_PORT || '3355'
const API_HOST = Bun.env.SUISU_AI_HOST || 'localhost'

const DOC_PORT = Bun.env.SUISU_DOC_PORT || '3366'
const DOC_HOST = Bun.env.SUISU_DOC_HOST || 'localhost'

// XXX: Ideal API but not for now.
// import './api/info'

// default (no args) outputs spec.json
// arg --spec runs the api too
// arg --frontend runs the frontend too

// Drop-dead simple (read: dumb) CLI argument parsing. Maybe use minimist later.
console.log('args', Bun.argv)

// Yes, this means for now running the frontend requires running the API.
const runApi = Bun.argv.at(2) === '--api'
const runDoc = Bun.argv.at(3) === '--doc'


// Always generate `spec.json`.
const jsonSpec = api.spec.getSpecAsJson()
const jsonSpecDir = join(import.meta.dir, OUTPUT_DIR)
const jsonSpecFile = join(jsonSpecDir, SPEC_OUTPUT_FILE)

await mkdir(jsonSpecDir, { recursive: true })
await Bun.write(jsonSpecFile, jsonSpec)
log('OpenAPI schema generated')

function runServer (fetchHandler: ServeOptions, msg: string = 'server') {
   log(`Starting ${msg} server`)
   const server = Bun.serve(fetchHandler)
   // We'll get them from the server just in-case.
   log(`Success, ${msg} listening on http://${server.hostname}:${server.port}`)
   return server
}

const apiServer = runApi ? runServer(apiHandler(API_PORT, API_HOST, api), 'REST API') : null
const docServer = runDoc ? runServer(await docHandler(DOC_PORT, DOC_HOST), 'documentation frontend') : null

process.on('SIGINT', () => {
   log('Stopping any running servers')

   apiServer?.stop()
   docServer?.stop()

   log('Done, now terminating process')

  process.exit(0)
})

// router.get('/missing/params/{foo}/object', {
//    params: {
//       foo: Type.String()
//    },
//    docs: {
//       title: 'bing',
//       desc: 'bong',
//    }
// }, (ctx) => {
//    ctx.params.foo
//    return new Response('howdy')
// })

// router.get('/no/params', {
//    docs: {
//       title: 'bing',
//       desc: 'bong',
//    }
// }, (ctx) => {
//    ctx.params
//    return new Response('howdy')
// })

// router.get('/foo/{bar}/lorem/{ipsum}/{dolor}', {
//    params: {
//       bar: Type.Integer(),
//       ipsum: Type.String(),
//       dolor: Type.Boolean(),
//       // extra: Type.String(),
//    },
//    docs: {
//       title: 'Node\'s network information',
//       desc: 'Returns a nodes foo bar baz',
//    }
//    // TODO: Another parameter which is an object which has a description and summary of the route (for use in OpenAPI spec generation).
// }, (ctx) => {
//    console.log('ctx:\n', ctx)
//    ctx.params
//    ctx.params.bar
//    const abc = ctx.params.ipsum ?? 'foo'

//    console.log('hello from handler')
//    return new Response('Foo bar')
// })

// console.log(router.spec.getSpecAsJson(undefined, 2))



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
