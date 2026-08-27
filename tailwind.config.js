module.exports = {
  blocklist: ['container'],
  theme: {
    extend: {
      colors: {
        blue: '#192D64',
        yellow: '#EEAF32',
        black: '#333333',
        white: '#FFFEF6',
        gray: '#949494',
        'dark-gray': '#777676',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        destructive: 'var(--destructive)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        information: 'var(--information)',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      spacing: {
        'sidebar-width': 'var(--sidebar-width)',
        'sidebar-content-offset': 'var(--sidebar-content-offset)',
      },
    },
  },
}
