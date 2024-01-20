---
# ZK Frontmatter
title: EPF Update -- Weeks 17, and 18
date: 2024-01-20 23:33:00
keywords: [epf, dev_update, blog]
---

[comment]: # (2023-10-30 to 2023-11-12)

# EPF Update -- Weeks 16, and 17 (Jordan Ellis Coppard)

I've refactored dependencies, the example router, and runtime handlers for the REST API and documentation generator.


## Documentation Generation

Documentation will always be generated and an optional REST API server can be spawned alongside it. Parameter descriptions are also included in generated documentation now as well as the desired API title and overall-description.


## Compiler

HTTP status codes have been added and the compiler will attempt to check that the returned codes from a route-handler match those expected. This serves both as documentation and, if the REST API server is set to run, as a runtime check.


## Dependencies

The goal is to keep dependencies to an absolute minimum as the `npm` ecosystem is famous for supply-chain attacks however _for now_ `radix3` has been added for radix trie routing, `roar` for logging, and `viem` for type-aware Ethereum RPC invocations. All three of these may potentially be removed before or at project completion; they have been added temporarily to assist with velocity.
