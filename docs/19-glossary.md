# 19. Glossary

## Hydroponic terms

**Air stone** — A porous diffuser that breaks pumped air into fine bubbles, oxygenating the nutrient solution. Standard in deep water culture.

**Backflow preventer** — A one-way device on a water connection that stops nutrient solution from being drawn back into a potable supply. Mandatory on any mains connection in a Hydroponer plan.

**DLI (Daily Light Integral)** — Total photosynthetically active light received in a day, in mol/m²/day. The unit Hydroponer uses for every lighting decision.

**Drip system** — Solution delivered to each plant individually through emitters into media-filled pots or slabs. Best for large fruiting crops.

**DWC (Deep Water Culture)** — Roots suspended permanently in aerated solution. Simple, forgiving, thermally stable in large volumes.

**Ebb and flow (flood and drain)** — A tray of media-filled pots periodically flooded from a reservoir below and drained back by gravity. The most tolerant of brief pump outages.

**EC (Electrical Conductivity)** — A measure of dissolved salts, used as a proxy for nutrient concentration. Measured in mS/cm.

**Growing media** — The inert material supporting roots: rockwool, clay pebbles, coco coir, perlite. Provides structure, not nutrition.

**Head (total dynamic head)** — The pressure a pump must overcome, in metres: vertical lift plus friction losses through pipe and fittings. Sizing on flow alone while ignoring head is a common and confusing failure.

**Kratky method** — Non-circulating passive hydroponics. Roots partly in static solution, partly in the air gap that forms as the level falls. No pump, no power.

**Net pot** — A slotted basket holding a plant and its media while letting roots pass through into the solution.

**NFT (Nutrient Film Technique)** — A thin film of solution flowing continuously down a sloped channel over bare roots. High density, low tolerance for pump failure.

**Nutrient solution** — Water with dissolved mineral nutrients. Usually mixed from commercial two- or three-part concentrates.

**pH** — Acidity or alkalinity. Hydroponic crops generally want 5.5–6.5; outside that band, nutrients become chemically unavailable regardless of concentration.

**Photoperiod** — Hours of light per day. Combined with fixture intensity, it determines DLI.

**PPF / PPFD** — Photosynthetic Photon Flux (total light output of a fixture, µmol/s) and its density at the canopy (µmol/m²/s). PPFD across the photoperiod integrates to DLI.

**Reservoir** — The tank holding nutrient solution. Larger reservoirs are more thermally stable and more forgiving of neglect.

**Root rot** — Root decay caused by warm, poorly oxygenated solution. The most common failure in deep water culture.

**Run-to-waste** — A system that does not recirculate; solution passes the roots once and drains away. Simpler, less efficient.

**Transplant** — Moving a seedling from its germination medium into the system, typically 10–14 days after sowing.

**Vertical tower** — Stacked planting sites on a column, fed from the top. The highest plant density per square metre of floor.

---

## Project terms

**Adjustment** — A user-initiated change to a plan (budget, system, crops, area, dimensions, scale) that produces a new plan version by re-running only the invalidated pipeline stages.

**BOM (Bill of Materials)** — The complete parts list for a plan, with quantities, specifications, and price bands, grouped by build phase.

**Build playback** — The 3D viewer mode that assembles the design phase by phase, matching the tutorial's order.

**Catalog** — The curated dataset of system types, crops, materials, prices, and regional factors. Versioned, reviewed, and never model-generated.

**Exploded view** — A 3D viewer mode that separates the assembly along its build axis so the user can see how parts fit together.

**Confidence gate** — The pipeline checkpoint that suspends a job and asks the user to confirm or correct a measurement when confidence is too low to proceed honestly.

**Design engine** — The pure, deterministic library that performs system selection, layout solving, BOM expansion, and costing. No I/O, no models, no randomness.

**Golden set** — Fifty photographed spaces with hand-measured ground truth, used to evaluate every change to a model or a prompt.

**Hard constraint** — A rule the solver may never violate for a better score. Contrast with soft scoring, which ranks valid options.

**Intake** — The four-question form: what to grow, budget, skill level, country.

**Layout** — The solved arrangement: positioned, sized components with plumbing and electrical runs, walkways, and warnings.

**glTF** — The 3D asset format used for the part library. Draco-compressed, CDN-served, cached across every plan.

**Narration** — The final pipeline stage, where a language model writes prose from already-computed structured output.

**Part library** — The small set of parametric, low-poly 3D models keyed to catalog items by `model_ref`. An item without one renders as a labelled box at its true dimensions.

**No-invented-numbers rule** — The project's central discipline: a language model may never originate a number, part, dimension, price, or quantity that reaches a user. Enforced by post-validation, not by convention.

**Plan** — The complete deliverable: space analysis, system recommendation, layout, BOM, cost, tutorial, and grow plan.

**Plan version** — An immutable snapshot of a plan. Adjustments create new versions; existing versions never change.

**Provenance** — The record attached to every stage result: model, prompt version, engine version, catalog version, tokens, and duration. What makes any delivered plan reproducible and diagnosable.

**Scene analysis** — The vision stage: a structured, typed description of the photographed space, with per-field confidence. Not to be confused with the 3D **scene description**.

**Scene description (`Scene3D`)** — The deterministic projection of a layout into renderable 3D nodes, cameras, annotations, and build phases. Computed server-side, rendered client-side.

**Stage** — One step of the ten-stage generation pipeline. Each has a versioned input and output schema, and can be re-run in isolation.

**Usable area** — The floor polygon remaining after obstructions, door swings, walkways, wall clearance, and utility access have been subtracted.
