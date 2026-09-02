# ADR-0004: Ask the user rather than guess when confidence is low

## Status

Accepted

## Context

Some photos cannot be measured well. No reference object, poor lighting, an awkward angle, a featureless outdoor area. The pipeline can always produce *a* number — the question is what to do when that number is probably wrong.

Two failure modes are available:

- **Silent guess:** produce a plan anyway. The user gets a complete, confident-looking design built on a dimension that is 40% off. They discover it when the bench does not fit.
- **Ask:** stop, show the estimate, and let the user confirm or correct it. The flow is interrupted; some users abandon.

## Decision

The pipeline suspends at a confidence gate whenever any of the following hold:

- Overall scene confidence is below threshold
- Any primary dimension estimate is below its individual threshold
- Vision and depth estimates disagree beyond tolerance
- No reference object was found and no user measurement was supplied

When it trips, the job pauses in `awaiting_input` and the user is asked one specific, answerable question — "I think this wall is about 3.2 m wide. Is that close?" — never a generic request for more information.

Answering resumes the job from scale calibration. The expensive vision stages are not re-run.

## Alternatives considered

**Always guess, show error bars.** Rejected: error bars do not survive contact with a shopping list. Users read the central estimate and buy against it.

**Always ask for dimensions.** Rejected: it removes the product's core promise for the majority of users whose photos are perfectly measurable.

**Ask after showing the plan.** Rejected: a plan already presented anchors the user, and corrections then feel like the product backtracking rather than checking.

**Silently widen tolerances when confidence is low.** Rejected: it produces an under-utilised design without telling the user why, which is a quieter version of the same dishonesty.

## Consequences

**What it costs.** A measurable fraction of sessions gains an extra step, and some of those users will not return to finish. The pipeline needs suspension, resumption, and partial-invalidation machinery it would not otherwise need.

**What it buys.**

- Plans that are delivered are plans the system can stand behind
- The interaction itself communicates honesty — a product that admits uncertainty is trusted more on the things it does assert
- The gate's trip rate becomes a production quality signal for the vision stage, visible long before user complaints arrive
- Users who correct a dimension supply ground truth the evaluation set can learn from

**What would revisit it.** Sustained accuracy well above target could raise the thresholds so the gate trips less often — but it would not be removed. The asymmetry between "asked an unnecessary question" and "shipped a plan that does not fit" does not change with model quality.
