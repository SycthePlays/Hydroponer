# 12. API Reference

Base path: `/api`. JSON in, JSON out. All timestamps ISO 8601 UTC. All physical quantities in SI base units, suffixed in the field name.

Authentication is a bearer session token for signed-in users. Anonymous users carry an `X-Anon-Session` header issued on first visit; it scopes access to spaces created in that session and is exchanged for an account on signup.

---

## 12.1 Conventions

**Errors** use a consistent envelope:

```json
{
  "error": {
    "code": "IMAGE_NOT_A_SPACE",
    "message": "This doesn't look like a space I can plan for.",
    "detail": { "stage": "analyze_scene" },
    "retryable": false
  }
}
```

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_FAILED` | 400 | Request body failed schema validation; `detail.issues` lists the fields |
| `UNAUTHORIZED` | 401 | Missing or invalid session |
| `FORBIDDEN` | 403 | Valid session, not the owner of the resource |
| `NOT_FOUND` | 404 | Unknown id, or a resource the caller may not see |
| `IMAGE_TOO_LARGE` | 413 | Over the per-file limit |
| `UNSUPPORTED_MEDIA` | 415 | Not JPEG, PNG, WebP, or HEIC |
| `RATE_LIMITED` | 429 | `Retry-After` header is set |
| `IMAGE_NOT_A_SPACE` | 422 | Scene analysis rejected the photo |
| `IMAGE_QUALITY_LOW` | 422 | Too dark or too blurred to analyse; `detail.reason` says which |
| `NO_VALID_LAYOUT` | 422 | No system could be laid out; `detail.blockers` explains why |
| `JOB_FAILED` | 500 | Pipeline failure; `detail.stage` names the failing stage |
| `PROVIDER_UNAVAILABLE` | 503 | Upstream model provider down; retryable |

**Idempotency.** `POST /api/spaces/:id/generate` accepts an `Idempotency-Key` header. Repeating a key returns the original job rather than starting a second one.

**Rate limits.** Anonymous: 3 generations per IP per day. Free account: 10 per day. Limits are returned in `X-RateLimit-Remaining` and `X-RateLimit-Reset`.

---

## 12.2 Spaces

### `POST /api/spaces`

Create a space and obtain signed upload URLs.

**Request**

```json
{
  "name": "Garage",
  "intake": {
    "grow_goal": "mixed",
    "budget": { "amount": 600, "currency": "USD" },
    "skill": "basic_tools",
    "country_code": "MY"
  },
  "images": [
    { "role": "primary", "content_type": "image/jpeg", "size_bytes": 3840219 }
  ]
}
```

**Response `201`**

```json
{
  "space_id": "5c1f...",
  "uploads": [
    {
      "image_id": "a91b...",
      "role": "primary",
      "upload_url": "https://storage.example/...",
      "expires_at": "2026-09-02T10:14:00Z"
    }
  ]
}
```

Upload URLs are short-lived, single-use, and restricted by content type and size. The client `PUT`s bytes directly to storage.

### `GET /api/spaces/:id`

Returns the space, its images (as signed read URLs), its intake, and its plan if one exists.

### `PATCH /api/spaces/:id`

Updates `name` or `intake`. Changing `intake` does not regenerate anything on its own; the client must call `generate` again.

### `DELETE /api/spaces/:id`

Soft-deletes the space and schedules its images for purge. Returns `204`.

---

## 12.3 Generation

### `POST /api/spaces/:id/generate`

Starts the pipeline.

**Request** (all fields optional)

```json
{
  "force": false,
  "known_dimensions": { "width_mm": 5800, "depth_mm": 3100 },
  "prefer_system": null
}
```

`known_dimensions` skips vision-based scale calibration entirely and is the escape hatch for users who would rather measure than be measured for. `prefer_system` overrides selection but does not override hard constraints — an impossible preference is rejected with `NO_VALID_LAYOUT` and an explanation.

**Response `202`**

```json
{
  "job_id": "7d3e...",
  "status": "queued",
  "estimated_seconds": 60
}
```

### `GET /api/jobs/:id`

```json
{
  "job_id": "7d3e...",
  "status": "running",
  "current_stage": "solve_layout",
  "stages": [
    { "stage": "preprocess",     "status": "done",    "finding": null },
    { "stage": "analyze_scene",  "status": "done",    "finding": "Garage, concrete floor, one window" },
    { "stage": "calibrate_scale","status": "done",    "finding": "About 5.8 m by 3.1 m" },
    { "stage": "select_system",  "status": "done",    "finding": "Deep water culture" },
    { "stage": "solve_layout",   "status": "running", "finding": null }
  ],
  "queued_at": "2026-09-02T09:58:11Z",
  "started_at": "2026-09-02T09:58:13Z"
}
```

### `GET /api/jobs/:id/stream`

Server-Sent Events. Event types: `stage`, `question`, `complete`, `error`.

```
event: stage
data: {"stage":"solve_layout","status":"done","finding":"2 benches, 96 plant sites"}

