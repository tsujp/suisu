import { t, getSchemaValidator } from 'elysia'

import { Static, Kind, TSchema, TypeRegistry, FormatRegistry, ValueGuard, SchemaOptions } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { TypeSystem } from '@sinclair/typebox/system'
import { TypeCompiler } from '@sinclair/typebox/compiler'

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
//   // static: number, // When encoded to JSON Schema (?)
// }
// export const U256 = (value: unknown): TU256 => {
//   return {
//     [Kind]: 'U256',
//     type: 'u256',
//     value: value,
//   } as TU256
// }

// const wat = U256()

// console.log('wat is:', wat)


// -------------------------------

// interface TU256<T extends TSchema = TSchema> extends TSchema {
// interface TU256 extends TSchema {
//   [Kind]: 'TypeDef:U256',
//   type: 'u256', // Within TypeBox (?)
//   static: number, // When encoded to JSON Schema (?)
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
//       case 'TypeDef:U256': return U256(anySchema, value)
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
//     return IsObject(schema) && schema[Kind] === 'TypeDef:U256' && schema['type'] === 'u256'
//   }
// }

// // Parameter `schema` is for mapping from JSON Schema -> TypeBox's type system (I think)
// TypeRegistry.Set<TU256>('TypeDef:U256', (schema, value) => ValueCheck.Check(schema, value))

// TypeSystemErrorFunction.Set((schema, type))

// -------------------------------

// const Uint256 = TypeSystem.Type<bigint>('Uint256', (options, value) => {
//   return ValueGuard.IsBigInt(value) && value >= 0n && value <= MAX_U256
// })

// const TT = Uint256()

// console.log('Check 1', Value.Check(TT, 1n))
// console.log('Check 2', Value.Check(TT, -1))


// Add a custom format via the format registry for u256 which validates integers between (inclusive) 0 and 2**256. It will do this by taking the return hex from the underlying RPC and parsing that to a BigInt then range checking the BigInt before converting that into a string.
// There will be an additional _thing_ (not sure yet) which validates a u256 is above 0 meaning the range is (inclusive) 1 to 2**256. This would be for the chain id where it cannot be value 0. This is preferred over adding another type which is essentially exactly the same called say `n256` for 'natural numbers 256-bit' since that's a bit obtuse compared to the well understood `u` and `i` prefixes (e.g. `u256` or `i256`) with a simple range bounds. The problem here is these numbers are returned as strings.



// TODO: JSON Schema specifies an integer matches any number with a zero
//       fractional part. So this includes unbounded size? I.e. not say a
//       maxium of 32 or 64 or 128 ... bits?
// - https://github.com/json-schema-org/json-schema-spec/issues/898

// Q: Why is the peer count `net_peerCount` returned as QUANTITY (hex encoded)?
// Q: Are chain ids only ever integers or is this purely convention? Could
//    we have a chain id of `foobar` (literally) and it be valid? If the
//    latter then keep the string representation of that data.
// Per EIP-695 we do not call `net_version`: https://eips.ethereum.org/EIPS/eip-695

// NB: It is unclear (to me) what the current limit on chain id maximum size is
//     there are competing EIPs and implementations (e.g. in MetaMask). For now
//     I will take the maximum to be 256-bit as I believe this is the most
//     sensible as per EIP-1344.
//     Resources:
//       - https://ethereum-magicians.org/t/eip-2294-explicit-bound-to-chain-id/11090
//       - https://github.com/ethereum/EIPs/issues/2294
//       - https://ethereum-magicians.org/t/eip-1344-add-chain-id-opcode/1131
//       - https://eips.ethereum.org/EIPS/eip-1344
// Other reading:
//   - https://ethereum.stackexchange.com/questions/37533/what-is-a-chainid-in-ethereum-how-is-it-different-than-networkid-and-how-is-it
//   - https://eips.ethereum.org/EIPS/eip-695

// const U256 = t.BigInt({
//   minimum: 0n,
//   maximum: MAX_U256,
//   description: '256-bit unsigned integer',
//   examples: 1,
// })

// namespace ValueGuard {
//   function IsU256(value: unknown): value is bigint {
//     return typeof value === 'bigint'
//   }
// }

// namespace TypeGuard {
//   export function TU256(schema: unknown): schema is TU256 {
//     return schema[Kind] === 'U256' && schema['type'] === 'u256'
//   }
// }

declare module '@sinclair/typebox' {
    interface TypeBuilder {
        U256: typeof U256;
    }
    // interface SchemaOptions {
    //     error?: string | ((type: string, validator: TypeCheck<any>, value: unknown) => string | void);
    // }
}

// TypeRegistry.Set<{ min: bigint, max: bigint }>('U256', (schema, value) => {
// declare module '@sinclair/typebox' {
TypeRegistry.Set<U256Options>('U256', (schema, value) => {
  console.log('received', schema, value)
  console.dir(schema.min)
  // const wat = typeof value === 'bigint' && value >= schema.min && value >= 0n && value <= schema.max && value <= MAX_U256
  const wat = typeof value === 'bigint' &&
              value >= 0n && (schema.min ? value >= schema.min : true) &&
              value <= MAX_U256 && (schema.max ? value <= schema.max : true)
  console.log('type', typeof value === 'bigint')
  console.log('schema min', schema.min ? value >= schema.min : true)
  console.log('0n min', value >= 0n)
  console.log('schema max', schema.max ? value <= schema.max : true)
  console.log('MAX_U256 max', value <= MAX_U256)
  console.log('schema good?', wat)
  return wat
})

t.U256 = (properties) => {
  return U256(properties)
}

interface TU256 extends TSchema {
  [Kind]: 'U256',
  static: bigint,
  type: 'integer',
  min?: bigint,
  max?: bigint,
}

interface U256Options extends SchemaOptions {
  min?: bigint,
  max?: bigint,
}

const U256 = (options?: U256Options): TU256 => {
  return {
    [Kind]: 'U256',
    type: 'integer',
    ...options,
  } as TU256
}
  // }

const T = t.Object({
  peers: t.Integer(),
  // chain: U256(),
  chain: t.U256(),
  // foo: t.Numeric(),
  // chain: t.BigInt({
  //   type: 'integer',
  //   minimum: 0n,
  //   maximum: MAX_U256,
  // }),
  listening: t.Boolean(),
})

const C = TypeCompiler.Compile(T)

console.log('value check:', Value.Check(T, {
  peers: 1,
  chain: 69n,
  listening: true,
}))

console.log('valid???????', C.Check({
  peers: 1,
  chain: 70n,
  listening: false,
}))

console.log(T)

const a = getSchemaValidator(T, {})

export const net = {
  netVersion: {
    200: T
  }
}

// Not using Integer as per Beacon APIs style.
// peers: t.String(),
// NB: No _nice_ way to specify (in JSON Schema) >0 yet unfortunately.
// chain: t.String({
//   format: 'u256',
//   default: 'stringzzz',
// }),
// Ignore `eth_protocolVersion` as per: https://github.com/ethereum/go-ethereum/pull/22064
export const eth = {}
