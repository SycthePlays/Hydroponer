'use client';

import { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Design, Layer } from '@/lib/types';
import { Plan2D } from './plan-2d';
import { cameraPresets, type SceneSettings } from './scene-3d';

const Scene3D = dynamic(() => import('./scene-3d').then((m) => m.Scene3D), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-surface-2">
      <span className="label">Preparing the scene</span>
    </div>
  ),
});

const ALL_LAYERS: { key: Layer; label: string }[] = [
  { key: 'shell', label: 'Room' },
  { key: 'structure', label: 'Structure' },
  { key: 'plumbing', label: 'Plumbing' },
  { key: 'electrical', label: 'Electrical' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'plants', label: 'Plants' },
];

function hasWebGL(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function LayoutStudio({ design, fullBleed = false }: { design: Design; fullBleed?: boolean }) {
  const [tab, setTab] = useState<'plan' | '3d'>('3d');
  const [visible, setVisible] = useState<Set<Layer>>(
    new Set(['shell', 'structure', 'plumbing', 'electrical', 'lighting', 'plants']),
  );
  const [explode, setExplode] = useState(0);
  const [growth, setGrowth] = useState(1);
  const [phase, setPhase] = useState(8);
  const [spin, setSpin] = useState(false);
  const [preset, setPreset] = useState<keyof typeof cameraPresets>('isometric');
  const [selected, setSelected] = useState<string | null>(null);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const ok = hasWebGL();
    setWebgl(ok);
    if (!ok) setTab('plan');
  }, []);

  const toggle = (layer: Layer) =>
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });

  const settings: SceneSettings = { visible, explode, growth, phase, spin, preset };

  const selectedComponent = useMemo(
    () => design.layout.components.find((c) => c.id === selected) ?? null,
    [design, selected],
  );

  const selectedMaterials = useMemo(() => {
    if (!selectedComponent) return [];
    return design.materials.filter((m) => selectedComponent.materialLineIds.includes(m.id));
  }, [design, selectedComponent]);

  const selectedSteps = useMemo(() => {
    if (!selectedComponent) return [];
    return design.phases
      .flatMap((p) => p.steps)
      .filter((s) => selectedComponent.buildStepIds.includes(s.id));
  }, [design, selectedComponent]);

  const phaseTitle = design.phases.find((p) => p.index === phase)?.title ?? 'Finished';

  return (
    <div className="flex flex-col gap-3">
      {/* tab bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-[4px] border border-line bg-surface p-[3px]">
          {(['plan', '3d'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              disabled={t === '3d' && !webgl}
              aria-pressed={tab === t}
              className={`rounded-[3px] px-3 py-1 text-[13px] font-medium transition-colors disabled:opacity-40 ${
                tab === t ? 'bg-surface-3 text-ink' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {t === 'plan' ? 'Plan' : '3D'}
            </button>
          ))}
        </div>

        <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto">
          {ALL_LAYERS.map((l) => {
            const on = visible.has(l.key);
            return (
              <button
                key={l.key}
                onClick={() => toggle(l.key)}
                aria-pressed={on}
                className={`shrink-0 rounded-full border px-2.5 py-[3px] text-[12px] transition-colors ${
                  on
                    ? 'border-canopy/40 bg-canopy-wash text-canopy-ink'
                    : 'border-line bg-surface text-ink-3 line-through'
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* the drawing surface */}
      <div
        className={`relative overflow-hidden rounded-[5px] border border-line ${
          fullBleed ? 'h-[min(72vh,720px)]' : 'h-[420px] sm:h-[520px]'
        } ${tab === 'plan' ? 'graph-paper' : 'bg-surface-2'}`}
      >
        {tab === 'plan' ? (
          <div className="h-full w-full overflow-auto p-4">
            <Plan2D design={design} visible={visible} className="mx-auto max-w-[900px]" />
          </div>
        ) : (
          <Scene3D
            design={design}
            settings={settings}
            selected={selected}
            onSelect={setSelected}
            className="h-full w-full"
          />
        )}

        {tab === '3d' ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 p-3">
            <div className="pointer-events-auto flex flex-wrap gap-1 rounded-[4px] border border-line bg-paper/90 p-1 backdrop-blur">
              {(Object.keys(cameraPresets) as (keyof typeof cameraPresets)[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPreset(p)}
                  aria-pressed={preset === p}
                  className={`rounded-[3px] px-2 py-1 text-[11px] capitalize transition-colors ${
                    preset === p ? 'bg-surface-3 text-ink' : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSpin((s) => !s)}
              aria-pressed={spin}
              className="pointer-events-auto rounded-[4px] border border-line bg-paper/90 px-3 py-1.5 text-[12px] font-medium text-ink-2 backdrop-blur hover:text-ink"
            >
              {spin ? 'Stop spin' : 'Spin it'}
            </button>
          </div>
        ) : null}
      </div>

      {/* scene controls */}
      {tab === '3d' ? (
        <div className="grid gap-4 rounded-[5px] border border-line bg-surface p-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="explode" className="label">Exploded view</label>
            <input
              id="explode"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={explode}
              onChange={(e) => setExplode(Number(e.target.value))}
              className="accent-[var(--canopy)]"
            />
            <p className="text-xs text-ink-3">Pull the assembly apart to see how the parts fit.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phase" className="label">
              Build playback &mdash; phase <span className="measure">{phase}</span>
            </label>
            <input
              id="phase"
              type="range"
              min={1}
              max={8}
              step={1}
              value={phase}
              onChange={(e) => setPhase(Number(e.target.value))}
              className="accent-[var(--canopy)]"
            />
            <p className="text-xs text-ink-3">{phaseTitle}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="label">Plant size</span>
            <div className="inline-flex rounded-[4px] border border-line p-[3px]">
              <button
                onClick={() => setGrowth(0)}
                aria-pressed={growth === 0}
                className={`flex-1 rounded-[3px] px-2 py-1 text-[12px] ${growth === 0 ? 'bg-surface-3 text-ink' : 'text-ink-2'}`}
              >
                At transplant
              </button>
              <button
                onClick={() => setGrowth(1)}
                aria-pressed={growth === 1}
                className={`flex-1 rounded-[3px] px-2 py-1 text-[12px] ${growth === 1 ? 'bg-surface-3 text-ink' : 'text-ink-2'}`}
              >
                Fully grown
              </button>
            </div>
            <p className="text-xs text-ink-3">
              Check the mature canopy clears whatever is above it.
            </p>
          </div>
        </div>
      ) : null}

      {/* what is selected */}
      {selectedComponent ? (
        <div className="rounded-[5px] border border-canopy/30 bg-canopy-wash/40 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="font-sans text-[15px] font-semibold text-ink">{selectedComponent.label}</h4>
            <button onClick={() => setSelected(null)} className="text-xs text-ink-3 hover:text-ink">
              Clear
            </button>
          </div>
          <p className="mt-1 text-xs text-ink-2">
            <span className="measure">
              {selectedComponent.size_mm.w} &times; {selectedComponent.size_mm.d} &times; {selectedComponent.size_mm.h}
            </span>{' '}
            mm, at{' '}
            <span className="measure">
              x {selectedComponent.position_mm.x} &middot; y {selectedComponent.position_mm.y} &middot; z {selectedComponent.position_mm.z}
            </span>
            {selectedComponent.instances ? (
              <> &middot; <span className="measure">{selectedComponent.instances.count}</span> of them</>
            ) : null}
          </p>
          {selectedMaterials.length ? (
            <p className="mt-2 text-xs text-ink-2">
              <span className="text-ink-3">Costs:</span>{' '}
              {selectedMaterials.map((m) => m.name).join(', ')}
            </p>
          ) : null}
          {selectedSteps.length ? (
            <p className="mt-1 text-xs text-ink-2">
              <span className="text-ink-3">Installed by:</span>{' '}
              {selectedSteps.map((s) => s.title).join('; ')}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* the accessible primary: a real list of what is in the scene */}
      <details className="rounded-[5px] border border-line bg-surface">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-ink-2 hover:text-ink">
          Every component, as a list
        </summary>
        <div className="border-t border-line px-4 py-3">
          <p className="mb-3 text-xs text-ink-3">
            The same data the viewer draws from. Keyboard and screen-reader users get the design here
            in full rather than a summary of a canvas.
          </p>
          <ul className="flex flex-col divide-y divide-line">
            {design.layout.components.map((c) => (
              <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
                <span className="text-sm text-ink">
                  {c.label}
                  {c.instances ? <span className="text-ink-3"> &times;{c.instances.count}</span> : null}
                </span>
                <span className="measure text-xs text-ink-3">
                  {c.size_mm.w}&times;{c.size_mm.d}&times;{c.size_mm.h} mm &middot; {c.layer}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </details>

      {!webgl ? (
        <p className="rounded-[5px] border border-line border-l-[3px] border-l-blueprint bg-blueprint-wash/40 p-3 text-sm text-ink-2">
          Your browser cannot run the 3D view, so you are seeing the scaled plan instead. The plan is
          the drawing this design is actually built from, and it is complete.
        </p>
      ) : null}
    </div>
  );
}
