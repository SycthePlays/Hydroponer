# 13. Frontend

Next.js App Router, React, TypeScript, Tailwind. Server components by default; client components only where interaction requires them.

---

## 13.1 Route map

| Route | Rendering | Purpose |
|---|---|---|
| `/` | Static | Landing, example plans, primary call to action |
| `/new` | Client | Capture or upload, intake form |
| `/spaces/:id/analyzing` | Client | Live progress, confidence-gate questions |
| `/plans/:id` | Server, streamed | The plan, with 2D plan and 3D viewer as tabs |
| `/plans/:id/3d` | Client | The 3D viewer full-screen, deep-linkable with a camera state |
| `/plans/:id/build` | Server plus client | Tutorial with persisted checkboxes |
| `/plans/:id/bom` | Server | Shopping view, printable |
| `/p/:slug` | Static, revalidated | Public shared plan |
| `/dashboard` | Server | Saved plans |
| `/learn/:topic` | Static | Reference content on the six systems |
| `/settings` | Client | Units, currency, data and retention controls |

The plan page is server-rendered and streamed section by section, so "Your space" and "Your system" paint while the SVG layout and tutorial are still being assembled.

---

## 13.2 State

Three distinct kinds, each handled differently:

| Kind | Mechanism |
|---|---|
| Server state (plans, spaces, catalog) | React Server Components plus TanStack Query on the client for anything mutable |
| Job progress | SSE subscription in a small client provider; the only genuinely real-time state in the app |
| Local UI state (form values, toggles, checkbox optimism) | Component state and `useReducer`; no global store |

There is deliberately no Redux-shaped global store. The app has one long-lived stateful flow — generation — and it is served better by a scoped provider than by a store the whole tree can reach into.

Anonymous build progress is written to `localStorage` and merged into the account on signup.

---

## 13.3 Key components

### `CaptureFrame`

Wraps `getUserMedia` on mobile and a drop zone on desktop. Responsibilities: live coaching overlay, orientation handling, client-side downscale before upload, HEIC detection, and immediate blur and exposure checks so an unusable photo is caught before it is uploaded rather than after it is analysed.

### `PipelineProgress`

Subscribes to the job stream and renders stages with their findings. Falls back to polling if the SSE connection fails. Renders the confidence-gate question inline when the job suspends, so the user never leaves the page.

### `LayoutView`

Renders the server-generated SVG with an interaction layer over it:

- Pan and zoom (pointer, wheel, pinch)
- Layer toggles: components, plumbing, electrical, dimensions, walkways
- Click a component to see its BOM lines and the steps that install it
- Drag the usable-area boundary to trigger a re-solve
- Elevation and plan toggle for vertical systems

The SVG itself is never generated in the browser. The server owns rendering so that the PDF, the shared link, the social preview, and the app all show exactly the same drawing.

### `SceneView`

The interactive 3D viewer, code-split and loaded on demand so the plan page stays fast without it. Built on Three.js with React Three Fiber, it consumes the server-computed `Scene3D` description and assembles the scene from the cached glTF part library.

- Orbit, momentum spin, zoom, and pan, each with a keyboard equivalent
- Component focus: tap a part to fly to it and reveal its BOM lines and install steps
- Layer toggles matching `LayoutView`, so the two stay mentally aligned
- Exploded-view slider and phase-by-phase build playback
- Growth preview toggling plants between transplant and mature size
- A visually hidden, navigable component list beneath the canvas carrying the same data, since the canvas is opaque to assistive technology
- Falls back to `LayoutView` with an explanation when WebGL is unavailable

`LayoutView` and `SceneView` are tabs over one dataset, never two sources of truth. Full behaviour in [3D Visualisation](20-3d-visualization.md).

### `BomTable`

Grouped by phase, tier switcher at the top, per-line expansion showing the engine's `rationale`. Exports to CSV and plain text. Sticky total.

### `TutorialSteps`

Phase accordion, per-step checkboxes with optimistic update, safety blocks rendered as non-collapsible callouts, sticky "current step" bar on mobile, and a progress summary that survives reloads.

