import { SiteHeader } from '@/components/chrome';
import { Button, Card } from '@/components/ui';

export const metadata = { title: 'Photograph your space' };

const coaching = [
  { ok: true, text: 'Whole space in frame' },
  { ok: true, text: 'Enough light to see corners' },
  { ok: false, text: 'Something of known size in shot' },
];

export default function CapturePage() {
  return (
    <>
      <SiteHeader variant="minimal" />
      <main id="main" className="mx-auto max-w-[880px] px-4 py-10 sm:px-6">
        <span className="label">Step 1 of 2</span>
        <h1 className="mb-2 mt-2 text-[32px]">Photograph your space</h1>
        <p className="mb-8 max-w-[58ch] text-ink-2">
          One wide shot that takes in the whole area. If you can get a door, a bottle, or a tape
          measure in the frame, the measurements come out far more accurate.
        </p>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="graph-paper relative flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-[6px] border-2 border-dashed border-line-2 p-6 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2.5" y="6" width="19" height="14" rx="2.5" stroke="var(--ink-3)" strokeWidth="1.4" />
              <circle cx="12" cy="13" r="4" stroke="var(--canopy)" strokeWidth="1.6" />
              <path d="M8.5 6L10 3.5H14L15.5 6" stroke="var(--ink-3)" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            <div>
              <p className="text-[15px] font-medium text-ink">Take a photo, or drop one here</p>
              <p className="mt-1 text-sm text-ink-3">JPEG, PNG or HEIC, up to 12 MB</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button href="/new/brief">Open camera</Button>
              <Button href="/new/brief" variant="secondary">Choose a file</Button>
            </div>
            <div className="pointer-events-none absolute inset-4 rounded-[4px] border border-canopy/25" />
          </div>

          <div className="flex flex-col gap-4">
            <Card className="p-5">
              <div className="label mb-3">While you frame the shot</div>
              <ul className="flex flex-col gap-2.5">
                {coaching.map((c) => (
                  <li key={c.text} className="flex items-start gap-2.5 text-sm">
                    <span
                      aria-hidden="true"
                      className={`mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] ${
                        c.ok ? 'bg-canopy text-white' : 'border border-nutrient text-nutrient-ink'
                      }`}
                    >
                      {c.ok ? 'y' : '!'}
                    </span>
                    <span className={c.ok ? 'text-ink-2' : 'text-ink'}>{c.text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-line pt-3 text-xs text-ink-2">
                The reference object matters more than the camera. A standard door is 2.0 m tall, and
                that single fact fixes the scale of everything else in the frame.
              </p>
            </Card>

            <Card className="p-5">
              <div className="label mb-2">What happens to your photo</div>
              <p className="text-xs leading-relaxed text-ink-2">
                It is used to measure the space, then kept for 90 days so you can come back to it. You
                can set that down to delete-after-analysis at any time. It is never included when you
                publish a design.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
