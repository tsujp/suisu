import { Ensure, Static, TObject, TPickProperties, TProperties } from '@sinclair/typebox';
import { Handler, Params, Router } from '@stricjs/router'

// TODO: This can be a macro.
// const methods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH', 'ALL', 'GUARD', 'REJECT']
const methodsUpper = ['GET', 'POST', 'PUT', 'DELETE'] as const
const methodsLower = methodsUpper.map(v => v.toLowerCase());
// const methodsUpper = methods.map(v => v)
// END TODO

type HttpMethods = typeof methodsUpper[number]

type TypedRoutes = {
	// Example, so now `app.GET` would require a string and number.
	// [M in HttpMethods]: (foo: string, bar: number) => void

	[M in HttpMethods as Lowercase<M>]: <
		Path extends string,
		// ParamsSchema extends Ensure<TProperties>,
		ParamsSchema extends TProperties,
		Schema = Static<TObject<ParamsSchema>>,
		ParamsKeys = Params<Path>,
	>(
		path: Path,
		params: TPickProperties<
			ParamsSchema,
			keyof Exclude<ParamsKeys, ParamsKeys & keyof Schema>
		>,
		callback: (ctx: Schema, ser: string) => void,
	) => void
}

type Wat55 = keyof TypedRoutes
type Idx22 = {
	[M in Wat55]: any
}
type Idx33 = Record<Wat55, any>

type Wat = { [K in keyof TypedRoutes]: TypedRoutes[K] }

export interface TypedRouter extends TypedRoutes {}

/*
for loop thing has been invoked
item: [ "get", "/foo/:id", {
    id: {
      [Symbol(TypeBox.Kind)]: "Integer",
      type: "integer"
    }
  } ]
*/


function Wrapper<T extends object>(): new (init: T) => T {
  return class {
    constructor(init: T) {
      Object.assign(this, init);
    }
  } as any;
}

// export class TypedRouter implements TypedRouter {
// export class TypedRouter extends Wrapper<TypedRoutes>() {
export class TypedRouter {
	// [key: string]: any
	// [key: string]: any

	private router: Router
	private record: any[][]
	
	constructor() {
		// this.router = new Router()
		console.log('for loop')

		// Dynamically add HTTP verbs to concrete object (so they can be actually
		//   called). Essentially there's an interface with a type API specified
		//   above `TypedRoutes` but here is where that is actually _runtime
		//   created_.


		// const methods = methodsLower.reduce((acc, cur) => {
		// 	acc = Object.assign(acc, {
		// 		[cur]: (foo: string) => { console.log('hi') }
		// 	})
		// 	return acc
		// }, <TypedRoutes>{})

		// console.log('bing bong', methods)
		
		// for (const method of methodsLower) {
		// 		ting[`${method}`] = (path: string, handler: Handler) => {
		// 		this.record = []
		// 		console.log('...invoked')

		// 		const args = [method, path, handler]

		// 		this.record.push(args)
		// 	}
		// }

		// super(methods)

		
		for (const method of methodsLower) {
			Object.assign(this, {
				[method]: (path: string, handler: Handler) => {
					this.record = []
					console.log('...invoked')

					const args = [method, path, handler]

					this.record.push(args)
				}
			})
		}

		console.log('for loop done')
		console.log(this)

		return this
	}

	plugin(app: Router) {
		console.log('plugin')
		// nothing?
    for (const item of this.record) {
      console.log('item:', item)
      app[item[0]](...item.slice(1));
    }
	}
}
