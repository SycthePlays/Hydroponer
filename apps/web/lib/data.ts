import type {
  Design, Space, CommonsEntry, Version, PlacedComponent, PlumbingRun,
} from './types';

/* ============================================================
   One worked design, in full.
   A 5.8 x 3.1 m garage running a two-bench NFT system.
   Every coordinate is real millimetres; the 2D plan and the 3D
   scene are both projections of this single object.
   ============================================================ */

const benchComponents = (suffix: 'a' | 'b', yBase: number): PlacedComponent[] => {
  const channelYs = [yBase + 40, yBase + 220, yBase + 400];
  const out: PlacedComponent[] = [
    {
      id: `bench-${suffix}`,
      label: `Bench ${suffix.toUpperCase()} frame`,
      layer: 'structure',
      position_mm: { x: 600, y: yBase, z: 0 },
      size_mm: { w: 3600, d: 600, h: 800 },
      shape: 'box',
      materialLineIds: ['m-frame', 'm-frame-connector'],
      buildStepIds: ['s2-a1'],
      phase: 2,
    },
  ];

  channelYs.forEach((y, i) => {
    const n = i + 1;
    out.push({
      id: `channel-${suffix}${n}`,
      label: `NFT channel ${suffix.toUpperCase()}${n}`,
      layer: 'structure',
      position_mm: { x: 600, y, z: 800 },
      size_mm: { w: 3600, d: 150, h: 100 },
      shape: 'box',
      materialLineIds: ['m-channel', 'm-endcap'],
      buildStepIds: ['s3-a1', 's3-b2'],
      phase: 3,
    });
    out.push({
      id: `pots-${suffix}${n}`,
      label: `Net pots, channel ${suffix.toUpperCase()}${n}`,
      layer: 'structure',
      position_mm: { x: 700, y: y + 35, z: 860 },
      size_mm: { w: 80, d: 80, h: 80 },
      shape: 'cylinder',
      instances: { count: 16, step_mm: { x: 215, y: 0, z: 0 } },
      materialLineIds: ['m-netpot'],
      buildStepIds: ['s3-a1'],
      phase: 3,
    });
    out.push({
      id: `plants-${suffix}${n}`,
      label: `Plants, channel ${suffix.toUpperCase()}${n}`,
      layer: 'plants',
      position_mm: { x: 700, y: y + 35, z: 930 },
      size_mm: { w: 240, d: 240, h: 210 },
      shape: 'plant',
      instances: { count: 16, step_mm: { x: 215, y: 0, z: 0 } },
      materialLineIds: ['m-seed', 'm-media'],
      buildStepIds: ['s8-2'],
      phase: 8,
    });
  });

  out.push({
    id: `led-${suffix}`,
    label: `LED bar over bench ${suffix.toUpperCase()}`,
    layer: 'lighting',
    position_mm: { x: 700, y: yBase + 250, z: 1560 },
    size_mm: { w: 1150, d: 70, h: 45 },
    shape: 'box',
    instances: { count: 3, step_mm: { x: 1170, y: 0, z: 0 } },
    materialLineIds: ['m-led'],
    buildStepIds: ['s6-1'],
    phase: 6,
  });

  return out;
};

const components: PlacedComponent[] = [
  ...benchComponents('a', 250),
  ...benchComponents('b', 2250),
  {
    id: 'reservoir',
    label: 'Reservoir, 120 L',
    layer: 'plumbing',
    position_mm: { x: 700, y: 350, z: 0 },
    size_mm: { w: 900, d: 500, h: 560 },
    shape: 'box',
    materialLineIds: ['m-reservoir', 'm-lid'],
    buildStepIds: ['s4-1'],
    phase: 4,
  },
  {
    id: 'pump',
    label: 'Submersible pump, 2000 L/h',
    layer: 'plumbing',
    position_mm: { x: 900, y: 470, z: 60 },
    size_mm: { w: 140, d: 120, h: 150 },
    shape: 'box',
    materialLineIds: ['m-pump'],
    buildStepIds: ['s4-2'],
    phase: 4,
  },
  {
    id: 'timer-box',
    label: 'Timer and RCD outlet box',
    layer: 'electrical',
    position_mm: { x: 5500, y: 200, z: 1200 },
    size_mm: { w: 200, d: 120, h: 260 },
    shape: 'box',
    materialLineIds: ['m-rcd', 'm-timer'],
    buildStepIds: ['s6-2'],
    phase: 6,
  },
];

