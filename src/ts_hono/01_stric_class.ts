import { createPublicClient, http, stringify, hexToNumber, hexToBigInt, hexToString } from 'viem'
import { mainnet } from 'viem/chains'
import { wrap, Context, Handler, ResponseBody, Router, RouterMethods, Wrapper } from '@stricjs/router'
import fastJson from 'fast-json-stringify'
import { ApiType } from './u256.ts'
import { Kind, Static, StaticDecode, TSchema, Type } from '@sinclair/typebox'
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

export interface Foo<R extends string> extends RouterMethods<R> { }
export class Foo<R extends string = '/'> {
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


  specialRoute<R extends Route>(
    routeDef: R,
    callback: (ctx: string, res: number) => string) {

    let sluggified = routeDef.path

    let precomp

    // console.log('routeDef:', routeDef)
    for (let q of routeDef.get.query) {
      console.log(q)
      sluggified += '/:' + q.slug      
      precomp = q.schema
    }
    console.log(sluggified)

    const handler = (ctx, ser) => {
      console.log(ctx.params.id)
      const tryConvert = Value.Convert(Type.Integer(), ctx.params.id)
      console.log(tryConvert)
      console.log(Value.Check(Type.Integer(), tryConvert))
     
      
      return new Response('It still works')
    }

    this.record.push(['get', sluggified, handler])
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
