# Suisu

A REST API specification and reference implementation wrapper of the current Execution client JSON-RPC API and (as much as possible) its quirks.

---

# Who am I?

Jordan Ellis Coppard

Software engineer and DevOps engineer

Developed and operated ~2300 nodes on bare metal infrastructure on Hetzner, previously ConsenSys

---

# Sitrep

JSON-RPC...

- Incomplete standardisation (coverage).
- Arbitrary vendor extensions which are weakly differentiated.
- Not actually stateless.
- Fixed undiscoverable interface.
- Poor domain linking.

---

# The goal

REST...

- Complete standardisation.
- Strong namespacing.
- Actually stateless.
- Discoverable interface.
- Well-defined domain linking.

---

# Proposed Solution

1. A REST API specification for the Execution layer.

    - Maximal API coverage.
    - Hypermedia response payload (HATEOAS).

2. Reference implementation of (1) by wrapping existing JSON-RPC API.

---

# HATEOAS, huh? (1)

Consider a familiar JSON-style API response:

`GET /accounts/12345`

```json
{
    "account": {
        "account_number": 12345,
        "balance": {
            "currency": "usd",
            "value": -50.00
        },
        "status": "overdrawn"
    }
}
```

- What else can I query from here? `GET /accounts/12345/ANYTHING_HERE_OR_NAH`
- If I know I can query more, how do I do so?

---

# HATEOAS, huh? (2)

What about if we use HTML instead?

```html
<html>
  <body>
    <div>Account number: 12345</div>
    <div>Balance: $100.00 USD</div>
    <div>Links:
        <a href="/accounts/12345/deposits">deposits</a>
        <form method="post" action="/accounts/12345/deposits">
            <input name="amount" type="number" />
            <button>Submit</button>
        </form>
        <a href="/accounts/12345/withdrawals">withdrawals</a>
        <a href="/accounts/12345/transfers">transfers</a>
        <a href="/accounts/12345/close-requests">close-requests</a>
    </div>
  <body>
</html>
```

- What we can further query is very obvious and dynamically discoverable.
- Built-in UI!

You _can_ do this with JSON (see: JSON-LD) and JSON-LD _is_ used by some but it's not concrete or widespread.

---

# But how?

## 3 major project domains

1. Iteration of JRA, and discovery of any Execution-client specific quirks; _leading to..._
2. REST API specification and self-testing against reference implementation; _which requires..._
3. General Execution client infrastructure access.

## Let's get loopy

Completing the project can be thought of as a loop, throughout the project's duration the goal is to loop as many times as possible, doing:

1. Choose a subset of JSON-RPC API to replace with a REST specification.
2. Develop that REST specification.
3. Implement reference API-surface for (2).
4. Implement tests for (3) using _real_ Execution client backends as data sources.

---

# But how, with technology?

## Varnish

    A very fast, HTTP specific cache with configurable behaviour (VCL), plugins (VMODs), and useable as a library.

## Zig

    A great low-level systems programming language with, amongst many other things, configurable memory allocators and a complete C/C++ toolchain.

#### Links

- https://varnish-cache.org/
- https://ziglang.org/

---

# Roadmap

- A week forming t-shirt sizes and general order of attack for JSON-RPC API methods to tackle.
- The rest of the time: loop!

---

# Challenges

- Complete list of JSON-RPC API quirks unknown.
- Leaky abstractions: failure to abstract away that which we want to.
- Abstraction inversion (likely to happen): users re-implementing functionality of an API that the API itself already implements but does not expose to the user.
- Time: the complete specification and implementation challenges arising are not known ahead of time, loops make progress and there are only so many loops that can be made before the EPF programme ends (although of course development can continue beyond this).
- Fuzzing.

---

See you in the Ether(eum)!
