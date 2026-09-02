# 17. Deployment and Operations

---

## 17.1 Environments

| Environment | Web | Worker | Depth | Database | Models |
|---|---|---|---|---|---|
| `local` | `pnpm dev` | Local process | Docker container, CPU | Docker Postgres | Fixtures by default |
| `preview` | Vercel preview per PR | Shared preview worker | Shared preview pool | Neon branch, ephemeral | Live, low limits |
| `staging` | Vercel | Dedicated container | Dedicated pool | Anonymised copy | Live, production config |
| `production` | Vercel | Auto-scaled containers | Auto-scaled GPU pool | Managed Postgres with PITR | Live |

Preview environments get a real database branch per pull request. A migration that breaks is discovered in review rather than in production.

---

## 17.2 Pipeline

```
push / pull request
  ├─ typecheck            tsc --noEmit across the monorepo
  ├─ lint                 eslint + prettier check
  ├─ unit + property      vitest, engine and packages
  ├─ integration          vitest + testcontainers (postgres, redis)
  ├─ e2e                  playwright, fixture mode
  ├─ a11y                 axe against key routes
  ├─ security             dependency audit, secret scan, licence check
  └─ evaluation           only when prompts/, catalog/, or model config changed

merge to main
  ├─ migrate              forward-only migrations against production
  ├─ deploy web           Vercel
  ├─ deploy worker        rolling, drain in-flight jobs before stopping old instances
  ├─ deploy depth         rolling
  └─ smoke                generate one fixture plan end to end against production
```

The evaluation step is conditional because it costs real money and takes minutes. It runs when the change could plausibly move model quality, and nightly regardless.

**Worker deploys drain rather than kill.** A job interrupted mid-pipeline is a user staring at a stalled progress bar. Old instances stop accepting work, finish what they hold, then exit.

---

## 17.3 Migrations

- Forward-only; no down migrations in production
- Expand, migrate, contract: add the new column, backfill, switch reads, then drop the old one in a later release
- Every migration must be safe against the previous application version, because deploys are not atomic across web and worker
- Long backfills run as background jobs, never inside a migration
- Catalog updates are migrations too, which is what makes catalog changes reviewable and reversible

---

## 17.4 Observability

**Traces.** Every job is one trace, every stage a span, carrying model, prompt version, tokens, cache hit, and duration. When a user reports a bad plan, the plan id resolves to the exact trace.

**Metrics.**

| Metric | Why |
|---|---|
| Jobs per hour, by status | Throughput and failure rate |
| Stage duration, p50/p95/p99 | Where time goes |
| Stage failure rate | Which stage is unhealthy |
| Cache hit rate, by stage | The main cost lever |
| Cost per plan, by stage | Unit economics |
| Queue depth and oldest queued age | Capacity |
| Confidence gate trip rate | Vision quality proxy |
| Adjustment rate | Recommendation quality proxy |

**Logs.** Structured JSON, correlated by job id, with emails, tokens, and storage keys redacted at the logger.

**Alerts** page a human for: job failure rate above threshold, queue age above threshold, spend rate anomaly, provider outage, error-rate spike, and database connection saturation. Everything else is a dashboard, not a page.

---

## 17.5 Cost control

Model calls are the dominant variable cost. Left unmanaged they scale linearly with traffic and can be driven up deliberately by an abusive user.

**Levers, in order of effectiveness:**

1. **Caching.** Scene analysis keyed by image hash; narration keyed by engine output hash. Regenerating a plan for an unchanged photo costs nothing at the vision stage. Target above 30% hit rate at steady state.
2. **Stage-appropriate models.** Frontier vision where accuracy compounds; a cheaper model for narration, where the task is writing from a supplied payload.
3. **Selective re-runs.** An adjustment re-runs only the invalidated stages. Changing the budget never re-pays for vision.
4. **Token budgets.** Per-stage input and output caps. Images are downscaled to the smallest resolution that holds accuracy — verified by evaluation, not assumed.
5. **Rate limits.** Anonymous generation is the exposed, expensive surface; it carries the tightest limit in the system.
6. **Wall-clock caps.** A job that exceeds its budget is cancelled rather than allowed to burn.
7. **Spend alerting.** Daily spend, spend per plan, and spend per user are monitored, with anomaly alerts rather than only monthly totals.

**Unit economics target.** Cost per generated plan is tracked as a first-class metric alongside latency. Every model configuration change reports its effect on both, and a change that improves quality at unacceptable cost is a rejected change, not a shipped one.

---

## 17.6 Scaling

| Component | Scaling | Bottleneck |
|---|---|---|
| Web | Vercel automatic | None expected; most routes are cached |
| Worker | Horizontal, on queue depth | Provider concurrency limits |
| Depth | Horizontal GPU pool, scale to zero when idle | Cold start, roughly 20–30 s |
| Postgres | Vertical, then read replicas | Not on the generation hot path |
| Redis | Vertical | Queue throughput |

The depth pool scaling to zero is a deliberate cost trade: at low traffic, paying a cold start on the first plan of the hour is better than paying for an idle GPU all night. Above a traffic threshold, a warm minimum is kept.

---

## 17.7 Backup and recovery

| Asset | Protection | Target recovery |
|---|---|---|
| Postgres | Point-in-time recovery, 7-day window, daily snapshots retained 30 days | RPO 5 min, RTO 1 h |
| Object storage | Versioning enabled, cross-region replication | RPO near zero |
| Catalog | In version control; the database copy is derived | Rebuildable from source |
| Redis | Not backed up | Queue state is reconstructible from `plan_jobs` |

Redis holding no durable truth is intentional: a total Redis loss requeues in-flight jobs from the database and loses nothing a user cares about.

Restores are rehearsed quarterly. A backup that has never been restored is a hypothesis.

---

## 17.8 Runbooks

### Model provider outage

1. Alert fires on `PROVIDER_UNAVAILABLE` rate
2. Jobs already past the vision stage complete normally
3. New jobs queue rather than fail; users see "we're waiting on an upstream service"
4. Saved plans stay fully readable — the plan route touches no model
5. On recovery, the queue drains oldest-first with concurrency ramped gradually rather than all at once

### Depth service down

1. The pipeline degrades to vision-only estimation with reduced confidence
2. The confidence gate trips more often; users are asked to confirm dimensions
3. Quality drops measurably but the product keeps working
4. Alert if degradation persists beyond a short window

### Cost spike

1. Spend anomaly alert fires
2. Check `model_calls` grouped by user, stage, and cache-hit status
3. If abuse: tighten the rate limit for the source, revoke the session
4. If a cache regression: check whether a prompt or model version changed and invalidated keys
5. If organic growth: confirm unit economics still hold before raising limits

### Bad plan reported

1. Resolve the plan id to its job and stage results
2. Read the exact scene analysis, model, prompt version, engine version, and catalog version
3. Classify: vision error, engine judgement, catalog error, or narration error
4. Vision errors become golden-set entries; engine and catalog errors become fixtures and data fixes
5. If the plan carries a safety implication, contact the user directly before anything else

---

## 17.9 Release cadence

- Web and worker deploy continuously from `main`
- Catalog releases are versioned and announced in-product, because they change prices users may have already shopped against
- Model and prompt changes are staged to a traffic percentage before becoming the default
- Plans already generated are never retroactively changed by a release; a user's plan is a snapshot, and it stays the plan they read
