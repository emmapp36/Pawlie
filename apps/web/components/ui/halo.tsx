import type { ReactNode } from 'react';

const TONES = {
  mint: 'bg-mint',
  blossom: 'bg-[#F2D8E1]',
  butter: 'bg-[#F4E9C8]',
  lilac: 'bg-[#E4DDF2]',
} as const;

interface HaloProps {
  children: ReactNode;
  tone?: keyof typeof TONES;
  size?: number;
}

/**
 * Organic blob backdrop for pet avatars and hero imagery — the one element
 * of the design system allowed to break card bounds.
 */
export function Halo({ children, tone = 'mint', size = 96 }: HaloProps) {
  return (
    <span
      className={`inline-flex items-center justify-center ${TONES[tone]}`}
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--halo-radius)',
      }}
    >
      {children}
    </span>
  );
}
