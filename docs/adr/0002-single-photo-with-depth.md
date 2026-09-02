# ADR-0002: Single photo plus monocular depth, not photogrammetry

## Status

Accepted

## Context

The product promise is "photograph your space". Every additional capture step reduces the number of people who complete it. But a single ordinary photo carries no metric scale, and the design engine needs metres.

Options range from asking the user to measure everything (accurate, high friction, and it abandons the core promise) to full multi-view reconstruction (accurate, very high friction, heavy compute).

## Decision

One primary photo, optionally supported by additional angles. Scale is recovered from a monocular depth model combined with a calibration reference, in this order of preference:

1. A user-supplied measurement
2. A detected standard object of known size (interior door, roller door, A4 sheet, outlet plate, brick course)
3. EXIF focal length with the depth map
4. None available — ask the user

Where none of the first three produce sufficient confidence, the confidence gate (ADR-0004) asks rather than guesses.

## Alternatives considered

**Manual measurement only.** Accurate and simple, but it discards the product's central idea and its differentiation.

**Multi-view photogrammetry.** Genuinely more accurate, but it requires a guided capture sequence most users will not complete, plus significant compute per plan. Reconsidered for Phase 5 as an optional accuracy upgrade rather than the default path.

**Device AR sensors (LiDAR, ARCore depth).** Excellent where available, but they cover a minority of devices and would fragment the product into two capture paths on day one. A candidate for a later native or progressive enhancement.

**Vision model estimating dimensions unaided.** Rejected: language models estimate absolute size poorly and, worse, do so confidently. The depth model exists precisely to give the estimate a geometric basis and a cross-check.

## Consequences

**What it costs.** Accuracy depends heavily on whether a reference object is in frame, so capture guidance becomes a first-class part of the interface rather than a nicety. Some spaces — long, empty, featureless, or outdoor with no built reference — will reliably fall through to asking the user.

**What it buys.** The capture step stays one photograph. The depth model is self-hosted, so scale estimation adds no per-call cost. Vision and depth provide two independent estimates, and their disagreement is a usable quality signal.

**What would revisit it.** If Phase 1 evaluation misses its accuracy targets, the fallback is photo-assisted manual measurement — the user measures, the photo supplies context, and the engine is unaffected.
