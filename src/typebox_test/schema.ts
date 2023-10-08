import { Type, Static, Kind, TSchema, TypeRegistry, FormatRegistry, ValueGuard } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { DefaultErrorFunction, TypeSystem, TypeSystemErrorFunction } from '@sinclair/typebox/system'

const MAX_U256 = BigInt(2 ** 256)

// FormatRegistry.Set('u256', (value) => {
//   const check = BigInt(value)
//   return ValueGuard.IsBigInt(check) ? true : false
// })

// TypeRegistry.Set<TU256>('U256', (schema, value) => {
//     return ValueGuard.IsBigInt(value) && value >= 0n && value <= MAX_U256
// })
// export interface TU256 extends TSchema {
//   [Kind]: 'U256',
//   type: 'u256', // Within TypeBox (?)
//   static: number, // When encoded to JSON Schema (?)
// }
// export const U256 = (value: unknown): TU256 => {
//   return {
//     [Kind]: 'U256',
//     type: 'u256',
//     value: value,
//   } as TU256
// }

// -------------------------------

// interface TU256<T extends TSchema = TSchema> extends TSchema {
// interface TU256 extends TSchema {
//   [Kind]: 'U256',
//   type: 'integer', // When encoded to JSON Schema.
//   static: number, // Within TypeScript (TODO: type as `bigint` instead)
// }

// namespace ValueCheck {
//   // Guards
//   export function InBigIntRange(value: unknown, min_i: bigint, max_i: bigint): value is bigint {
//     return ValueGuard.IsBigInt(value) && value >= min_i && value <= max_i
//   }
//   // Types
//   export function U256(schema: TU256, value: unknown): boolean {
//     return InBigIntRange(value, 0n, MAX_U256)
//   }
//   // Utility
//   function Visit(schema: TSchema, value: unknown): boolean {
//     const anySchema = schema as any
//     switch (anySchema[Kind]) {
//       case 'U256': return U256(anySchema, value)
//       // TODO: throw `TypeBoxError` instead?
//       default: throw new Error(anySchema)
//     }
//   }
//   export function Check<T extends TSchema>(schema: T, value: unknown): value is Static<T> {
//     return Visit(schema, value)
//   }
// }

// namespace TypeGuard {
//   // Guards
//   export function IsObject(value: unknown): value is Record<keyof any, unknown> {
//     return typeof value === 'object'
//   }
//   // Types
//   export function TU256(schema: unknown): schema is TU256 {
//     return IsObject(schema) && schema[Kind] === 'U256' && schema['type'] === 'integer'
//   }
// }

// // Parameter `schema` is for mapping from JSON Schema -> TypeBox's type system (I think)
// TypeRegistry.Set<TU256>('U256', (schema, value) => ValueCheck.Check(schema, value))

// TypeSystemErrorFunction.Set((schema, type) => {
//   switch(schema[Kind]) {
//     case 'U256': return 'Expected 256-bit unsigned integer'
//   }

//   return DefaultErrorFunction(schema, type)
// })

// -------------------------------


const U256 = Type.BigInt({
  minimum: 0n,
  maximum: MAX_U256,
  description: '256-bit unsigned integer',
})


export const net = {
  netVersion: {
    200: Type.Object({
      // Not using Integer as per Beacon APIs style.
      // peers: t.String(),
      peers: Type.Integer(),
      // NB: No _nice_ way to specify (in JSON Schema) >0 yet unfortunately.
      // chain: t.String({
      //   format: 'u256',
      //   default: 'stringzzz',
      // }),
      chain: U256,
      listening: Type.Boolean(),
    })
  }
}
