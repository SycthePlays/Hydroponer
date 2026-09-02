# 8. Layout Generation

The design engine is the heart of Hydroponer. It takes a described space and a set of goals and produces a specific, physical arrangement of components. It is pure code — no model calls, no network, no randomness that is not seeded.

Its stages: **usable area extraction → system scoring → module instantiation → placement solving → validation.**

---

## 8.1 Usable area extraction

The space arrives as dimensions plus a list of obstructions with normalised bounding boxes. This stage converts that into a polygon of floor the design may occupy.

Subtracted from the raw footprint:

| Deduction | Rule |
|---|---|
| Immovable obstructions | Removed entirely, plus a 100 mm margin |
| Movable obstructions | Removed, but recorded as reclaimable and reported to the user: "moving the workbench would gain 1.8 m²" |
| Door swings | A quarter-circle of the door's width, from every hinged door |
| Circulation | A walkway of at least 700 mm from the entrance to every serviceable component |
| Wall clearance | 50 mm behind any component, for airflow and to avoid damp |
| Utility access | 600 mm clear in front of every outlet, tap, drain, and consumer unit |
| Heat sources | 500 mm exclusion around boilers, heaters, and vehicle exhaust paths |

The result is a polygon (often non-rectangular) plus a set of anchor points: where the water is, where the power is, where the drain is, where the door is, and where the light comes from.

Those anchors matter more than the polygon. A layout that fits perfectly but puts the reservoir 6 m from the tap is a bad layout.

---

## 8.2 System scoring

Every system type is evaluated against the space and the intake.

### Hard elimination

Each system's hard requirements (see [Domain Model §7.2](07-domain-model.md#72-the-selection-matrix)) are checked. A failure eliminates the system and records a reason:

```ts
{ system: 'nft', eliminated: true,
  reason: 'No power outlet was visible in the space, and NFT requires a continuously running pump.' }
```

These reasons are surfaced to the user verbatim, in the "other options" section. Being told why something was ruled out is what makes the recommendation credible.

### Soft scoring

Survivors are scored 0–100 on seven weighted factors:

| Factor | What it measures |
|---|---|
| `area_efficiency` | Plant sites achievable per square metre of usable area |
| `budget_fit` | How the estimated build cost sits against the stated budget |
| `skill_fit` | Build complexity against the user's stated comfort |
| `crop_fit` | How well the system suits what the user said they want to grow |
| `climate_fit` | Thermal and humidity suitability for the region |
| `maintenance` | Ongoing time burden, inverted |
| `failure_tolerance` | How long the crop survives a pump or power failure |

Weights are profile-dependent:

```ts
const WEIGHTS = {
  beginner:      { failure_tolerance: 0.25, skill_fit: 0.25, budget_fit: 0.20,
                   crop_fit: 0.15, maintenance: 0.10, climate_fit: 0.05, area_efficiency: 0.00 },
  intermediate:  { crop_fit: 0.22, area_efficiency: 0.20, budget_fit: 0.18,
                   climate_fit: 0.15, failure_tolerance: 0.10, skill_fit: 0.08, maintenance: 0.07 },
  space_limited: { area_efficiency: 0.35, crop_fit: 0.20, budget_fit: 0.15,
                   skill_fit: 0.12, failure_tolerance: 0.10, climate_fit: 0.05, maintenance: 0.03 },
}
```

The weight table is data, versioned with the catalog. It is the product's opinion, made explicit and reviewable, rather than buried in conditionals.

Every factor score carries a generated reason string. The set of reasons for the winning system becomes the input to the narration stage — which is how the explanation shown to the user is guaranteed to describe what the engine actually did.

---

## 8.3 Module instantiation

The winning system type is expanded into concrete modules sized for the space.

Each system has a module template:

```ts
type ModuleTemplate = {
  id: string
  system: SystemType
  footprint_mm: { w: number; d: number; h: number }   // base unit
  scalable_axis: 'w' | 'd' | 'none'
  scale_increment_mm: number
  plant_sites_per_unit: number
  filled_mass_kg_per_unit: number
  requires: ModuleRequirement[]      // reservoir, pump, lighting, aeration
  clearances_mm: { front: number; back: number; sides: number; top: number }
}
```

For example, an NFT channel bank scales along its length in 1000 mm increments, yields plant sites at the crop's spacing, requires a reservoir below the low end, a pump sized to the run, and 400 mm of front clearance for harvesting.

The engine determines how many modules to instantiate by working outward from three limits and taking the minimum: the usable area, the budget, and the light footprint that can be affordably supplied.

Budget is a real constraint here, not a post-hoc filter. A design that fills the space and costs three times the stated budget is a failed design, so the module count is reduced until the estimated cost lands inside the band.

---

## 8.4 Placement solving

A constrained 2D placement problem, solved deterministically.

**Objective function** (weighted, in priority order):

1. Maximise plant sites
2. Minimise plumbing run length (reservoir to pump to modules to return)
3. Minimise electrical run length (outlet to pump and lights)
4. Maximise proximity of grow modules to natural light, where natural light is meaningful
5. Maximise contiguous free floor (users value the space still feeling usable)

