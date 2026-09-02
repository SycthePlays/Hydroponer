/**
 * The domain objects the interface renders.
 *
 * These mirror the shapes described in the project documentation
 * (docs/07-domain-model.md, docs/08-layout-generation.md,
 * docs/20-3d-visualization.md). The 2D plan, the 3D scene, the
 * materials list and the build guide are all derived from one
 * `Design` — there is never a second source of truth.
 */

export type Confidence = 'high' | 'medium' | 'low';

export type Vec3 = { x: number; y: number; z: number };

export type SpaceKind = 'garage' | 'balcony' | 'spare room' | 'greenhouse' | 'open field' | 'basement';

export interface Space {
  id: string;
  name: string;
  kind: SpaceKind;
  /** Interior bounds in millimetres. x = width, y = depth, z = height. */
  bounds_mm: { w: number; d: number; h: number };
  dimensionConfidence: Confidence;
  photoCount: number;
  capturedOn: string;
  findings: Finding[];
  notes?: string;
  designIds: string[];
}

export interface Finding {
  key: string;
  label: string;
  value: string;
  confidence: Confidence;
  detail?: string;
}

export interface Brief {
  crops: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  skill: 'assemble only' | 'basic tools' | 'happy to cut and drill';
  country: string;
  hoursPerWeek?: string;
  quietRequired?: boolean;
  tidyRequired?: boolean;
}

export type Layer = 'shell' | 'structure' | 'plumbing' | 'electrical' | 'lighting' | 'plants';

export interface PlacedComponent {
  id: string;
  label: string;
  layer: Layer;
  /** Position of the component's minimum corner, in millimetres. */
  position_mm: Vec3;
  size_mm: { w: number; d: number; h: number };
  rotation_deg?: number;
  /** Repeated geometry — net pots along a channel, plants in pots. */
  instances?: {
    count: number;
    /** Step between instances, in millimetres. */
    step_mm: Vec3;
  };
  shape?: 'box' | 'cylinder' | 'plant';
  materialLineIds: string[];
  buildStepIds: string[];
  phase: number;
}

export interface PlumbingRun {
  id: string;
  label: string;
  kind: 'feed' | 'return' | 'power';
  /** Polyline through the space, in millimetres. */
  points_mm: Vec3[];
  diameter_mm: number;
  phase: number;
}

export interface Warning {
  id: string;
  severity: 'note' | 'caution' | 'critical';
  title: string;
  body: string;
  anchorComponentId?: string;
}

export interface MaterialLine {
  id: string;
  name: string;
  spec: string;
  quantity: number;
  unit: string;
  phase: number;
  priceLow: number;
  priceTypical: number;
  priceHigh: number;
  /** Why the engine sized it this way. */
  rationale: string;
  substitutes?: string;
  safetyCritical?: boolean;
}

export interface BuildStep {
  id: string;
  title: string;
  body: string;
  minutes: number;
  parts: string[];
  tools: string[];
  verify: string;
  safety?: string;
  componentIds?: string[];
}

export interface BuildPhase {
  index: number;
  title: string;
  summary: string;
  steps: BuildStep[];
}

export interface SystemOption {
  key: string;
  name: string;
  status: 'recommended' | 'workable' | 'ruled out';
  reason: string;
  plantSites?: number;
  costTypical?: number;
}

export interface CostModel {
  buildLow: number;
  buildTypical: number;
  buildHigh: number;
  currency: string;
  surveyedOn: string;
  running: { key: string; label: string; monthly: number; detail: string }[];
}

export interface GrowPlan {
  crops: { name: string; sites: number; spacing_mm: number; firstHarvestDays: number; yieldPerCycle: string }[];
  targets: { key: string; label: string; value: string }[];
  firstWeeks: { week: string; what: string }[];
}

export type DesignStatus = 'draft' | 'kept' | 'building' | 'built' | 'archived';

export interface Design {
  id: string;
  slug: string;
  name: string;
  spaceId: string;
  status: DesignStatus;
  version: number;
  updatedOn: string;
  published: null | { slug: string; publishedOn: string; adaptations: number; version: number };
  brief: Brief;
  system: { chosen: string; summary: string; options: SystemOption[] };
  layout: {
    usableArea_mm: { x: number; y: number; w: number; d: number };
    components: PlacedComponent[];
    runs: PlumbingRun[];
    walkways: { x: number; y: number; w: number; d: number }[];
  };
  warnings: Warning[];
  materials: MaterialLine[];
  cost: CostModel;
  phases: BuildPhase[];
  grow: GrowPlan;
  buildProgress?: string[];
}

export interface Version {
  n: number;
  on: string;
  summary: string;
  system: string;
  plantSites: number;
  costTypical: number;
  published?: boolean;
}

export interface CommonsEntry {
  slug: string;
  title: string;
  note: string;
  author: { handle: string; bio: string };
  publishedOn: string;
  adaptations: number;
  spaceKind: SpaceKind;
  footprint: string;
  system: string;
  plantSites: number;
  costTypical: number;
  currency: string;
  skill: string;
  crops: string;
  designId: string;
  adaptedFrom?: string;
}
