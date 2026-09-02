# ADR-0006: The engine is TypeScript, not Python

## Status

Accepted

## Context

The design engine is geometry, constraint checking, and arithmetic. Python has the stronger ecosystem for that kind of work — NumPy, Shapely, SciPy, and every optimisation library worth having. On the merits of the domain alone, Python is the obvious choice.

Against that: the engine's output is consumed by exactly two things, the Next.js frontend and the Node worker, both TypeScript.

## Decision

The engine is a pure TypeScript package with no I/O and minimal dependencies. Python is used only for the depth service, where the models genuinely require it.

## Alternatives considered

**Python engine behind an HTTP service.** Rejected: it introduces a network boundary on the hot path, a second type definition to keep synchronised with the first, a generated client, and a class of drift bugs that only appear when the two definitions disagree.

**Python engine compiled to WebAssembly.** Rejected: the toolchain cost is real, debugging is worse, and the numeric libraries that motivated Python in the first place are the hardest part to bring along.

**Rust engine.** Genuinely attractive for a deterministic constraint solver — fast, exhaustively testable, no runtime surprises. Rejected for v1 on team velocity, and because the same type-duplication problem returns.

## Consequences

**What it costs.** Some geometry that would be one call in Shapely is written by hand. Polygon decomposition, offsetting, and point-in-polygon tests are implemented and tested directly. If the placement problem ever outgrows enumeration, TypeScript is a poorer place to reach for a solver.

**What it buys.**

- One schema definition, from the database through the API to the React component, with no generated client between them
- The engine runs in the worker, in tests, and — if ever useful — in the browser, unchanged
- Property tests run in milliseconds with no process boundary
- One language, one toolchain, one test runner for everything except the depth model

**What would revisit it.** A placement problem that genuinely needs a general-purpose constraint solver. At that point the solving step alone could move behind a service boundary, while the schemas, scoring, BOM expansion, and costing stay where they are.
