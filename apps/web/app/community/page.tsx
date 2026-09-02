import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/chrome';
import { Card, Measure } from '@/components/ui';
import { commons, formatShortIDR } from '@/lib/data';

export const metadata = { title: 'Community designs' };

const filters = [
  { label: 'Space', options: ['Any space', 'Balcony', 'Garage', 'Spare room', 'Basement', 'Open field'] },
  { label: 'System', options: ['Any system', 'Kratky', 'Deep water culture', 'NFT', 'Ebb and flow'] },
  { label: 'Building', options: ['Any level', 'Assemble only', 'Basic tools', 'Cut and drill'] },
];

export default function CommunityPage() {
  const sorted = [...commons].sort((a, b) => b.adaptations - a.adaptations);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6">
        <span className="label">The commons</span>
        <h1 className="mb-2 mt-2 text-[36px]">Designs people chose to open up</h1>
        <p className="mb-8 max-w-[62ch] text-ink-2">
          Nothing lands here automatically. Every design below was published deliberately by the
          person who made it, and every one can be reworked for your own space rather than copied.
        </p>

        <div className="mb-8 flex flex-wrap gap-3">
          {filters.map((f) => (
            <label key={f.label} className="flex flex-col gap-1">
              <span className="label">{f.label}</span>
              <select className="rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink">
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          ))}
          <label className="flex flex-col gap-1">
            <span className="label">Sort</span>
            <select className="rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink">
              <option>Most adapted</option>
              <option>Newest</option>
              <option>Smallest space</option>
              <option>Lowest cost</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((c) => (
            <Link key={c.slug} href={`/community/${c.slug}`} className="group">
              <Card className="flex h-full flex-col transition-colors group-hover:border-canopy/40">
                {/* the card leads with the design, never a photo of a home */}
                <div className="graph-paper flex aspect-[4/3] items-center justify-center rounded-t-[5px] border-b border-line">
                  <div className="text-center">
                    <Measure value={c.plantSites} className="text-[30px] font-semibold text-canopy-ink" />
                    <div className="label mt-1">plant sites</div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="label mb-1.5">
                    {c.spaceKind} &middot; {c.system}
                  </div>
                  <h2 className="mb-2 font-display text-[18px] font-semibold group-hover:text-canopy-ink">
                    {c.title}
                  </h2>
                  <p className="mb-4 flex-1 text-sm text-ink-2">{c.note.slice(0, 120)}&hellip;</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-ink-3">
                    <span><Measure value={c.footprint} /></span>
                    <span>{formatShortIDR(c.costTypical)}</span>
                    <span className="ml-auto text-blueprint-ink">
                      <Measure value={c.adaptations} /> adapted
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-[5px] border border-line border-l-[3px] border-l-blueprint bg-blueprint-wash/40 p-5">
          <h2 className="mb-1.5 font-sans text-[16px] font-semibold text-ink">
            Adaptation count, not likes
          </h2>
          <p className="max-w-[62ch] text-sm text-ink-2">
            The only number shown against a design is how many people reworked it for their own space,
            because that is the one that means the work was useful. There are no followers, no feed,
            and no comments.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
