---
# ZK Frontmatter
title: EPF Update -- Week 2
date: 2023-07-24 13:00:00
keywords: [epf, dev_update, blog]
---

[comment]: # (2023-07-17 to 2023-07-23)

# EPF Update -- Week 2 (Jordan Ellis Coppard)

### JSON RPC

This week I had plans to try and profile JSON RPC method usage but I quickly realised this isn't really feasible accross the ecosystem (to my knowledge) without a decent amount of reverse engineering and my curiosity there was mostly to identify patterns which platforms like Dune Analytics can better provide.

In general I came to the conclusion that trying to identify those constraints _now_ is probably premature optimisation due to how much work will have to go into analysing the data. I think it's better to get an actual MVP specification and middleware REST API wrapper for JSON RPC before adding on anything concluded from those potential analyses; one example would be a single REST method to deploy a contract instead of the multiple JSON RPC calls currently required.

### REST API

One annoyance (beyond vague standardisation) of the JSON RPC API is its lack of statelessness. Libraries help here with abstraction, and it does make the API composable, but for a lot of operations this composability is _required_ for what should feel like atomic operations (e.g. deploying a contract). Along this line, and for the REST API being _actually stateless_ I've been re-reading up on [HATEOAS](https://en.wikipedia.org/wiki/HATEOAS) principles.

Discoverability about related data being a part of a query's response means there's no pre-knowledge required and also no (explicit) risk of statelessness, for example having to find the ID of a user by searching for their username to then use that ID to look up their detailed profile information.

Doing some research on what I like to call _actually RESTful APIs_ I rediscovered a bunch of alternative hypermedia data schemas. The three most obvious are JSON (which I'm sorry to say sucks), HTML, and XML; there are other formats like [JSON-LD](https://en.wikipedia.org/wiki/JSON-LD) and [HAL](https://en.wikipedia.org/wiki/Hypertext_Application_Language) which I especially think are applicable here as (unfortunately) JSON is the norm and both JSON-LD and HAL can still use `$PROGRAMMING_LANGUAGE`'s JSON stdlib but with extra semantics baked-in (further tying into discoverability and statelessness) as part of the API specification.

### Zig

In my last update I mentioned using Zig for the reference middleware implementation and to that end I've continued with the [Zig language tutorial](https://ziglearn.org/); I think I am at a point where I can start messing around with non-trivial (relative to that tutorial) programs now.

I credit a lot of the progress here to using tools like Obsidian to take notes, and using Helix as an editor. I've used all manner of strategies to take notes before and used tools like Emacs and (N)Vim but in all cases I've spent too much time designing and customising those systems because they offer so little out of the box. They are more extensible, yes, but for someone like me I'll sink all my time into that extensibility (and have fun doing so) but lose sight of what I should actually be doing.