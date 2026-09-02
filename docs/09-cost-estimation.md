# 9. Bill of Materials and Cost Estimation

Cost is the number users act on hardest. It is also the number most likely to be wrong, because prices vary by country, retailer, season, and quality tier. The design here is built around admitting that variance honestly rather than pretending to a precision that does not exist.

---

## 9.1 The materials catalog

A curated dataset of every part Hydroponer will ever specify. Nothing is generated; nothing is scraped at request time.

```ts
type CatalogItem = {
  id: string                       // "channel_pvc_100x50_4m"
  name: string
  category: 'structure' | 'plumbing' | 'electrical' | 'lighting'
            | 'media' | 'nutrient' | 'instrument' | 'consumable' | 'tool'
  spec: Record<string, string | number>   // diameter_mm, flow_lpm, wattage, ...
  unit: 'each' | 'metre' | 'litre' | 'kg' | 'pack'
  pack_size: number | null
  food_grade: boolean
  tiers: {
    budget:  PriceBand
    typical: PriceBand
    premium: PriceBand
  }
  substitutes: string[]            // other catalog ids that can fill the same role
  diy_alternative: DiyOption | null
  lifespan_years: number | null
  sources: string[]                // where the spec came from
  reviewed_at: string              // ISO 8601 date, e.g. "2026-04-18"
}

type PriceBand = {
  currency: 'USD'                  // canonical; converted at render time
  low: number
  high: number
  basis: 'retail_survey' | 'manufacturer_list' | 'estimate'
  surveyed_at: string              // ISO 8601 date
}
```

Prices are stored canonically in USD with a low–high band, then adjusted for region and converted to the user's currency. Storing a band rather than a point is deliberate: a single price is a claim the product cannot support.

### Regional adjustment

```
local_price = usd_price × regional_multiplier × fx_rate
```

`regional_multiplier` is a per-country factor derived from a periodic survey of a basket of common items (a 100 L food-grade tote, a 1000 L/h submersible pump, a 4 m length of 100 mm PVC, a 100 W LED grow bar). It captures import duty, shipping, and local market reality in one number, and it is refreshed on a scheduled cadence rather than per request.

FX rates are fetched daily and cached. A stale rate is used rather than failing a plan, and the rate date is recorded in the plan's provenance.

### Why not live scraping

Considered and rejected for v1:

- Retailer terms of service generally prohibit it
- Scrapers break constantly, and a broken scraper produces a wrong price rather than an obvious error
- Availability varies too much by country for a single scraper to help most users
- A curated catalog is auditable; a scraped one is not

The tradeoff is accepted: Hydroponer quotes an honest range from a maintained survey rather than a precise-looking number from a fragile pipeline. Live pricing via retailer affiliate APIs is a Phase 3 item where such APIs exist.

---

## 9.2 BOM expansion

The solved layout is walked component by component and expanded into parts.

For each placed component:

1. Look up the module's part template
2. Compute quantities from the component's actual dimensions
3. Add fasteners, fittings, and adhesives implied by the assembly
4. Apply waste allowance
5. Round up to purchasable units (you cannot buy 3.4 m of a 4 m pipe length)

Then, across the whole layout:

6. Size shared systems — pump from total flow and head, reservoir from total plant sites, lighting from total canopy area and DLI deficit
7. Add plumbing from computed run lengths, plus fittings from the run geometry
8. Add electrical: timers, RCD/GFCI protection, cable management
9. Add instruments: pH meter, EC meter, calibration solutions, thermometer
10. Add consumables for the first cycle: nutrients, growing media, seeds, pH adjusters
11. Add tools the user does not already have, based on their stated skill level, marked separately as a one-off cost
12. Merge duplicate lines and re-round to purchasable units after merging

### Waste allowances

| Material | Allowance | Reason |
|---|---|---|
| Pipe and tubing | +10% | Cutting waste, mistakes |
| Channel stock | +5% | Sold in fixed lengths |
| Sheet material | +15% | Offcuts |
| Fittings | +2 of each type, minimum | They get lost or broken |
| Net pots | +5% | Breakage |
| Growing media | +20% | Compaction and spillage |

