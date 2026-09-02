import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/chrome';
import {
  Button, Card, Measure, ConfidenceTag, StatusPill, CostRange, WarningBlock, SectionHead,
} from '@/components/ui';
import { LayoutStudio } from '@/components/layout-studio';
import { DesignActions } from '@/components/design-actions';
import { getDesign, getSpace, formatIDR, formatShortIDR, plantSites } from '@/lib/data';

export async function generateStaticParams() {
  return [{ id: 'dsg_7f2a' }, { id: 'dsg_2c81' }];
}

const sections = [
  { id: 'space', label: 'Your space' },
  { id: 'brief', label: 'Your brief' },
  { id: 'system', label: 'The system' },
  { id: 'layout', label: 'The layout' },
  { id: 'grows', label: 'What it grows' },
  { id: 'materials', label: 'Made of' },
  { id: 'cost', label: 'Cost' },
  { id: 'build', label: 'Building it' },
];

export default async function DesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const design = getDesign(id);
  const space = getSpace(design.spaceId);
  const sites = plantSites(design);
  const runningTotal = design.cost.running.reduce((n, r) => n + r.monthly, 0);
  const totalMinutes = design.phases.reduce(
    (n, p) => n + p.steps.reduce((m, s) => m + s.minutes, 0), 0,
  );

  return (
    <>
      <SiteHeader variant="minimal" />

      {/* design header */}
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-end justify-between gap-4 px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label">{space.name}</span>
              <StatusPill status={design.status} />
              <span className="measure text-xs text-ink-3">v{design.version}</span>
            </div>
            <h1 className="text-[30px] sm:text-[36px]">{design.name}</h1>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
              <span><Measure value={sites} /> plant sites</span>
              <span>{design.system.chosen.split(' (')[0]}</span>
              <span><Measure value="5.80 &times; 3.10" unit="m" /></span>
              <span>{formatShortIDR(design.cost.buildTypical)} typical</span>
            </div>
          </div>
          <DesignActions designName={design.name} />
        </div>
      </div>

      {/* section nav */}
      <nav
        aria-label="Design sections"
        className="hide-scrollbar sticky top-14 z-30 overflow-x-auto border-b border-line bg-paper/90 backdrop-blur"
      >
        <div className="mx-auto flex max-w-[1180px] gap-1 px-4 py-2 sm:px-6">
          {sections.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex shrink-0 items-baseline gap-1.5 rounded-[4px] px-2.5 py-1 text-[13px] text-ink-2 hover:bg-surface-2 hover:text-ink"
            >
              <span className="measure text-[10px] text-ink-3">{i + 1}</span>
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <main id="main" className="mx-auto max-w-[1180px] px-4 pb-20 sm:px-6">
        {/* 1 — space */}
        <section className="scroll-mt-28 pt-10" id="space">
          <SectionHead n={1} title="Your space" />
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="graph-paper flex aspect-[4/3] items-center justify-center rounded-[5px] border border-line">
              <div className="px-6 text-center">
                <div className="label mb-2">Your photo</div>
                <p className="max-w-[30ch] text-sm text-ink-3">
                  The photo you uploaded, with the measurements marked on it. It stays private and is
                  never published with a design.
                </p>
              </div>
            </div>
            <Card className="divide-y divide-line">
              {space.findings.map((f) => (
                <div key={f.key} className="p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="text-sm font-medium text-ink">{f.label}</span>
                    <Measure value={f.value} className="text-sm text-ink" />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <p className="min-w-0 flex-1 text-xs text-ink-3">{f.detail ?? ''}</p>
                    <ConfidenceTag level={f.confidence} />
                  </div>
                </div>
              ))}
              <div className="p-4">
                <p className="text-xs text-ink-2">
                  Anything here that is wrong can be corrected, and the design is worked out again
                  from the corrected value.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* 2 — brief */}
        <section className="scroll-mt-28 pt-14" id="brief">
          <SectionHead n={2} title="Your brief">
            <Button size="sm" variant="secondary">Edit brief</Button>
          </SectionHead>
          <p className="mb-4 max-w-[62ch] text-sm text-ink-2">
            What you asked for. This is stored with the design and stays editable: change it and the
            whole design is worked out again, as a new version.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: 'Growing', v: design.brief.crops },
              { k: 'Budget', v: `${formatShortIDR(design.brief.budgetMin)} – ${formatShortIDR(design.brief.budgetMax)}` },
              { k: 'Building', v: design.brief.skill },
              { k: 'Where', v: design.brief.country },
              { k: 'Time per week', v: design.brief.hoursPerWeek ?? 'Not set' },
              { k: 'Must be quiet', v: design.brief.quietRequired ? 'Yes' : 'No' },
              { k: 'Must look tidy', v: design.brief.tidyRequired ? 'Yes' : 'No' },
              { k: 'Currency', v: design.brief.currency },
            ].map((b) => (
              <Card key={b.k} className="p-4">
                <div className="label mb-1.5">{b.k}</div>
                <div className="text-sm text-ink">{b.v}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* 3 — system */}
        <section className="scroll-mt-28 pt-14" id="system">
          <SectionHead n={3} title="The system" />
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Card className="p-6">
              <div className="label mb-2 text-canopy-ink">Recommended</div>
              <h3 className="mb-3 text-[24px]">{design.system.chosen}</h3>
              <p className="text-[15px] leading-relaxed text-ink-2">{design.system.summary}</p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-4 text-sm">
                <span className="text-ink-2">
                  <Measure value={sites} className="text-ink" /> plant sites
                </span>
                <span className="text-ink-2">
                  <Measure value={formatShortIDR(design.cost.buildTypical)} className="text-ink" /> typical
                </span>
                <span className="text-ink-2">
                  <Measure value={Math.round(totalMinutes / 60)} className="text-ink" /> hours to build
                </span>
              </div>
            </Card>

            <div className="flex flex-col gap-3">
              <details className="rounded-[5px] border border-line bg-surface" open>
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-ink-2 hover:text-ink">
                  Other options for this space
                </summary>
                <ul className="divide-y divide-line border-t border-line">
                  {design.system.options
                    .filter((o) => o.status !== 'recommended')
                    .map((o) => (
                      <li key={o.key} className="p-4">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-medium text-ink">{o.name}</span>
                          <span
                            className={`rounded-full border px-2 py-[1px] text-[10px] uppercase tracking-wider ${
                              o.status === 'workable'
                                ? 'border-line-2 text-ink-3'
                                : 'border-clay/30 bg-clay-wash/50 text-clay'
                            }`}
                          >
                            {o.status}
                          </span>
                          {o.plantSites ? (
                            <span className="measure ml-auto text-xs text-ink-3">{o.plantSites} sites</span>
                          ) : null}
                        </div>
                        <p className="text-xs leading-relaxed text-ink-2">{o.reason}</p>
                      </li>
                    ))}
                </ul>
              </details>
              <p className="text-xs text-ink-3">
                Options that were ruled out stay visible with their blockers, so you can see what
                would have to change for them to work.
              </p>
            </div>
          </div>
        </section>

        {/* 4 — layout */}
        <section className="scroll-mt-28 pt-14" id="layout">
          <SectionHead n={4} title="The layout">
            <Button size="sm" variant="secondary" href={`/designs/${design.id}/3d`}>
              Open 3D full screen
            </Button>
          </SectionHead>
          <p className="mb-4 max-w-[62ch] text-sm text-ink-2">
            One design, two drawings. The plan is what you build from; the 3D view is what makes it
            make sense. Both come from the same coordinates, so they cannot disagree.
          </p>
          <LayoutStudio design={design} />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {design.warnings.map((w) => (
              <WarningBlock key={w.id} warning={w} />
            ))}
          </div>
        </section>

        {/* 5 — grows */}
        <section className="scroll-mt-28 pt-14" id="grows">
          <SectionHead n={5} title="What it grows" />
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line-2 bg-surface-2">
                    <th className="label px-4 py-3 text-left">Crop</th>
                    <th className="label px-4 py-3 text-right">Sites</th>
                    <th className="label px-4 py-3 text-right">Spacing</th>
                    <th className="label px-4 py-3 text-right">First harvest</th>
                    <th className="label px-4 py-3 text-right">Per cycle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {design.grow.crops.map((c) => (
                    <tr key={c.name}>
                      <td className="px-4 py-3 text-ink">{c.name}</td>
                      <td className="px-4 py-3 text-right"><Measure value={c.sites} /></td>
                      <td className="px-4 py-3 text-right"><Measure value={c.spacing_mm} unit="mm" /></td>
                      <td className="px-4 py-3 text-right"><Measure value={c.firstHarvestDays} unit="days" /></td>
                      <td className="px-4 py-3 text-right text-ink-2">{c.yieldPerCycle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <Card className="p-5">
              <div className="label mb-3">Running targets</div>
              <dl className="flex flex-col divide-y divide-line">
                {design.grow.targets.map((t) => (
                  <div key={t.key} className="flex items-baseline justify-between gap-4 py-2">
                    <dt className="text-sm text-ink-2">{t.label}</dt>
                    <dd><Measure value={t.value} className="text-sm text-ink" /></dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </section>

        {/* 6 — materials */}
        <section className="scroll-mt-28 pt-14" id="materials">
          <SectionHead n={6} title="What it is made of">
            <Button size="sm" variant="secondary" href={`/designs/${design.id}/materials`}>
              Full list
            </Button>
          </SectionHead>
          <p className="mb-4 max-w-[62ch] text-sm text-ink-2">
            Every part the design specifies, grouped by the phase it is used in. This is a parts list,
            not a checkout: Hydroponer does not sell any of it and does not know where you buy it.
          </p>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-line-2 bg-surface-2">
                    <th className="label px-4 py-3 text-left">Part</th>
                    <th className="label px-4 py-3 text-left">Spec</th>
                    <th className="label px-4 py-3 text-right">Qty</th>
                    <th className="label px-4 py-3 text-right">Typical</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {design.materials.slice(0, 8).map((m) => (
                    <tr key={m.id}>
                      <td className="px-4 py-3">
                        <span className="text-ink">{m.name}</span>
                        {m.safetyCritical ? (
                          <span className="ml-2 rounded-full border border-clay/30 bg-clay-wash/50 px-1.5 py-[1px] text-[10px] uppercase tracking-wider text-clay">
                            Safety
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-ink-2"><Measure value={m.spec} className="text-xs" /></td>
                      <td className="px-4 py-3 text-right">
                        <Measure value={m.quantity} /> <span className="text-xs text-ink-3">{m.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-right"><Measure value={formatIDR(m.priceTypical)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-line px-4 py-3 text-xs text-ink-3">
              Showing 8 of <Measure value={design.materials.length} />.{' '}
              <Link href={`/designs/${design.id}/materials`} className="text-canopy-ink underline">
                See every part, why it was sized that way, and what you could substitute
              </Link>
              .
            </div>
          </Card>
        </section>

        {/* 7 — cost */}
        <section className="scroll-mt-28 pt-14" id="cost">
          <SectionHead n={7} title="What it would cost" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <div className="label mb-4">To build it</div>
              <CostRange
                low={design.cost.buildLow}
                typical={design.cost.buildTypical}
                high={design.cost.buildHigh}
                surveyedOn={design.cost.surveyedOn}
              />
              <p className="mt-4 border-t border-line pt-4 text-xs text-ink-2">
                Safety-critical parts stay at one quality across the whole range. The pump and the RCD
                cost the same whether you build to the low end or the high end.
              </p>
            </Card>

            <Card className="p-6">
              <div className="label mb-4">To run it, monthly</div>
              <div className="mb-4 flex items-baseline gap-2">
                <Measure
                  value={formatIDR(runningTotal)}
                  className="text-[26px] font-semibold leading-none text-ink"
                />
                <span className="text-sm text-ink-3">per month</span>
              </div>
              <dl className="flex flex-col divide-y divide-line">
                {design.cost.running.map((r) => (
                  <div key={r.key} className="py-2.5">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-sm text-ink">{r.label}</dt>
                      <dd><Measure value={formatIDR(r.monthly)} className="text-sm" /></dd>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-3">{r.detail}</p>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </section>

        {/* 8 — building it */}
        <section className="scroll-mt-28 pt-14" id="build">
          <SectionHead n={8} title="Building it">
            <Button size="sm" href={`/designs/${design.id}/build`}>Open the build guide</Button>
          </SectionHead>
          <p className="mb-4 max-w-[62ch] text-sm text-ink-2">
            <Measure value={design.phases.length} /> phases, about{' '}
            <Measure value={Math.round(totalMinutes / 60)} unit="hours" /> of work in total. Dry work
            before wet, plumbing before electrical, and a plain-water leak test before anything is
            committed.
          </p>
          <ol className="grid gap-3 sm:grid-cols-2">
            {design.phases.map((p) => {
              const mins = p.steps.reduce((n, s) => n + s.minutes, 0);
              const done = p.steps.every((s) => design.buildProgress?.includes(s.id));
              return (
                <li key={p.index}>
                  <Card className={`h-full p-4 ${done ? 'border-canopy/30 bg-canopy-wash/25' : ''}`}>
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="measure text-xs text-ink-3">
                        {String(p.index).padStart(2, '0')}
                      </span>
                      <h3 className="font-sans text-[15px] font-semibold text-ink">{p.title}</h3>
                      <span className="measure ml-auto text-xs text-ink-3">
                        {mins >= 60 ? `${(mins / 60).toFixed(1)} h` : `${mins} min`}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-ink-2">{p.summary}</p>
                    {done ? (
                      <div className="label mt-2 text-canopy-ink">Done</div>
                    ) : null}
                  </Card>
                </li>
              );
            })}
          </ol>

          <div className="mt-8">
            <h3 className="mb-3 text-[19px]">Then the first four weeks</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {design.grow.firstWeeks.map((w) => (
                <Card key={w.week} className="p-4">
                  <div className="label mb-1.5">{w.week}</div>
                  <p className="text-xs leading-relaxed text-ink-2">{w.what}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
