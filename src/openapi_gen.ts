// Generates an OpenAPI schema.

import { Kind, type TObject, Type } from "@sinclair/typebox"
import { oas31 } from "openapi3-ts"
import { ParamApiDescription, type BaseApiDescription, type HttpMethods } from "./typed_router"

// Of dubious value since the spec itself isn't _that_ complex (what we need
//   thus far), we'll see (referring to the use of a package here).
import { type OperationObject } from "openapi3-ts/oas31"

export const spec = new oas31.OpenApiBuilder()

spec.addTitle('Execution REST API')
spec.addDescription('REST API specification for Ethereum execution layer.')

// Spec: https://spec.openapis.org/oas/v3.1.0
const SCHEMA = {
	openapi: '3.0.2',
	// https://spec.openapis.org/oas/v3.1.0#infoObject
	info: {
		title: 'Foo API',
		summary: 'A summary',
		description: 'Some description',
	},
	// https://spec.openapis.org/oas/v3.1.0#pathsObject
	paths: {},
}

// TODO: Get this type from TypedRouter so it's DRY.

// export function createRouteSchema(method: HttpMethods, path: string, schema: TObject, docs: BaseApiDescription['docs']) {
export function createRouteSchema(method: HttpMethods, path: string, schema: TObject, docs: ParamApiDescription<object>['docs']) {
  console.log('createRouteSchema called')
  console.log('docs:', docs)

// export interface OperationObject extends ISpecificationExtension {
//     tags?: string[];
//     summary?: string;
//     description?: string;
//     externalDocs?: ExternalDocumentationObject;
//     operationId?: string;
//     parameters?: (ParameterObject | ReferenceObject)[];
//     requestBody?: RequestBodyObject | ReferenceObject;
//     responses: ResponsesObject;
//     callbacks?: CallbacksObject;
//     deprecated?: boolean;
//     security?: SecurityRequirementObject[];
//     servers?: ServerObject[];
// }

  // TODO: Parameter descriptions.
  const op: OperationObject = {
    summary: docs.title,
    description: docs.desc,
    parameters: Object.entries(schema.properties).map(([param, schema]) => ({
				name: param,
				in: 'path',
				required: true, // Required to be true by OpenAPI spec.
        // XXX: This should narrow to understand that if we're even mapping here
        //      then there WILL be a key on `docs` of the parameters name but
        //      we can waste XYZ hours trying to get TypeScript to understand that
        //      some other time.
				// description: docs.params?.[param],
				// description: Object.getOwnPropertyDescriptor(docs, param).value ?? 'BIG PROBLEMS',
        // TODO: Actual error.
				description: docs[param as keyof typeof docs] ?? 'BIG PROBLEMS',
				// Path parameters cannot be optional.
				schema: Type.Strict(schema)
			})),
    responses: {
      200: {
        description: 'successful operation',
        content: {
         'application/json': {
            schema: {
              type: 'string'
            }
          } 
        }
      }
    }
  }

  spec.addPath(path, {
    [method]: op,
  })

  const out = spec.getSpecAsJson(undefined, 2)
  console.log(out)
}

export function createRouteSchema_v1(method: string, path: string, schema: TObject, handler) {
	console.log('a', schema.description)
	console.log('b', schema.properties)
	console.log('c', schema.required)
	console.log('method', method)
	// console.log(JSON.parse(JSON.stringify(schema)))
	console.log(JSON.stringify(schema))

	SCHEMA.paths[path] = {
		// https://spec.openapis.org/oas/v3.1.0#operationObject
		[method]: {
			summary: 'TODO: Allow passing summary in',
			description: 'TODO: Allow passing method description in',
			// TODO: Schemas other than pure path parameters
			parameters: Object.entries(schema.properties).map(([param, schema]) => ({
				name: param,
				in: 'path',
				required: true,
				description: 'Bing bong baz',
				// Path parameters cannot be optional.
				schema: Type.Strict(schema)
			})),
				responses: {
          200: {
            description: "successful operation",
            content: {
              'application/json': {
                schema: {
                  type: 'string'
                }
              }
            }
          },
				}
			// parameters: Object.keys(schema.properties).map((param) => ({
			// 	name: param,
			// 	in: 'path',
			// 	required: true,
			// 	// Path parameters cannot be optional.
			// 	schema: 'x'
			// }))
		}
	}
	// console.log(method, JSON.stringify(schema))
	console.log('schema is now...')
	// console.log(SCHEMA, null)
	console.log(JSON.stringify(SCHEMA, null, 2))
}


