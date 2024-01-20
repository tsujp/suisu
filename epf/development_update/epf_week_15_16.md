---
# ZK Frontmatter
title: EPF Update -- Weeks 15, and 16
date: 2023-11-07 00:00:00
keywords: [epf, dev_update, blog]
---

[comment]: # (2023-10-16 to 2023-10-29)

# EPF Update -- Weeks 15, and 16 (Jordan Ellis Coppard)

The plan was REST routes, but the focus remains on documentation generation from code.


## Documentation Generation

I've added properly typed slug validation to URLs, e.g. `example.com/users/{UserId}/profile` where `UserId` is the slug. Requiring slugs be typed adds to API documentation and runtime validation as per prior updates.

Adding that feature required updating the TypeScript route definitions and documentation compiler which were both done in-tandem, so now generated documentation displays the expected types as well.

### Required Slugs

URL slugs are also called 'path parameters' and according to the OAS 3.1 spec they are required when declared within a URL path. Various libraries and frameworks I've seen in the wild don't actually enforce this however; meaning you can pass garbage URLs like (reusing the above example): `example.com/users//profile`. Note the double slash. This is enforced, as per the specification, in my implementation.


## Planning Refactor

I'm not happy with how the codebase is coming along. Hacking things together at the start is fine but as I've pivoted a few times there hasn't yet been a consolidation phase to tidy things up. This will be my next step.
