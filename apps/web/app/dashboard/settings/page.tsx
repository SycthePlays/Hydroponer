import { AppShell } from '@/components/chrome';
import { Button, Card } from '@/components/ui';

export const metadata = { title: 'Settings' };

function Group({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="mb-1 text-[19px]">{title}</h2>
      {note ? <p className="mb-4 max-w-[58ch] text-sm text-ink-2">{note}</p> : <div className="mb-4" />}
      <div className="flex flex-col gap-4">{children}</div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

const inputCls = 'rounded-[4px] border border-line bg-paper px-3 py-2 text-sm text-ink';

export default function SettingsPage() {
  return (
    <AppShell current="/dashboard/settings">
      <h1 className="mb-1 text-[30px]">Settings</h1>
      <p className="mb-7 text-ink-2">Your account, your units, and what happens to your photos.</p>

      <div className="flex max-w-[720px] flex-col gap-5">
        <Group title="Profile" note="Your handle is the only part of you that appears on a published design.">
          <Field label="Public handle">
            <input className={inputCls} defaultValue="sycthe" />
          </Field>
          <Field label="A line about you, shown on your profile">
            <input className={inputCls} defaultValue="Garage grower, mostly leafy greens." />
          </Field>
        </Group>

        <Group title="Units and currency">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Measurements">
              <select className={inputCls} defaultValue="Metric">
                <option>Metric</option>
                <option>Imperial</option>
              </select>
            </Field>
            <Field label="Currency">
              <select className={inputCls} defaultValue="IDR">
                <option>IDR</option>
                <option>MYR</option>
                <option>SGD</option>
                <option>USD</option>
              </select>
            </Field>
          </div>
        </Group>

        <Group
          title="Photos"
          note="How long your photos are kept after a design is made from them. This is a real control, not fine print."
        >
          <Field label="Keep photos for">
            <input type="range" min={0} max={3} step={1} defaultValue={3} className="accent-[var(--canopy)]" />
          </Field>
          <div className="flex justify-between text-xs text-ink-3">
            <span>Delete after analysis</span>
            <span>7 days</span>
            <span>30 days</span>
            <span>90 days</span>
          </div>
          <p className="text-xs text-ink-2">
            A design survives without its photo. It is built on the measurements, not the image.
          </p>
        </Group>

        <Group title="Your data">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm">Export everything</Button>
            <Button variant="secondary" size="sm">Download my designs as PDF</Button>
          </div>
        </Group>

        <Card className="border-clay/30 p-5">
          <h2 className="mb-1 text-[19px] text-clay">Danger zone</h2>
          <p className="mb-4 max-w-[58ch] text-sm text-ink-2">
            Deleting your account removes your spaces, photos, designs and versions. Designs you
            published are withdrawn from the community. This cannot be undone.
          </p>
          <Button variant="secondary" size="sm">Delete my account</Button>
        </Card>
      </div>
    </AppShell>
  );
}
