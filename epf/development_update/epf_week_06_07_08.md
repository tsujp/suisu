---
# ZK Frontmatter
title: EPF Update -- Weeks 6, 7 and 8
date: 2023-09-11 16:42:00
keywords: [epf, dev_update, blog]
---

[comment]: # (2023-08-14 to 2023-09-03)

# EPF Update -- Weeks 6, 7, and 8 (Jordan Ellis Coppard)

As part of my project plan I had slated two weeks for planning and implementing -- in more granular detail -- with wrapping REST endpoints; research has been done and options noted so those two weeks are for trying out said options with the goal to choose one for the rest of the project. Now, I had elected to use [Varnish](https://varnish-cache.org) and while getting a real-world setup going (fairly simple given prior research) I soon found out I missed a key determination from my research: _1:N requests within Varnish_.

Essentially: I hit a major unknown-unknown (due to my own mistakes) which required some (relatively) quick planning and real-world testing to work around.


### Varnish and 1:N

During my research I had simply _assumed_ that collecting content from multiple backends would be possible as alternate implementation options (like writing a server in Zig) would naturally allow this. I had assumed this because I had not given proper focus to Varnish's primary function: caching. I think I was too focused on trying to (have the option to) kill two birds with one stone and conflated this seemingly trivial functionality with Varnish's main purpose. Now, Varnish _does_ support a subset of [Edge Side Includes] ([wiki](https://en.wikipedia.org/wiki/Edge_Side_Includes) - [varnish docs](https://varnish-cache.org/docs/7.3/users-guide/esi.html)) but ESI is intended for _documents_ and not JSON _data_ so it is inelegant when applied as a solution here. At this point it is probably a better idea to write a custom Varnish backend that does the 1:N orchestration itself.

A Varnish backend is a source of cacheable content. You can imagine you make a request to the interface Varnish is listening on and in order to service that request Varnish will interact with the configured backend(s). Backends can be many things and since I had previously trialed writing a basic REST HTTP server in Zig I figured I could do 1:N orchestration there and provide this binary as a backend for Varnish. This is of dubious value until a caching strategy is known (or appropriate) but I felt it was worth a shot and built upon work I had already successfully completed.

Turns out one of the RPC providers I was using (Infura) does not support TLS 1.3. That's... very annoying. Zig intentionally only supports TLS 1.3 because TLS 1.2 is a standard addled with complexity and TLS 1.3 being simpler, and also widely supported solves this.

I could locally proxy TLS 1.3 to TLS 1.2 for RPC APIs (used in the test harness) to work around that but now again: at this point I felt there were too many cuts going on and to prevent death (by 1000 of them) it was probably a good idea to move to a higher-level strategy since this project is time constrained and its value is in its completion not just the attempting-of.


### Changing-tack

Reinitiating research to overcome this problem the goal was to quickly combine research with a quick experiments for validation. I did, and do, like Zig but for the initial implementation I figure using such a low level language will likely slow me down as the reference implementation is merely a _wrapper_ and so will mostly be blocked on IO and not raw execution speed. Varnish fit that nicely as its higher-level configuration language, VCL, is compiled (by Varnish) into C for runtime execution.

The natural choice is now something like Python, Ruby, or {Java,Type}Script (herein just JavaScript). Python and JavaScript package management and developer tooling is absolute hell which I fear will slow me down so I was about to use Ruby when I decided to give Bun a try again.

It's also important to mention developer friendliness. I would hope the work I am doing here is valuable enough that others would like to contribute but I do recognise not everything one can do _can_ be valuable. In the case it is, however, having the fewest amount of hurdles to contribution is key. Having to deal with brittle package managers, flakey environments, and toolchain hell is not something I want to project onto others because, for me, if I see another project I want to contribute to with such problems it somewhat kills my enthusiasm. The exception here is where improving the developer tooling is on the table.


### Bun with Elysia

In the past I've used Deno (and still do for smaller self-contained script-like programs for now) as well as Bun. Deno is pretty good for smaller things but doesn't have great `npm` compatibility which, unfortunately, is a hard requirement since that is _the_ package ecosystem for JavaScript. Deno has great first-class support for standardised web APIs which I really, really like but my fear is using API tooling packages such as OpenAPI, API Blueprint, or Dredd may break and I've spent too much time in the past trying to get npm packages that do work with Deno to work where there is a mix of `"type": "module"` within the dependency tree (that is, ESM and CommonJS imports) and other self-imposed stupid problems the JavaScript community push onto themselves.

Bun I tried in the past very early on and hadn't really touched since, but given the packaging requirements here I gave it another shot. I did some research for express-like frameworks for Bun and found Elysia which looked to be a good blend between terse and configurable. Bun, like Deno, has its own testing framework embedded and is a single binary you can download, inflate, mark executable, and be _done_ installing. You can (and probably should) use your operating systems' package manager to do the installation trivial as it is; the point here is that it doesn't depend on a combinatorial explosion of other libraries or software (less brittle by _number_ of dependencies). More major JavaScript frameworks work in Bun than do in Deno so it's npm compatibility is better and Bun itself replaces every single piece of JavaScript tooling except your LSP.

My experiments wrapping some RPC endpoints with Elysia went fine as you'd expect, completely boring (in a good way) it just worked.


### Moving forward

This will be the plan from now on: continue with the wrapper implementation and spec development (in API Blueprint unless there is a problem) using Bun with Elysia. Dredd can be used to validate the specification and for any other test requirements Bun's inbuilt testing framework (which I think is literally a subset of Jest) bridges the gap.


### Conclusion

I think this is an important reminder not to take seemingly trivial things for granted. If I had validated the options for 1:N requests using Varnish during the explicit research phase I could have saved these 3 weeks of experimentation and tack-changing. It may seem pedantic or pointless to check such 'obvious' things but this here is proof that until you know, you don't know; and the only way to know is to do or check.