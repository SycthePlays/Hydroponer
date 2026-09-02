import Link from 'next/link';
import { AppShell } from '@/components/chrome';
import { Button, Card, Measure } from '@/components/ui';
import { designs } from '@/lib/data';

export const metadata = { title: 'Published' };

export default function PublishedPage() {
  const published = designs.filter((d) => d.published);

  return (
    <AppShell current="/dashboard/published">
      <h1 className="mb-1 text-[30px]">What you have opened up</h1>
      <p className="mb-7 max-w-[62ch] text-ink-2">
        Only these are public. Everything else in your library is private, and publishing is always a
        deliberate act you can undo.
      </p>

      {published.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-ink-2">You have not published anything.</p>
        </Card>
      ) : (
        <div className="mb-8 flex flex-col gap-4">
          {published.map((d) => (
            <Card key={d.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="mb-1 text-[20px]">{d.name}</h2>
                  <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
                    <span>published <Measure value={d.published!.publishedOn} /></span>
                    <span className="text-blueprint-ink">
                      <Measure value={d.published!.adaptations} /> people adapted it
                    </span>
                    <span>pinned to <Measure value={`v${d.published!.version}`} /></span>
                  </div>
                  <Link
                    href={`/community/${d.published!.slug}`}
                    className="measure text-xs text-canopy-ink hover:underline"
                  >
                    /community/{d.published!.slug}
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm">Copy link</Button>
                  <Button variant="secondary" size="sm">Publish v{d.version}</Button>
                  <Button variant="ghost" size="sm">Withdraw</Button>
                </div>
              </div>

              {d.version > d.published!.version ? (
                <p className="mt-3 border-t border-line pt-3 text-xs text-ink-2">
                  You have refined this since publishing. Readers still see{' '}
                  <Measure value={`v${d.published!.version}`} /> until you publish the newer one
                  deliberately.
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-[5px] border border-line border-l-[3px] border-l-clay bg-clay-wash/40 p-5">
        <h2 className="mb-1.5 font-sans text-[16px] font-semibold text-ink">
          Withdrawing takes effect immediately
        </h2>
        <p className="max-w-[62ch] text-sm text-ink-2">
          A withdrawn design leaves the gallery at once. Anyone who already adapted it keeps their own
          copy, because that design is now theirs and was worked out for their space. The credit to
          you stays.
        </p>
      </div>
    </AppShell>
  );
}
