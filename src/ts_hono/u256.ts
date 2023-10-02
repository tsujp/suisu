import { Static, Kind, TSchema, TypeRegistry, FormatRegistry, ValueGuard, SchemaOptions, TypeBoxError, TKind } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { DefaultErrorFunction, TypeSystem, TypeSystemErrorFunction } from '@sinclair/typebox/system'
import { maxU256 } from './macro.ts' with { type: 'macro' };
import { TypeCompiler } from '@sinclair/typebox/compiler'

export interface Metadata {
	[name: string]: any
}


// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// * * * * * * * * * * * Type schemas (abstract definitions).

// Schema for U256; this is the 'lowest' form of representation.
export interface TU256 extends TSchema {
	[Kind]: 'API:U256', // TypeBox internal tag to understand this schema.
	static: bigint, // TypeScript representation of this schema's value.
	type: 'integer', // JSON Schema encoded representation.
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// * * * * * * * * * * * Value checker (runtime schema validations).

// - - - Utility
function InBigIntRange(value: unknown, min_i: bigint, max_i: bigint): value is bigint {
	return typeof value === 'bigint' && min_i <= value && value <= max_i
}


export class ValueCheckError extends TypeBoxError {
	constructor(public readonly schema: TSchema) {
		super('Unknown type')
	}
}

export namespace ValueCheck {
	// - - - U256
	export function U256(schema: TU256, value: unknown): boolean {
		return InBigIntRange(value, 0n, maxU256())
	}
	// - - - 
	function Visit(schema: TSchema, value: unknown): boolean {
		const anySchema = schema as any
		switch(anySchema[Kind]) {
			case 'API:U256': return U256(anySchema, value)
			default: throw new ValueCheckError(anySchema)
		}
	}
	export function Check<T extends TSchema>(schema: T, value: unknown): value is Static<T> {
		return Visit(schema, value)
	}
}


// TypeGuard

export namespace TypeGuard {
	// - - -
	function IsObject(value: unknown): value is Record<typeof any, unknown> {
		return typeof value === 'object'
	}
	// - - - U256 (Type)
	export function TU256(schema: unknown): schema is TU256 {
		return IsObject(schema) && schema[Kind] === 'API:U256' && schema['type'] === 'integer'
	}
	// - - -
	export function TKind(schema: unknown): schema is TKind {
    return IsObject(schema) && Kind in schema && typeof (schema as any)[Kind] === 'string' // TS 4.1.5: any required for symbol indexer
  }
	// - - -
	export function TSchema(schema: unknown): schema is TSchema {
		return (
			TU256(schema) ||
			(TKind(schema)) && TypeRegistry.Has(schema[Kind])
		)
	}
}

// TypeRegistry

TypeRegistry.Set<TU256>('API:U256', (schema, value) => ValueCheck.Check(schema, value))

// TypeSystemErrorFunction

TypeSystemErrorFunction.Set((schema, type) => {
	switch(schema[Kind]) {
		case 'API:U256': return 'Expected 256-bit unsigned integer'
	}

	return DefaultErrorFunction(schema, type)
})


// TypeDefBuilder (instantiates runtime types)

export class TypeDefBuilder {
	protected Create(schema: Record<PropertyKey, any>, metadata: Record<keyof any, any>): any {
    const keys = globalThis.Object.getOwnPropertyNames(metadata)
    return keys.length > 0 ? { ...schema, metadata: { ...metadata } } : { ...schema }
  }
  /** [Standard] Removes compositing symbols from this schema */
  public Strict<T extends TSchema>(schema: T): T {
    return JSON.parse(JSON.stringify(schema)) as T
  }
	/** [Standard] Creates an unsigned 256-bit integer type */
  public U256(metadata: Metadata = {}): TU256 {
    return this.Create({  [Kind]: 'API:U256', type: 'integer' }, metadata)
  }
}

export const ApiType = new TypeDefBuilder()

// Custom type system for non-standard JSON Schema types. The main purpose is to
//   have compile and runtime validation on the server while encoding to a
//   JSON Schema which appears opaque; because if JSON Schema does not support
//   these types there is no point exporting them.
// For example while the wrapped `eth_chainId` value could be specified via
//   TypeBox as `Type.Integer({ minimum: 1, maximum: 2 ** 256 })` savvy readers
//   will be aware that JavaScript's runtime does not support integers this
//   high. Using a BigInt does not solve this when generating the API documentation
//   because again JavaScript literally cannot represent an integer that size
//   to print. So, a custom type U256 is created which encodes to a JSON Schema
//   integer the same as TypeBox's Type.Integer but which internally uses
//   BigInt so API documentation generation can correctly show a 256-bit maximum
//   integer value.
// Why not use TypeBox's Type.BigInt? Because you cannot change the encoding
//   type to integer from bigint.
