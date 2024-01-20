---
# ZK Frontmatter
title: EPF Update -- Final
date: 2024-01-20 23:41:00
keywords: [epf, dev_update, blog]
---

[comment]: # (2023-11-13)

# EPF Update -- Final-ish (Jordan Ellis Coppard)

This is the final development update during the course of the EPF, but not _the_ final update. Overall I am unhappy with my performance during the EPF and this mostly boils down to my choice of project but also some habits I've noticed in myself as the programme unfolded.


## Overall Progress

I started out wanting to make a REST API wrapper using software I had never used before and which I could only conclude functionality of based on a limited amount of research, it turns out some key assumptions were missed and I had to reevaluate plans; these things happen, so I did just that.

I concluded on using Bun and writing the codebase in TypeScript. I noticed that all up to date API documentation generation out there was either intimately tied to a specific language framework, or required horrible accommodations to produce even mediocre results. I've been doing web development for almost 10 years now so the idea of a REST API spec isn't a novel one, and is not what I wanted to be doing during the EPF.

The focus on the project transitioned to documentation generation from code where the code written can also be used to run an example implementation of the documented API, but optionally. Using TypeScript for this (as one of the most popular languages in the web space) meant maximum reach for such a tool _could_ exist.

To date I am still in the middle of a refactor, but the end-goal of producing valid OAS 3.1 schemas with any API types using JSON Schema Draft 7 is in-sight. The guts of the compiler are done with the main slowdown being getting TypeScript to function as desired. I've encountered a number of non-trivial problems and produced a few (to my knowledge) world-first features in typed APIs that other major projects like Elysia have not even managed.


## What I Wanted To Do

I wanted to have a crack at writing an EVM. Not a full client, just the EVM. Yes that entails dealing with data that a client would produce and update but snapshots can be made and read etc. In a programme centred around _Ethereum_ development I felt like doing something I was already very familiar with (REST APIs) was kind of a waste of an opportunity. I did so because I wanted to make sure I had something reasonably complete by the end of the programme (and I didn't even achieve that self-goal) but have since learned that overshooting is fine.

I have started work on said EVM implementation, it's good to start a project about something unfamiliar to you if you want to learn more about it. The goal with my EVM project, in addition to what's already been said, is to produce something that has top-tier developer tooling; a great debugger, analysis for certain execution patterns (profiling/efficiency/malware).


## Location and Motivation

I think continuing to be in Australia is a mistake. Attending DevConnect IST 2023 was incredibly motivating for me. Meeting and talking to people who are interested in the _technology_ and _not_ out to scam people with NFTs or the latest pump-and-dump was great. I think if I had a morsel of that at periods throughout the EPF I would have gotten a lot more done, and there were some things I could have done during the EPF to help achieve that goal but staying up until 1 AM to _begin_ having calls would mean other commitments in life (like badminton) would get destroyed due to lack of sleep.

Australia is too far away from any common-ground (read: Europe) in the crypto-space. Even flying to DevConnect involved an 18 hour flight non-stop. Such flight-times are not fun and I noticed how far away I was from the type of people I want to interact with with my being based in Australia.

I think a short-term goal of mine is to get closer to Europe so I can attend conferences, probably meet more of these kinds of people, and communicate on Discord without it being completely asynchronous all the time. Having to _only_ summon motivation internally is not a sustainable feat.


## The Future

My REST API tooling project will be completed, and I may even look at trying to integrate Ethereum's Hiive into it somehow (or vice versa), including a conversion of existing Ethereum REST and RPC documentation converted under my system. If I have set out to do something I intend to finish it but I note that for this type of project I've taken to working on it in chunks and periods.

There shall be more updates soon.
