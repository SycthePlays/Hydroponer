# Hydroponer

**Photograph a space. Get a buildable hydroponic system.**

Hydroponer is a web application that turns a single photo of a room, balcony, garage, greenhouse, or open field into a complete hydroponic growing plan: a spatial layout, a bill of materials, a cost range, and a step-by-step build tutorial.

The user uploads a photo, answers a few short questions (what they want to grow, budget, experience level), and receives a design they can actually build.

---

## What it produces

For every uploaded space, Hydroponer generates:

| Output | Description |
|---|---|
| **Space analysis** | Estimated dimensions, surface types, light conditions, water and power access, obstructions |
| **System recommendation** | Which hydroponic method fits the space (NFT, DWC, ebb & flow, drip, vertical tower, Kratky) and why |
| **Spatial layout** | A scaled 2D plan showing where each component goes |
| **Interactive 3D view** | The whole build in 3D — rotate it, spin it, zoom into any part, hide layers, watch it assemble step by step |
| **Bill of materials** | Every part, quantity, specification, and substitution options |
| **Cost range** | Low / typical / high estimate, split into build cost and monthly running cost |
| **Build tutorial** | Ordered, checkable steps with tools, time estimates, and safety notes |
| **Grow plan** | Crop selection, nutrient schedule, expected yield and harvest timeline |

---

## Documentation

Start here and read in order, or jump to what you need.

### Understanding the project
1. [Introduction](docs/01-introduction.md) — what Hydroponer is and the problem it solves
2. [Vision and Scope](docs/02-vision-and-scope.md) — goals, non-goals, target users, success criteria
3. [How It Works](docs/03-how-it-works.md) — the end-to-end journey in plain language
4. [User Flows](docs/04-user-flows.md) — screen-by-screen walkthroughs and edge cases

### How it is built
5. [System Architecture](docs/05-architecture.md) — services, boundaries, request lifecycle
6. [AI Pipeline](docs/06-ai-pipeline.md) — vision analysis, prompting, structured output, guardrails
7. [Hydroponic Domain Model](docs/07-domain-model.md) — the horticultural and engineering knowledge encoded in the system
8. [Layout Generation](docs/08-layout-generation.md) — the deterministic solver that places components in space
9. [Cost Estimation](docs/09-cost-estimation.md) — materials catalog, pricing model, regional adjustment
10. [Tutorial Generation](docs/10-tutorial-generation.md) — turning a layout into buildable instructions
11. [3D Visualisation](docs/20-3d-visualization.md) — the interactive viewer: how the scene is derived, rendered, and made accessible

### Reference
12. [Data Model](docs/11-data-model.md) — database schema and core entities
13. [API Reference](docs/12-api-reference.md) — HTTP endpoints, payloads, errors
14. [Frontend](docs/13-frontend.md) — pages, components, state, rendering
15. [Tech Stack](docs/14-tech-stack.md) — every technology choice with rationale
16. [Security and Privacy](docs/15-security-privacy.md) — photo handling, PII, threat model
17. [Testing and Evaluation](docs/16-testing-and-evaluation.md) — how correctness of an AI system is measured
18. [Deployment and Operations](docs/17-deployment-operations.md) — environments, CI/CD, monitoring, cost control
19. [Roadmap](docs/18-roadmap.md) — phased delivery plan
20. [Glossary](docs/19-glossary.md) — hydroponic and technical terms
21. [Architecture Decision Records](docs/adr/) — why key decisions were made

---

## Core design principle

> **The AI describes. The engine decides. The AI explains.**

Language models are excellent at reading a photo and describing what is in it, and excellent at writing clear prose. They are unreliable at arithmetic, spatial packing, and price lookup.

Hydroponer therefore splits responsibility strictly:

- **AI (vision):** extract structured facts from the photo — dimensions, light, surfaces, access points.
- **Deterministic engine:** choose the system type, solve the layout, compute the bill of materials, calculate cost. Pure code, unit-tested, reproducible.
- **AI (language):** turn the engine's output into readable explanations and tutorial prose.

No number shown to a user is ever invented by a language model. This is the single most important rule in the codebase and it is enforced at the schema boundary. See [AI Pipeline](docs/06-ai-pipeline.md#the-no-invented-numbers-rule).

---

## Status

**Phase: Documentation and design.** No application code yet. This repository currently holds the complete specification of the system to be built. See the [Roadmap](docs/18-roadmap.md) for the build order.

---

## Safety notice

Hydroponer produces estimates and educational guidance, not engineering certification. Layouts involving structural loads, mains electrical work, or plumbing connected to a potable supply must be reviewed by a qualified professional before construction. See [Safety and Liability](docs/02-vision-and-scope.md#safety-and-liability).

## License

MIT — see [LICENSE](LICENSE).
