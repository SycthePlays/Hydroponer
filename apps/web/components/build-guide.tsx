'use client';

import { useMemo, useState } from 'react';
import type { Design } from '@/lib/types';
import { Card, Measure } from './ui';

/**
 * P-09. Read one-handed, in a garage, with dirty hands, over several days.
 * Progress is a property of the design, not a project tracker.
 */

export function BuildGuide({ design }: { design: Design }) {
  const [done, setDone] = useState<Set<string>>(new Set(design.buildProgress ?? []));
  const [open, setOpen] = useState<number | null>(null);

  const allSteps = useMemo(() => design.phases.flatMap((p) => p.steps), [design]);
  const totalMinutes = allSteps.reduce((n, s) => n + s.minutes, 0);
  const remaining = allSteps.filter((s) => !done.has(s.id)).reduce((n, s) => n + s.minutes, 0);
  const current = allSteps.find((s) => !done.has(s.id));
  const currentPhase = design.phases.find((p) => p.steps.some((s) => s.id === current?.id));
  const completed = allSteps.length - allSteps.filter((s) => !done.has(s.id)).length;
  const pct = Math.round((completed / allSteps.length) * 100);

  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const openPhase = open ?? currentPhase?.index ?? 1;

  return (
    <div className="pb-24">
      <Card className="mb-6 p-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <span className="label">Progress</span>
          <span className="text-sm text-ink-2">
            <Measure value={pct} className="text-ink" />% done &middot;{' '}
            <Measure value={(remaining / 60).toFixed(1)} unit="hours" /> left of{' '}
            <Measure value={(totalMinutes / 60).toFixed(1)} unit="hours" />
          </span>
        </div>
        <div className="flex gap-1">
          {design.phases.map((p) => {
            const phaseDone = p.steps.filter((s) => done.has(s.id)).length;
            const frac = phaseDone / p.steps.length;
            return (
              <div
                key={p.index}
                className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3"
                title={p.title}
              >
                <div
                  className="h-full rounded-full bg-canopy transition-all"
                  style={{ width: `${frac * 100}%` }}
                />
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {design.phases.map((phase) => {
          const phaseDone = phase.steps.every((s) => done.has(s.id));
          const isOpen = openPhase === phase.index;
          const mins = phase.steps.reduce((n, s) => n + s.minutes, 0);

          return (
            <Card key={phase.index} className={phaseDone ? 'border-canopy/25 bg-canopy-wash/20' : ''}>
              <button
                onClick={() => setOpen(isOpen ? -1 : phase.index)}
                aria-expanded={isOpen}
                className="flex w-full items-baseline gap-3 px-4 py-4 text-left"
              >
                <span className="measure text-xs text-ink-3">
                  {String(phase.index).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-sans text-[16px] font-semibold text-ink">
                    {phase.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-2">{phase.summary}</span>
                </span>
                <span className="measure shrink-0 text-xs text-ink-3">
                  {phaseDone ? 'done' : mins >= 60 ? `${(mins / 60).toFixed(1)} h` : `${mins} min`}
                </span>
              </button>
              {isOpen ? <StepList steps={phase.steps} done={done} toggle={toggle} /> : null}
            </Card>
          );
        })}
      </div>

      {current ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur">
          <div className="mx-auto flex max-w-[860px] items-center gap-3 px-4 py-3 sm:px-6">
            <div className="min-w-0 flex-1">
              <div className="label">
                Phase <Measure value={currentPhase?.index ?? 1} /> of{' '}
                <Measure value={design.phases.length} />
              </div>
              <div className="truncate text-sm font-medium text-ink">{current.title}</div>
            </div>
            <button
              onClick={() => { setOpen(currentPhase?.index ?? 1); toggle(current.id); }}
              className="shrink-0 rounded-[4px] bg-canopy px-4 py-2 text-sm font-medium text-white hover:bg-canopy-ink"
            >
              Mark done
            </button>
          </div>
        </div>
      ) : (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-canopy/30 bg-canopy-wash/95 backdrop-blur">
          <div className="mx-auto flex max-w-[860px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
            <div className="min-w-0 flex-1">
              <div className="label text-canopy-ink">Built</div>
              <div className="text-sm text-ink">How did it go, and what did it actually cost?</div>
            </div>
            <button className="shrink-0 rounded-[4px] bg-canopy px-4 py-2 text-sm font-medium text-white hover:bg-canopy-ink">
              Tell us
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepList({
  steps, done, toggle,
}: {
  steps: Design['phases'][number]['steps'];
  done: Set<string>;
  toggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col divide-y divide-line border-t border-line">
      {steps.map((step) => {
        const isDone = done.has(step.id);
        return (
          <div key={step.id} className="flex gap-3 p-4">
            <button
              onClick={() => toggle(step.id)}
              aria-pressed={isDone}
              aria-label={isDone ? `Mark ${step.title} not done` : `Mark ${step.title} done`}
              className={`mt-[3px] grid h-5 w-5 shrink-0 place-items-center rounded-[4px] border text-[11px] transition-colors ${
                isDone
                  ? 'border-canopy bg-canopy text-white'
                  : 'border-line-2 bg-surface hover:border-canopy'
              }`}
            >
              {isDone ? 'y' : ''}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h4
                  className={`font-sans text-[15px] font-semibold ${
                    isDone ? 'text-ink-3 line-through' : 'text-ink'
                  }`}
                >
                  {step.title}
                </h4>
                <span className="measure text-xs text-ink-3">{step.minutes} min</span>
              </div>

              <p className="mt-1 text-sm leading-relaxed text-ink-2">{step.body}</p>

              {step.safety ? (
                <div className="mt-2.5 rounded-[4px] border border-clay/30 border-l-[3px] border-l-clay bg-clay-wash/50 p-3">
                  <div className="label mb-1 text-clay">Safety</div>
                  <p className="text-xs leading-relaxed text-ink-2">{step.safety}</p>
                </div>
              ) : null}

              {step.parts.length || step.tools.length ? (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {step.parts.map((p) => (
                    <span
                      key={p}
                      className="rounded-[3px] border border-canopy/25 bg-canopy-wash/50 px-2 py-[2px] text-[11px] text-canopy-ink"
                    >
                      {p}
                    </span>
                  ))}
                  {step.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded-[3px] border border-line px-2 py-[2px] text-[11px] text-ink-3"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}

              <p className="mt-2.5 border-t border-line pt-2 text-xs text-ink-2">
                <span className="text-ink-3">How you know it worked: </span>
                {step.verify}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
