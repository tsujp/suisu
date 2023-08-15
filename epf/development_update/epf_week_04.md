---
# ZK Frontmatter
title: EPF Update -- Week 4
date: 2023-08-14 13:00:00
keywords: [epf, dev_update, blog]
---

[comment]: # (2023-07-31 to 2023-08-06)

# EPF Update -- Week 4 (Jordan Ellis Coppard)

This week I've done a bunch of further exploration of Zig, Varnish, and hypermedia for the REST API.


### Zig

I created an incredibly trivial Zig HTTP server as planned and changed tack from using Zig's included (standard library) HTTP server as apparently this implementation suffers from major performance issues. I search for an alternative package and found [`http.zig`](https://github.com/karlseguin/http.zig) from [Karl Seguin](https://github.com/karlseguin). Karl also has packages for an LRU cache, and data validation named `cache.zig` and `validate.zig` respectively; very cool.

Zig's custom allocators mean memory optimisations (and so performance related to) are more explicitly configurable including say an allocator which up-front allocates 512 MiB (or another user-configurable amount) on the heap and then never does another allocation. Now there's only one potential memory allocation failure (so long as the codebase is well written), presumably early in main(), and our chance of being OOM killed later on, or other allocation-failure logic, is drastically reduced.

I watched this Zig talk by Benjamin Feng ["What's a Memory Allocator Anyway?"](https://www.youtube.com/watch?v=vHWiDx_l4V0) and in addition to the Zig language tutorial I've been doing as well as Zig's documentation my understanding of allocators is burgeoning. I've neither dealt with being able to _choose_ a memory allocation strategy (beyond basic heap or stack in C) nor memory management at this level so I'll be re-viewing and re-reading a lot I expect (should the Zig implementation be the chosen path).


### Varnish

On this line of memory leads to one of the key aspects of the Execution REST API spec and wrapper: caching.

I don't know much about caching on an _implementation_ level, that is implementing the actual software cache invalidation system. _Implementing_ a cache and _using_ a cache such as Redis or Varnish are two very different things. I am aware of the backing datastructures and general algorithms but optimising such _implementations_ is probably more difficult than meets the eye. To this end I have not done much exploration of the different _methods_ of cache invalidation and will stick with an LRU cache for now because I see avenues for this strategy in both Zig and Varnish. If performance is somehow bad _and_ it's directly the fault of the LRU _strategy_ (not implementation) then others can be evaluated. The implementation of the REST wrapper (stemming from its specification of course) is required to assess this beyond an educated guess and I'd rather have one moving variable: the REST wrapper instead of two: cache invalidation _and_ the REST wrapper.

While I was looking at Varnish's LRU caching I discovered VCL. I mentioned in a prior development update that Varnish has _modules_; these are called VMODs and are compiled and execute within the Varnish host process. VMODs can also be exposed to VCL if need be. What I wasn't aware of is how much you can do with VCL including calling different backends and manipulating requests, much like you can do with Nginx for example. In my quick research during prior weeks I'd only gathered a general idea of what could be done but now in the deep-dive stages I think the first (and maybe _the_) implementation could be in VCL or as a VMOD compiled to a single binary since Varnish specialises in HTTP and already has tonnes of cache invalidation VMOD options and optimisations available that I would otherwise have to implement in Zig.


### Hypermedia

I mentioned in my week 2 update that, unfortunately, the most likely payload format will be JSON -- not because it is good but because it is what the vast and overwhelming majority of developers and end-users (even) expect.

Keen readers will already know that JSON is _not_ hypermedia so what is it doing under this heading? Well, JSON _can_ be bastardised into various hypermedia-ish forms but none of these are widely adopted (except JSON-LD) so your experience with them differs greatly depending on the implementation chosen by the authors of the API you're using. On the other hand no hypermedia masquerading attempts within JSON would ruin the _stateless_ aspect of _REST_ at which point just using JSON _RPC_ is better. Mentioned before, formats like [JSON-LD](https://en.wikipedia.org/wiki/JSON-LD) and [HAL](https://en.wikipedia.org/wiki/Hypertext_Application_Language) are kind of the best you can expect within JSON-land for hypermedia-ish features.

There's a better way for this specific use-case though, I pontificate: HTML. To no one's surprise the **H**yper**T**ext **M**arkup **L**anguage is pretty good at representing... hypertext. Nowadays HTML can natively represent more complex media types like audio and video and so itself is a hypermedia system. What we really care about here is the ability to _easily_ describe relationships between data the user has queried for _and_ how to further query for that data in a standardised way both of which HTML does already. Conveniently most users and programming languages already have tools to deal with HTML: the web browser, and a languages standard library.

HTML is not as easy or performant to parse as JSON which is a downside but the ability for a native interface to the execution layer to exist with a HATEOAS (truly) RESTful API responding with HTML as it's payload format _by default_ is a boon I think and uses an already existing widely adopted standard to describe data relationships. Notice the _"by default"_, I think with a simple query parameter it would be fine to also specify the API capable of responding with a JSON payload for those who wish it.

There are still many alternatives to consider here and much more to read. For example [RFC 5988](https://datatracker.ietf.org/doc/html/rfc5988) describes a similarly semantic (but still limiting) relationship system by using HTTP headers. Published standards from W3C like the [Resource Description Framework](https://en.wikipedia.org/wiki/Resource_Description_Framework) and [Web Ontology Language](https://en.wikipedia.org/wiki/Web_Ontology_Language) look like they provide _the_ way to represent relationships between more complex data and there are further W3C recommendations like [Rule Interchange Format](https://en.wikipedia.org/wiki/Rule_Interchange_Format) for extending OWL's relationship description capabilities and [SPARQL](https://en.wikipedia.org/wiki/SPARQL) as a query language for RDF. This is me going in a rabbit hole though. As much as it may be _correct_ (uncertain as of yet however) to adopt one or multiple of the aforementioned technologies there comes a cost with the lack of familiarity and programming language tooling, libraries, etc. that is _lost_ in the process.

Ethereum is already a widely known and used technology and so more minor adjustments to the familiar REST paradigm (like HTML as the primary payload format) are _probably_ more appropriate even though they _might_ be less "correct" when compared to RDF, OWL, etc.