const runs: PlumbingRun[] = [
  {
    id: 'feed-a',
    label: 'Feed line to bench A',
    kind: 'feed',
    diameter_mm: 20,
    phase: 5,
    points_mm: [
      { x: 1150, y: 600, z: 320 },
      { x: 1150, y: 600, z: 1150 },
      { x: 4350, y: 600, z: 1150 },
      { x: 4350, y: 470, z: 980 },
    ],
  },
  {
    id: 'return-a',
    label: 'Return to reservoir, bench A',
    kind: 'return',
    diameter_mm: 32,
    phase: 5,
    points_mm: [
      { x: 580, y: 470, z: 840 },
      { x: 380, y: 470, z: 840 },
      { x: 380, y: 600, z: 420 },
      { x: 1150, y: 600, z: 420 },
    ],
  },
  {
    id: 'feed-b',
    label: 'Feed line to bench B',
    kind: 'feed',
    diameter_mm: 20,
    phase: 5,
    points_mm: [
      { x: 1150, y: 600, z: 320 },
      { x: 1150, y: 160, z: 320 },
      { x: 4450, y: 160, z: 320 },
      { x: 4450, y: 2470, z: 320 },
      { x: 4450, y: 2470, z: 980 },
    ],
  },
  {
    id: 'return-b',
    label: 'Return to reservoir, bench B',
    kind: 'return',
    diameter_mm: 32,
    phase: 5,
    points_mm: [
      { x: 580, y: 2470, z: 840 },
      { x: 330, y: 2470, z: 840 },
      { x: 330, y: 160, z: 250 },
      { x: 1150, y: 160, z: 250 },
    ],
  },
  {
    id: 'power-1',
    label: 'Pump power, routed on the dry side',
    kind: 'power',
    diameter_mm: 10,
    phase: 6,
    points_mm: [
      { x: 5500, y: 200, z: 1200 },
      { x: 5500, y: 200, z: 700 },
      { x: 1300, y: 200, z: 700 },
      { x: 1150, y: 400, z: 400 },
    ],
  },
];

