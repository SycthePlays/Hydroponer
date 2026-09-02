import { SiteHeader, SiteFooter } from '@/components/chrome';
import { Card, Measure } from '@/components/ui';

export const metadata = { title: 'The six systems' };

const systems = [
  {
    name: 'Kratky',
    line: 'No pump, no power, nothing to fail.',
    how: 'The plant sits above a reservoir. As it drinks, the water level drops and the gap that opens up is what feeds the roots air. You fill it once and leave it.',
    good: 'Balconies and windowsills with no outlet. First builds.',
    bad: 'Uses space poorly, needs refilling by hand, and does not suit large plants.',
    power: 'None',
  },
  {
    name: 'Deep water culture',
    line: 'Roots sit in aerated water. Forgiving.',
    how: 'An air pump keeps a reservoir oxygenated and the roots hang in it permanently. There is a lot of water at the roots, so conditions change slowly.',
    good: 'Anywhere the power is unreliable. A six-hour cut does nothing.',
    bad: 'About 40% fewer plants than NFT in the same footprint.',
    power: 'Air pump, continuous',
  },
  {
    name: 'NFT',
    line: 'A thin film of solution running down a channel.',
    how: 'A pump lifts solution to the high end of a sloped channel. It runs 2 to 3 mm deep past the roots and drains back to the reservoir.',
    good: 'The most plants per square metre, and easy to harvest at bench height.',
    bad: 'No water at the roots if the pump stops. You have about 40 minutes.',
    power: 'Water pump, continuous',
  },
  {
    name: 'Ebb and flow',
    line: 'Flood the bed, then let it drain.',
    how: 'A timer floods a bed of media every few hours and lets it drain. The draining is what pulls fresh air down to the roots.',
    good: 'Forgiving, flexible about what you grow, and tolerant of a missed cycle.',
    bad: 'A deeper bench and a lot of media, which costs more to buy and to replace.',
    power: 'Water pump, on a timer',
  },
  {
    name: 'Drip',
    line: 'Solution delivered to each plant individually.',
    how: 'A pump feeds a manifold of small drippers, one per plant, into media that holds moisture between cycles.',
    good: 'Fruiting crops: tomatoes, chillies, cucumbers. Precise control per plant.',
    bad: 'Emitters block. More maintenance than any other system here.',
    power: 'Water pump, on a timer',
  },
  {
    name: 'Vertical tower',
    line: 'Plants stacked up rather than out.',
    how: 'Solution is pumped to the top of a column and trickles down past plants set into its sides.',
    good: 'Small floor area with generous height. Striking to look at.',
    bad: 'Needs about 2.2 m of clear height, and the lower plants get less light.',
    power: 'Water pump, continuous',
  },
];

export default function LearnPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6">
        <span className="label">Learn</span>
        <h1 className="mb-2 mt-2 text-[36px]">The six systems</h1>
        <p className="mb-8 max-w-[62ch] text-ink-2">
          Hydroponer weighs all six against your space, your climate and your brief, then recommends
          one and tells you why the others were not it. Here is what each of them actually is.
        </p>

        <div className="flex flex-col gap-4">
          {systems.map((s, i) => (
            <Card key={s.name} className="p-6">
              <div className="mb-3 flex flex-wrap items-baseline gap-3">
                <span className="measure text-xs text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="text-[24px]">{s.name}</h2>
                <span className="text-sm text-ink-2">{s.line}</span>
                <span className="measure ml-auto text-xs text-ink-3">{s.power}</span>
              </div>
              <p className="mb-4 max-w-[68ch] text-[15px] leading-relaxed text-ink-2">{s.how}</p>
              <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                <div>
                  <div className="label mb-1 text-canopy-ink">Suits</div>
                  <p className="text-sm text-ink-2">{s.good}</p>
                </div>
                <div>
                  <div className="label mb-1 text-nutrient-ink">Costs you</div>
                  <p className="text-sm text-ink-2">{s.bad}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 rounded-[5px] border border-line border-l-[3px] border-l-blueprint bg-blueprint-wash/40 p-5">
          <h2 className="mb-1.5 font-sans text-[16px] font-semibold text-ink">
            Which one is not a matter of taste
          </h2>
          <p className="max-w-[64ch] text-sm text-ink-2">
            It follows from what your space has. No outlet rules out five of the six. A ceiling under{' '}
            <Measure value="2.2" unit="m" /> rules out towers. Unreliable power makes NFT a bad bet
            however well it uses the floor.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
