# 16. Testing and Evaluation

Two different problems live under one heading. The deterministic parts of Hydroponer are *tested*: given an input, assert an output. The model-dependent parts cannot be, because their outputs vary — they are *evaluated*, statistically, against a graded set.

Confusing the two is how AI products end up with green test suites and unhappy users.

---

## 16.1 The testing pyramid

| Layer | Scope | Tool | Runs |
|---|---|---|---|
| Unit | Engine functions: scoring, packing, BOM expansion, pump sizing, cost arithmetic | Vitest | Every commit |
| Property | Invariants across generated inputs | fast-check | Every commit |
| Golden | Full engine runs against fixture scenes, snapshotted | Vitest | Every commit |
| Integration | API routes plus database plus queue, with models stubbed | Vitest and Testcontainers | Every commit |
| End-to-end | Real browser through the whole flow, models in fixture mode | Playwright | Every pull request |
| Visual and performance | Rendered stills of golden-set scenes; frame time on a mid-range device profile | Playwright + a rendering budget gate | Every pull request |
| Evaluation | Model stages against a graded set, live models | Custom harness | Nightly, and before every model or prompt change |
| Field | Real people building real systems | Manual | Continuously, per release cycle |

---

## 16.2 Engine unit and property tests

The engine is pure, so it is cheap to test exhaustively. Property tests carry most of the weight, because the interesting failures are the ones nobody thought to write a case for.

Invariants asserted across thousands of generated spaces:

```
For any valid scene input, the produced layout must satisfy:

  no component overlaps another
  no component crosses the usable-area boundary
  every serviceable component is reachable by a walkway >= 700 mm
  no electrical component sits below a water-carrying component
  total filled mass never exceeds the placement surface's threshold
  reservoir elevation is below every gravity-return point
  selected pump flow >= required flow at computed total head
  every plant site receives >= the crop's minimum DLI
  BOM quantities are >= the quantities the layout consumes
  cost_low <= cost_typical <= cost_high, for every tier
  every PlacedComponent yields exactly one 3D scene node, at the same coordinates
  every physical BOM line appears in at least one scene node
  no two scene node bounding boxes intersect
  the same input produces a byte-identical output, scene description included
```

Any generated input that violates one is minimised by the property runner and committed as a permanent regression fixture. Over time the fixture set becomes the engine's real specification.

**Determinism** gets its own test: every fixture is run twice in the same process and once in a fresh one, and the outputs must be identical. Non-determinism in the engine would break caching, break versioning, and break the user's trust when a reloaded plan differs from the one they read yesterday.

---

## 16.3 The golden set

Fifty photographed spaces with **ground truth measured by hand**: real dimensions, real window areas, real outlet positions, real obstructions.

Composition is deliberate, not convenient:

| Category | Count | Why |
|---|---|---|
| Indoor rooms | 10 | The common case |
| Garages | 8 | The archetypal Hydroponer space |
| Balconies | 8 | Small, constrained, high-value |
| Basements | 5 | No natural light at all |
| Greenhouses | 5 | Abundant light, different constraints |
| Open ground | 6 | No walls to measure against |
| Deliberately hard | 8 | Poor lighting, no reference object, cluttered, extreme aspect ratios, mirrors, glass |

The "deliberately hard" group is the most valuable. A model that scores well only on clean photos will disappoint in the field, because users do not take clean photos.

Each entry stores: the image, the measured ground truth, the expected system ranking as judged by a hydroponics-competent reviewer, and a note on what makes it difficult.

---

## 16.4 Evaluating scene analysis

Run nightly and before any change to the vision model or its prompt.

| Metric | Definition | Target |
|---|---|---|
| Dimension error | Mean absolute percentage error against measured truth | under 15% |
| Dimension error, hard subset | Same, on the difficult group | under 25% |
| Confidence calibration | Correlation between reported confidence and actual error | above 0.6 |
| Overconfidence rate | Fraction of estimates with confidence above 0.8 and error above 25% | under 5% |
| Utility detection | Precision and recall for outlets, taps, drains | recall above 0.85 |
| Obstruction detection | Recall for obstructions that materially affect layout | above 0.90 |
| Rejection accuracy | Correct rejection of non-space photos | above 0.95 |
| Schema validity | First-attempt valid structured output | above 0.98 |