### `CostPanel`

Three-point build range plus the monthly running breakdown. The electricity line expands to show wattage and hours. Includes the price survey date, visibly, rather than in a footnote.

---

## 13.4 Design principles

**Show the reasoning.** Every recommendation exposes why. The alternatives section lists what was rejected and the reason. A user who understands the choice trusts the plan.

**Ranges, not false precision.** Costs are ranges, dimensions are "about", confidence is expressed in language rather than as a percentage. The interface never renders a hedged number as if it were exact.

**Progressive disclosure.** The default view is one recommended design. Alternatives, engine rationale, and adjustment controls are one interaction away, not on the surface.

**Mobile is the build surface.** Planning may happen on a laptop; building happens on a phone in a garage. The tutorial and BOM views are designed phone-first: large tap targets, high contrast, no hover-dependent affordance, readable at arm's length.

**Nothing important is colour-only.** Component types in the layout carry a label and a hatch pattern in addition to colour; warnings carry an icon and a heading, not just a red border.

---

## 13.5 Performance

- The landing page and `/learn` routes are static and cached at the edge
- Plan pages stream; the layout SVG and tutorial are separate suspense boundaries
- Images use `next/image` with responsive sizes; the original photo is served at display resolution, never full size
- The layout SVG is inlined when small and lazy-fetched when large
- Client JavaScript budget: under 150 KB gzipped on the plan route, excluding the 3D viewer
- The 3D viewer and the glTF part library are code-split, loaded on demand, and never block first paint; the part library is CDN-cached and shared across every plan
- Frame time on a mid-range device profile is a CI budget, not an aspiration — see [3D Visualisation §20.3](20-3d-visualization.md#performance-targets)
- Targets: LCP under 2.5 s, CLS under 0.1, INP under 200 ms on a mid-range Android device over 4G

---

## 13.6 Accessibility

Target WCAG 2.2 AA, verified by automated checks in CI plus a manual pass per release.

- The layout SVG carries `role="img"` and a description listing every component with its position and size; a visually hidden table beneath it presents the same data in a navigable form
- Every interactive control in `LayoutView` is reachable and operable by keyboard, including boundary adjustment (arrow keys nudge; shift-arrow moves faster)
- `SceneView` is fully keyboard-operable (arrows orbit, `+` and `-` zoom, `Tab` cycles components) and pairs the canvas with a navigable structured component list; `prefers-reduced-motion` disables momentum spin and camera transitions
- Live regions announce pipeline stage changes for screen reader users, throttled so they do not flood
- Focus is managed explicitly across the multi-step generation flow
- Text meets 4.5:1 contrast; the plan renders correctly at 200% zoom and in forced-colours mode

---

## 13.7 Internationalisation

- Units follow the user's setting, not a guess from their locale; the engine emits SI and the presentation layer converts, with imperial conversions rounded to values a person would actually use (a 2400 mm channel becomes 8 ft, not 7.87 ft)
- Currency formatting follows the plan's currency, not the browser's
- Copy is externalised from the first commit even though v1 ships English only, because retrofitting it is expensive and the target audience is not primarily English-speaking
- Model-authored narration is generated in the user's language rather than translated after the fact

---

## 13.8 Error presentation

Errors are shown in the user's terms with a concrete next action, never as a code:

| Condition | What the user sees |
|---|---|
| `IMAGE_NOT_A_SPACE` | "This doesn't look like a room or outdoor area. Try a wider shot." plus a retake button |
| `IMAGE_QUALITY_LOW` | "This photo is a bit dark to measure from. Can you retake it with more light?" |
| `NO_VALID_LAYOUT` | The blockers, listed plainly, with what would unblock each one |
| `RATE_LIMITED` | When they can try again, and what an account would give them |
| `JOB_FAILED` | An apology, confirmation that nothing was charged, and a retry button |
| `PROVIDER_UNAVAILABLE` | "Something upstream is down. Your photo is saved — try again in a few minutes." |

Saved plans remain fully readable during any pipeline outage, because the plan route reads the database and nothing else.
