# 14. Tech Stack

Every choice here is justified against the specific shape of this product: a long-running, expensive, AI-dependent generation pipeline behind a mostly-read web app.

---

## 14.1 The stack

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript everywhere except the depth service | One type system across the frontend, the API, the worker, and the engine; the shared schemas are the app's spine |
| Web framework | Next.js (App Router) | Server rendering plus streaming suits a page assembled from slow parts; API routes remove the need for a separate backend in v1 |
| UI | React, Tailwind, Radix primitives | Radix gives accessible behaviour for free, which matters given the WCAG target |
| Validation | Zod | One schema definition serves runtime validation, static types, and model tool schemas |
| Database | PostgreSQL (Supabase or Neon) | Relational data, `jsonb` where the shape is a snapshot, row-level security, mature tooling |
| ORM | Drizzle | SQL-shaped, no query builder magic, migrations as reviewable files |
| Object storage | S3-compatible | Signed direct uploads; photos never pass through application servers |
| Queue | BullMQ on Redis | Durable, observable, supports delayed retries and suspended jobs |
| Worker runtime | Long-running Node container (Fly.io, Railway, or ECS) | Serverless timeouts are hostile to a 90-second pipeline |
| Depth service | Python, FastAPI, PyTorch | The open depth models live in Python; fighting that costs more than a second language does |
| Vision and language | Claude API | Strong vision, strict tool-use schemas, and the structured-output reliability the pipeline depends on |
| Rendering (2D) | Server-side SVG generation; Satori or Resvg for raster; a headless renderer for PDF | One drawing, rendered once, reused everywhere |
| Rendering (3D) | Three.js with React Three Fiber, `drei` helpers, Draco-compressed glTF assets | Client-side WebGL from a server-computed scene description; no per-plan asset generation or storage |
| Auth | Supabase Auth or Auth.js | Email plus OAuth; no credential handling in application code |
| Hosting (web) | Vercel | Matches Next.js, edge caching for static routes |
| Observability | OpenTelemetry, Sentry, a metrics backend | Per-stage traces are the only way to debug a pipeline |
| Testing | Vitest, Playwright, a custom evaluation harness | Unit for the engine, end-to-end for flows, evals for the model stages |
| CI/CD | GitHub Actions | Type check, test, evaluate, migrate, deploy |

---

## 14.2 The decisions that matter

### TypeScript for the engine, not Python

The design engine is geometry, rules, and arithmetic — a domain where Python's numeric ecosystem would be a genuine advantage. It is written in TypeScript anyway, because:

- Its output types are consumed directly by the frontend and the API; one schema definition beats a generated client plus a hand-maintained mirror
- It has no numerical dependency heavier than basic geometry
- Keeping it in the same language as its only two consumers removes a serialisation boundary and an entire class of drift

Python is used only where it is unavoidable: the depth model.

### A separate worker instead of serverless functions

Generation takes 40–90 seconds and must survive retries, suspension at the confidence gate, and partial resumption. Serverless execution limits, cold starts, and the absence of durable in-process state make that awkward at best. A long-running worker is simpler, cheaper under sustained load, and lets the orchestrator hold a job open while it waits for a user's answer.

### Postgres with `jsonb`, not a document database

The relational parts are genuinely relational — users, spaces, jobs, catalog references, BOM lines. The plan snapshot is genuinely a document. Postgres does both well, and one database is dramatically less operational surface than two.

### A curated catalog, not a scraper

Covered in [Cost Estimation §9.1](09-cost-estimation.md#why-not-live-scraping). Short version: a scraper that silently returns a wrong price is worse than an honest range from a dated survey.

### Claude for both vision and narration

One provider for both model stages simplifies the integration, the cost accounting, and the failure handling. The tool-use schema support is the specific feature the pipeline is built around — the scene analysis stage depends on the model reliably returning a typed object rather than prose.

Model identifiers are configuration per stage, so a stage can be moved to a cheaper or newer model independently once evaluation supports it.

### SSE, not WebSockets

Progress is one-directional, server to client. SSE is simpler, survives proxies better, reconnects natively, and needs no additional infrastructure. The only client-to-server message in the flow — the confidence-gate answer — is an ordinary POST.

---

## 14.3 What was rejected

| Considered | Rejected because |
|---|---|
| Python or Django backend | Would split the type system across the boundary the engine's output crosses most often |
| ~~A dedicated 3D engine (Three.js) in v1~~ | **Reversed.** See [ADR-0007](adr/0007-3d-viewer-in-v1.md): the scene is derived from the layout rather than authored, so the effort estimate was wrong, and the comprehension gain for beginners is the point of the product. Three.js ships in v1. |
| A server-rendered turntable image sequence instead of a live viewer | Cheaper on the client and works without WebGL, but not zoomable, not inspectable, cannot isolate layers, and every plan version would need re-rendering and storing. Kept only for PDF and social previews. |
| AI-generated 3D geometry or renders | Forbidden by [ADR-0001](adr/0001-deterministic-engine.md): a mesh in the wrong place is a dimensional lie told visually, and it looks plausible enough to escape review |
| Fine-tuning a custom vision model | No training data, and a frontier model with a strict schema already clears the accuracy bar |
| A general-purpose constraint solver | The placement problem is bounded enough for enumeration; a solver adds a heavy dependency and removes inspectability |
| Vector database for "similar spaces" | No demonstrated user need; the engine does not learn from other users' spaces in v1 |
| Kubernetes | Three services do not justify it; managed containers are enough until they are not |
| A monolith with no worker | Cannot survive the pipeline's runtime characteristics |
| Firebase or a BaaS-only architecture | The pipeline needs a real server process; a BaaS would be doing half the job |

---

## 14.4 Dependency policy

- **Few dependencies in `packages/engine`.** Ideally zero beyond geometry helpers. It is the code that must never surprise anyone.
- **Prefer boring.** Every dependency is a thing that can break during a deploy at an inconvenient time.
- **Pin exact versions** for anything on the generation path, including model identifiers.
- **Lockfile committed**, and dependency updates are batched into their own reviewed pull requests rather than mixed into feature work.
- **Licences audited** in CI; nothing copyleft in the distributed frontend bundle.

---

## 14.5 Local development

```bash
cp .env.example .env.local
```

```bash
docker compose up -d
```

```bash
pnpm install && pnpm db:migrate && pnpm db:seed
```

```bash
pnpm dev
```

| Command | What it does |
|---|---|
| `pnpm dev` | Web plus worker, with recorded fixtures replayed instead of live model calls |
| `pnpm dev:live` | Same, but with real model calls (costs money) |
| `pnpm test` | Unit and integration tests |
| `pnpm eval` | Golden-set evaluation against live models |

Fixture mode is the default and it matters more than it sounds: about fifty recorded space analyses let an engineer iterate on selection, layout, BOM, and costing with zero API spend and no network latency. Live mode exists for the stages that genuinely need it.

---

## 14.6 Environment variables

```
DATABASE_URL=
REDIS_URL=
STORAGE_BUCKET=
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

ANTHROPIC_API_KEY=
MODEL_SCENE_ANALYSIS=claude-opus-5
MODEL_NARRATION=claude-sonnet-5

DEPTH_SERVICE_URL=
FX_API_KEY=

FIXTURE_MODE=true
MAX_JOB_SECONDS=180
RATE_LIMIT_ANON_PER_DAY=3
```

No secret is ever read in a client component. Anything reachable from the browser is prefixed `NEXT_PUBLIC_` and contains nothing sensitive.