export const garageDesign: Design = {
  id: 'dsg_7f2a',
  slug: 'garage-nft-96',
  name: 'Garage NFT, 96 sites',
  spaceId: 'spc_garage',
  status: 'building',
  version: 3,
  updatedOn: '2026-08-28',
  published: null,
  brief: {
    crops: 'Leafy greens and herbs',
    budgetMin: 2000000,
    budgetMax: 6000000,
    currency: 'IDR',
    skill: 'basic tools',
    country: 'Indonesia',
    hoursPerWeek: '2-4 hours',
    quietRequired: false,
    tidyRequired: false,
  },
  system: {
    chosen: 'NFT (nutrient film technique)',
    summary:
      'Your garage has a working outlet on the north wall, a floor drain, and enough clear floor for two benches with a wide walkway between them. That combination is what NFT wants: continuous power for the pump, somewhere for water to go if a fitting lets go, and a run long enough to give the channels their fall.',
    options: [
      { key: 'nft', name: 'NFT', status: 'recommended', reason: 'Highest plant count for this footprint, and the space has the power and drainage it needs.', plantSites: 96, costTypical: 5921000 },
      { key: 'dwc', name: 'Deep water culture', status: 'workable', reason: 'Survives a power cut for hours rather than minutes, but fits about 40% fewer plants in the same area.', plantSites: 56, costTypical: 5480000 },
      { key: 'ebb', name: 'Ebb and flow', status: 'workable', reason: 'Forgiving and flexible, but needs a deeper bench and far more media, which raises the running cost.', plantSites: 72, costTypical: 6890000 },
      { key: 'kratky', name: 'Kratky', status: 'workable', reason: 'No pump at all, so nothing to fail, but it would use this space poorly and needs refilling by hand.', plantSites: 40, costTypical: 2240000 },
      { key: 'drip', name: 'Drip', status: 'ruled out', reason: 'Suits fruiting crops in media. Your brief asks for leafy greens, where drip adds cost and maintenance without adding yield.' },
      { key: 'tower', name: 'Vertical tower', status: 'ruled out', reason: 'Needs 2.2 m of clear height under the light. Your ceiling is 2.4 m, and the garage door track crosses at 2.05 m.' },
    ],
  },
  layout: {
    usableArea_mm: { x: 300, y: 140, w: 5200, d: 2820 },
    components,
    runs,
    walkways: [{ x: 400, y: 900, w: 5000, d: 1320 }],
  },
  warnings: [
    { id: 'w1', severity: 'caution', title: 'Each bench weighs about 190 kg when running', body: 'Channels, media, plants and water come to roughly 190 kg spread over the bench frame. That is fine on a concrete garage floor. Do not repeat this design on a suspended timber floor without checking it first.', anchorComponentId: 'bench-a' },
    { id: 'w2', severity: 'critical', title: 'The pump outlet needs residual-current protection', body: 'A pump sits in water and runs unattended. Its outlet must be on an RCD, and every cable must hang in a drip loop below the socket so water runs off rather than in. This is not a preference and the part is not substitutable.', anchorComponentId: 'timer-box' },
    { id: 'w3', severity: 'caution', title: 'NFT gives you about 40 minutes if the pump stops', body: 'There is no reservoir of water at the roots. A power cut on a hot afternoon will wilt the crop within the hour. If your supply is unreliable, deep water culture is the safer choice and it is one tap away under Refine.' },
    { id: 'w4', severity: 'note', title: 'The garage door track crosses at 2.05 m', body: 'Both benches and their lights clear it. It is the reason vertical towers were ruled out for this space.' },
  ],
  materials: [
    { id: 'm-frame', name: 'Bench frame, galvanised steel', spec: '40 x 40 mm box section, 800 mm tall', quantity: 2, unit: 'benches', phase: 2, priceLow: 420000, priceTypical: 620000, priceHigh: 980000, rationale: 'Sized to carry 190 kg per bench with a 2x margin, at a working height that suits harvesting standing up.', substitutes: 'Treated 45 x 45 mm timber, if you keep it out of standing water.' },
    { id: 'm-frame-connector', name: 'Frame connectors and bolts', spec: 'M8, galvanised', quantity: 48, unit: 'pieces', phase: 2, priceLow: 65000, priceTypical: 90000, priceHigh: 140000, rationale: 'Four per joint, twelve joints per bench.' },
    { id: 'm-channel', name: 'NFT channel', spec: '100 x 50 mm, 3.6 m lengths', quantity: 6, unit: 'lengths', phase: 3, priceLow: 720000, priceTypical: 1080000, priceHigh: 1560000, rationale: 'Three channels per bench at 180 mm centres, the spacing lettuce needs at full size without shading its neighbour.', substitutes: '110 mm PVC downpipe, cut and drilled. Cheaper, and about two hours more work.' },
    { id: 'm-endcap', name: 'Channel end caps', spec: 'Matched to channel profile', quantity: 12, unit: 'pieces', phase: 3, priceLow: 60000, priceTypical: 96000, priceHigh: 150000, rationale: 'One per channel end, with the outlet end drilled to 32 mm.' },
    { id: 'm-netpot', name: 'Net pots', spec: '80 mm, slotted', quantity: 96, unit: 'pots', phase: 3, priceLow: 190000, priceTypical: 290000, priceHigh: 430000, rationale: '16 per channel at 215 mm centres. This number is your plant count.' },
    { id: 'm-reservoir', name: 'Reservoir tank', spec: '120 L, opaque, food grade', quantity: 1, unit: 'tank', phase: 4, priceLow: 320000, priceTypical: 450000, priceHigh: 720000, rationale: 'Roughly 1.2 L per plant site, so the solution stays stable between changes. Opaque because light in the tank grows algae.' },
    { id: 'm-lid', name: 'Reservoir lid and grommets', spec: 'Cut to suit, 32 mm grommets', quantity: 1, unit: 'set', phase: 4, priceLow: 45000, priceTypical: 70000, priceHigh: 110000, rationale: 'Keeps light and mosquitoes out; grommets stop the return line chafing.' },
    { id: 'm-pump', name: 'Submersible pump', spec: '2000 L/h, 2.5 m head', quantity: 1, unit: 'pump', phase: 4, priceLow: 260000, priceTypical: 380000, priceHigh: 620000, rationale: 'Six channels at 1.5 L/min each, plus 60% margin for head loss over the 3.2 m rise and the fittings.', safetyCritical: true },
    { id: 'm-pipe-feed', name: 'Feed pipe and fittings', spec: '20 mm LDPE, elbows, tees, drippers', quantity: 14, unit: 'metres', phase: 5, priceLow: 180000, priceTypical: 260000, priceHigh: 400000, rationale: 'Measured along the routed run with 15% added for cuts and mistakes.' },
    { id: 'm-pipe-return', name: 'Return pipe and fittings', spec: '32 mm, laid to a 1:100 fall', quantity: 9, unit: 'metres', phase: 5, priceLow: 150000, priceTypical: 210000, priceHigh: 330000, rationale: 'Oversized deliberately. A return line that backs up floods the floor, and 32 mm never does.' },
    { id: 'm-led', name: 'LED grow bar', spec: '120 cm, full spectrum, 40 W', quantity: 6, unit: 'bars', phase: 6, priceLow: 900000, priceTypical: 1320000, priceHigh: 2400000, rationale: 'Your two windows give useful light for about four hours. Three bars per bench cover the rest of the day at 450 mm above the canopy.' },
    { id: 'm-rcd', name: 'RCD outlet', spec: '30 mA, weatherproof enclosure', quantity: 1, unit: 'unit', phase: 6, priceLow: 180000, priceTypical: 260000, priceHigh: 420000, rationale: 'Required wherever a pump runs unattended near water. Do not substitute this line.', safetyCritical: true },
    { id: 'm-timer', name: 'Timer', spec: 'Digital, minute resolution', quantity: 1, unit: 'unit', phase: 6, priceLow: 70000, priceTypical: 110000, priceHigh: 190000, rationale: 'NFT runs continuously by day; the timer is for the night cycle and for the leak test.' },
    { id: 'm-meter', name: 'pH and EC meters', spec: 'Pen type, with calibration fluid', quantity: 1, unit: 'set', phase: 7, priceLow: 240000, priceTypical: 380000, priceHigh: 720000, rationale: 'Without these you are guessing, and guessing is what kills a first crop.' },
    { id: 'm-nutrient', name: 'Nutrient concentrate', spec: 'Two-part A and B, 1 L each', quantity: 1, unit: 'set', phase: 7, priceLow: 130000, priceTypical: 190000, priceHigh: 320000, rationale: 'Roughly three months at this volume and plant count.' },
    { id: 'm-media', name: 'Growing media', spec: 'Rockwool cubes, 25 mm', quantity: 100, unit: 'cubes', phase: 8, priceLow: 90000, priceTypical: 140000, priceHigh: 220000, rationale: '96 sites plus spares, because some seed will not come up.' },
    { id: 'm-seed', name: 'Seed', spec: 'Lettuce, pak choi, basil', quantity: 3, unit: 'packets', phase: 8, priceLow: 45000, priceTypical: 75000, priceHigh: 130000, rationale: 'All three are forgiving, fast, and hard to kill in NFT. Start here.' },
  ],
  cost: {
    buildLow: 4065000,
    buildTypical: 5921000,
    buildHigh: 9870000,
    currency: 'IDR',
    surveyedOn: '2026-07-14',
    running: [
      { key: 'power', label: 'Electricity', monthly: 138000, detail: 'Pump 45 W continuous plus 240 W of light for 12 hours, at 1,700 IDR per kWh' },
      { key: 'nutrient', label: 'Nutrients', monthly: 64000, detail: 'One two-part set every three months at this volume' },
      { key: 'media', label: 'Media', monthly: 47000, detail: '96 fresh cubes per cycle, about six weeks per cycle' },
      { key: 'seed', label: 'Seed', monthly: 25000, detail: 'Three varieties, resown each cycle' },
    ],
  },
  phases: [
    {
      index: 1,
      title: 'Before you start',
      summary: 'Clear the floor, confirm the outlet works, and sow seed. It needs a head start on the build.',
      steps: [
        { id: 's1-1', title: 'Sow your seed today', body: 'Soak the rockwool cubes, sow two seeds per cube, and keep them somewhere bright and warm. They need about three weeks to be ready for the channels, which is roughly how long the rest of this build will take you.', minutes: 30, parts: ['Rockwool cubes', 'Seed'], tools: ['Tray'], verify: 'Cubes are damp but not dripping, and the tray sits somewhere that stays above 18 C.' },
        { id: 's1-2', title: 'Clear and sweep the bay', body: 'You need the full 5.2 x 2.8 m clear. Move anything stored along the north wall, because that is where the reservoir and the outlet are.', minutes: 45, parts: [], tools: ['Broom'], verify: 'You can walk the whole footprint without stepping over anything.' },
        { id: 's1-3', title: 'Check the outlet', body: 'Confirm the north-wall outlet is live and find out which breaker it is on. You will be switching it off repeatedly later.', minutes: 15, parts: [], tools: ['Socket tester'], verify: 'The outlet reads correct wiring, and you know its breaker by name.', safety: 'If the tester shows anything but correct wiring, stop and get an electrician before going further.' },
      ],
    },
    {
      index: 2,
      title: 'Build the benches',
      summary: 'Two frames, level along their length, with a deliberate fall across it.',
      steps: [
        { id: 's2-a1', title: 'Assemble both frames', body: 'Bolt the box section into two 3.6 x 0.6 m frames at 800 mm working height. Hand tight first, everything square, then final tighten.', minutes: 90, parts: ['Bench frame', 'Frame connectors and bolts'], tools: ['Spanner', 'Square'], verify: 'Diagonals measure the same on both frames, within 5 mm.', componentIds: ['bench-a', 'bench-b'] },
        { id: 's2-2', title: 'Set the fall', body: 'Shim the outlet end down so each frame drops 36 mm over its 3.6 m length. That is a 1:100 fall: enough to move a film of water, gentle enough that it does not run off and leave roots dry.', minutes: 40, parts: [], tools: ['Spirit level', 'Shims', 'Tape measure'], verify: 'A marble placed at the high end rolls slowly and does not stop.' },
      ],
    },
    {
      index: 3,
      title: 'Fit channels and pots',
      summary: 'Six channels, ninety-six holes, all of it dry work.',
      steps: [
        { id: 's3-a1', title: 'Mark and cut the pot holes', body: 'Mark 16 centres per channel at 215 mm spacing, starting 100 mm from the high end. Cut with an 80 mm hole saw, then deburr, because a rough edge shreds roots at harvest.', minutes: 120, parts: ['NFT channel'], tools: ['Hole saw 80 mm', 'Drill', 'File'], verify: 'A net pot drops in and sits on its lip without forcing.', componentIds: ['channel-a1', 'channel-a2', 'channel-a3'] },
        { id: 's3-b1', title: 'Fit end caps', body: 'Cap both ends of every channel. Drill the low end to 32 mm for the return.', minutes: 45, parts: ['Channel end caps'], tools: ['Hole saw 32 mm'], verify: 'Caps are seated all round with no daylight at the seam.', componentIds: ['channel-b1', 'channel-b2', 'channel-b3'] },
        { id: 's3-b2', title: 'Set the channels on the benches', body: 'Three per bench at 180 mm centres. Check each one follows the frame fall rather than fighting it.', minutes: 40, parts: [], tools: ['Spirit level'], verify: 'Water poured in the high end reaches the low end without pooling anywhere.' },
      ],
    },
    {
      index: 4,
      title: 'Reservoir and pump',
      summary: 'Everything wet, still with the power off.',
      steps: [
        { id: 's4-1', title: 'Position the reservoir', body: 'Under bench A, against the north wall. Cut the lid for the return line and the pump cable.', minutes: 30, parts: ['Reservoir tank', 'Reservoir lid and grommets'], tools: ['Jigsaw'], verify: 'The lid sits flat with the tank in place under the bench, and you can still lift it off.', componentIds: ['reservoir'] },
        { id: 's4-2', title: 'Set the pump', body: 'Stand the pump on a brick rather than the tank floor, so it does not draw sediment. Route the cable up and out through its grommet.', minutes: 20, parts: ['Submersible pump'], tools: [], verify: 'The pump sits about 40 mm clear of the tank bottom and stays upright when the tank is full.', componentIds: ['pump'] },
      ],
    },
    {
      index: 5,
      title: 'Plumb it',
      summary: 'Feed up, return down, everything dry-fitted before it is committed.',
      steps: [
        { id: 's5-1', title: 'Run the feed lines', body: 'From the pump up the wall, across at 1.15 m, and down to the high end of each bench. Dry-fit the whole run before you glue or clamp anything.', minutes: 75, parts: ['Feed pipe and fittings'], tools: ['Pipe cutter'], verify: 'Every joint is home, and the run has no dips that would hold water.', componentIds: ['pump'] },
        { id: 's5-2', title: 'Run the returns', body: '32 mm from each channel outlet back to the reservoir, keeping a constant fall the whole way. This is the line that floods your floor if you get it wrong.', minutes: 60, parts: ['Return pipe and fittings'], tools: ['Spirit level'], verify: 'The line falls continuously. Check with a level at three points, not one.', componentIds: ['reservoir'] },
      ],
    },
    {
      index: 6,
      title: 'Power',
      summary: 'The only phase where the mains is involved. Read the whole phase before starting it.',
      steps: [
        { id: 's6-1', title: 'Hang the lights', body: 'Three bars per bench, 450 mm above where the canopy will be, not above where the seedlings are now.', minutes: 50, parts: ['LED grow bar'], tools: ['Drill'], verify: 'A tape from the channel surface to the bar reads 450 mm at both ends.', componentIds: ['led-a', 'led-b'] },
        { id: 's6-2', title: 'Fit the RCD outlet and timer', body: 'Mount the enclosure on the north wall at 1.2 m, well away from the benches. Every cable entering it hangs in a drip loop below the socket.', minutes: 40, parts: ['RCD outlet', 'Timer'], tools: ['Drill', 'Screwdriver'], verify: 'Press the RCD test button. It trips. Reset it.', safety: 'Breaker off before you open anything. If the enclosure needs wiring into a circuit rather than plugging in, that is work for an electrician, not for you.', componentIds: ['timer-box'] },
      ],
    },
    {
      index: 7,
      title: 'Leak test on plain water',
      summary: 'A full run with nothing but tap water. Do not skip this and do not shorten it.',
      steps: [
        { id: 's7-1', title: 'Fill and run for two hours', body: 'Fill the reservoir with plain water. Run the pump and watch. Check every joint, both returns, and the floor under the benches at 10 minutes, 30 minutes and two hours.', minutes: 120, parts: [], tools: ['Paper towel'], verify: 'Dry paper towel under every joint after two hours, and the reservoir level has not dropped.', safety: 'Plain water only. Nutrients now would mean draining and refilling if something needs adjusting.' },
        { id: 's7-2', title: 'Check the film depth', body: 'Water in the channels should be a film 2-3 mm deep, not a stream. Adjust the pump or the tap until it is.', minutes: 20, parts: [], tools: ['Ruler'], verify: 'A ruler laid in the channel reads under 3 mm along the whole run.' },
      ],
    },
    {
      index: 8,
      title: 'Commission and plant',
      summary: 'Nutrients in, seedlings across, and the first four weeks begin.',
      steps: [
        { id: 's8-1', title: 'Mix and set the solution', body: 'Add part A, stir, then part B. Never together in concentrate. Target EC 1.2 and pH 5.8 to 6.2 for young leafy greens.', minutes: 40, parts: ['Nutrient concentrate', 'pH and EC meters'], tools: [], verify: 'Meter reads EC 1.2 plus or minus 0.1, and pH between 5.8 and 6.2 after fifteen minutes of circulation.', safety: 'A and B concentrates react if mixed directly. Always into water, always separately.' },
        { id: 's8-2', title: 'Transplant the seedlings', body: 'Move each cube into a net pot once it has two true leaves and roots showing underneath. Firm it so the roots touch the film.', minutes: 60, parts: ['Growing media'], tools: [], verify: 'Every pot has a seedling with roots reaching the channel floor, and no cube is sitting dry.', componentIds: ['plants-a1', 'plants-b1'] },
      ],
    },
  ],
  grow: {
    crops: [
      { name: 'Lettuce', sites: 48, spacing_mm: 215, firstHarvestDays: 35, yieldPerCycle: 'about 9 kg' },
      { name: 'Pak choi', sites: 24, spacing_mm: 215, firstHarvestDays: 40, yieldPerCycle: 'about 5 kg' },
      { name: 'Basil', sites: 24, spacing_mm: 215, firstHarvestDays: 45, yieldPerCycle: 'cut and come again' },
    ],
    targets: [
      { key: 'ph', label: 'pH', value: '5.8 - 6.2' },
      { key: 'ec', label: 'EC', value: '1.2 - 1.8 mS/cm' },
      { key: 'temp', label: 'Solution temperature', value: 'below 24 C' },
      { key: 'change', label: 'Full solution change', value: 'every 14 days' },
      { key: 'light', label: 'Light', value: '14 hours per day' },
    ],
    firstWeeks: [
      { week: 'Week 1', what: 'Check pH daily. It moves most in the first week. Top up with plain water, not nutrient, as the level drops.' },
      { week: 'Week 2', what: 'Roots should reach the channel floor. First full solution change at day 14.' },
      { week: 'Week 3', what: 'Raise EC toward 1.8 as growth speeds up. Watch for yellowing lower leaves, which means it is time.' },
      { week: 'Week 4', what: 'The canopy closes. Check the lights are still 450 mm above it and raise them if not.' },
    ],
  },
  buildProgress: ['s1-1', 's1-2', 's1-3', 's2-a1', 's2-2', 's3-a1', 's3-b1'],
};

