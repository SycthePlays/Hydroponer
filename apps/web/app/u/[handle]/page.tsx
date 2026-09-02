import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/chrome';
import { Button, Card, Measure } from '@/components/ui';
import { commons, formatShortIDR } from '@/lib/data';

export async function generateStaticParams() {
  const handles = Array.from(new Set(commons.map((c) => c.author.handle)));
  return handles.map((handle) => ({ handle }));
}

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const theirs = commons.filter((c) => c.author.handle === handle);
  const author = theirs[0]?.author ?? { handle, bio: '' };
  const adapted = theirs.reduce((n, c) => n + c.adaptations, 0);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6">
        <Link href="/community" className="label hover:text-ink">
          &larr; All community designs
        </Link>

        <div className="mb-8 mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[34px]">{author.handle}</h1>
            <p className="mt-1 max-w-[52ch] text-ink-2">{author.bio}</p>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <Measure value={theirs.length} className="block text-[22px] font-semibold text-ink" />
              <span className="label">published</span>
            </div>
            <div>
              <Measure value={adapted} className="block text-[22px] font-semibold text-blueprint-ink" />
              <span className="label">adapted by others</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {theirs.map((c) => (
            <Link key={c.slug} href={`/community/${c.slug}`} className="group">
              <Card className="h-full p-5 transition-colors group-hover:border-canopy/40">
                <div className="label mb-2">{c.spaceKind} &middot; {c.system}</div>
                <h2 className="mb-2 font-display text-[17px] font-semibold group-hover:text-canopy-ink">
                  {c.title}
                </h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-3">
                  <span><Measure value={c.plantSites} /> sites</span>
                  <span><Measure value={c.footprint} /></span>
                  <span>{formatShortIDR(c.costTypical)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <p className="mt-8 max-w-[62ch] text-xs text-ink-3">
          A profile shows a handle, a line, and published designs. There are no followers and no
          activity feed, because neither would help anyone build anything.
        </p>

        <div className="mt-6">
          <Button href="/new">Design your own setup</Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
