/**
 * Tailwind preset mapping design tokens to CSS custom properties.
 * The variables themselves are declared in each app's global stylesheet,
 * where light/dark values are assigned per color-scheme.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        ground: 'var(--ground)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        line: 'var(--line)',
        mint: 'var(--mint)',
        'mint-tint': 'var(--mint-tint)',
        'mint-deep': 'var(--mint-deep)',
        'on-mint': 'var(--on-mint)',
        'sky-soft': 'var(--sky-soft)',
        'sky-deep': 'var(--sky-deep)',
        safe: 'var(--safe)',
        'safe-soft': 'var(--safe-soft)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
      },
      borderRadius: {
        card: '28px',
        panel: '22px',
        pill: '999px',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        lift: 'var(--shadow-lift)',
      },
      fontFamily: {
        display: ['"Varela Round"', 'ui-rounded', 'system-ui', 'sans-serif'],
        body: ['"Nunito Sans"', '"Avenir Next"', 'system-ui', 'sans-serif'],
      },
      transitionDuration: {
        enter: '220ms',
        exit: '150ms',
      },
    },
  },
};
