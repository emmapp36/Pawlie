import type { ReactNode } from 'react';

interface StatCellProps {
  icon: ReactNode;
  label: string;
  value: string;
}

/** Borderless vitals cell: icon marker, uppercase label, tabular value. */
export function StatCell({ icon, label, value }: StatCellProps) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <span
        className="flex h-8 w-8 items-center justify-center bg-mint-tint text-mint-deep"
        style={{ borderRadius: 'var(--halo-radius)' }}
        aria-hidden
      >
        {icon}
      </span>
      <span className="text-[11px] font-extrabold uppercase tracking-[0.09em] text-ink-soft">
        {label}
      </span>
      <span className="font-display text-lg font-bold tabular-nums">{value}</span>
    </div>
  );
}
