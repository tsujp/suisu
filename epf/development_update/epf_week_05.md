---
# ZK Frontmatter
title: EPF Update -- Week 5
date: 2023-08-14 13:00:00
keywords: [epf, dev_update, blog]
---

[comment]: # (2023-08-07 to 2023-08-13)

# EPF Update -- Week 5 (Jordan Ellis Coppard)

I spent most of this week working on my project proposal. Within that context mostly I was thinking about any challenges as well as how I should timeline milestones. There was also a bit of time spent on the API specification-source format.


### Project Proposal

I came to the conclusion that it's quite hard to get some definite milestone deadlines for the project as I've architected it and instead I've opted for a 'bite and chew' approach where chunks of JSON RPC endpoints are chosen incrementally to be re-specified and wrapped (implemented) in REST. My reasoning is I cannot confidently estimate just how challenging the work will be at any one point in time; I could provide an average estimate but this breaks down when challenges are met. Overall I expect this to be quite tough, especially towards the edge of the existing JSON RPC specification, but also due to the inherent constraints from the scope of this project being a _wrapper_ over an existing imperfect API; leaky abstractions and abstraction inversion will probably crop up a lot and be difficult to manage. This will be specific to the wrapper implementation and not the REST specification itself.

If the project was to implement the REST API within an execution clients codebase then I could be more definite around incremental deadlines but it is not so I can't. I also expect a lot of cross-pollination hence 'bite and chew'.


### Twilight Research

I also spent a bit of time thinking about API specification formats. There's the obvious [OpenAPI (Swagger)](https://github.com/OAI/OpenAPI-Specification) for which I'd use JSON (YAML is a disaster) but the idea of wrangling increasingly huge and/or numerous JSON files with all kinds of interwoven 'syntax' (really just a string) tires me simply thinking about it. [RAML](https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md) looked interesting but it's based on YAML 1.2 so that's ruled out immediately. [API Blueprint](https://apiblueprint.org/) looks much more _developer_ friendly (no overly complicated markup language like YAML nor syntax hell like _writing_ JSON), my only concern would be adopting 'weird' tooling when compared to OpenAPI but then popular API testing tools like [Dredd](https://github.com/apiaryio/dredd) looks to support API Blueprint more than OpenAPI's latest spec (3). Dredd does fully support OpenAPI 2 however.

Honestly I think I'll go the API Blueprint route since this is the perfect project to try it out on and worst-case I can change back to OpenAPI.