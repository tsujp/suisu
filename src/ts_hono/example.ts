import fastJson from 'fast-json-stringify'
import { ApiType } from './u256.ts'
import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { Value } from '@sinclair/typebox/value'
import { Router } from '@stricjs/router'

// I'm using StricJS to proxy another API, this `const` represents a valid
//   upstream response.
const MockedDataType = Type.Object({
  peers: Type.Integer(),
  chain: ApiType.U256(),
  listening: Type.Boolean(),
})

const CDT = TypeCompiler.Compile(MockedDataType)

// Mock data of upstream response. Try changing `listening` to a string value
//   instead.
const mockedData = {
  peers: 123,
  chain: 1n,
  listening: true,
  // listening: 'foo',     // Uncomment me for an error.
}

const app = new Router()

// With such a simple example being done here this can use your existing `check`
//   logic but for more complex input requirements TypeBox is the thing to use.
const FooValidRequestSchema = Type.Integer()

app.get('/foo/:bar', (req) => {
  console.log('\nIncoming request to `foo` ...')

  
  // Step 1: validate the request schema.

  // You can imagine the verification and conversion of types is much more
  //   complex (required fields, unions, etc etc).
  const requestFoo = Value.Convert(FooValidRequestSchema, req.params.bar)
  const requestIsValid = Value.Check(FooValidRequestSchema, requestFoo)

  if (requestIsValid) {
    console.log('    ... valid request, querying upstream API ...')
  } else {
    console.log('    ... error request.')
    console.log(Array.from(Value.Errors(FooValidRequestSchema, requestFoo)))

    req.status = 400
    return new Response('Malformed request.')
  }

  // Step 1 done.


  // Call upstream API, and _validate_ their response as if the upstream API
  //   returns an error we need to know about it.
  const dataIsValid = CDT.Check(mockedData)


  // Step 2: validate the upstream API response schema.

  if (dataIsValid) {
    console.log('    ... good response.')

    return new Response(fastJson(MockedDataType)(mockedData))
  } else {
    console.log('    ... error response:')
    console.log(Array.from(CDT.Errors(mockedData)))

    req.status = 500
    return new Response('Upstream API returned malformed data.')    
  }

  // Step 2 done.
})

export default app
