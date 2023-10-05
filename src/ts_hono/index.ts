import { Router } from '@stricjs/router'
import { ApiType } from './u256.ts'
import { Type } from '@sinclair/typebox'
import { TypedRouter } from './typed_router.ts'

// TODO: Make these both just one call.
const base = new Router()
const app = new TypedRouter()

// Client response type.
const GetNetType = Type.Object({
  peers: Type.Integer(),
  chain: ApiType.U256(),
  listening: Type.Boolean(),
})

// Upstream proxy type(s).
// N/A right now.

const jsonHeader = {
  headers: { 'Content-Type': 'application/json' }
}

// app.post('/foo/bar')
// app.get('/foo/bar')
app.specialRoute(
  '/foo/:id',
  {
    id: Type.Integer(),
  },
  (ctx, ser) => {
    // At this point `params.id` is guaranteed to be an integer.
    console.log('route callback invokved')
  }
)

base.plug(app)

export default base
