import { Type } from '@sinclair/typebox'
import { Router } from '@stricjs/router'
import { TypedRouter } from './typed_router'
import { ApiType } from './u256.ts'

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
   headers: { 'Content-Type': 'application/json' },
}

app.get('/foo/:id', {
   id: Type.Integer(),
}, (ctx, ser) => {
   // At this point `params.id` is guaranteed to be an integer.
   return new Response('why howdy there')
})

base.plug(app)

export default base
