# Architecture Decision Records

Each ADR records one significant decision: the context that forced it, what was chosen, what was rejected, and what it costs. They are immutable — a decision that changes gets a new ADR that supersedes the old one, rather than an edit.

| # | Decision | Status |
|---|---|---|
| [0001](0001-deterministic-engine.md) | The design engine is deterministic code, not a language model | Accepted |
| [0002](0002-single-photo-with-depth.md) | Single photo plus monocular depth, not photogrammetry | Accepted |
| [0003](0003-curated-catalog.md) | Curated materials catalog, not live price scraping | Accepted |
| [0004](0004-confidence-gate.md) | Ask the user rather than guess when confidence is low | Accepted |
| [0005](0005-worker-not-serverless.md) | A long-running worker, not serverless functions | Accepted |
| [0006](0006-typescript-engine.md) | The engine is TypeScript, not Python | Accepted |
| [0007](0007-3d-viewer-in-v1.md) | The 3D viewer ships in v1, rendered client-side from the layout | Accepted |

## Format

```markdown
# ADR-NNNN: Title

## Status
Proposed | Accepted | Superseded by ADR-NNNN

## Context
What forces this decision. What is true that makes it necessary.

## Decision
What was chosen, stated plainly.

## Alternatives considered
What else was on the table, and why each was rejected.

## Consequences
What this costs, what it makes easy, what it makes hard, and what would
cause it to be revisited.
```
