/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00D4FF',
          cyan: '#00FFF7',
          purple: '#B400FF',
          gold: '#FFD700',
          red: '#FF003C',
        },
        dark: {
          900: '#03040A',
          800: '#070B14',
          700: '#0D1526',
          600: '#111C33',
          500: '#162040',
          400: '#1E2D52',
        },
      },
      fontFamily: {
        display: ['var(--font-rajdhani)', 'sans-serif'],
        body: ['var(--font-exo)', 'sans-serif'],
        mono: ['var(--font-share-tech)', 'monospace'],
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 3s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        glow: {
          from: { textShadow: '0 0 10px #00D4FF, 0 0 20px #00D4FF' },
          to: { textShadow: '0 0 20px #00D4FF, 0 0 40px #00D4FF, 0 0 60px #00D4FF' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        'hero-gradient': 'linear-gradient(135deg, #03040A 0%, #070B14 50%, #0D1526 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(13,21,38,0.8) 0%, rgba(7,11,20,0.9) 100%)',
        'neon-border': 'linear-gradient(90deg, #00D4FF, #B400FF, #00D4FF)',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0,212,255,0.4), 0 0 40px rgba(0,212,255,0.2)',
        'neon-purple': '0 0 20px rgba(180,0,255,0.4), 0 0 40px rgba(180,0,255,0.2)',
        'neon-gold': '0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(255,215,0,0.2)',
        'card': '0 4px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
};
