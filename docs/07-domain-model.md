# 7. Hydroponic Domain Model

This is the horticultural and engineering knowledge that Hydroponer encodes. It is the reason the product can be right, and the place where being wrong is most expensive.

All of it lives as data in `packages/catalog`, versioned and reviewable, not scattered through code.

---

## 7.1 System types

Six methods are supported in v1. Each is defined by a data record with hard requirements, soft preferences, and a module template used by the solver.

### Kratky (non-circulating passive)

Plants sit in net pots above a static reservoir. The water level falls as plants drink, leaving an air gap for the roots. No pump, no power, no moving parts.

| Property | Value |
|---|---|
| Power required | None |
| Water access required | Fill only |
| Drainage required | No |
| Skill floor | Assemble only |
| Cost band | Lowest |
| Best crops | Lettuce, leafy greens, herbs |
| Poor for | Fruiting crops, long cycles, hot climates |
| Failure mode | Root suffocation if the air gap is lost; algae in clear vessels |
| Footprint | Anything from a jar to a large tote |

**Why it matters:** it is the only system that works with no power at all, which makes it the mandatory fallback whenever the scene analysis finds no outlets.

### Deep Water Culture (DWC)

Roots hang permanently in aerated nutrient solution. An air pump and air stone provide oxygen.

| Property | Value |
|---|---|
| Power required | Air pump (low wattage, continuous) |
| Water access required | Fill and periodic change |
| Drainage required | Helpful, not required |
| Skill floor | Assemble only |
| Cost band | Low |
| Best crops | Lettuce, basil, chard; with larger vessels, peppers and tomatoes |
| Poor for | Root crops |
| Failure mode | Root rot if aeration stops or solution temperature rises |
| Thermal note | Large water volume buffers temperature — favoured in hot climates |

### Nutrient Film Technique (NFT)

A thin film of solution flows continuously down a gently sloped channel over bare roots and returns to a reservoir.

| Property | Value |
|---|---|
| Power required | Water pump, continuous |
| Water access required | Yes |
| Drainage required | Return path required |
| Skill floor | Basic tools |
| Cost band | Medium |
| Slope requirement | 1:30 to 1:40 |
| Best crops | Lettuce, leafy greens, strawberries, herbs |
| Poor for | Heavy fruiting crops (insufficient root support), hot environments |
| Failure mode | Pump failure kills the crop within hours — no reservoir buffer at the roots |
| Efficiency | Highest plant density per square metre of the horizontal systems |

### Ebb and Flow (flood and drain)

A tray of media-filled pots is periodically flooded from a reservoir below and drained back by gravity.

| Property | Value |
|---|---|
| Power required | Water pump on a timer |
| Water access required | Yes |
| Drainage required | Gravity return to reservoir |
| Skill floor | Basic tools |
| Cost band | Medium |
| Best crops | Very broad — greens, herbs, peppers, tomatoes |
| Poor for | Nothing in particular; a good generalist |
| Failure mode | Overflow if the drain clogs; media salt build-up over time |
| Robustness | Highest tolerance to short pump outages of the pumped systems |

### Drip

Solution is delivered to each plant individually through emitters, into media-filled pots or slabs.

| Property | Value |
|---|---|
| Power required | Water pump on a timer |
| Water access required | Yes |
| Drainage required | Yes for run-to-waste; return path for recirculating |
| Skill floor | Comfortable cutting and drilling |
| Cost band | Medium to high |
| Best crops | Large fruiting crops — tomatoes, cucumbers, peppers |
| Poor for | Dense leafy production |
| Failure mode | Emitter clogging, which is silent and plant-specific |
| Scalability | Best of the six for large installations |

### Vertical tower

Stacked planting sites on a vertical column; solution is pumped to the top and trickles down.

| Property | Value |
|---|---|
| Power required | Water pump, continuous or timed |
| Water access required | Yes |
| Drainage required | Return to base reservoir |
| Skill floor | Assemble only (commercial) or comfortable cutting (DIY) |
| Cost band | Medium to high per plant site |
| Height requirement | 1.8 m minimum practical |
| Best crops | Strawberries, lettuce, herbs |
| Poor for | Anything heavy or tall |
| Failure mode | Uneven distribution — lower sites over-fed, upper sites starved |
| Efficiency | Highest plant sites per square metre of floor, by a wide margin |

---

## 7.2 The selection matrix

Each system record declares hard requirements. Any unmet hard requirement eliminates the system outright and produces a stated reason.

| Requirement | Kratky | DWC | NFT | Ebb/Flow | Drip | Tower |
|---|---|---|---|---|---|---|
| Mains power | no | yes | yes | yes | yes | yes |
| Continuous pump | no | air only | yes | no (timed) | no (timed) | yes |
| Water source | fill | fill | yes | yes | yes | yes |
| Drainage path | no | no | yes | yes | yes | yes |
| Level floor | no | yes | slope needed | yes | yes | yes |
| Min. ceiling height | 0.5 m | 0.8 m | 1.0 m | 1.0 m | 1.2 m | 1.8 m |
| Min. usable area | 0.1 m² | 0.5 m² | 1.5 m² | 1.5 m² | 2.0 m² | 0.5 m² |

Soft scoring then ranks the survivors across weighted factors: area efficiency, budget fit, skill fit, crop fit, climate fit, maintenance burden, and failure tolerance. Weights differ by user profile — a beginner weights failure tolerance and skill fit far more heavily than area efficiency.

