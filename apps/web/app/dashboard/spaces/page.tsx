import { AppShell } from '@/components/chrome';
import { Button, Card, Measure, ConfidenceTag } from '@/components/ui';
import { spaces } from '@/lib/data';

export const metadata = { title: 'Spaces' };

export default function SpacesPage() {
  return (
    <AppShell current="/dashboard/spaces">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 text-[30px]">Your spaces</h1>
          <p className="text-ink-2">
            A space is a physical place. One space can carry many designs, which is why they are kept
            apart.
          </p>
        </div>
        <Button href="/new">Photograph a new space</Button>
      </div>

      <div className="flex flex-col gap-5">
        {spaces.map((s) => (
          <Card key={s.id} className="overflow-hidden">
            <div className="flex flex-wrap gap-5 p-5">
              <div className="graph-paper grid aspect-[4/3] w-full shrink-0 place-items-center rounded-[4px] border border-line sm:w-[200px]">
                <div className="text-center">
                  <div className="label">photo archive</div>
                  <Measure value={s.photoCount} className="text-[24px] font-semibold text-ink-2" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="label">{s.kind}</span>
                  <ConfidenceTag level={s.dimensionConfidence} />
                </div>
                <h2 className="mb-2 text-[22px]">{s.name}</h2>
                <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
                  <Measure
                    value={`${(s.bounds_mm.w / 1000).toFixed(2)} x ${(s.bounds_mm.d / 1000).toFixed(2)} x ${(s.bounds_mm.h / 1000).toFixed(2)}`}
                    unit="m"
                  />
                  <span>captured <Measure value={s.capturedOn} /></span>
                  <span><Measure value={s.designIds.length} /> designs from it</span>
                </div>
                {s.notes ? <p className="mb-3 text-sm text-ink-2">{s.notes}</p> : null}
                <div className="flex flex-wrap gap-2">
                  <Button href="/new/brief" size="sm">New design for this space</Button>
                  <Button variant="secondary" size="sm">Add a photo</Button>
                  <Button variant="ghost" size="sm">Rename</Button>
                </div>
              </div>
            </div>

            <div className="border-t border-line bg-surface-2/40 px-5 py-4">
              <div className="label mb-2">What was found here</div>
              <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                {s.findings.map((f) => (
                  <div key={f.key} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-ink-2">{f.label}</span>
                    <Measure value={f.value} className="text-right text-xs text-ink" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
