import { SiteHeader } from '@/components/chrome';
import { Button, Card, Measure } from '@/components/ui';

export const metadata = { title: 'Your brief' };

const crops = ['Leafy greens', 'Herbs', 'Fruiting vegetables', 'A mix', 'Not sure yet'];
const skills = ['Assemble only', 'Basic tools', 'Happy to cut and drill'];
const morePrefs = [
  { l: 'Time you want to spend', v: '2 to 4 hours a week' },
  { l: 'It needs to be quiet', v: 'No' },
  { l: 'It needs to look tidy', v: 'No' },
  { l: 'Tools you already own', v: 'Drill, spanner, level' },
];

export default function BriefPage() {
  return (
    <>
      <SiteHeader variant="minimal" />
      <main id="main" className="mx-auto max-w-[760px] px-4 py-10 sm:px-6">
        <span className="label">Step 2 of 2</span>
        <h1 className="mb-2 mt-2 text-[32px]">What do you want from it?</h1>
        <p className="mb-8 max-w-[56ch] text-ink-2">
          Everything here has a sensible default, so you can skip straight through. Only your country
          is actually required, because it sets the currency, the prices and the climate.
        </p>

        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <span className="label mb-3 block">What would you like to grow?</span>
            <div className="flex flex-wrap gap-2">
              {crops.map((c, i) => (
                <span
                  key={c}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    i === 0
                      ? 'border-canopy bg-canopy-wash text-canopy-ink'
                      : 'border-line bg-surface text-ink-2'
                  }`}
                >
                  {c}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <label className="label mb-3 block" htmlFor="budget">
              Roughly what would you like to spend?
            </label>
            <input
              id="budget"
              type="range"
              min={500000}
              max={15000000}
              step={500000}
              defaultValue={6000000}
              className="w-full accent-[var(--canopy)]"
            />
            <div className="mt-2 flex items-baseline justify-between text-sm">
              <Measure value="Rp500rb" className="text-xs text-ink-3" />
              <Measure value="Rp2 jt - Rp6 jt" className="font-medium text-ink" />
              <Measure value="Rp15 jt+" className="text-xs text-ink-3" />
            </div>
            <p className="mt-2 text-xs text-ink-3">
              A range, not a limit. If nothing sensible fits it, you will be told by how much rather
              than shown a design that pretends.
            </p>
          </Card>

          <Card className="p-5">
            <span className="label mb-3 block">How much building are you up for?</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {skills.map((s, i) => (
                <div
                  key={s}
                  className={`rounded-[4px] border px-3 py-2.5 text-sm ${
                    i === 1
                      ? 'border-canopy bg-canopy-wash text-canopy-ink'
                      : 'border-line bg-surface text-ink-2'
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <label className="label mb-3 block" htmlFor="country">Where are you?</label>
            <select
              id="country"
              defaultValue="Indonesia"
              className="w-full rounded-[4px] border border-line bg-paper px-3 py-2.5 text-sm text-ink"
            >
              <option>Indonesia</option>
              <option>Malaysia</option>
              <option>Singapore</option>
              <option>Philippines</option>
              <option>Thailand</option>
            </select>
            <p className="mt-2 text-xs text-ink-3">
              Sets your currency, the price survey used, and the climate the design is worked out for.
            </p>
          </Card>

          <details className="rounded-[5px] border border-line bg-surface">
            <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-ink-2 hover:text-ink">
              More preferences
            </summary>
            <div className="grid gap-4 border-t border-line p-5 sm:grid-cols-2">
              {morePrefs.map((p) => (
                <div key={p.l}>
                  <div className="label mb-1.5">{p.l}</div>
                  <div className="rounded-[4px] border border-line bg-paper px-3 py-2 text-sm text-ink-2">
                    {p.v}
                  </div>
                </div>
              ))}
            </div>
          </details>

          <div className="flex flex-wrap items-center gap-3">
            <Button href="/spaces/spc_garage/analyzing" size="lg">Design my setup</Button>
            <span className="text-sm text-ink-3">Takes about a minute and a half.</span>
          </div>
        </div>
      </main>
    </>
  );
}
