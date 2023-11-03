---
# ZK Frontmatter
title: EPF Update -- Weeks 11, and 12
date: 2023-10-10 00:10:00
keywords: [epf, dev_update, blog]
---

[comment]: # (2023-09-18 to 2023-10-01)

# EPF Update -- Weeks 11, and 12 (Jordan Ellis Coppard)

I've learned how to use TypeBox reasonably well and ventured into a quest to return true integer values from the REST API that are not constrained to JavaScript's 53-bit safe integer range. This started when I created a custom TypeBox type to represent a 256-bit integer and then wanted to serialise this into JSON (for example as a response payload).


## Real Integer Values

I thought it would be very silly to limit the REST API reference implementation to 53-bit values for the chain id response payload (which is a 256-bit value as per my last update) simply because the implementation language happens to be JavaScript. The first part of this is trivial: use BigInt(). It's a standard API and while it can have unbounded size a simple range check is easy enough. The hard part comes with representing this type _and_ value in JSON Schema as well as actually doing the validation.

It turns out you cannot represent such a type in Open API. In-fact the latest extension to the Open API specification only allows specifying things like shorts or 64-bit integers. Any kind of custom types are ad-hoc. That's... very annoying. _The_ industry standard API definition framework cannot represent 256-bit integers nor provide any means of doing so in a standardised way? I freely admit I spent far longer on this than I'd like because I couldn't believe it and thought I must be missing something.

With that out of the way I wanted to create a TypeBox type that represents this data. TypeBox already has a BigInt type `Type.BigInt()` but this serialises to an annotated payload with `type: 'bigint'` which isn't actually a _thing_ in Open API. I want it to serialise to `type: 'integer'`.


### Custom TypeBox Types

TypeBox is very powerful, and the maintainer has a treasure trove of knowledge in the GitHub issues for the project [here](https://github.com/sinclairzx81/typebox/issues). I struggled to get the hang of how to create custom types properly in the start but after a few days of messing around with all the different approaches you can take to achieve it I landed on [the implementation present in my EPF project's repo](https://github.com/tsujp/suisu/blob/master/src/u256.ts) which combines the custom type and serialisation as well as error messages relating to type validation (useful for error response payloads).

At this point I had maybe a dozen scratchpad files so I condensed it down to the aforementioned implementation and attempted to use it within Elysia... and oh no... it didn't work.


### Elysia and Custom TypeBox Types

I double and triple checked my TypeBox implementation and began trying to figure out why Elysia could apparently not validate a response schema if it contained my custom U256 type. The long and short is a lot of time was frustratingly wasted here as _somehow_ Elysia just will not accept custom TypeBox types even if you patch the entire framework locally. I tried quite hard to fix the issue because of the automatic documentation generation it provides but had to give up. There's some very long series of multiple switch-case statements in Elysia's source code which I narrowed down to the issue but nothing in there works as I expect so... hello StricJS.


### StricJS

My brief stint with Elysia was good as it introduced me to TypeBox which provides free JSON Schema documentation and runtime validation. Exactly what I need to produce the API documentation _and_ reference implementation. For these reasons I wanted to find another minimal framework that I could use TypeBox with. Stric doesn't use TypeBox but can be used as just a router so I went with that. It's a pretty neat project, it's exposed as a single class which is precompiled to a radix-tree router implementation ahead of time. This also means that pre-compiled TypeBox types (since TypeBox generates the JavaScript required to assert a valid type at runtime) pair nicely there too, a small boon.

While Stric is nice, small, and narrow in scope it does not play well with extending its interfaces. A lot of monkey patching and TypeScript gymnastics are required to get something to the point where you can keep compile-time TypeScript checking while also ensuring that you're using the router, and TypeBox, in a way that won't silently produce an error. I am starting to understand why quite a few big projects out there (e.g. Svelte) are abandoning using TypeScript in their source, the amount of time spent messing around with making the TypeScript compiler shut up for seemingly obvious things is frustrating. I achieved some [semblance of acceptability here though](https://github.com/tsujp/suisu/blob/master/src/typed_router.ts).


## Serialising

With the TypeBox types working, and a REST API framework with it integrated working now is the time to serialise some data. You cannot serialise a BigInt to an integer and expect it to work (if the value is over 53-bits) so how about calling `.toString()` and removing the quotation marks? Open API does not allow quotation marks for integer values so `1` is the integer value 1 whereas `"1"` is the _string_ 1. Turns out this requires writing your own JSON serialiser, no amount of monkey patching JavaScript's default will work. Thankfully someone else has already realised this is probably a limitation and Fastify has just such a custom JSON serialiser which itself accepts JSON Schema as the input to validate when serialising!


## The Result

The result is I can respond with true 256-bit chain id values as actual integers in compliance with the Open API specification while at the same time generating JSON Schema... schemas for the API documentation.

Giving...

```jsonc
# GET localhost:3000/net/info

{
	'peers': 123,
	'chain': 115792089237316195423570985008687907853269984665640564039457584007913129639934,
	'listening': true,
}
```

...and _NOT_...

```jsonc
# GET localhost:3000/net/info

{
	'peers': 123,
	'chain': '115792089237316195423570985008687907853269984665640564039457584007913129639934',
	'listening': true,
}
```
