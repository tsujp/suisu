---
# ZK Frontmatter
title: EPF Update -- Week 1
date: 2023-07-17 13:00:00
keywords: [epf, dev_update, blog]
---

[comment]: # (2023-07-10 to 2023-07-16)

# EPF Update -- Week 1 (Jordan Ellis Coppard)

I'm participating in EPF cohort four and this is my first week update.

The goal for this week is to look at areas of interest and canvas ideas, either new or existing, to contribute to.

## Update

I am prone to biting off more than I can chew, which is both good and bad, however given the structured nature of the EPF cohorts I figure it's a good idea for me to select something already proposed and if there's extra time, or after the EPF programme finishes I can take my learnings and understanding onwards to tackle a larger task.

### JSON RPC

Looking at the [proposed projects list](https://github.com/eth-protocol-fellows/cohort-four/blob/master/projects/project-ideas.md) the idea of a JSON RPC wrapper application stood out to me and this was mostly from the linked tweet. Reading the thread I discovered that apparently various execution clients have subtle differences between their JSON RPC implementations which is something I was not aware of before and is certainly a problem. Non-standard data schemas mean applications _will_ gravitate to specific implementations which is the opposite of being agnostic to any specific client for effective decentralisation.

Improving the existing JSON RPC API was not of much interest to me though when compared to developing a REST API wrapper as a standalone middleware application. Simply porting a JSON RPC API to REST is trivial, almost every single MVC framework in existence today, and for the last decade, is able to take a single ORM and present a JSON and REST interface to that data. One could dig out the logic from Ruby on Rails and viola: a REST API.

The challenge lay in deciding what that API looks like... manually. Designing a specification that does not afford the variances present in the existing JSON RPC one, and crucially with the hindsight of years of Ethereum usage to find out what API calls are frequent and how taxing they are on node clients.

### Research

I asked [Péter Szilágyi for some insight into the specific problems and properties a good solution may have](https://twitter.com/wz__ht/status/1680855026858885122). To summarise his response, a good REST API wrapper will:

- Be composable with existing web2 infrastructure (reuse authentication, routing, etc).
- Have deterministic serving cost from a node's perspective.
- Be stateless (a lot of REST APIs aren't _actually_ stateless).
- Be cacheable.
- Possess disk IO and alloc free endpoints (where appropriate).
- Reconsider the data output from the API itself, what schema is appropriate? What can be left out?

These properties comprise a system that I think is non-trivial to design and implement. I had some ideas on a stack to use: Zig. I discovered a talk about alloc free programming in Zig and I've been wanting to use the language for a project; importantly it's well suited to the task of a _fast_ middleware application being that Zig is a low-level systems programming language. Zig's capacity as a C compiler also means I can use a project like [Varnish](https://varnish-cache.org/) as a cache; no reinventing the wheel there.

I spent the rest of the week doing some [tutorials with Zig](https://ziglearn.org/), [taking some notes on the talk in question](https://www.youtube.com/watch?v=BH2jvJ74npM) (as well as the first EPF call recording which is at a very late time for me) and figuring out some tasks that I need to further delve into. Specifically I'd like to:

- Determine what the most common JSON RPC method calls are.
- Determine the frequency of those calls
- What it costs a node in compute resources to serve them, and
- Any specific patterns of method calls for common functionality.