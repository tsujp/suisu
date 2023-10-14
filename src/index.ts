import { Type } from '@sinclair/typebox'
import { typedRouter } from './typed_router'
import { fetchHandler } from './fetch_handler'

const foo = typedRouter()

foo.get(
	'/foo/{bar}/lorem/{ipsum}/{dolor}',
	{
		bar: Type.Integer(),
		ipsum: Type.Optional(Type.String()),
		dolor: Type.Boolean(),
		// extra: Type.String(),
	},
	(ctx) => {
		console.log('ctx:\n', ctx)
		ctx.params
		ctx.params.bar
		const abc = ctx.params.ipsum ?? 'foo'
		ctx.params.dolor

		console.log('hello from handler')
		return new Response('Foo bar')
	},
)

// const h = foo.match('/get/foo/12345/lorem/TWO_STRING/false')
// // const h = foo.match('/get/blah')
// console.log('lookup', h)

const fch = fetchHandler(foo)

export default fch
