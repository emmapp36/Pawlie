import type { ButtonHTMLAttributes } from 'react';

const VARIANTS = {
  primary: 'bg-mint text-on-mint font-bold shadow-soft hover:shadow-lift',
  quiet: 'bg-surface text-ink shadow-soft hover:bg-mint-tint',
  clinical: 'bg-sky-soft text-sky-deep font-bold hover:shadow-soft',
} as const;

type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  fullWidth?: boolean;
};

export function PillButton({
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}: PillButtonProps) {
  return (
    <button
      className={[
        'rounded-pill px-6 py-3 text-sm transition-all duration-enter',
        'active:scale-[0.98] focus-visible:outline focus-visible:outline-2',
        'focus-visible:outline-offset-2 focus-visible:outline-mint-deep',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    />
  );
}
