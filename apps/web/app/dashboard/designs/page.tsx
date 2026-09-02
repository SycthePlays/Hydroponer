import Link from 'next/link';
import { AppShell } from '@/components/chrome';
import { Button, Card, Measure, StatusPill, PublishedMark } from '@/components/ui';
import { designs, spaces, versions, formatShortIDR, plantSites } from '@/lib/data';

export const metadata = { title: 'Designs' };

const filterGroups = [
  ['Any space', 'Garage', 'Back balcony'],
  ['Any system', 'NFT', 'Kratky'],
  ['Any status', 'Draft', 'Kept', 'Building', 'Built'],
  ['Any state', 'Published', 'Private'],
];

export default function DesignsPage() {
  return (
    <AppShell current="/dashboard/designs">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 text-[30px]">Your designs</h1>
          <p className="text-ink-2">
            Build progress shows here as a status. There is no separate tracker, because this is a
            design tool.
          </p>
        </div>
        <Button href="/new">New design</Button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {filterGroups.map((g, i) => (
          <select
            key={i}
            className="rounded-[4px] border border-line bg-surface px-3 py-2 text-sm text-ink"
          >
            {g.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ))}
      </div>

      <Card className="mb-10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line-2 bg-surface-2">
                <th className="label px-4 py-3 text-left">Design</th>
                <th className="label px-4 py-3 text-left">Space</th>
                <th className="label px-4 py-3 text-left">System</th>
                <th className="label px-4 py-3 text-right">Sites</th>
                <th className="label px-4 py-3 text-right">Typical</th>
                <th className="label px-4 py-3 text-left">Status</th>
                <th className="label px-4 py-3 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {designs.map((d) => {
                const space = spaces.find((s) => s.id === d.spaceId);
                return (
                  <tr key={d.id} className="hover:bg-surface-2/50">
                    <td className="px-4 py-3">
                      <Link href={`/designs/${d.id}`} className="font-medium text-ink hover:text-canopy-ink">
                        {d.name}
                      </Link>
                      {d.published ? (
                        <span className="ml-2 inline-block align-middle">
                          <PublishedMark adaptations={d.published.adaptations} />
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-ink-2">{space?.name}</td>
                    <td className="px-4 py-3 text-ink-2">{d.system.chosen.split(' (')[0]}</td>
                    <td className="px-4 py-3 text-right"><Measure value={plantSites(d)} /></td>
                    <td className="px-4 py-3 text-right">
                      <Measure value={formatShortIDR(d.cost.buildTypical)} />
                    </td>
                    <td className="px-4 py-3"><StatusPill status={d.status} /></td>
                    <td className="px-4 py-3 text-right"><Measure value={d.updatedOn} className="text-xs" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <h2 className="mb-2 text-[20px]">Version history</h2>
      <p className="mb-4 max-w-[62ch] text-sm text-ink-2">
        Every refinement makes a new version with a summary of what changed. Old versions are never
        rewritten, so what you printed last month still opens exactly as you printed it.
      </p>
      <Card className="divide-y divide-line">
        {versions.map((v) => (
          <div key={v.n} className="flex flex-wrap items-start gap-4 p-4">
            <span className="measure w-8 shrink-0 text-sm text-ink-3">v{v.n}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink">{v.summary}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-3">
                <span>{v.system}</span>
                <span><Measure value={v.plantSites} /> sites</span>
                <span>{formatShortIDR(v.costTypical)}</span>
                <span><Measure value={v.on} /></span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">Compare</Button>
              <Button variant="secondary" size="sm">Restore</Button>
            </div>
          </div>
        ))}
      </Card>
    </AppShell>
  );
}
