---
# ZK Frontmatter
title: EPF Update -- Week 3
date: 2023-07-31 13:00:00
keywords: [epf, dev_update, blog]
---

[comment]: # (2023-07-24 to 2023-07-30)

# EPF Update -- Week 3 (Jordan Ellis Coppard)

This week I've been a bit sick so I spent most of my time absorbing information passively by watching programming talks on Zig, Rust, and the recommended material in the EPF syllabus. I spent some time on non-EPF projects which were already spec'd out since that required less mental effort. I'm feeling a lot better now ahead of week 4 though!

### Zig

Alongside programming talks by Andrew Kelly and Tigerbeetle I've been reading about Zig's build system; specifically using Zig as a C/C++ compiler. This is because I've shortlisted using software like [Varnish](https://varnish-cache.org/) (already mentioned in a previous update) or [Squid](http://www.squid-cache.org/) -- which are written in C and C++ respectively -- as caches.

If you didn't already know: Zig can compile C/C++ software with it's clang frontend and you'd want to do that because Zig's build system is written in... Zig and that's it! I like tools like `make` but with large and established C/C++ codebases I find it very hard to really grok the careful web of `make`, `m4`, `autotools` etc interactions and the inevitable tooling problems that arise. Having a single tool to do the builds would make the developer experience with that software better -- I should point out I haven't tried to build Varnish or Squid (yet).

Anyway, Varnish has a lot of ways you can use it including as a library in which case the bindings would be done using Zig too hence this investigation.

## Week 4 Plan

I'd like to get a very, very MVP HTTP server going with Zig... built using Zig's build system as a confirmation of my reading and notes at which point I think I can start spec'ing out the first iteration of the REST API (and iterate from there).

Doing the spec for the start of the REST API will require, well, actually doing it! So far notes, thoughts, and abstractions have been made but nothing concrete. I don't expect the first specification to be any good at all but it starts the ball rolling on any missed research areas and somewhat formalises the process which will serve to help (1) verify I can actually do this, and (2) form the basis of my project proposal which is due at the end of week 4 (this week)!
