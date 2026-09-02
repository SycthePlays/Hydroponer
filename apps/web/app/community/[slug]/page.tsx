import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/chrome';
import { Button, Card, Measure, WarningBlock, SectionHead } from '@/components/ui';
import { LayoutStudio } from '@/components/layout-studio';
import { commons, getCommonsEntry, getDesign, formatShortIDR } from '@/lib/data';

export async function generateStaticParams() {
  return commons.map((c) => ({ slug: c.slug }));
}

export default async function PublishedDesignPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getCommonsEntry(slug);
  const design = getDesign(entry.designId);

  return (
    <>
      <SiteHeader />

      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6">
          <Link href="/community" className="label hover:text-ink">
            &larr; All community designs
          </Link>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[30px] sm:text-[34px]">{entry.title}</h1>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
                <span>
                  by{' '}
                  <Link href={`/u/${entry.author.handle}`} className="text-canopy-ink hover:underline">
                    {entry.author.handle}
                  </Link>
                </span>
                <span><Measure value={entry.publishedOn} /></span>
                <span className="text-blueprint-ink">
                  <Measure value={entry.adaptations} /> people adapted this
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button href="/new">Adapt to my space</Button>
              <Button variant="ghost" size="sm">Report</Button>
            </div>
          </div>
        </div>
      </div>

      <main id="main" className="mx-auto max-w-[1180px] px-4 pb-16 sm:px-6">
        {/* what the author said */}
        <section className="pt-8">
          <Card className="p-6">
            <div className="label mb-2">From the author</div>
            <p className="max-w-[68ch] text-[15px] leading-relaxed text-ink-2">{entry.note}</p>
            <p className="mt-3 border-t border-line pt-3 text-xs text-ink-3">
              {entry.author.bio}
            </p>
          </Card>
        </section>

        {/* the facts a reader needs to judge fit */}
        <section className="pt-8">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { k: 'Space', v: entry.spaceKind },
              { k: 'Footprint', v: entry.footprint },
              { k: 'System', v: entry.system },
              { k: 'Plant sites', v: String(entry.plantSites) },
              { k: 'Typical cost', v: formatShortIDR(entry.costTypical) },
              { k: 'Building', v: entry.skill },
            ].map((f) => (
              <Card key={f.k} className="p-4">
                <div className="label mb-1.5">{f.k}</div>
                <Measure value={f.v} className="text-sm text-ink" />
              </Card>
            ))}
          </div>
        </section>

        <section className="pt-12">
          <SectionHead title="The design" />
          <LayoutStudio design={design} />
        </section>

        <section className="pt-12">
          <SectionHead title="Warnings, for the space it was built in" />
          <p className="mb-4 max-w-[62ch] text-sm text-ink-2">
            These were worked out for the author&rsquo;s space, not yours. When you adapt this design,
            every warning is computed again from your own measurements &mdash; a load warning belongs to
            the floor it sits on.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {design.warnings.slice(0, 2).map((w) => (
              <WarningBlock key={w.id} warning={w} />
            ))}
          </div>
        </section>

        {/* adapt */}
        <section className="pt-12">
          <div className="rounded-[6px] border border-canopy/30 bg-canopy-wash/40 p-6 sm:p-8">
            <span className="label text-canopy-ink">Adapt, do not copy</span>
            <h2 className="mb-2 mt-2 text-[24px]">Rework this for your own space</h2>
            <p className="mb-5 max-w-[60ch] text-[15px] text-ink-2">
              A design that fits <Measure value={entry.footprint} /> is wrong for a space of any other
              size. Adapting takes this design&rsquo;s approach &mdash; its system, its crop direction,
              its general strategy &mdash; and works it out again against your geometry, light, power
              and budget. If it will not fit, you get the reason and the nearest thing that will.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" href="/new">Photograph my space</Button>
              <Button size="lg" variant="secondary" href="/dashboard/spaces">
                Use a space I already have
              </Button>
            </div>
          </div>
        </section>

        <p className="pt-8 text-xs text-ink-3">
          Published under a licence that lets anyone read, adapt and build this design with credit to
          its author. The author&rsquo;s photo, location and budget are not part of what was published.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
