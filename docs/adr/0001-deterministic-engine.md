# ADR-0001: The design engine is deterministic code, not a language model

## Status

Accepted

## Context

Hydroponer's output is acted on physically. A user reads a plan, buys parts, cuts pipe, and fills a system with water. The cost of a wrong number is not a bad answer on a screen — it is a wasted weekend, wasted money, a system that does not fit, or in the worst case a flooded room or a pump running dry.

A language model given a described space could plausibly produce a whole plan in one call. It would read well. It would also, unpredictably, get arithmetic wrong, size a pump on flow while ignoring head, specify a channel that does not fit the wall it was measured against, or quote a price it inferred from training data rather than from a catalog.

These failures are silent. They do not throw. They are discovered by a person standing in a garage.

## Decision

Language models are used for exactly two things: **perception** (reading a photo into typed data) and **expression** (writing prose from already-computed data).

Everything between — system selection, layout solving, bill of materials, cost, tutorial structure — is ordinary deterministic code in `packages/engine`, with no I/O, no network, and no randomness.

A language model may never originate a number, part, dimension, price, or quantity that reaches a user. This is enforced mechanically: generated prose is validated so that every numeric token and every component name appears in the engine payload that produced it.

## Alternatives considered

**End-to-end generation.** One model call, photo in, full plan out. Rejected: unverifiable, non-reproducible, silently wrong, and impossible to regression-test.

**Model generates, code validates.** Let the model design, then check its output against constraints. Rejected: validation can only reject, not repair, so failures become retry loops with no convergence guarantee — and a plan that passes validation can still be a poor design for reasons the validator does not encode.

**Model as a tool-caller over engine functions.** Let the model orchestrate deterministic tools. Rejected for v1: it adds non-determinism to the control flow for no gain, since the pipeline order is fixed and known.

## Consequences

**What it costs.** Every capability must be explicitly encoded. The engine cannot handle a space type nobody anticipated; it will return "no valid layout" instead of improvising. Domain knowledge must be curated, sourced, and maintained by people.

**What it buys.**

- The same input always produces the same plan — cacheable, versionable, reproducible
- Every recommendation traces to a specific rule, weight, or catalog value, so a wrong recommendation is fixed at its source rather than by prompt-tuning
- The design logic is unit- and property-testable in milliseconds, with no API spend
- A model provider outage cannot change what the engine produces
- Safety constraints are guarantees rather than instructions

**What would revisit it.** Nothing foreseeable for the design path. If a future model demonstrated reproducible, verifiable numeric reasoning under evaluation, the narration boundary could widen — but the safety-critical constraints would remain in code regardless.
