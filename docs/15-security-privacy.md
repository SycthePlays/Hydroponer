# 15. Security and Privacy

Hydroponer asks users to photograph the inside of their homes. That is an unusually intimate request for a web app, and it sets the standard everything here is held to.

---

## 15.1 The photo problem

A photo of someone's garage, balcony, or spare room can reveal far more than the space: possessions, family members, documents on a desk, the layout of a home, and — through EXIF GPS — its exact location.

The product's position:

1. **Location metadata is destroyed on arrival.** EXIF GPS is stripped during preprocessing, before the image is written to storage. The useful fields (focal length, orientation, capture time) are extracted into the database as scalars; the rest is discarded.
2. **People are never analysed.** The scene prompt instructs the model to ignore people entirely and never to describe them. If people are detected, a hazard flag is raised and the user is invited to retake the photo. No facial data is extracted, stored, or embedded.
3. **Photos are never public by default.** A shared plan omits the photo unless the owner explicitly opts in, per share.
4. **Photos are not training data.** Uploaded images are not used to train models, are not sent to any third party other than the model provider for the single analysis call, and are not retained by that provider for training under the API terms.
5. **Retention is short and user-controlled.** 90 days by default, with a "delete after analysis" setting for users who want the image gone the moment the plan exists. The plan itself does not depend on the photo — it depends on the structured scene description.
6. **Deletion is real.** Deleting a space purges the objects from storage, not just the database rows.

This is stated plainly in the interface at the point of upload, not buried in a policy page.

---

## 15.2 Threat model

| Threat | Mitigation |
|---|---|
| Unauthorised access to another user's photos or plans | Row-level security in Postgres; signed, short-lived, single-use storage URLs; no enumerable identifiers |
| Enumeration of shared plans | Share slugs are high-entropy and unguessable; shared plans are unlisted and `noindex` unless the owner opts in |
| Malicious file upload | Content-type and magic-byte validation, size limits, re-encoding of every image (which strips embedded payloads), no execution path for uploaded bytes |
| Decompression bomb | Pixel-count and decoded-size limits enforced before decode |
| Prompt injection via text visible in a photo | The scene prompt classifies in-image text as data to be reported, never as instruction; extracted text lands in a string field and is never concatenated into a prompt |
| Cost-exhaustion abuse | Per-IP and per-account rate limits, job wall-clock caps, per-stage token budgets, alerting on spend anomalies |
| Credential leakage | No secrets in client bundles; secrets from the platform's secret store; scheduled rotation; secret scanning in CI |
| SQL injection | Parameterised queries throughout; no string-built SQL |
| XSS via model-authored prose | Narration renders as text, never as HTML; Markdown rendering is sanitised with a strict allowlist |
| SSRF via user-supplied URLs | The app accepts no URLs from users in v1 |
| Account takeover | Delegated auth, provider-enforced password policy, optional MFA, session invalidation on password change |
| Insider access to user photos | Production storage access is role-restricted and audited; debugging uses fixture images, never live user data |

---

## 15.3 Access control

- Row-level security is enabled on every user-owned table; policies are tested as code, not assumed
- Anonymous sessions carry a scoped claim that grants access only to spaces created within that session, and expire after 30 days
- Claiming an anonymous space on signup is a single transactional operation with ownership verification
- Public plan reads go through a dedicated path that selects only shareable fields — it cannot accidentally leak the photo, the intake budget, or account data, because it never reads them
- Administrative access to the catalog is separate from application access and requires a distinct role

---

## 15.4 Data handling summary

| Data | Sensitivity | Storage | Retention |
|---|---|---|---|
| Space photos | High | Private bucket, encrypted at rest, signed access only | 90 days default; user-configurable to "delete after analysis" |
| Scene analysis | Medium | Database | With the plan |
| Plans | Medium | Database | Until the user deletes them |
| Email address | Medium | Auth provider plus `users` | Until account deletion |
| Country and currency | Low | Database | Until account deletion |
| IP address | Medium | Rate-limit store only | 24 hours |
| Model call records | Low | Database, no user content | 24 months, aggregated after 90 days |
| Stage results | Medium (they contain the scene description) | Database | 180 days |

Everything is encrypted in transit (TLS 1.3) and at rest.

---

## 15.5 Third parties

| Party | Receives | Why |
|---|---|---|
| Model provider (Anthropic) | The analysis image and the engine payload | Scene analysis and narration |
| Object storage provider | The image bytes | Storage |
| Database provider | All relational data | Storage |
| Error monitoring | Stack traces with user identifiers scrubbed | Debugging |
| FX rate provider | Nothing user-specific | Currency conversion |

No advertising networks, no third-party analytics that fingerprint users, no data brokers. Product analytics, where used, are first-party and aggregate.

---

## 15.6 User rights

Implemented as features, not as an email address to write to:

- **Export.** A full data export — plans, spaces, images, feedback — as a downloadable archive, from settings
- **Deletion.** Account deletion soft-deletes immediately, revokes all sessions, and hard-purges within 30 days, including storage objects
- **Per-space deletion.** Any single space and its photos can be deleted independently at any time
- **Retention control.** The photo retention period is a user setting, with "delete after analysis" as the strictest option
- **Correction.** Any scene value the system inferred can be corrected by the user, which is both a privacy right and a quality mechanism

---

## 15.7 Application security practices

- Dependency scanning and secret scanning on every pull request
- Content Security Policy with no `unsafe-inline`; strict `frame-ancestors`
- Standard security headers: HSTS, `X-Content-Type-Options`, `Referrer-Policy`
- CSRF protection on all state-changing routes
- Structured logging with automatic redaction of emails, tokens, and storage keys
- Least-privilege service accounts; the web app cannot write to the catalog, and the worker cannot read auth data
- Deployment requires a passing security workflow; there is no manual override for a failing scan

---

## 15.8 Incident response

1. **Detect** — alerting on error-rate spikes, auth anomalies, and spend anomalies
2. **Contain** — revoke affected credentials, disable the affected path, and, if user photos are implicated, suspend uploads before anything else
3. **Assess** — determine what data was reachable, using the stage-result audit trail
4. **Notify** — affected users within 72 hours, plainly, including what was and was not exposed
5. **Remediate and publish** — fix, then publish a public post-mortem for anything touching user data

A photo breach is the worst realistic outcome for this product. The retention defaults exist specifically to keep the blast radius of that scenario small: most spaces older than 90 days have no image left to lose.
