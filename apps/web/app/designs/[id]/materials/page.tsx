import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/chrome';
import { Button, Card, Measure, CostRange, SectionHead } from '@/components/ui';
import { getDesign, formatIDR } from '@/lib/data';

export async function generateStaticParams() {
  return [{ id: 'dsg_7f2a' }, { id: 'dsg_2c81' }];
}

export default async function MaterialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const design = getDesign(id);
  const byPhase = design.phases.map((p) => ({
    phase: p,
    lines: design.materials.filter((m) => m.phase === p.index),
  })).filter((g) => g.lines.length > 0);

  const totalLow = design.materials.reduce((n, m) => n + m.priceLow, 0);
  const totalTypical = design.materials.reduce((n, m) => n + m.priceTypical, 0);
  const totalHigh = design.materials.reduce((n, m) => n + m.priceHigh, 0);

  return (
    <>
      <SiteHeader variant="minimal" />
      <main id="main" className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6">
        <Link href={`/designs/${design.id}`} className="label hover:text-ink">
          &larr; Back to the design
        </Link>
        <h1 className="mb-2 mt-2 text-[32px]">What {design.name} is made of</h1>
        <p className="mb-6 max-w-[62ch] text-ink-2">
          Grouped by the build phase each part is used in, because that is the order you will want
          them. Hydroponer does not sell any of this and does not know where you buy it. Prices are a
          survey, not a quote.
        </p>

        <div className="mb-8 flex flex-wrap gap-3">
          <Button variant="secondary" size="sm">Download PDF</Button>
          <Button variant="secondary" size="sm">Export CSV</Button>
          <Button variant="secondary" size="sm">Copy as plain text</Button>
        </div>

        <Card className="mb-10 p-6">
          <div className="label mb-4">Parts total</div>
          <CostRange
            low={totalLow}
            typical={totalTypical}
            high={totalHigh}
            surveyedOn={design.cost.surveyedOn}
          />
        </Card>

        {byPhase.map(({ phase, lines }) => (
          <section key={phase.index} className="mb-10">
            <SectionHead n={phase.index} title={phase.title} />
            <div className="flex flex-col gap-3">
              {lines.map((m) => (
                <Card key={m.id} className="p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-sans text-[15px] font-semibold text-ink">{m.name}</h3>
                      {m.safetyCritical ? (
                        <span className="rounded-full border border-clay/30 bg-clay-wash/50 px-1.5 py-[1px] text-[10px] uppercase tracking-wider text-clay">
                          Safety critical
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-baseline gap-3 text-sm">
                      <Measure value={m.quantity} className="text-ink" />
                      <span className="text-xs text-ink-3">{m.unit}</span>
                      <Measure value={formatIDR(m.priceTypical)} className="font-medium text-ink" />
                    </div>
                  </div>

                  <Measure value={m.spec} className="mt-1 block text-xs text-ink-2" />

                  <div className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3">
                    <p className="text-xs leading-relaxed text-ink-2">
                      <span className="text-ink-3">Why this part: </span>
                      {m.rationale}
                    </p>
                    {m.substitutes ? (
                      <p className="text-xs leading-relaxed text-ink-2">
                        <span className="text-ink-3">Could be: </span>
                        {m.substitutes}
                      </p>
                    ) : (
                      m.safetyCritical ? (
                        <p className="text-xs text-clay">No substitute. This one is not negotiable.</p>
                      ) : null
                    )}
                    <p className="text-xs text-ink-3">
                      Range <Measure value={formatIDR(m.priceLow)} /> to{' '}
                      <Measure value={formatIDR(m.priceHigh)} />
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