**Overconfidence is the metric that matters most.** A wrong estimate that is honestly flagged as uncertain trips the confidence gate and the user corrects it — the system degrades gracefully. A wrong estimate delivered with high confidence produces a plan that does not fit. The two failures are not equally bad, and the metrics say so.

---

## 16.5 Evaluating narration

Narration correctness is largely mechanical, and mechanical checks run on every generated plan in production, not only in evaluation:

| Check | Method | Threshold |
|---|---|---|
| No invented numbers | Every numeric token in the prose must appear in the engine payload | 100%; a failure fails the stage |
| No invented components | Every component named must exist in the BOM | 100% |
| Safety templates present | Every engine-raised flag produced its template text verbatim | 100% |
| Step coverage | Every BOM line is consumed by at least one tutorial step | 100% |
| Reading level | Automated readability score against the user's skill band | Within band |
| Instruction clarity | Sampled human review | Rated 4 of 5 or better |

The first four are hard gates. The last two are quality signals reviewed in aggregate.

---

## 16.6 Evaluating the engine's judgement

The engine is deterministic, so it cannot be "wrong" in the way a model can — but its *opinions* can be wrong. Was DWC really the right call for that garage?

This is evaluated by expert review: a hydroponics-competent reviewer grades the top recommendation for each golden-set space on a 1–5 scale, blind to what the engine chose.

| Metric | Target |
|---|---|
| Top recommendation rated 4 or better | above 85% |
| Top recommendation rated 2 or worse | under 5% |
| Reviewer agrees with at least one of the top three | above 95% |

When the reviewer disagrees, the disagreement is traced to a specific weight, threshold, or catalog value — and fixed there, in data, rather than by special-casing the code. That traceability is exactly what the deterministic engine buys.

---

## 16.7 Field validation

The only measurement that fully counts.

Ten test builders, each given a generated plan for their own space, each building it, each recording:

- Did it physically fit? (goal **G2**)
- Did it work? (goal **G1**)
- What did it actually cost, with receipts? (goal **G3**)
- Where did the tutorial fail them — ambiguous steps, missing parts, wrong quantities, wrong order?
- What did they have to figure out on their own?

Every discrepancy becomes either a catalog fix, an engine fix, or a golden-set entry. A missing part in a BOM is a bug of the highest severity in this product, because it strands a person mid-build.

Cost accuracy is then tracked continuously in production through the `actual_cost` feedback field, per region, so that systematic bias in a regional multiplier surfaces as a trend rather than as an anecdote.

---

## 16.8 Regression policy for prompts and models

No prompt change and no model change merges without an evaluation run.

```
1. Change the prompt or the model identifier
2. Run the full evaluation suite against the golden set
3. Compare against the current production baseline
4. Any primary metric regressing beyond its tolerance blocks the merge
5. Results are attached to the pull request as a rendered report
```

Model upgrades follow the same path as prompt changes, and both are staged: the new configuration serves a small percentage of production traffic while its live metrics are compared against the baseline before it becomes the default.

---

## 16.9 Production monitoring

Evaluation is periodic; production quality is continuous.

| Signal | Alert on |
|---|---|
| Confidence gate trip rate | A sustained rise suggests the vision stage has degraded |
| Schema validation failure rate | Any rise; this is the earliest indicator of a model behaviour change |
| Narration validation failure rate | Any rise |
| Stage latency, p50 and p95 | Regression against the baseline |
| Cost per plan | Deviation from the target unit economics |
| Adjustment rate per plan | A rise suggests first recommendations are getting worse |
| User feedback rating | A weekly trend, not a single score |
| `actual_cost` versus quoted range | A drift in the proportion falling inside the range |

The adjustment rate is the most useful product signal in that list. Users adjust a plan when the first answer was not right for them, and they do it long before they think to leave feedback.