**Hard constraints** — a solution violating any one is discarded, never scored:

- No component overlaps another, or the usable-area boundary
- Every serviceable component reachable by a walkway of at least 700 mm
- Every clearance in the module template respected
- Reservoir positioned below the return point of any gravity-return system
- NFT channels oriented so the slope runs toward the reservoir
- Total pump head within the selected pump's curve
- Lighting mounted at the fixture's specified height above the canopy, with coverage overlap so no plant site falls below the DLI floor
- Every structural rule from [Domain Model §7.7](07-domain-model.md#77-structural-model)
- No electrical component directly below any water-carrying component
- Drip loops present wherever a cable runs toward an outlet near water

**Algorithm.** Rectangular module footprints against a mostly-rectilinear polygon make this a bounded packing problem. The approach:

1. Decompose the usable polygon into maximal rectangles
2. Enumerate candidate orientations (modules along the long wall, along the short wall, in a double bank with a central aisle, perimeter arrangement)
3. For each candidate, greedily place modules by descending size, then place support components (reservoir, pump, lighting) against their anchor requirements
4. Score each complete candidate against the objective
5. Return the best, plus up to two meaningfully different alternatives

Typical spaces yield fewer than a few hundred candidates, which evaluates in milliseconds. There is no need for a general-purpose solver, and avoiding one keeps the engine dependency-free and its behaviour inspectable.

**Determinism.** Candidate generation is ordered, ties break on a fixed rule, and no randomness is used. The same input always produces the same layout — a requirement for caching, for regression tests, and for the user's trust when they reload their plan.

---

## 8.5 Output

```ts
type Layout = {
  usable_area_m2: number
  bounds_mm: { w: number; d: number; h: number }
  components: PlacedComponent[]
  walkways: Polygon[]
  plumbing_runs: Run[]        // ordered points, computed length, pipe diameter
  electrical_runs: Run[]
  total_plant_sites: number
  total_filled_mass_kg: number
  warnings: Warning[]         // structural, electrical, environmental
  alternatives: Layout[]      // up to two
  score_breakdown: Record<string, number>
}

type PlacedComponent = {
  id: string
  catalog_ref: string
  label: string               // "NFT channel bank A"
  position_mm: { x: number; y: number; z: number }
  size_mm: { w: number; d: number; h: number }
  rotation_deg: 0 | 90 | 180 | 270
  filled_mass_kg: number
  plant_sites: number
  connects_to: string[]       // ids of hydraulically or electrically linked components
}
```

This structure feeds four consumers: the BOM expander, the SVG renderer for the 2D plan view, the 3D scene builder, and the tutorial generator, which uses `connects_to` to derive assembly order.

The 3D view is not a separate design. It is the same `PlacedComponent[]` projected into a scene graph, which is why the two drawings can never disagree — there is one layout and several renderings of it.

---

## 8.6 Safety constraints

Restating them here because they are the constraints that must never be relaxed for a better score:

| Constraint | Enforcement |
|---|---|
| No electrical component beneath a water-carrying component | Hard placement rule |
| RCD/GFCI protection specified wherever pumps and water coexist | Mandatory BOM line |
| Drip loop on every cable near water | Mandatory tutorial step |
| Filled mass thresholds | Hard placement rule; elevation removed from the solution space above threshold |
| Walkway width at least 700 mm, egress never blocked | Hard placement rule |
| Food-grade materials only in contact with solution | Enforced in the catalog, so a non-compliant part cannot enter a BOM |
| Backflow prevention on any potable connection | Mandatory BOM line when a mains water connection is planned |
| No fixed wiring in any generated plan | Systems requiring it are eliminated with an explanation |

If no layout satisfies every hard constraint, the engine does not relax them. It returns "no valid layout" for that system and moves to the next-ranked one. If every system fails, the user is told plainly what blocked each one and what would change the outcome — usually more space, power, or budget.

---

## 8.7 Rendering

### 2D plan

The layout renders to SVG server-side: a scaled top-down plan with dimensioned components, labelled walkways, plumbing and electrical runs on toggleable layers, and a north arrow where orientation is known.

An elevation view is generated for vertical systems, where the useful information is height, not footprint.

The 2D plan is the canonical drawing. It is what prints, what a builder holds on site, and what a screen reader reads.

### 3D scene

The same layout is also projected into a scene description that the browser renders as an interactive 3D view — the user can orbit, spin, zoom, isolate layers, explode the assembly, and watch it build phase by phase.

The projection is mechanical: `bounds_mm` and surfaces become the room shell, each `PlacedComponent` becomes a node placed at its exact coordinates and scaled to its real dimensions, `plumbing_runs` and `electrical_runs` become swept tubes and cable curves, plant sites become instanced meshes at the crop's spacing and mature height, and `warnings` become anchored annotations.

No geometry is authored per plan and none is generated by a model. Full specification in [3D Visualisation](20-3d-visualization.md); the decision to ship it in v1 is [ADR-0007](adr/0007-3d-viewer-in-v1.md).

Accessibility: the SVG carries a structured text description enumerating every component with position and size, so a screen reader user receives the same information as a sighted one. Component types are distinguished by label and hatch pattern, never by colour alone.
