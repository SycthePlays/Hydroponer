import type { Design, Layer } from '@/lib/types';

/**
 * The scaled 2D plan.
 *
 * Drawn straight from the layout in real millimetres: the SVG user
 * space *is* millimetres, so nothing is ever scaled by hand and the
 * drawing cannot drift from the 3D scene or the materials list.
 */

const layerFill: Record<Layer, string> = {
  shell: 'transparent',
  structure: 'var(--canopy)',
  plumbing: 'var(--blueprint)',
  electrical: 'var(--nutrient)',
  lighting: 'var(--nutrient)',
  plants: 'var(--canopy)',
};

function Dim({
  x1, y1, x2, y2, label, offset = 0, vertical = false,
}: { x1: number; y1: number; x2: number; y2: number; label: string; offset?: number; vertical?: boolean }) {
  const tick = 55;
  return (
    <g stroke="var(--blueprint)" strokeWidth={4} fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {vertical ? (
        <>
          <line x1={x1 - tick} y1={y1} x2={x1 + tick} y2={y1} />
          <line x1={x2 - tick} y1={y2} x2={x2 + tick} y2={y2} />
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 - tick} x2={x1} y2={y1 + tick} />
          <line x1={x2} y1={y2 - tick} x2={x2} y2={y2 + tick} />
        </>
      )}
      <text
        x={vertical ? x1 + offset : (x1 + x2) / 2}
        y={vertical ? (y1 + y2) / 2 : y1 + offset}
        fill="var(--blueprint-ink)"
        stroke="none"
        fontSize={150}
        fontFamily="var(--font-mono)"
        textAnchor="middle"
        dominantBaseline="middle"
        transform={vertical ? `rotate(-90 ${x1 + offset} ${(y1 + y2) / 2})` : undefined}
      >
        {label}
      </text>
    </g>
  );
}

export function Plan2D({
  design, visible, className = '',
}: { design: Design; visible: Set<Layer>; className?: string }) {
  const { w, d } = { w: 5800, d: 3100 };
  const { components, runs, walkways, usableArea_mm: usable } = design.layout;
  const pad = 620;

  return (
    <svg
      viewBox={`${-pad} ${-pad} ${w + pad * 2} ${d + pad * 2}`}
      className={`h-auto w-full ${className}`}
      role="img"
      aria-label={`Scaled plan of the ${w / 1000} by ${d / 1000} metre space with every component in position`}
    >
      <defs>
        <pattern id="wallHatch" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="60" stroke="var(--line-2)" strokeWidth="16" />
        </pattern>
      </defs>

      {/* room shell */}
      <rect x={-90} y={-90} width={w + 180} height={d + 180} fill="url(#wallHatch)" />
      <rect x={0} y={0} width={w} height={d} fill="var(--surface)" stroke="var(--ink)" strokeWidth={12} />

      {/* usable area */}
      <rect
        x={usable.x} y={usable.y} width={usable.w} height={usable.d}
        fill="none" stroke="var(--canopy)" strokeWidth={5} strokeDasharray="60 40" opacity={0.5}
      />

      {/* walkways */}
      {walkways.map((wk, i) => (
        <g key={i}>
          <rect x={wk.x} y={wk.y} width={wk.w} height={wk.d} fill="var(--canopy)" opacity={0.045} />
          <text
            x={wk.x + wk.w / 2} y={wk.y + wk.d / 2}
            fill="var(--ink-3)" fontSize={140} fontFamily="var(--font-mono)"
            textAnchor="middle" dominantBaseline="middle" letterSpacing="24"
          >
            WALKWAY {wk.d} mm
          </text>
        </g>
      ))}

      {/* plumbing and power runs, in plan */}
      {runs.map((run) => {
        const layer: Layer = run.kind === 'power' ? 'electrical' : 'plumbing';
        if (!visible.has(layer)) return null;
        return (
          <polyline
            key={run.id}
            points={run.points_mm.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={run.kind === 'power' ? 'var(--nutrient)' : 'var(--blueprint)'}
            strokeWidth={run.kind === 'return' ? 26 : 18}
            strokeDasharray={run.kind === 'power' ? '90 60' : undefined}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.75}
          />
        );
      })}

      {/* placed components */}
      {components.map((c) => {
        if (!visible.has(c.layer)) return null;
        const fill = layerFill[c.layer];

        if (c.shape === 'cylinder' || c.shape === 'plant') {
          const n = c.instances?.count ?? 1;
          const step = c.instances?.step_mm ?? { x: 0, y: 0, z: 0 };
          const r = c.shape === 'plant' ? c.size_mm.w / 2.6 : c.size_mm.w / 2;
          return (
            <g key={c.id}>
              {Array.from({ length: n }).map((_, i) => (
                <circle
                  key={i}
                  cx={c.position_mm.x + step.x * i + c.size_mm.w / 2}
                  cy={c.position_mm.y + step.y * i + c.size_mm.d / 2}
                  r={r}
                  fill={fill}
                  opacity={c.shape === 'plant' ? 0.22 : 0.55}
                  stroke={fill}
                  strokeWidth={c.shape === 'plant' ? 4 : 6}
                />
              ))}
            </g>
          );
        }

        const n = c.instances?.count ?? 1;
        const step = c.instances?.step_mm ?? { x: 0, y: 0, z: 0 };
        return (
          <g key={c.id}>
            {Array.from({ length: n }).map((_, i) => (
              <rect
                key={i}
                x={c.position_mm.x + step.x * i}
                y={c.position_mm.y + step.y * i}
                width={c.size_mm.w}
                height={c.size_mm.d}
                fill={fill}
                fillOpacity={c.layer === 'lighting' ? 0.14 : 0.1}
                stroke={fill}
                strokeWidth={8}
                strokeDasharray={c.layer === 'lighting' ? '50 30' : undefined}
                rx={6}
              />
            ))}
          </g>
        );
      })}

      {/* overall dimensions */}
      <Dim x1={0} y1={-330} x2={w} y2={-330} label={`${(w / 1000).toFixed(2)} m`} offset={-130} />
      <Dim x1={-330} y1={0} x2={-330} y2={d} label={`${(d / 1000).toFixed(2)} m`} offset={-130} vertical />

      {/* north marker: the design reasons about window orientation */}
      <g transform={`translate(${w - 180} ${d + 300})`}>
        <circle r={130} fill="none" stroke="var(--line-2)" strokeWidth={8} />
        <path d="M0,-95 L38,60 L0,25 L-38,60 Z" fill="var(--blueprint)" />
        <text
          y={-150} fill="var(--ink-3)" fontSize={120} fontFamily="var(--font-mono)" textAnchor="middle"
        >
          N
        </text>
      </g>
    </svg>
  );
}
