'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/chrome';
import { Button, Card, Measure, ConfidenceTag } from '@/components/ui';

/**
 * P-04, and the confidence gate at P-05.
 *
 * Progress reports what was actually found, stage by stage. When the
 * measurement is not trustworthy the flow stops and asks one specific
 * question rather than guessing.
 */

const stages = [
  { key: 'read', label: 'Reading the photo', finding: 'A garage bay, photographed from the doorway' },
  { key: 'scale', label: 'Measuring the space', finding: 'About 5.80 by 3.10 m, ceiling 2.40 m' },
  { key: 'surfaces', label: 'Reading surfaces', finding: 'Bare concrete floor, takes the load' },
  { key: 'light', label: 'Working out the light', finding: 'Two east windows, about four useful hours' },
  { key: 'services', label: 'Finding power and water', finding: 'One outlet on the north wall, floor drain' },
  { key: 'system', label: 'Choosing a system', finding: 'NFT, on power and drainage' },
  { key: 'layout', label: 'Placing components', finding: '96 sites across two benches' },
  { key: 'cost', label: 'Pricing the parts', finding: 'About Rp5,9 jt typical' },
];

export default function AnalyzingPage() {
  const [step, setStep] = useState(0);
  const [gate, setGate] = useState(false);

  useEffect(() => {
    if (gate) return;
    if (step >= stages.length) return;
    const t = setTimeout(() => {
      // The confidence gate interrupts after the measuring stage.
      if (step === 1) setGate(true);
      setStep((s) => s + 1);
    }, step === 0 ? 700 : 900);
    return () => clearTimeout(t);
  }, [step, gate]);

  const done = step >= stages.length;

  if (gate) {
    return (
      <>
        <SiteHeader variant="minimal" />
        <main id="main" className="mx-auto max-w-[720px] px-4 py-12 sm:px-6">
          <span className="label">Paused, one question</span>
          <h1 className="mb-3 mt-2 text-[30px]">Is this wall about 3.2 m wide?</h1>
          <p className="mb-6 max-w-[54ch] text-ink-2">
            There was nothing of known size in the frame, so this measurement comes from the
            proportions of the room alone. Everything downstream depends on it, so it is worth thirty
            seconds of your time.
          </p>

          <div className="graph-paper mb-6 flex aspect-[16/10] items-center justify-center rounded-[5px] border border-line">
            <div className="text-center">
              <Measure value="3.20 m" className="text-[34px] font-semibold text-blueprint-ink" />
              <div className="label mt-2">the wall in question</div>
              <div className="mt-3"><ConfidenceTag level="low" /></div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => setGate(false)}>Yes, close enough</Button>
            <Button size="lg" variant="secondary" onClick={() => setGate(false)}>
              Let me correct it
            </Button>
            <Button size="lg" variant="ghost" href="/dashboard">
              I will measure and come back
            </Button>
          </div>

          <p className="mt-6 text-xs text-ink-3">
            Answering picks up where the analysis left off. The expensive part is not repeated.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader variant="minimal" />
      <main id="main" className="mx-auto max-w-[720px] px-4 py-12 sm:px-6">
        <span className="label">{done ? 'Done' : 'Working'}</span>
        <h1 className="mb-2 mt-2 text-[30px]">
          {done ? 'Your design is ready.' : 'Designing your setup'}
        </h1>
        <p className="mb-8 max-w-[52ch] text-ink-2">
          {done
            ? 'Two benches, 96 plant sites, and a walkway wide enough to actually work in.'
            : 'This usually takes about a minute and a half. You can watch what it finds.'}
        </p>

        <Card className="divide-y divide-line">
          {stages.map((s, i) => {
            const state = i < step ? 'done' : i === step ? 'active' : 'waiting';
            return (
              <div key={s.key} className="flex items-start gap-3 p-4">
                <span
                  aria-hidden="true"
                  className={`mt-[2px] grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] ${
                    state === 'done'
                      ? 'bg-canopy text-white'
                      : state === 'active'
                        ? 'border-2 border-canopy'
                        : 'border border-line-2'
                  }`}
                >
                  {state === 'done' ? 'y' : ''}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm ${state === 'waiting' ? 'text-ink-3' : 'text-ink'}`}
                  >
                    {s.label}
                  </div>
                  {state === 'done' ? (
                    <p className="mt-0.5 text-xs text-ink-2">{s.finding}</p>
                  ) : state === 'active' ? (
                    <div className="shimmer mt-1.5 h-3 w-1/2 rounded-[2px]" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </Card>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {done ? (
            <Button size="lg" href="/designs/dsg_7f2a">See your design</Button>
          ) : (
            <Link href="/new" className="text-sm text-ink-3 hover:text-ink">
              Cancel and start again
            </Link>
          )}
        </div>
      </main>
    </>
  );
}
