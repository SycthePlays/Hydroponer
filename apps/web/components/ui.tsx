import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Confidence, DesignStatus, Warning } from '@/lib/types';
import { formatIDR } from '@/lib/data';

/* ---------------- buttons ---------------- */

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
};

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-[4px] font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap';

const buttonVariants: Record<string, string> = {
  primary: 'bg-canopy text-white hover:bg-canopy-ink',
  secondary: 'border border-line-2 bg-surface text-ink hover:bg-surface-2',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
};

const buttonSizes: Record<string, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]',
};

export function Button({
  children, href, variant = 'primary', size = 'md', className = '', type = 'button', onClick, disabled,
}: ButtonProps) {
  const cls = `${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[5px] border border-line bg-surface ${className}`}>{children}</div>;
}

export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`label ${className}`}>{children}</div>;
}

/* ---------------- measurements ----------------
   Dimensions are data, not prose. They always render
   in the mono face with their unit attached.
   ------------------------------------------------ */

export function Measure({
  value, unit, className = '',
}: { value: string | number; unit?: string; className?: string }) {
  return (
    <span className={`measure ${className}`}>
      {value}
      {unit ? <span className="text-ink-3">&nbsp;{unit}</span> : null}
    </span>
  );
}

/* ---------------- confidence ----------------
   Never a bare percentage. A word the reader can act on,
   with a bar showing how much to trust it.
   ---------------------------------------------- */

const confidenceMeta: Record<Confidence, { label: string; bars: number; tone: string }> = {
  high: { label: 'Confident', bars: 3, tone: 'text-canopy-ink' },
  medium: { label: 'Fairly sure', bars: 2, tone: 'text-nutrient-ink' },
  low: { label: 'Needs checking', bars: 1, tone: 'text-clay' },
};

export function ConfidenceTag({ level }: { level: Confidence }) {
  const meta = confidenceMeta[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${meta.tone}`}>
      <span className="flex items-end gap-[2px]" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`w-[3px] rounded-[1px] ${i < meta.bars ? 'bg-current' : 'bg-line-2'}`}
            style={{ height: `${5 + i * 3}px` }}
          />
        ))}
      </span>
      {meta.label}
    </span>
  );
}

/* ---------------- status ---------------- */

const statusMeta: Record<DesignStatus, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-surface-2 text-ink-2 border-line-2' },
  kept: { label: 'Kept', cls: 'bg-canopy-wash text-canopy-ink border-canopy/30' },
  building: { label: 'Building', cls: 'bg-nutrient-wash text-nutrient-ink border-nutrient/40' },
  built: { label: 'Built', cls: 'bg-canopy-wash text-canopy-ink border-canopy/30' },
  archived: { label: 'Archived', cls: 'bg-surface-2 text-ink-3 border-line' },
};

export function StatusPill({ status }: { status: DesignStatus }) {
  const meta = statusMeta[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-[1px] text-[11px] font-medium ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

export function PublishedMark({ adaptations }: { adaptations: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-blueprint/40 bg-blueprint-wash px-2 py-[1px] text-[11px] font-medium text-blueprint-ink">
      <span aria-hidden="true">&#9672;</span>
      Published
      {adaptations > 0 ? <span className="measure">&middot; {adaptations}</span> : null}
    </span>
  );
}

/* ---------------- cost range ----------------
   Three points, never one number. The typical mark is
   emphasised; the ends are where the honesty lives.
   ---------------------------------------------- */

export function CostRange({
  low, typical, high, surveyedOn,
}: { low: number; typical: number; high: number; surveyedOn?: string }) {
  const pos = ((typical - low) / (high - low)) * 100;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <Measure value={formatIDR(typical)} className="text-[26px] font-semibold leading-none text-ink" />
        <span className="text-sm text-ink-3">typical</span>
      </div>
      <div className="relative h-[6px] rounded-full bg-surface-3">
        <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-canopy/20" />
        <div
          className="absolute top-1/2 h-[15px] w-[3px] -translate-y-1/2 rounded-full bg-canopy"
          style={{ left: `calc(${pos}% - 1.5px)` }}
        />
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs">
        <span className="text-ink-2">
          <Measure value={formatIDR(low)} /> <span className="text-ink-3">hunting for parts</span>
        </span>
        <span className="text-ink-2">
          <span className="text-ink-3">all new, best quality</span> <Measure value={formatIDR(high)} />
        </span>
      </div>
      {surveyedOn ? (
        <p className="text-xs text-ink-3">
          Prices surveyed <Measure value={surveyedOn} />. A range, not a quote.
        </p>
      ) : null}
    </div>
  );
}

/* ---------------- warnings ---------------- */

const warningMeta = {
  note: { border: 'border-l-blueprint', bg: 'bg-blueprint-wash/40', label: 'Worth knowing', tone: 'text-blueprint-ink' },
  caution: { border: 'border-l-nutrient', bg: 'bg-nutrient-wash/40', label: 'Check this', tone: 'text-nutrient-ink' },
  critical: { border: 'border-l-clay', bg: 'bg-clay-wash/50', label: 'Safety', tone: 'text-clay' },
};

export function WarningBlock({ warning }: { warning: Warning }) {
  const meta = warningMeta[warning.severity];
  return (
    <div className={`rounded-[5px] border border-line border-l-[3px] ${meta.border} ${meta.bg} p-4`}>
      <div className={`label mb-1.5 ${meta.tone}`}>{meta.label}</div>
      <h4 className="mb-1 font-sans text-[15px] font-semibold text-ink">{warning.title}</h4>
      <p className="text-sm leading-relaxed text-ink-2">{warning.body}</p>
    </div>
  );
}

export function SectionHead({
  n, title, id, children,
}: { n?: number; title: string; id?: string; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-3" id={id}>
      {n !== undefined ? (
        <span className="measure pt-1 text-xs text-ink-3">{String(n).padStart(2, '0')}</span>
      ) : null}
      <h2 className="text-[22px] sm:text-[26px]">{title}</h2>
      {children ? <div className="ml-auto">{children}</div> : null}
    </div>
  );
}