### Pump sizing worked

Pump selection is the most common place a generated BOM could be quietly wrong, so it is computed rather than looked up:

```
required_flow_lpm  = channels × flow_per_channel_lpm
static_head_m      = reservoir_surface_to_highest_delivery_point
friction_head_m    = f(pipe_diameter, total_run_length, fittings_count)
total_head_m       = static_head_m + friction_head_m
selected_pump      = cheapest catalog pump whose curve delivers
                     required_flow_lpm at total_head_m, with 20% margin
```

If no catalogued pump satisfies the requirement, the layout is rejected and re-solved with shorter runs — not "solved" by specifying an inadequate pump.

---

## 9.3 The cost estimate

### Three-point build cost

| Tier | Composition | Typical use |
|---|---|---|
| **Budget** | Lowest catalog tier, DIY alternatives where safe, generic brands | "What is the least I can spend?" |
| **Typical** | Mid-tier throughout, the recommended build | The headline number |
| **Premium** | Higher-tier components with longer lifespans, better pumps, better lighting | "What if I want this to last?" |

Safety-critical items never vary by tier. RCD/GFCI protection, food-grade contact materials, and backflow prevention are specified at one quality level in all three, because a budget tier that cheapens those is not a budget — it is a hazard.

Each tier is presented as a range, not a point, because the underlying price bands are ranges:

```
Budget:   MYR 1,450 – 1,900
Typical:  MYR 2,350 – 2,950
Premium:  MYR 3,800 – 4,700
```

### Running cost

Reported separately and monthly, because it is what determines whether a build is worth it:

| Item | Basis |
|---|---|
| Electricity | (lighting W × photoperiod h + pump W × duty hours) × 30 ÷ 1000 × local tariff |
| Nutrients | Litres of solution per month × concentration × unit price |
| Growing media | Replaced per cycle; amortised monthly |
| Seeds | Per cycle, per plant site, amortised |
| Water | Consumption estimate × local rate, where metered |
| Replacement parts | Annualised from catalog `lifespan_years`, divided monthly |

Electricity dominates almost every indoor build, and users consistently underestimate it. It is therefore shown as its own line, with the wattage and hours that produced it, not folded into a total.

### Yield context

The running cost is set against an estimated yield value: plant sites × yield per plant × cycles per year × local produce price. This is presented carefully — as an indication, with the produce price shown and adjustable — because an overclaimed payback period is the fastest way to lose a user's trust.

The honest framing the product uses: *"At current prices this system produces roughly MYR X of produce a month against MYR Y of running cost. Payback on the build cost depends heavily on what you grow and your local produce prices."*

---

## 9.4 Presentation

The BOM is grouped by build phase, not by category, because a user shops for a build in the order they will do it:

```
Phase 1 — Frame and benches          6 items   MYR 420 – 560
Phase 2 — Plumbing                  11 items   MYR 310 – 420
Phase 3 — Reservoir and pump         4 items   MYR 380 – 500
Phase 4 — Lighting                   3 items   MYR 890 – 1,150
Phase 5 — Instruments and chemicals   7 items   MYR 240 – 320
Tools (one-off, if not owned)         3 items   MYR 110 – 180
```

Each line shows: quantity, specification, tier price band, a substitution note where one exists, and a DIY alternative where one is safe. Every line is expandable to reveal why it was specified — "1000 L/h pump: required flow 12 L/min at 1.4 m total head, plus 20% margin."

Exports: CSV for a spreadsheet, plain text for a phone in a hardware store, and PDF as part of the full plan.

---

## 9.5 Accuracy and honesty

Cost accuracy is measured, not assumed. See [Testing and Evaluation](16-testing-and-evaluation.md).

- Test builders record actual receipts; the target is that actual spend falls inside the quoted typical range at least 85% of the time
- Systematic bias is tracked per region and corrects the regional multiplier
- Every plan states the price survey date and that prices vary by retailer
- A quoted range whose survey is older than the freshness threshold is labelled as such rather than silently served

The product would rather show a wide, honest range with a visible date than a narrow number it cannot stand behind.
