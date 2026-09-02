# ADR-0007: The 3D viewer ships in v1, rendered client-side from the layout

## Status

Accepted. Supersedes the deferral of 3D visualisation recorded in earlier drafts of [Vision and Scope](../02-vision-and-scope.md) and [Tech Stack](../14-tech-stack.md).

## Context

The original plan treated 3D as a Phase 5 enhancement, on the reasoning that a scaled 2D plan carries nearly all of the decision-relevant information and that a 3D renderer is high effort for low decision value.

That reasoning holds for a reader who already knows what a hydroponic system looks like. It does not hold for Hydroponer's primary user, who by definition does not. "Maya, the apartment beginner" has never seen an NFT channel bank in person. Handing her a top-down plan with labelled rectangles asks her to do a mental reconstruction that is exactly the thing she lacks the experience to do.

Three specific comprehension failures that a 2D plan cannot address:

- **Vertical relationships.** A plan view cannot show that the reservoir sits under the bench, or that a light hangs 450 mm above the canopy.
- **Scale intuition.** "2400 by 600 mm" means little until it is seen next to a room.
- **Assembly understanding.** How parts fit together is the single most common question during a build, and it is inherently spatial.

The cost objection was also weaker than assumed. Because the engine already emits exact component positions, sizes, and rotations, the scene is a projection of existing data rather than new work. There is no modelling step, no per-plan asset generation, and no server-side rendering cost.

## Decision

An interactive 3D viewer ships as part of the v1 plan page.

- The scene is **derived deterministically from the engine's layout**, not authored and not AI-generated
- Geometry comes from a small **parametric, low-poly part library** keyed to catalog items
- Rendering is **client-side WebGL** (Three.js with React Three Fiber); the server sends a compact JSON scene description
- The viewer supports orbit, momentum spin, zoom, pan, component focus, layer isolation, exploded view, build playback, and growth preview
- The **2D plan remains canonical** — it prints, it is what a builder holds, and it is what a screen reader reads
- The viewer is **progressive enhancement**: no WebGL means the 2D plan, with an explanation

Full specification in [3D Visualisation](../20-3d-visualization.md).

## Alternatives considered

**Keep 3D in Phase 5.** Rejected: it defers the feature that most helps the user who most needs help, and the effort estimate that justified deferring it was wrong once the scene was recognised as derived rather than authored.

**Server-side rendered turntable images.** A pre-rendered sequence of stills the user can scrub through. Cheaper on the client and works without WebGL — but it is not zoomable, not inspectable, cannot isolate layers, and every plan version would need re-rendering and storing. Kept only as the PDF and social-preview path, where a single isometric still is sufficient.

**AI-generated 3D geometry or renders.** Rejected outright under [ADR-0001](0001-deterministic-engine.md). A generated mesh in the wrong place is a dimensional lie told visually, and it would be harder to detect than a wrong number because it looks plausible.

**A full 3D editor.** Rejected: it reopens the "not a CAD tool" non-goal. Layout changes go through the engine's constrained adjustment flow; the viewer re-renders from the result.

**Photorealistic rendering.** Rejected: comprehension is the goal, and realism costs frame budget on the phones that need the help most.

## Consequences

**What it costs.**

- A part library must be modelled and maintained alongside the catalog; a new catalog item needs a `model_ref` or it falls back to a labelled box
- The client bundle grows; the viewer is code-split and loaded on demand, and the 2D plan must remain fast without it
- A performance budget now exists as a CI gate, because a viewer that stutters on a mid-range phone is worse than no viewer
- Accessibility work is non-trivial: a canvas is opaque to assistive technology, so the structured component list becomes a first-class parallel surface rather than a fallback
- Visual regression testing joins the test suite

**What it buys.**

- The user understands what they are about to build before they spend money
- Vertical relationships, clearances, and mature plant height become visible, which surfaces layout problems the user can catch and correct
- Build playback ties the tutorial to the object it describes
- The BOM, the tutorial, and the geometry cross-link: tap a bench, see its cost and its steps
- It costs nothing per plan — no model calls, no server rendering, no stored assets

**What would revisit it.** Sustained evidence that the viewer is unused, or that its performance budget cannot be met on the target device class. In that case it degrades to the turntable-still approach rather than disappearing, because the comprehension problem it solves does not go away.
