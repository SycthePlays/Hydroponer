# ADR-0005: A long-running worker, not serverless functions

## Status

Accepted

## Context

Plan generation takes 40–90 seconds across ten stages, calls external models with their own latency and rate limits, can suspend indefinitely at the confidence gate, and must survive retries without repeating expensive work.

The rest of the application — a mostly-read web app — is an excellent fit for serverless. The pipeline is not.

## Decision

Generation runs in a long-running Node worker container, fed by a durable Redis-backed queue. The web app and its API routes stay serverless on Vercel.

## Alternatives considered

**Everything serverless.** Rejected: execution time limits sit uncomfortably close to p95 generation time; cold starts add latency to an already-slow path; and there is no natural home for a job that is waiting on a human answer.

**Serverless with step orchestration (Step Functions, Inngest, Temporal).** A genuine fit for the problem shape — durable execution, suspension, retries — and reconsidered if operational load grows. Rejected for v1 because it adds a substantial platform dependency and a second mental model for a pipeline whose ten stages are already explicit and sequential.

**Everything on one long-running server.** Rejected: it gives up edge caching and painless scaling for the read-heavy majority of traffic, which is most of the request volume.

## Consequences

**What it costs.** Two deployment targets, two scaling stories, and a container to keep patched. Local development runs two processes.

**What it buys.**

- No timeout pressure on the pipeline
- Jobs can suspend for hours at the confidence gate without holding an execution slot
- Warm process state: connection pools, catalog in memory, model clients reused
- Deploys drain in-flight jobs instead of killing them
- Concurrency against the model provider is controlled in one place
- Cheaper under sustained load than per-invocation billing on 90-second executions

**What would revisit it.** If the queue and worker become the dominant operational burden, a durable-execution platform is the natural migration — the stage boundaries and their persisted results are already shaped for it.
