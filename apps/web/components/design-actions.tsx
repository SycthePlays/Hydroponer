'use client';

import { useState } from 'react';
import { Button } from './ui';

/**
 * The action bar on a design, and the two sheets it can open.
 *
 * Save is the seam between the tool and the workspace: it never blocks
 * the design, and it names what it buys. Publish is the commons, and it
 * shows exactly what becomes public before anything does.
 */

function Sheet({
  title, onClose, children,
}: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="rise relative w-full max-w-[520px] rounded-t-[10px] border border-line bg-surface p-6 shadow-raised sm:rounded-[8px]"
      >
        {children}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-sm text-ink-3 hover:text-ink"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

export function DesignActions({ designName }: { designName: string }) {
  const [sheet, setSheet] = useState<null | 'save' | 'publish'>(null);
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => (saved ? undefined : setSheet('save'))}>
          {saved ? 'Saved' : 'Save'}
        </Button>
        <Button size="sm" variant="secondary" href="#layout">Refine</Button>
        <Button size="sm" variant="secondary" onClick={() => setSheet('publish')}>
          {published ? 'Published' : 'Publish'}
        </Button>
        <Button size="sm" variant="ghost" href="/designs/dsg_7f2a/materials">Export</Button>
      </div>

      {sheet === 'save' ? (
        <Sheet title="Keep this design" onClose={() => setSheet(null)}>
          <span className="label">Save to your library</span>
          <h3 className="mb-2 mt-2 text-[22px]">Keep this design and your photo.</h3>
          <p className="mb-5 text-sm text-ink-2">
            Right now this design lives in this browser for 30 days. An account keeps it for good,
            syncs your build progress across devices, and lets you compare versions as you refine it.
          </p>
          <div className="flex flex-col gap-2">
            <Button size="lg" onClick={() => { setSaved(true); setSheet(null); }}>
              Continue with email
            </Button>
            <Button size="lg" variant="secondary" onClick={() => { setSaved(true); setSheet(null); }}>
              Continue with Google
            </Button>
          </div>
          <p className="mt-4 text-xs text-ink-3">
            Your photo stays private. It is never included when you publish a design, and you can
            delete it at any time.
          </p>
        </Sheet>
      ) : null}

      {sheet === 'publish' ? (
        <Sheet title="Publish to the community" onClose={() => setSheet(null)}>
          <span className="label">Publish to the community</span>
          <h3 className="mb-2 mt-2 text-[22px]">Here is exactly what becomes public.</h3>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[5px] border border-canopy/30 bg-canopy-wash/40 p-3">
              <div className="label mb-1.5 text-canopy-ink">Public</div>
              <ul className="flex flex-col gap-1 text-xs text-ink-2">
                <li>The layout and the 3D scene</li>
                <li>System choice and the reasoning</li>
                <li>Materials and cost range</li>
                <li>The build guide</li>
                <li>Space type and dimensions</li>
                <li>Your handle</li>
              </ul>
            </div>
            <div className="rounded-[5px] border border-clay/30 bg-clay-wash/40 p-3">
              <div className="label mb-1.5 text-clay">Never public</div>
              <ul className="flex flex-col gap-1 text-xs text-ink-2">
                <li>Your photo</li>
                <li>Where you are</li>
                <li>Your email</li>
                <li>The budget you entered</li>
                <li>Every other space you own</li>
              </ul>
            </div>
          </div>
          <label className="label mb-1 block" htmlFor="pub-note">
            What were you going for?
          </label>
          <textarea
            id="pub-note"
            rows={3}
            defaultValue=""
            placeholder="The most useful thing you can write here is what you would do differently."
            className="mb-4 w-full rounded-[4px] border border-line bg-paper p-3 text-sm text-ink placeholder:text-ink-3"
          />
          <p className="mb-4 text-xs text-ink-2">
            Published so others may read, adapt and build it, crediting you. Pinned to this version,
            so later changes stay private until you publish again. You can withdraw it at any time.
          </p>
          <Button size="lg" className="w-full" onClick={() => { setPublished(true); setSheet(null); }}>
            Publish {designName}
          </Button>
        </Sheet>
      ) : null}
    </>
  );
}
