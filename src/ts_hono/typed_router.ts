import { createPublicClient, http, stringify, hexToNumber, hexToBigInt, hexToString } from 'viem'
import { mainnet } from 'viem/chains'
import { wrap, Context, Handler, ResponseBody, Router, RouterMethods, Wrapper, Params, BodyParser, ConcatPath, RouteOptions } from '@stricjs/router'
import fastJson from 'fast-json-stringify'
import { ApiType } from './u256.ts'
import { Ensure, Kind, Static, StaticDecode, TObject, TParameters, TPickProperties, TProperties, TSchema, Type } from '@sinclair/typebox'
import { TypeCheck, TypeCompiler } from '@sinclair/typebox/compiler'
import { Value } from '@sinclair/typebox/value'
import { Server } from 'bun'
import { Route } from './01_stric.ts'

// copied from: https://github.com/bunsvr/router/blob/main/src/core/constants.ts#L2
const methods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH', 'ALL', 'GUARD', 'REJECT'];
const methodsLowerCase = methods.map(v => v.toLowerCase());
const methodsUpper = methods.map(v => v)

function convert(path: string) {
  if (path.length < 2) return path;
  if (path.at(-1) === '/') return path.substring(0, path.length - 1);
  return path;
}
// end copy

// type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace' | 'patch' | 'all' | 'guard' | 'reject';
type HttpMethod = 'get' | 'post' | 'put'
type RouterMethods_N<R extends string> = {
    [K in HttpMethod]: <T extends string, O extends RouteOptions>(path: T, handler: O extends {
        body: infer B;
    } ? (B extends BodyParser ? Handler<ConcatPath<R, T>, B> : Handler<ConcatPath<R, T>>) : Handler<ConcatPath<R, T>>, options?: O) => Router;
};
// type abc123 = RouterMethods<string>

// export interface TypedRouter<R extends string> extends RouterMethods_N<R> { }
export interface TypedRouter<R extends string> extends RouterMethods<R> { }

export class TypedRouter<R extends string = '/'> {
  private record: any[][];
  private wsRecord: any[][];

  constructor(public readonly root: R = '/') {
    if (root !== '/' && root.endsWith('/'))
      // @ts-ignore
      root = root.slice(0, -1);
    this.root = root;
    this.record = [];
    // this.record = {};
    this.wsRecord = [];

    // Looks like `app` now uses a dictionary instead of an array so redo this
    for (const method of methodsLowerCase) this[method] = (path: string, handler: Handler, opts: any) => {
      // Special cases
      if (this.root !== '/') path = this.root + path;
      path = convert(path);

      const args = [method, path, handler] as any[];
      if (opts) args.push(opts);

      console.log('hi')

      this.record.push(args);

      console.log('class print', this)
      return this;
    }
  }


  // specialRoute<R extends Route>(
  specialRoute<
    Path extends string,
    ParamsSchema extends Ensure<TProperties>,
    TypeBoxSchema = Static<TObject<ParamsSchema>>,
  >(
    path: Path,
    params: TPickProperties<ParamsSchema, keyof Exclude<Params<Path>, Params<Path> & keyof TypeBoxSchema>>,
    callback: (ctx: TypeBoxSchema, ser: Server) => string) {

    // TODO: Type and invoke callback.

  }

  /**
   * Use the default response wrapper for a group of subroutes
   */
  wrap(path: string): this;

  /**
   * Add a response wrapper for a group of subroutes
   */
  wrap(path: string, type: keyof typeof wrap): this;

  /**
   * Add a custom response wrapper for a group of subroutes
   */
  wrap(path: string, fn: Wrapper): this;

  /**
   * Wrap the response
   */
  wrap(path: string, handler: Wrapper | keyof typeof wrap = 'default') {
    console.log('wrap has been called', path, handler)

    if (typeof handler === 'string')
      handler = wrap[handler];

    if (this.root !== '/')
      path = this.root + path;
    path = convert(path);

    this.record.push(['wrap', path, handler]);
    // this.record[path] = { 'WRAP': handler }
    return this;
  }

  plugin(app: Router) {
    // console.log('app is', app)
    for (const item of this.record) {
      console.log('item:', item)
      app[item[0]](...item.slice(1));
    }
    for (const item of this.wsRecord) app.ws(item[0], item[1]);
  }
}
