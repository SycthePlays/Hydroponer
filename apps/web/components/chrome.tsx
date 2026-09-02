import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from './ui';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 18V8" stroke="var(--canopy)" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M10 9C10 5.5 12.4 3 16 2.5C16 6 13.6 9 10 9Z"
          fill="var(--canopy)"
          fillOpacity="0.9"
        />
        <path
          d="M10 12C10 9.2 8 7 5 6.6C5 9.5 7 12 10 12Z"
          fill="var(--canopy)"
          fillOpacity="0.55"
        />
        <path d="M3 18H17" stroke="var(--blueprint)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span className="font-display text-[17px] font-semibold tracking-tight">Hydroponer</span>
    </Link>
  );
}

/* ---------------- public chrome ---------------- */

export function SiteHeader({ variant = 'default' }: { variant?: 'default' | 'minimal' }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-6 px-4 sm:px-6">
        <Logo />
        {variant === 'default' ? (
          <nav className="ml-auto hidden items-center gap-6 text-sm text-ink-2 sm:flex">
            <Link href="/#how" className="hover:text-ink">How it works</Link>
            <Link href="/community" className="hover:text-ink">Community</Link>
            <Link href="/learn" className="hover:text-ink">Learn</Link>
          </nav>
        ) : null}
        <div className={variant === 'default' ? 'ml-auto flex items-center gap-2 sm:ml-0' : 'ml-auto'}>
          <Button href="/dashboard" variant="ghost" size="sm">Sign in</Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-2/50">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-10 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-[38ch] text-sm text-ink-2">
            A design tool for hydroponic systems. It designs, prices, and explains a setup for your
            space. It does not sell anything.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <div className="label mb-1">Product</div>
          <Link href="/new" className="text-ink-2 hover:text-ink">Design a setup</Link>
          <Link href="/community" className="text-ink-2 hover:text-ink">Community designs</Link>
          <Link href="/learn" className="text-ink-2 hover:text-ink">The six systems</Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <div className="label mb-1">Project</div>
          <a href="https://github.com/SycthePlays/Hydroponer" className="text-ink-2 hover:text-ink">
            Source and documentation
          </a>
          <span className="text-ink-3">Prototype interface, sample data</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- workspace chrome ---------------- */

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/spaces', label: 'Spaces' },
  { href: '/dashboard/designs', label: 'Designs' },
  { href: '/dashboard/published', label: 'Published' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export function AppShell({ current, children }: { current: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-4 px-4 sm:px-6">
          <Logo />
          <span className="hidden rounded-full border border-nutrient/40 bg-nutrient-wash px-2 py-[1px] text-[11px] font-medium text-nutrient-ink sm:inline">
            Workspace
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button href="/new" size="sm">New design</Button>
            <div
              className="grid h-8 w-8 place-items-center rounded-full border border-line-2 bg-surface-2 text-[12px] font-semibold text-ink-2"
              title="Signed in"
            >
              SP
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1320px] gap-8 px-4 sm:px-6">
        <nav className="hide-scrollbar sticky top-14 z-30 -mx-4 flex gap-1 overflow-x-auto border-b border-line bg-paper px-4 py-2 sm:mx-0 sm:top-20 sm:h-fit sm:w-[172px] sm:shrink-0 sm:flex-col sm:border-b-0 sm:px-0 sm:py-6">
          {navItems.map((item) => {
            const active = current === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 rounded-[4px] px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? 'bg-surface-2 font-medium text-ink'
                    : 'text-ink-2 hover:bg-surface-2/60 hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main id="main" className="min-w-0 flex-1 py-7 sm:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
