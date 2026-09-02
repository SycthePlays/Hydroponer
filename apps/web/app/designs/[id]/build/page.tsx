import Link from 'next/link';
import { SiteHeader } from '@/components/chrome';
import { BuildGuide } from '@/components/build-guide';
import { getDesign } from '@/lib/data';

export async function generateStaticParams() {
  return [{ id: 'dsg_7f2a' }, { id: 'dsg_2c81' }];
}

export default async function BuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const design = getDesign(id);

  return (
    <>
      <SiteHeader variant="minimal" />
      <main id="main" className="mx-auto max-w-[860px] px-4 py-8 sm:px-6">
        <Link href={`/designs/${design.id}`} className="label hover:text-ink">
          &larr; Back to the design
        </Link>
        <h1 className="mb-2 mt-2 text-[30px]">Building {design.name}</h1>
        <p className="mb-6 max-w-[58ch] text-ink-2">
          Work down the phases in order. Every step tells you how to know it worked, and the leak test
          in phase 7 happens on plain water before anything is committed.
        </p>
        <BuildGuide design={design} />
      </main>
    </>
  );
}
