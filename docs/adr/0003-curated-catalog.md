# ADR-0003: Curated materials catalog, not live price scraping

## Status

Accepted

## Context

The product promises a cost range. Prices vary by country, retailer, quality tier, and season. The obvious approach is to look prices up at generation time from real retailers, which would appear more accurate and more current.

## Decision

Prices come from a curated, versioned catalog maintained in the repository. Each item carries a low–high band per quality tier in USD, sourced from a periodic retail survey, then adjusted by a per-country multiplier and converted at a daily-cached FX rate.

Every plan displays the survey date. A band whose survey is older than the freshness threshold is labelled stale rather than served silently.

## Alternatives considered

**Live scraping of retailer sites.** Rejected: generally prohibited by terms of service; scrapers break constantly and fail by returning a wrong price rather than an obvious error; coverage varies too much by country to help most users; and a scraped catalog is not auditable.

**Retailer affiliate or product APIs.** Attractive where they exist, but coverage is thin outside a few markets and the integration burden is per-retailer. Deferred to Phase 3 as an enhancement layered over the catalog, not a replacement for it.

**Model-estimated prices.** Rejected outright under ADR-0001. A model's price estimate is a confident guess drawn from training data of unknown vintage.

**Crowd-sourced prices from users.** Interesting later — the `actual_cost` feedback field already collects the raw signal — but it cannot bootstrap a catalog from zero users, and unmoderated it is trivially poisoned.

## Consequences

**What it costs.** Someone must maintain the catalog. Prices drift between surveys. The quoted range is wider than a single scraped number would appear to be.

**What it buys.**

- Every price is traceable to a survey with a date
- Nothing breaks silently; a stale catalog is visible rather than wrong
- Specifications and prices live together, so the engine can size a pump and price it from the same record
- Non-food-grade and unsafe items simply do not exist in the catalog, which makes the safety rule structural rather than procedural
- Cost accuracy is measurable against `actual_cost` feedback, and systematic regional bias corrects the multiplier

**What would revisit it.** Broad availability of reliable product APIs in the launch regions, at which point live pricing could override catalog bands per item while the catalog remains the fallback and the source of specifications.
