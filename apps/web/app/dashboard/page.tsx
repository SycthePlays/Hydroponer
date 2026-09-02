import Link from 'next/link';
import { AppShell } from '@/components/chrome';
import { Button, Card, Measure, StatusPill, PublishedMark } from '@/components/ui';
import { designs, spaces, garageDesign, formatShortIDR, plantSites } from '@/lib/data';

export const metadata = { title: 'Overview' };

export default function DashboardPage() {
  const active = garageDesign;
  const allSteps = active.phases.flatMap((p) => p.steps);
  const doneCount = (active.buildProgress ?? []).length;
  const pct = Math.round((doneCount / allSteps.length) * 100);
  const next = allSteps.find((s) => !active.buildProgress?.includes(s.id));
  const phase = active.phases.find((p) => p.steps.some((s) => s.id === next?.id));

  return (
    <AppShell current="/dashboard">
      <h1 className="mb-1 text-[30px]">Where you left off</h1>
      <p className="mb-7 text-ink-2">Two spaces, two designs, one build in progress.</p>

      {/* resume */}
      <Card className="mb-8 overflow-hidden">
        <div className="flex flex-wrap items-start gap-5 p-5 sm:p-6">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="label">Building</span>
              <StatusPill status={active.status} />
            </div>
            <h2 className="mb-1 text-[22px]">{active.name}</h2>
            <p className="mb-4 text-sm text-ink-2">
              Phase <Measure value={phase?.index ?? 1} /> of{' '}
              <Measure value={active.phases.length} /> &mdash; {phase?.title}. Next up:{' '}
              <span className="text-ink">{next?.title}</span>
            </p>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2 w-full max-w-[280px] overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-canopy" style={{ width: `${pct}%` }} />
              </div>
              <span className="measure text-sm text-ink-2">{pct}%</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button href={`/designs/${active.id}/build`}>Continue the build</Button>
              <Button href={`/designs/${active.id}`} variant="secondary">Open the design</Button>
            </div>
          </div>

          <div className="graph-paper grid aspect-square w-full shrink-0 place-items-center rounded-[5px] border border-line sm:w-[180px]">
            <div className="text-center">
              <Measure value={plantSites(active)} className="text-[28px] font-semibold text-canopy-ink" />
              <div className="label mt-1">plant sites</div>
            </div>
          </div>
        </div>
      </Card>

      {/* designs */}
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-[20px]">Your designs</h2>
        <Link href="/dashboard/designs" className="text-sm text-ink-2 hover:text-ink">
          See all
        </Link>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {designs.map((d) => (
          <Link key={d.id} href={`/designs/${d.id}`} className="group">
            <Card className="h-full p-5 transition-colors group-hover:border-canopy/40">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StatusPill status={d.status} />
                {d.published ? <PublishedMark adaptations={d.published.adaptations} /> : null}
                <span className="measure ml-auto text-xs text-ink-3">v{d.version}</span>
              </div>
              <h3 className="mb-1.5 text-[18px] group-hover:text-canopy-ink">{d.name}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-3">
                <span><Measure value={plantSites(d)} /> sites</span>
                <span>{formatShortIDR(d.cost.buildTypical)}</span>
                <span>updated <Measure value={d.updatedOn} /></span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* spaces */}
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-[20px]">Your spaces</h2>
        <Link href="/dashboard/spaces" className="text-sm text-ink-2 hover:text-ink">
          See all
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {spaces.map((s) => (
          <Card key={s.id} className="p-5">
            <div className="label mb-1.5">{s.kind}</div>
            <h3 className="mb-1.5 text-[18px]">{s.name}</h3>
            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-3">
              <Measure value={`${(s.bounds_mm.w / 1000).toFixed(2)} x ${(s.bounds_mm.d / 1000).toFixed(2)} m`} />
              <span><Measure value={s.photoCount} /> photos</span>
              <span><Measure value={s.designIds.length} /> designs</span>
            </div>
            <Button href="/new/brief" variant="secondary" size="sm">
              New design for this space
            </Button>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
