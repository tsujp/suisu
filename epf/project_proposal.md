# Suisu -- Execution REST

That'll do JSON-RPC, that'll do.

## Motivation

The current JSON RPC API (herein: JRA) suffers from imperfect standardisation and ad-hoc per-execution-node extensions
resulting in difficult to use and tightly coupled applications. If the goal of Ethereum is a distributed and
implementation-agnostic protocol then the current JRA, while making great strides, currently fails to meet this requirement.

Further standardisation improvements to the JRA _could_ alleviate these problems but given the Beacon chain's implementation
of a REST API this represents a good opportunity to address the current Execution JRA's shortfalls with a REST API
specification and reference JRA wrapper implementation. These two components will (propose to) extend the Execution
API protocol.

## Project description

1. A REST API specification for the Execution layer.
2. A reference implementation of (1) by wrapping the current JRA.

## Specification

How will you implement your solutions? Give details and more technical information on the project.

## Roadmap

What is your proposed timeline? Outline parts of the project and insight on how much time it will take to execute them.

## Possible challenges

What are the limitations and issues you may need to overcome?

## Goal of the project

What does success look like? Describe the end goal of the project, scope, state and impact for the project to be considered finished and successful.

## Collaborators

### Fellows 

None.

### Mentors

@lightclient

## Resources

[GitHub repo](https://github.com/tsujp/execution_rest)

#### Etymology

- 수행(하다): (n. (v.)) To carry out a duty or perform (execute) a task.
- 쉬다: (n.) Rest.

Combine and abbreviate both words (without attention to grammar) and romanise for
ease of spelling to yield: 쉬수 (Suisu).
