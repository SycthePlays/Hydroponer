# 4. User Flows

This document describes what the user actually sees and does, screen by screen, including the paths that go wrong.

## Flow A — First-time plan generation (the happy path)

### A1. Landing

A single-purpose page. Headline, one-sentence explanation, one primary action: **Photograph your space**. Below the fold, three example plans (a balcony, a garage, a field) that a visitor can open and browse in full without signing up. Social proof by demonstration, not testimonial.

No account required to reach a plan.

### A2. Capture / Upload

On mobile the camera opens directly. On desktop a drop zone accepts files.

An overlay coaches the shot while the camera is live:

- "Stand in the doorway or corner so the whole space is in frame"
- "Include something of a known size — a door, a bottle, a tape measure"
- "Daylight helps"

Accepted: JPEG, PNG, WebP, HEIC. Max 15 MB per image, up to 5 images. The first image is the primary; the others are supporting angles.

After upload the user sees their photo with a small confirmation: "Got it. Can you see the whole area you want to use in this shot?" Yes / retake.

### A3. Intake form

Four questions, one screen, all with defaults preselected. Progress is never blocked by a required field except country.

The budget slider is denominated in the user's local currency, inferred from country and confirmable.

### A4. Analysing

Not a spinner. A staged progress display showing the pipeline's real state:

```
Reading your space...          done
Measuring dimensions...        done
Checking light and access...   in progress
Choosing a system...
Planning the layout...
Pricing materials...
Writing your build guide...
```

Each stage completes with a one-line finding: *"Measuring dimensions — found about 5.8 m by 3.1 m."* This is honest progress and it doubles as an explanation of what the product is doing. Typical total: 40–90 seconds.

### A5. Confirmation gate (conditional)

If dimensional confidence is below threshold, the flow pauses here:

> **Quick check before I continue**
> I think this wall is about **3.2 m** wide. Is that close?
> `Yes, close enough` · `Let me correct it` · `I'll measure and come back`

Correcting takes a single numeric input with a unit toggle. Correcting re-runs stages 5 onward, not the whole pipeline.

### A6. The plan

The main deliverable. A single scrolling page, sectioned, with a sticky table of contents:

1. **Your space** — the photo, an annotated overlay, the measured dimensions, and what was found (light, water, power, obstructions)
2. **Your system** — the recommended method, an illustration, and a plain-language explanation of why it was chosen for *this* space. Alternatives are collapsed behind "See other options that would also work here."
3. **The layout** — two tabs over one design:
   - **Plan** — a scaled 2D view with labelled components, dimensions, and aisles. Zoomable. Toggle for top-down or elevation.
   - **3D** — the build in three dimensions. Drag to rotate, flick to spin, pinch to zoom, tap a part to see what it costs and which steps install it. Layers can be hidden, the assembly can be exploded, and the build can be played back phase by phase. Plants can be shown at mature size, which is how a user finds out their canopy will hit the shelf above.
4. **What it grows** — crops, plant count, spacing, expected first harvest, expected yield per cycle
5. **What to buy** — the bill of materials, grouped by build phase, each line showing quantity, specification, price band, and substitution notes
6. **What it costs** — the three-point build range and the monthly running cost, broken into electricity / nutrients / media / seed
7. **How to build it** — the tutorial, in phases, each step checkable, with tools, time, and safety callouts
8. **Care after building** — the first four weeks: filling, pH and EC targets, seeding, transplant timing, what to watch for

Persistent actions in the header: **Save**, **Share**, **Download PDF**, **Adjust**.

### A7. Save and share

Saving prompts for an account at the moment it has value, not before. A plan generated anonymously is held in the session and claimed on signup — nothing is lost.

Sharing produces a read-only public link with a stable slug. The public view hides the original photo by default; the user opts in to including it.

---

## Flow B — Adjusting a plan

The user disagrees with something. Adjustment is constrained, not free-form.

Adjustable, from the plan page:

| Control | Effect |
|---|---|
| Budget slider | Re-runs BOM and cost with different component tiers; may change the recommended system if the new budget crosses a threshold |
| System type | Switch to a ranked alternative; re-runs layout, BOM, cost, tutorial |
| Crop selection | Re-runs grow plan, spacing, plant count, nutrient schedule |
| Usable area | Drag the usable-area boundary on the plan view; re-runs the layout |
| Dimensions | Correct any measurement; re-runs everything from stage 5 |
| Scale up or down | Add or remove modules within the same design |

Every adjustment shows what it changed: *"Switching to NFT reduced the build cost by $180 and increased plant sites from 96 to 144, but added a daily pump-failure risk you should be aware of."*

Adjustments create versions. The user can compare and revert.

---

## Flow C — Returning user

Signed in, lands on a dashboard listing saved plans with thumbnails, space names, and status (draft / building / built). From a plan they can:

- Resume the build tutorial where they left off (step checkboxes persist)
- Duplicate a plan for a different space
- Re-photograph the same space after building and store the result alongside the plan

---

## Failure and edge cases

These are the paths that determine whether the product feels trustworthy.

| Situation | System response |
|---|---|
| **Photo is not a space** (selfie, pet, screenshot) | Rejected at scene analysis: "This doesn't look like a space I can plan for. Try a wider shot of the room or area." No charge, no job queued. |
| **Photo too dark or blurred** | Quality check before analysis; asks for a retake with a specific reason. |
| **Space is too small** (under a usable threshold) | Still produces a plan, but a minimal one — a countertop Kratky jar system — with a note that the space limits what is possible. Never returns nothing. |
| **Space is enormous** (a field beyond v1 scale limits) | Plans a defined sub-area and says so: "I've planned a 10 m by 6 m section. For the full area, multiply this design or consult a commercial designer." |
| **No power visible** | Eliminates every pumped system by hard constraint. Recommends Kratky, which needs no power. Explains why. |
| **No water access visible** | Not disqualifying, but adds a manual-fill workflow to the tutorial and increases the running-effort estimate. Asks the user to confirm. |
| **Confidence too low to proceed even after asking** | Offers a manual-entry path: the user types dimensions and skips vision-based measurement entirely. |
| **Budget below the minimum viable build** | Shows the cheapest possible working system and its cost, stating clearly that it exceeds the stated budget by a given amount, rather than silently producing something unbuildable. |
| **Generation fails mid-pipeline** | The job is retried once. On second failure the user sees a plain apology, the failing stage named, and no charge. Partial results already computed are shown if usable. |
| **Model returns malformed structured output** | Schema validation fails, one repair attempt is made, then the job errors. Never passed downstream. |
| **User uploads an image containing people** | Faces are not analysed or stored as features; the analysis prompt instructs the model to ignore people entirely. A notice suggests retaking without people in frame. |

---

## Accessibility requirements

- Every plan is fully readable as text; both the 2D diagram and the 3D scene have a structured text equivalent listing each component with position and size
- The 3D view is an enhancement, never a requirement — no WebGL means the 2D plan with an explanation, and every 3D gesture has a keyboard equivalent
- Colour is never the only carrier of meaning in the layout view — component types are also labelled and patterned
- Full keyboard navigation, including the layout adjustment controls
- Target WCAG 2.2 AA
- Tutorial steps are readable at phone screen size while the user is holding tools

---

## What the user never sees

- Raw model output
- Confidence scores as bare numbers (they are expressed as questions or hedged language instead)
- Internal system names, stage identifiers, or job IDs
- A plan presented with false certainty when the inputs were weak
