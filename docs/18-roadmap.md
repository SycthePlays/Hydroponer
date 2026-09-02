# 18. Roadmap

Build order is chosen so that the riskiest assumptions are tested first and so that something demonstrable exists early.

The riskiest assumption in Hydroponer is not "can we build a web app". It is **"can a photo yield dimensions accurate enough to design against"**. That question is answered in Phase 1, before any product is built around it.

---

## Phase 0 — Foundations

**Goal:** a repository that can hold real work.

- Monorepo scaffolding, TypeScript configuration, linting, CI skeleton
- Shared schema package with the stage contracts from [Architecture §12.3](05-architecture.md#data-flow-contracts)
- Database schema and migrations
- Catalog data structures, seeded with a deliberately minimal set: two system types, ten crops, forty materials
- Part library conventions: asset budget, naming, parametric axes, and the `model_ref` field on catalog items
- Fixture harness: record and replay for model calls

**Exit criterion:** `pnpm test` passes against a seeded database in CI.

---

## Phase 1 — Prove the vision hypothesis

**Goal:** find out whether the core idea works, before building a product on it.

- Collect the golden set: 50 spaces, photographed, hand-measured
- Scene analysis prompt and schema
- Depth service and scale calibration
- Evaluation harness with the accuracy and calibration metrics from [Testing §16.4](16-testing-and-evaluation.md#164-evaluating-scene-analysis)
- No UI at all — a CLI that takes an image and prints a structured scene

**Exit criterion:** dimensional error under 15% on the clean set and under 25% on the hard set, with an overconfidence rate under 5%.

**If this fails**, the product pivots to manual dimension entry with photo-assisted context, and the whole shape of the app changes. Discovering that in Phase 1 costs weeks; discovering it in Phase 4 costs the project.

---

## Phase 2 — The engine

**Goal:** a described space becomes a real, buildable design.

- System selection with the hard-constraint and weighted-scoring model
- Usable-area extraction
- Placement solver
- BOM expansion, pump sizing, reservoir sizing, lighting sizing
- Cost calculation with the three-point model
- Property tests for every invariant in [Testing §16.2](16-testing-and-evaluation.md#162-engine-unit-and-property-tests)
- Expert review of the top recommendation across the golden set

**Exit criterion:** every golden-set space yields a constraint-satisfying layout, and expert review rates the top recommendation 4 or better at least 85% of the time.

---

## Phase 3 — The product

**Goal:** a person who is not on the team can use it.

- Capture, upload, and intake flow
- Job orchestration, progress streaming, the confidence gate
- Plan page: space, system, layout SVG, BOM, cost
- 3D viewer: scene projection, glTF part library, orbit/spin/zoom, layer isolation, component focus, exploded view, build playback, WebGL fallback ([3D Visualisation](20-3d-visualization.md))
- Narration and tutorial generation with post-validation
- Accounts, saving, sharing, PDF export
- Adjustment flow
- Accessibility pass to WCAG 2.2 AA
- Full catalog: six systems, forty crops, several hundred materials, five launch regions

**Exit criterion:** ten external testers generate plans for their own spaces and report the plan as understandable and plausible, and can describe from the 3D view what they would be building. The viewer holds 30 fps on the mid-range device profile.

---

## Phase 4 — Field validation and launch

**Goal:** plans that get built, not just read.

- Ten funded test builds, receipts recorded, discrepancies fixed
- Cost model corrected against actual spend, per region
- Tutorial gaps closed from real build feedback
- Production monitoring, alerting, runbooks
- Rate limiting and abuse protection hardened
- Public launch

**Exit criterion:** the [Vision and Scope success criteria](02-vision-and-scope.md#success-criteria) are met — systems fit, systems work, costs land in range, users can explain their recommendation.

---

## Phase 5 — Depth

Post-launch, ordered by expected value rather than by novelty.

| Feature | Value | Effort |
|---|---|---|
| More regions and currencies | High | Low — catalog work, not engineering |
| Multi-photo reconstruction for better geometry | High | High |
| Photorealistic materials and a first-person walkthrough camera | Low | High — the v1 viewer already solves comprehension; realism buys little |
| AR placement: view the design in the real room through a phone camera | High | High — the natural extension of the 3D scene once it exists |
| Seasonal and succession planting schedules | High | Medium |
| Community plans: browse what others built in similar spaces | Medium | Medium |
| Supplier links and affiliate pricing | Medium (revenue) | Medium |
| Raw-salt nutrient formulation for advanced users | Low | Low |
| Aquaponics | Medium | High — new domain, new safety surface |
| Sensor integration and monitoring | Medium | High — reopens the "not a grow controller" non-goal |
| Native mobile app | Low | High — responsive web already covers capture |

The ordering is deliberately unglamorous. Adding two more currencies helps more users than a 3D renderer does, and costs a fraction as much.

---

## What would change the plan

Stated in advance, so that changing course later is a decision rather than a drift:

- **If Phase 1 accuracy targets are missed**, the product becomes photo-assisted rather than photo-driven: the user measures, the photo supplies context, and the design engine — which is unaffected — still carries the value.
- **If expert review in Phase 2 disagrees often**, the weighting model needs domain input the team does not have, and a horticultural advisor becomes a prerequisite rather than a nice-to-have.
- **If field builds in Phase 4 fail on fit**, the solver's clearances are wrong, and clearance defaults become conservative until real data says otherwise.
- **If unit economics do not hold at launch traffic**, the anonymous free generation path is the first thing to tighten, not the model quality.