The full scoring model is specified in [Layout Generation](08-layout-generation.md#system-scoring).

---

## 7.3 Light model

Light is the single most common reason a beginner hydroponic build fails, and the thing photos are worst at revealing. The model is deliberately conservative.

**Daily Light Integral (DLI)** — total photosynthetically active light received per day, in mol/m²/day — is the working unit.

| Crop class | DLI required | Notes |
|---|---|---|
| Microgreens | 6–12 | Very forgiving |
| Leafy greens (lettuce, spinach) | 12–17 | The beginner default |
| Herbs (basil, mint) | 12–20 | Basil at the top of the band |
| Fruiting (tomato, pepper, cucumber) | 20–30 | The hard case |
| Strawberry | 17–22 | |

Estimation path:

1. Scene analysis returns a DLI band, not a number — models are poor at estimating absolute light
2. For outdoor spaces, the band is refined by latitude, season, and reported shading
3. For indoor spaces, natural light is treated as a supplement, never as the primary source, unless window area and orientation are strong
4. The engine computes the deficit between available DLI and the target crop's requirement
5. Supplemental lighting is sized to close the deficit: required PPF, fixture wattage, mounting height, photoperiod hours

**Conservatism rule:** where the light estimate is uncertain, the engine sizes lighting for the higher requirement. Over-lit systems waste electricity; under-lit systems fail entirely. The asymmetry justifies the bias, and the cost consequence is disclosed.

---

## 7.4 Crop model

Each crop record carries what the engine needs:

```ts
type Crop = {
  id: string
  common_name: string
  class: 'leafy' | 'herb' | 'fruiting' | 'root' | 'microgreen'
  spacing_mm: number              // centre to centre
  mature_height_mm: number
  root_type: 'shallow' | 'medium' | 'deep'
  dli_min: number
  dli_optimal: number
  ph_range: [number, number]
  ec_range_ms_cm: [number, number]
  temp_range_c: [number, number]
  days_to_transplant: number
  days_to_harvest: number
  yield_per_plant_g: number
  compatible_systems: SystemType[]
  difficulty: 1 | 2 | 3           // 1 = beginner-safe
  notes: string
}
```

Crop selection is filtered by the chosen system, the available DLI, the climate zone, and the user's difficulty tolerance — then ranked by yield value per plant site.

Beginners are steered firmly toward difficulty 1 crops. A first build that produces lettuce in four weeks creates a second build; a first build that fails at tomatoes produces an abandoned system.

---

## 7.5 Water, nutrients, and chemistry

**Reservoir sizing.** Encoded as a formula: minimum 2 L per leafy plant site, 4 L per fruiting site, with a floor of 20 L for any recirculating system. Larger reservoirs are more thermally stable and more forgiving of neglect, so the engine sizes up when floor space allows.

**Flow rate.** For NFT, 1–2 L/min per channel. For ebb and flow, the flood volume must fill the tray in under five minutes. Pump selection is computed from required flow **and** total head (vertical lift plus friction losses), not from flow alone — an under-headed pump is a common and confusing beginner failure.

**pH.** Target 5.5–6.5 for most crops; the crop record narrows it. The tutorial always includes measurement and adjustment as a step, never as an afterthought.

**EC (electrical conductivity).** A proxy for nutrient concentration. Targets are per-crop and per-growth-stage: seedlings take roughly half the mature-plant EC.

**Nutrient formulation.** v1 recommends commercial two- or three-part solutions rather than raw salt formulations. Mixing individual salts is cheaper at scale and materially more dangerous and error-prone for a beginner. Raw-salt schedules are a Phase 4 feature for advanced users.

**Water quality.** Source water hardness affects both EC baseline and pH stability. The engine asks (rather than assumes) when the region is known to have hard water, and adjusts the schedule.

---

## 7.6 Environmental model

| Factor | Effect on design |
|---|---|
| Ambient temperature | High ambient favours large-volume systems and root-zone cooling; low ambient may require a reservoir heater |
| Solution temperature | Target 18–22 °C; above 24 °C dissolved oxygen falls and root disease risk climbs sharply |
| Humidity | Very high humidity in an enclosed space needs ventilation to prevent fungal disease |
| Air movement | Gentle airflow strengthens stems and reduces disease; a clip fan is added for enclosed spaces |
| CO2 | Not addressed in v1; sealed-room enrichment is out of scope |
| Frost | Outdoor systems in frost-prone zones get a seasonal warning and a drain-down procedure |

Climate is derived from the user's country and, where offered, region — mapped to a climate zone record that supplies temperature bands and seasonal daylight.

---

## 7.7 Structural model

Water weighs 1 kg per litre and hydroponic systems hold a lot of it. The engine computes total filled mass for every placed component and applies these thresholds:

| Condition | Response |
|---|---|
| Any component over 100 kg filled | Floor placement enforced; shelf and wall mounting removed from the solution space |
| Any component over 50 kg filled and elevated | Structural warning emitted with the calculated load |
| Balcony placement, any system | Warning issued with total load and a recommendation to verify the balcony's rated capacity |
| Upper-floor placement over 150 kg total | Strong warning recommending professional verification |
| Wall-mounted anything over 15 kg | Fixing specification included in the BOM with a substrate note (masonry versus stud) |

These are hard solver constraints, not advisory text. See [Layout Generation](08-layout-generation.md#safety-constraints).

---

## 7.8 Knowledge sourcing and maintenance

The catalog is a curated dataset, and its provenance matters as much as its content.

- Every record cites its source: extension-service publications, peer-reviewed horticulture literature, and manufacturer specifications
- No value in the catalog originates from a language model
- Records carry `reviewed_by` and `reviewed_at` fields
- Changes go through pull request review by someone with horticultural knowledge
- The catalog is versioned; every generated plan records the catalog version used, so a plan can be reproduced exactly

This is the same discipline as prompt versioning, applied to domain data.
