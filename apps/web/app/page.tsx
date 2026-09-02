import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/chrome';
import { Button, Card, Measure } from '@/components/ui';
import { Plan2D } from '@/components/plan-2d';
import { garageDesign, commons, formatShortIDR, plantSites } from '@/lib/data';
import type { Layer } from '@/lib/types';

const heroLayers = new Set<Layer>(['shell', 'structure', 'plumbing', 'lighting', 'plants']);

const steps = [
  {
    n: 1,
    title: 'Photograph the space',
    body: 'A room, a balcony, a garage, an open field. Get something of known size in the shot and the measurements come out far better.',
  },
  {
    n: 2,
    title: 'Say what you want',
    body: 'What to grow, roughly what you want to spend, and how much building you are up for. Four questions, all with sensible defaults.',
  },
  {
    n: 3,
    title: 'Get a design for that place',
    body: 'The layout in 2D and 3D, what it is made of, what it would cost, and a build guide written for the thing you are actually building.',
  },
];

const contents = [
  { t: 'A layout for your space', b: 'Components at real coordinates, respecting walkways, door swings, clearances and how much your floor can carry.' },
  { t: 'The whole build in 3D', b: 'Rotate it, spin it, zoom into any part, hide layers, explode the assembly, and watch it build itself phase by phase.' },
  { t: 'What it is made of', b: 'Every part with its size, why it was sized that way, what you could substitute, and an honest price range.' },
  { t: 'How to build it', b: 'Ordered phases with a leak test before anything is committed, checkable steps, and a way to know each one worked.' },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:py-20">
            <div className="flex flex-col items-start gap-6">
              <span className="label rise">Hydroponic design, from a photo</span>
              <h1 className="rise text-[40px] leading-[1.05] sm:text-[54px]">
                Photograph your space.
                <br />
                Get a system designed
                <br />
                <span className="text-canopy">to fit it.</span>
              </h1>
              <p className="rise max-w-[46ch] text-[17px] text-ink-2">
                Hydroponer works out what will actually fit where you are, what it is made of, what it
                would cost, and how to build it. Then it shows you the whole thing in 3D so you can
                turn it around before you buy a single part.
              </p>
              <div className="rise flex flex-wrap items-center gap-3">
                <Button href="/new" size="lg">Photograph your space</Button>
                <Button href="/designs/dsg_7f2a" variant="secondary" size="lg">
                  See a finished design
                </Button>
              </div>
              <p className="text-sm text-ink-3">
                No account needed. Nothing is public unless you choose to share it.
              </p>
            </div>

            <div className="graph-paper rounded-[6px] border border-line p-4 shadow-card sm:p-6">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="label">Garage &middot; NFT &middot; 96 sites</span>
                <span className="measure text-xs text-ink-3">1:50</span>
              </div>
              <Plan2D design={garageDesign} visible={heroLayers} />
            </div>
          </div>
        </section>

        <section id="how" className="border-b border-line bg-surface-2/40">
          <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6">
            <h2 className="mb-8 text-[26px]">How it works</h2>
            <ol className="grid gap-6 sm:grid-cols-3">
              {steps.map((s) => (
                <li key={s.n} className="flex flex-col gap-2">
                  <span className="measure text-xs text-canopy-ink">
                    {String(s.n).padStart(2, '0')}
                  </span>
                  <h3 className="text-[19px]">{s.title}</h3>
                  <p className="text-sm text-ink-2">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-b border-line">
          <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6">
            <h2 className="mb-2 text-[26px]">What a design contains</h2>
            <p className="mb-8 max-w-[62ch] text-ink-2">
              Everything a design needs to be buildable, and nothing that belongs to a shop. Hydroponer
              names parts and estimates cost because a design is not finished without them. It sells
              nothing.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {contents.map((c) => (
                <Card key={c.t} className="p-5">
                  <h3 className="mb-2 text-[17px]">{c.t}</h3>
                  <p className="text-sm text-ink-2">{c.b}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-surface-2/40">
          <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-[26px]">Designs people chose to share</h2>
                <p className="mt-1 max-w-[58ch] text-sm text-ink-2">
                  Nothing is published automatically. These are designs whose authors opened them up,
                  and any of them can be reworked for your own space.
                </p>
              </div>
              <Button href="/community" variant="secondary">Browse the community</Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {commons.slice(0, 3).map((c) => (
                <Link key={c.slug} href={`/community/${c.slug}`} className="group">
                  <Card className="h-full p-5 transition-colors group-hover:border-canopy/40">
                    <div className="label mb-2">{c.spaceKind}</div>
                    <h3 className="mb-2 text-[17px] group-hover:text-canopy-ink">{c.title}</h3>
                    <p className="mb-4 text-sm text-ink-2">{c.note.slice(0, 130)}&hellip;</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-3">
                      <span><Measure value={c.plantSites} /> sites</span>
                      <span><Measure value={c.footprint} /></span>
                      <span>{formatShortIDR(c.costTypical)}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto flex max-w-[1180px] flex-col items-start gap-5 px-4 py-16 sm:px-6">
            <h2 className="max-w-[20ch] text-[30px]">
              It takes about two minutes to find out what fits.
            </h2>
            <p className="max-w-[54ch] text-ink-2">
              The drawing above is a real garage: <Measure value="5.80 &times; 3.10" unit="m" />,{' '}
              <Measure value={plantSites(garageDesign)} /> plant sites, about{' '}
              {formatShortIDR(garageDesign.cost.buildTypical)} to build. Yours will be different,
              which is rather the point.
            </p>
            <Button href="/new" size="lg">Photograph your space</Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
