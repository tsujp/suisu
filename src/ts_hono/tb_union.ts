import { AssertProperties, DecodeType, Ensure, Evaluate, ObjectProperties, ObjectPropertyKeys, PropertiesReducer, Static, StaticDecode, TKind, TNumber, TObject, TPickProperties, TProperties, TPropertyKey, TSchema, TString, TTransform, TTransformResolve, TransformFunction, TransformOptions, Type } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"
import { Params } from "@stricjs/router"

const path = '/one/two/:id'

// Decomposed scenario.

type StricjsParams = Params<typeof path>

// v1
// type ObjectlessSchema = {
// 	[key: string]: TKind,
// }

const paramsSchema = {
	id: Type.Integer()
	// id: Type.String()
}

type TbParamsSchema = TObject<typeof paramsSchema>
type x = TPickProperties<typeof paramsSchema, 'id'>
type y = TObject<typeof paramsSchema>


type zz = TTransformResolve<y, [StricjsParams]>
type zz2 = TransformFunction<StaticDecode<y>, StricjsParams>
type zz3 = TransformFunction<StricjsParams, StaticDecode<y>>


type D = StaticDecode<y>

type Z55 = D extends StricjsParams ? true : false


// Actual scenario (v1 working!!!)
//   - This one works, a naked object can be provided and the second callback
//     parameter will have the evaluated typescript type.
//   - TODO: From this one the Schema object needs the key thing from path.

thing(
	path,
	{
		wat: Type.Integer(),
		// foo: '123',
	},
	(ctx, abc) => {
		abc.wat
		console.log('Callback')
	}
)

// Function which takes StricjsParams (R) and a second object literal parameter
//   (P) and requires all keys in (R) are present in (P) and (P) has no
//   extra keys not in (R).
function thing<
		Path extends string,
		Schema extends Ensure<TProperties>,
	>(
		routeSchema: Path,
		paramSchema: Schema,
		callback: (ctx: R, abc: Static<TObject<Schema>>) => void
	) {
	
}

// v1 end


// v2 start

thing_2(
	path,
	{
		// id: '123',
		id: Type.Integer(),
		// wat: Type.Integer(),
		// foo: '123',
	},
	(abc, xyz) => {
		console.log('Callback')
	}
)

type paramsKeys = keyof Params<typeof path>
const theParams = { wat: Type.String() }
type staticParams = keyof Static<TObject<typeof theParams>>

type GotTheJuice<W, C> = Exclude<W, W & keyof C>

type GotTheJuice_2<W, O extends TProperties, C> = TPickProperties<O, keyof Exclude<W, W & keyof C>>
// type GotTheJuice_2<W, O extends TProperties, C> = Exclude<W, W & keyof C> extends never
// 	? never
// 	: TPickProperties<O, C>

// type testJuice = GotTheJuice_2<Params<typeof path>, typeof abc123>

// Function which takes StricjsParams (R) and a second object literal parameter
//   (P) and requires all keys in (R) are present in (P) and (P) has no
//   extra keys not in (R).
function thing_2<
		Path extends string,
		// Schema extends Static<TObject<Ensure<TProperties>>>,
		Schema extends Ensure<TProperties>,
		R = Static<TObject<Schema>>,
		// R = TObject<Schema>,
	>(
		routeSchema: Path,
		// paramSchema: GotTheJuice<Params<Path>, R>,
		paramSchema: GotTheJuice_2<Params<Path>, Schema, R>,
		callback: (abc: Static<TObject<Schema>>, xyz: R) => void
	) {
	
}

// v2 end




// function dothing<S extends StricjsParams>(s: S) {
function dothing<
	paramsKeys extends staticParams,
	// staticParams,
	// InputPath extends string = ParamsKeys<InputPath>,
	// T extends string,
	// ParamsKeys<T>,
	// S extends StricjsParams,
	// S extends Static<TObject<Ensure<TProperties>>>,
	// C = keyof Params<InputPath>
	// C = ParamsKeys<InputPath>
>(c: paramsKeys) {
	return c
}

// const theParams = { wat: Type.Integer() }
// const theParams = { id: Type.Integer() }
const cando = dothing(path)

// const theParams = { wat: Type.Integer() }
// type staticParams = Static<TObject<typeof theParams>>
// const cando = dothing(theParams)




// paramSchema: TObject<P>,
// Schema extends Ensure<TProperties>,
// const Schema extends TProperties,
// Schema extends TSchema,
// Schema extends Record<TPropertyKey, TSchema>,
// R extends Params<Path> = Params<Path>,
// P extends TObject<Schema> = TObject<Schema>,
// P = TObject<<Schema>>,
// P = TObject<Schema>,
