import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export function Card({ interactive = false, className = '', ...props }: CardProps) {
  const base = 'rounded-card bg-surface p-6 shadow-soft';
  const hover = interactive
    ? ' transition-transform duration-enter hover:shadow-lift active:scale-[0.98] cursor-pointer'
    : '';
  return <div className={`${base}${hover} ${className}`} {...props} />;
}
