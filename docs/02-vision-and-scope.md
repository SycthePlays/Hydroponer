# 2. Vision and Scope

## Vision statement

> Anyone with a camera and a spare corner should be able to go from "I wonder if I could grow food here" to a concrete, costed, buildable plan in under five minutes.

## Product goals

| # | Goal | How it is measured |
|---|---|---|
| G1 | A plan is buildable without further research | A test builder can complete the build using only the generated tutorial and BOM |
| G2 | Layouts physically fit the space | Solver never emits a layout exceeding measured bounds or violating clearance rules |
| G3 | Cost estimates are honest | Actual receipts from test builds fall inside the quoted low–high range ≥85% of the time |
| G4 | The system says "I don't know" when it should | Low-confidence dimension estimates trigger a manual-measurement prompt rather than a silent guess |
| G5 | Time to plan is short | p95 end-to-end generation under 90 seconds |
| G6 | Beginners are not overwhelmed | Default output is one recommended design, with alternatives available but not forced |
| G7 | A beginner can picture what they will build | The design is inspectable in 3D from any angle before any part is bought |

## Non-goals

Stating these explicitly prevents scope creep, which is the main risk to a project of this shape.

- **Not a shop.** Hydroponer does not sell, stock, or fulfil components. It may link out to suppliers; it never takes an order.
- **Not a grow controller.** No IoT integration, no sensor telemetry, no pump automation in v1. The output is a plan, not a running system.
- **Not a general plant doctor.** No pest identification, no disease diagnosis from leaf photos.
- **Not soil gardening.** Aquaponics and aeroponics are stretch goals; conventional soil beds are out of scope entirely.
- **Not a CAD tool.** The user cannot freely draw or model. They may adjust a generated layout within constraints and inspect the result in 3D; they cannot author geometry from nothing or move parts by hand.
- **Not structural engineering.** The system will flag when a design implies significant load and will refuse to certify it.

## Target users

### Primary: "Maya", the apartment beginner
Rents a flat with a 2 m × 1.2 m balcony. Wants herbs and salad leaves. Budget around $200. Has never built anything more complex than flat-pack furniture. Needs a design that is small, low-risk, forgiving of mistakes, and does not require drilling into a landlord's walls.

**What she needs from Hydroponer:** confidence that it will fit, a short parts list she can buy in one trip, and a tutorial that assumes nothing.

### Secondary: "Dan", the garage tinkerer
Owns a house, has a 6 m × 3 m garage with power and a utility sink. Wants to grow enough lettuce and tomatoes to matter. Budget $800–1500. Comfortable with tools, will happily cut PVC and wire a timer.

**What he needs:** an efficient use of the full space, a system that scales, and real numbers on running cost including electricity.

### Tertiary: "The Riverside School"
Has an unused 15 m × 8 m field area and a small grant. Wants a teaching installation. Decisions are made by a committee that needs a costed proposal document.

**What they need:** a larger-scale plan, a clear cost breakdown suitable for a budget submission, and an exportable PDF.

## In scope for v1

- Single-photo upload (JPEG/PNG/HEIC), plus optional additional angles
- Indoor spaces: rooms, garages, basements, spare corners, balconies
- Outdoor spaces: yards, open field areas, polytunnels, rooftops
- Six system types: Kratky, deep water culture, nutrient film technique, ebb and flow, drip, vertical tower
- Scale calibration via reference object, EXIF metadata, or manual entry
- Interactive 3D view of the design: orbit, spin, zoom, layer isolation, exploded view, build playback (see [3D Visualisation](20-3d-visualization.md))
- Bill of materials with quantities and specifications
- Three-point cost estimate in the user's currency
- Step-by-step build tutorial with tools and time estimates
- Crop recommendation and nutrient schedule for the chosen system
- Shareable plan link and PDF export
- Account-free trial, accounts for saving plans

## Explicitly deferred

| Feature | Deferred to | Reason |
|---|---|---|
| Photorealistic / first-person walkthrough rendering | Phase 5 | The v1 3D viewer targets comprehension, not realism; a walkthrough camera costs frame budget on the phones that need the help most. See [ADR-0007](adr/0007-3d-viewer-in-v1.md). |
| Video upload / multi-frame reconstruction | Phase 4 | Photogrammetry complexity; single-photo depth is sufficient for v1 accuracy targets |
| Live supplier price scraping | Phase 3 | Legal and reliability burden; curated catalog first |
| Aquaponics | Phase 5 | Adds livestock welfare, biofiltration, and regulatory concerns |
| Automated ordering / affiliate cart | Post-v1 | Business model decision not yet made |
| Native mobile app | Post-v1 | Responsive web with camera capture covers the need |

## Success criteria

Hydroponer v1 is successful if:

1. Ten independent test users each build the generated design and report that it fit and functioned
2. Median actual build cost lands within the quoted range
3. A user with no hydroponic knowledge can explain, after reading their plan, why their system type was chosen
4. A user who has never seen a hydroponic system can describe, after using the 3D view, what they are about to build and how the parts fit together
5. Generation cost per plan stays under the target unit economics ceiling (see [Deployment and Operations](17-deployment-operations.md#cost-control))

## Safety and liability

Hydroponer touches water, electricity, and sometimes structural loading. The product takes the following firm positions:

- **Electrical work.** Plans specify plug-in appliances only. Any design implying new fixed wiring is flagged: *"This requires a qualified electrician."* The tutorial always specifies RCD/GFCI protection where pumps and water coexist.
- **Structural loading.** Water is heavy — roughly 1 kg per litre. Any design placing more than a defined load threshold on a shelf, wall mount, balcony, or upper floor emits a structural warning with the calculated load, and instructs the user to have it verified.
- **Potable water.** Any plumbing that connects to a drinking-water supply must include backflow prevention; this is stated as mandatory, not optional.
- **Food safety.** Only food-grade materials appear in bills of materials for anything contacting nutrient solution. Non-food-grade PVC, galvanised fittings in contact with solution, and reused chemical containers are excluded from the catalog by policy.
- **Nutrient chemicals.** Handling guidance and PPE are included in tutorials. Concentrate mixing order (always acid to water, never water to acid) is stated explicitly.
- **Legal disclaimer.** Every plan carries a visible statement that outputs are estimates for educational purposes and do not constitute professional engineering, electrical, or structural advice.

These rules are not advisory text in a wiki. They are encoded as hard constraints in the solver and the catalog; see [Layout Generation](08-layout-generation.md#safety-constraints).