event: complete
data: {"plan_id":"b22a...","version":1}
```

### `POST /api/jobs/:id/answer`

Resumes a job suspended at the confidence gate.

**Request**

```json
{
  "question_id": "dim_width",
  "answer": { "width_mm": 5600 }
}
```

Resumes from `calibrate_scale`. The expensive vision stages are not re-run.

### `POST /api/jobs/:id/cancel`

Cancels a queued or running job. Returns `204`.

---

## 12.4 Plans

### `GET /api/plans/:id`

Returns the current version in full.

```json
{
  "plan_id": "b22a...",
  "version": 3,
  "space": { "id": "5c1f...", "name": "Garage" },
  "scene": {
    "space_type": "garage",
    "dimensions_mm": { "width": 5800, "depth": 3100, "height": 2600 },
    "light": { "estimated_dli_band": "very_low", "windows": 1 },
    "utilities": { "power_outlets_visible": 2, "water_source_type": "sink" },
    "confidence": 0.84
  },
  "system": {
    "selected": "dwc",
    "reasons": [
      "High ambient temperature favours a large-volume reservoir over a shallow film.",
      "A utility sink provides fill and drain access."
    ],
    "alternatives": [
      { "system": "vertical_tower", "score": 71, "note": "More plant sites, higher cost per site." },
      { "system": "nft", "eliminated": true, "reason": "Marginal on thermal grounds in this climate." }
    ]
  },
  "layout": {
    "usable_area_m2": 8.7,
    "total_plant_sites": 96,
    "total_filled_mass_kg": 412,
    "components": [],
    "warnings": [
      { "kind": "structural", "message": "Each filled bench weighs about 190 kg. Place on the floor." }
    ],
    "svg_url": "https://storage.example/...",
    "scene_url": "/api/plans/b22a.../scene",
    "isometric_still_url": "https://storage.example/..."
  },
  "cost": {
    "currency": "MYR",
    "build": {
      "budget":  { "low": 1450, "high": 1900 },
      "typical": { "low": 2350, "high": 2950 },
      "premium": { "low": 3800, "high": 4700 }
    },
    "running_monthly": {
      "total": 95,
      "breakdown": { "electricity": 62, "nutrients": 18, "media": 9, "seeds": 6 }
    },
    "price_surveyed_at": "2026-07-01"
  },
  "grow_plan": {},
  "narration": {},
  "created_at": "2026-09-02T09:59:42Z"
}
```

### `GET /api/plans/:id/versions`

Lists versions with `change_summary` and creation time.

### `GET /api/plans/:id/versions/:version`

A specific version, same shape as above.

### `POST /api/plans/:id/adjust`

Creates a new version from an adjustment.

**Request**

```json
{
  "from_version": 2,
  "change": {
    "kind": "system",
    "value": "nft"
  }
}
```

`kind` is one of `budget`, `system`, `crops`, `usable_area`, `dimensions`, `scale`. The response is a `202` with a job id — adjustments re-run only the stages their change invalidates, so most complete in a few seconds.

### `GET /api/plans/:id/scene`

The 3D scene description for the current version. Deterministic for a given layout, immutable per plan version, and heavily cacheable (`ETag`, long `max-age`).

```json
{
  "version": "1.0",
  "units": "mm",
  "room": {
    "bounds_mm": { "w": 5800, "d": 3100, "h": 2600 },
    "floor_material": "concrete",
    "wall_materials": ["brick", "brick", "brick", "metal"],
    "openings": [
      { "kind": "window", "wall": "west", "position_mm": [400, 0, 1800], "size_mm": [900, 0, 600] },
      { "kind": "door", "wall": "south", "position_mm": [1700, 0, 0], "size_mm": [2400, 0, 2100] }
    ],
    "sun_direction": [-0.42, 0.78, 0.46]
  },
  "nodes": [
    {
      "id": "bench_a",
      "model_ref": "dwc_bench_2400x600",
      "bom_line_ids": ["bl_014", "bl_015"],
      "tutorial_step_ids": ["ts_p1_03", "ts_p1_04"],
      "transform": {
        "position_mm": [300, 700, 0],
        "rotation_deg": [0, 0, 0],
        "scale": [1, 1, 1]
      },
      "size_mm": { "w": 2400, "d": 600, "h": 800 },
      "layer": "structure",
      "label": "DWC bench A"
    }
  ],
  "annotations": [
    { "node_id": "bench_a", "kind": "structural", "text": "Filled, about 190 kg. Floor placement only." }
  ],
  "phases": [{ "phase": 1, "node_ids": ["bench_a"] }],
  "cameras": [{ "name": "doorway", "position_mm": [2900, -1200, 1600], "target_mm": [2900, 1550, 800] }]
}
```

Query parameter `detail=full|reduced` (default `full`). `reduced` groups repeated plant and net-pot instances for low-end devices; the client requests it after measuring its own frame budget.

Nothing here is model-generated. Every node projects from a `PlacedComponent` in the layout, and every `bom_line_ids` entry resolves to a real BOM line — the invariants are tested, see [3D Visualisation §20.8](20-3d-visualization.md#208-testing).

### `GET /api/reference/models`

The glTF part library manifest: asset ids, URLs, sizes, and the catalog item ids each one serves. Static, CDN-cached, versioned with the catalog. Clients preload it while the plan page streams.

### `GET /api/plans/:id/bom`

Query parameters: `tier` (`budget` | `typical` | `premium`, default `typical`), `format` (`json` | `csv` | `text`).

### `GET /api/plans/:id/tutorial`

Returns phases and steps. Query parameter `format=json|pdf`.

### `POST /api/plans/:id/progress`

```json
{ "step_id": "9f21...", "completed": true }
```

### `POST /api/plans/:id/share`

```json
{ "enabled": true, "include_photo": false }
```

**Response**

```json
{ "share_url": "https://hydroponer.app/p/quiet-garden-4821", "include_photo": false }
```

### `GET /api/public/plans/:slug`

Unauthenticated read of a shared plan. Returns the same shape as `GET /api/plans/:id` minus the space photo (unless the owner opted in), the original intake budget, and any account information.

---

## 12.5 Feedback

### `POST /api/plans/:id/feedback`

```json
{
  "kind": "cost",
  "rating": 4,
  "comment": "Pump was cheaper locally than quoted.",
  "actual_cost": 2180,
  "actual_currency": "MYR"
}
```

`actual_cost` feeds the cost-accuracy measurement described in [Cost Estimation §9.5](09-cost-estimation.md#95-accuracy-and-honesty). It is the highest-value field in the API for product quality, and the UI asks for it explicitly once a build is marked complete.

---

## 12.6 Reference data

### `GET /api/reference/systems`

The six system types with their descriptions, requirements, and illustrations. Static, heavily cached.

### `GET /api/reference/crops`

Query parameters: `system`, `dli_max`, `difficulty`. Used by the crop-adjustment UI.

### `GET /api/reference/regions/:country_code`

Currency, unit system default, electricity tariff, and price survey date for a country.

---

## 12.7 Webhooks (Phase 3)

For future integrations, plan completion may be delivered to a registered endpoint:

```json
{
  "event": "plan.completed",
  "plan_id": "b22a...",
  "version": 1,
  "occurred_at": "2026-09-02T09:59:42Z"
}
```

Signed with an HMAC in the `X-Hydroponer-Signature` header. Not implemented in v1.