export const balconyDesign: Design = {
  ...garageDesign,
  id: 'dsg_2c81',
  slug: 'balcony-kratky-18',
  name: 'Balcony Kratky, 18 sites',
  spaceId: 'spc_balcony',
  status: 'kept',
  version: 1,
  updatedOn: '2026-08-09',
  published: { slug: 'balcony-kratky-18', publishedOn: '2026-08-12', adaptations: 7, version: 1 },
  system: {
    chosen: 'Kratky',
    summary:
      'No outlet reaches the balcony, and running an extension through a doorway that has to close is not a design. Kratky needs no pump at all: the water level drops as the plant drinks, and the gap that opens up is what feeds the roots air.',
    options: garageDesign.system.options,
  },
  cost: { ...garageDesign.cost, buildLow: 640000, buildTypical: 910000, buildHigh: 1480000 },
  buildProgress: [],
};

export const spaces: Space[] = [
  {
    id: 'spc_garage',
    name: 'Garage',
    kind: 'garage',
    bounds_mm: { w: 5800, d: 3100, h: 2400 },
    dimensionConfidence: 'high',
    photoCount: 3,
    capturedOn: '2026-08-02',
    designIds: ['dsg_7f2a'],
    notes: 'Door track crosses at 2.05 m. Floor drain in the north-east corner.',
    findings: [
      { key: 'dims', label: 'Floor area', value: '5.80 x 3.10 m', confidence: 'high', detail: 'Calibrated against the standard door in frame' },
      { key: 'height', label: 'Ceiling height', value: '2.40 m', confidence: 'high' },
      { key: 'floor', label: 'Floor', value: 'Bare concrete', confidence: 'high', detail: 'Takes the bench load without checking' },
      { key: 'light', label: 'Natural light', value: 'Two windows, east facing', confidence: 'medium', detail: 'About four useful hours; lighting is sized for the rest' },
      { key: 'power', label: 'Power', value: 'One outlet, north wall', confidence: 'high' },
      { key: 'water', label: 'Water', value: 'Tap outside, floor drain inside', confidence: 'medium' },
      { key: 'obstruction', label: 'Obstructions', value: 'Door track at 2.05 m', confidence: 'high' },
    ],
  },
  {
    id: 'spc_balcony',
    name: 'Back balcony',
    kind: 'balcony',
    bounds_mm: { w: 2400, d: 1100, h: 2600 },
    dimensionConfidence: 'medium',
    photoCount: 2,
    capturedOn: '2026-07-19',
    designIds: ['dsg_2c81'],
    findings: [
      { key: 'dims', label: 'Floor area', value: '2.40 x 1.10 m', confidence: 'medium', detail: 'No reference object in frame; you confirmed the railing height' },
      { key: 'light', label: 'Natural light', value: 'Six hours, north facing', confidence: 'high' },
      { key: 'power', label: 'Power', value: 'None found', confidence: 'high', detail: 'Every pumped system was ruled out because of this' },
      { key: 'water', label: 'Water', value: 'Carried from indoors', confidence: 'high' },
    ],
  },
];

