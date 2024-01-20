---
# ZK Frontmatter
title: EPF Update -- Weeks 13, and 14
date: 2023-10-25 01:51:00
keywords: [epf, dev_update, blog]
---

[comment]: # (2023-10-02 to 2023-10-15)

# EPF Update -- Weeks 13, and 14 (Jordan Ellis Coppard)

With all the TypeBox and serialisation progress (from the last update) done I've now implemented a very simple web framework using a trie-based (radix) router (from a package) which uses that TypeBox information to generate API documentation _and_ runtime value-checking for the reference implementation.

What this means is that when you define an API route which may take certain query, path, or body parameters (which are required to be typed) then a valid OpenAPI 3.1 schema will be generated from this _as well as_ it existing as a reference implementation in a simple web framework where incoming requests are validated to meet those types. The code produces the documentation as well as the reference implementation.

I've almost finished removing work-in-progress code from all the TypeScript hacking as well as hooking up Scalar (without requiring using Vue locally) for viewing the documentation.


## Documentation Generation

With TypeBox handling JSON Schema the rest of the documentation generation is a simple iteration over routes to construct a (JSON) object which is output... that's it. I'm not going down the path of YAML because YAML is a _terrible_ language and will make the idea of simplicity in this implementation immediately moot; those who doubt may go and read the YAML specification and implement their own parser. JSON still sucks but is the lesser of two evils.

This is how simple the guts of schema generation boils down to:

```typescript
const op: OperationObject = {
  summary: docs.title,
  description: docs.desc,
  parameters: Object.entries(schema.properties).map(([param, schema]) => ({
    name: param.name,
    in: 'path',
    required: true, // Path parameters cannot be optional.
    description: param.desc,
    schema: Type.Strict(schema)
  }))
  // Similarly for query parameters...
  // Similarly for request bodies...
  // Similarly for responses...
}
```


## Documentation Frontends

With simple OpenAPI 3.1 schema generation complete I want a way to _simply_ view this without having to use something like Python, or anything involving YAML, PHP etc. The reason is the _simpler_ things are--the easier it is for developers or potential contributors to experiment--the more likely a project is to receive attention from said developers/contributors (all else equal). Minimising dependencies is key to that end.

The project has drifted into {Java,Type}Script land and so keeping within that ecosystem helps meet that goal. Savvy readers may be pulling their hair, "simple?! simple and JavaScript do not go together!". Normally I would agree but with the use of Bun as a single-binary dependency to run the API, generate the documentation, and render the documentation to a frontend for viewing I think that represents the simplest possible experience in {Java,Type}Script land that can be achieved. It is quite literally:

	1. Download Bun (an executable in a zip file).
	2. Extract the zip file and mark it executable.
	3. `bun dev`.
	4. Done.

That's from having _nothing_ installed, including the language runtime. No multiple languages or brittle PATH-based toolchains requiring special tooling just to use without wanting to smash your monitor. It's not the _ideal_ choice but I think it's astoundingly clean given the ecosystem ({Java,Type}Script) in-use here. If it isn't clear already: I've put a lot of time and consideration into making the _developer experience_ as nice as possible for potential contributors so that there is minimal friction to their potential contributions.


## Testing

Implementing tests against various JSON RPC endpoints may be a tight squeeze before Devconnect, and while it will be done (likely afterwards), the goal is to use Ethereum's Hive end-to-end suite. This is more of a primer to that eventual goal.


## Next Steps

I'm currently designing and implementing REST routes! My next update will have most of the first draft of the specification available (finally)!