export const versions: Version[] = [
  { n: 3, on: '2026-08-28', summary: 'Widened the walkway to 1.32 m after you dragged the usable area in.', system: 'NFT', plantSites: 96, costTypical: 5921000 },
  { n: 2, on: '2026-08-14', summary: 'Switched from deep water culture to NFT. Cost fell, plant count rose, and the pump became a single point of failure.', system: 'NFT', plantSites: 96, costTypical: 6140000 },
  { n: 1, on: '2026-08-02', summary: 'First design from the photo.', system: 'Deep water culture', plantSites: 56, costTypical: 5480000 },
];

export const commons: CommonsEntry[] = [
  {
    slug: 'balcony-kratky-18',
    title: 'Balcony Kratky, no pump, no outlet',
    note: 'Built this on a rented balcony where drilling anything was out of the question. Everything sits on the floor and comes apart in ten minutes. If I did it again I would use opaque tubs from the start. The clear ones grew algae within a fortnight and I ended up wrapping them anyway.',
    author: { handle: 'rifqi', bio: 'Third floor, north facing, no power outside.' },
    publishedOn: '2026-08-12',
    adaptations: 7,
    spaceKind: 'balcony',
    footprint: '2.4 x 1.1 m',
    system: 'Kratky',
    plantSites: 18,
    costTypical: 910000,
    currency: 'IDR',
    skill: 'assemble only',
    crops: 'Lettuce, kangkung',
    designId: 'dsg_2c81',
  },
  {
    slug: 'spare-room-dwc-40',
    title: 'Spare room DWC that survives blackouts',
    note: 'Our power goes out most weeks, so I wanted something that would not die in an afternoon. Deep water culture holds enough at the roots that a six-hour cut does nothing. Fewer plants than NFT in the same room, and I have never regretted the trade.',
    author: { handle: 'ptrwn', bio: 'Growing in a converted spare room since 2024.' },
    publishedOn: '2026-06-30',
    adaptations: 23,
    spaceKind: 'spare room',
    footprint: '3.2 x 2.6 m',
    system: 'Deep water culture',
    plantSites: 40,
    costTypical: 3840000,
    currency: 'IDR',
    skill: 'basic tools',
    crops: 'Lettuce, pak choi',
    designId: 'dsg_7f2a',
  },
  {
    slug: 'carport-nft-120',
    title: 'Carport NFT under an existing roof',
    note: 'The roof was already there, which saved the whole cost of a structure. Wind was the real problem, not light. I added a mesh screen on the open side after the first crop got shredded.',
    author: { handle: 'daniswara', bio: 'Semarang. Mostly leafy greens for the family.' },
    publishedOn: '2026-05-18',
    adaptations: 31,
    spaceKind: 'open field',
    footprint: '6.0 x 3.4 m',
    system: 'NFT',
    plantSites: 120,
    costTypical: 7250000,
    currency: 'IDR',
    skill: 'happy to cut and drill',
    crops: 'Lettuce, selada, basil',
    designId: 'dsg_7f2a',
  },
  {
    slug: 'kitchen-window-kratky-6',
    title: 'Six jars on a kitchen window',
    note: 'The smallest thing worth publishing. Six jars, no pump, no light beyond the window. My first build and the reason I kept going.',
    author: { handle: 'ayu.h', bio: 'Started with jars, still mostly jars.' },
    publishedOn: '2026-08-25',
    adaptations: 4,
    spaceKind: 'spare room',
    footprint: '0.9 x 0.3 m',
    system: 'Kratky',
    plantSites: 6,
    costTypical: 185000,
    currency: 'IDR',
    skill: 'assemble only',
    crops: 'Basil, mint',
    designId: 'dsg_2c81',
  },
  {
    slug: 'basement-dwc-tent-32',
    title: 'Basement DWC in a grow tent',
    note: 'No natural light at all, so lighting is most of the cost and all of the electricity bill. Worth knowing that before you start rather than after the first month.',
    author: { handle: 'kurnia', bio: 'Basement, entirely artificial light.' },
    publishedOn: '2026-04-02',
    adaptations: 12,
    spaceKind: 'basement',
    footprint: '2.4 x 1.2 m',
    system: 'Deep water culture',
    plantSites: 32,
    costTypical: 5600000,
    currency: 'IDR',
    skill: 'basic tools',
    crops: 'Lettuce, rocket',
    designId: 'dsg_7f2a',
  },
];

export const designs: Design[] = [garageDesign, balconyDesign];

export function getDesign(id: string): Design {
  return designs.find((d) => d.id === id || d.slug === id) ?? garageDesign;
}

export function getSpace(id: string): Space {
  return spaces.find((s) => s.id === id) ?? spaces[0];
}

export function getCommonsEntry(slug: string): CommonsEntry {
  return commons.find((c) => c.slug === slug) ?? commons[0];
}

export function plantSites(d: Design): number {
  return d.layout.components
    .filter((c) => c.layer === 'plants')
    .reduce((n, c) => n + (c.instances?.count ?? 1), 0);
}

export function formatIDR(n: number): string {
  return 'Rp' + n.toLocaleString('id-ID');
}

export function formatShortIDR(n: number): string {
  if (n >= 1000000) {
    const juta = n / 1000000;
    return 'Rp' + juta.toFixed(juta >= 10 ? 1 : 2).replace(/0+$/, '').replace(/\.$/, '') + ' jt';
  }
  return 'Rp' + Math.round(n / 1000) + 'rb';
}
