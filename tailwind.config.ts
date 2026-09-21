import type { Config } from "tailwindcss";

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		colors: {
  			'surface-deep': '#0b0e14',
  			surface: '#10131a',
  			'surface-canvas': '#12161f',
  			'surface-card': '#161b26',
  			'surface-elevated': '#1f2736',
  			'surface-variant': '#32353c',
  			'surface-bright': '#363940',
  			'text-primary': '#f1f5f9',
  			'text-secondary': '#94a3b8',
  			'text-tertiary': '#64748b',
  			'on-surface': '#e1e2eb',
  			'on-surface-variant': '#bac9cc',
  			'primary-container': '#00e5ff',
  			'on-primary-container': '#00626e',
  			'primary-fixed': '#9cf0ff',
  			'primary-fixed-dim': '#00daf3',
  			'on-primary': '#00363d',
  			'synergy-cyan': '#00f2fe',
  			'gold-tier-s': '#ffd166',
  			'purple-tier-a': '#a855f7',
  			'threat-crimson': '#ff4757',
  			'status-grass': '#2ed573',
  			'status-water': '#1e90ff',
  			'status-electric': '#ffbe0b',
  			'secondary-fixed': '#efdbff',
  			'secondary-fixed-dim': '#dcb8ff',
  			outline: '#849396',
  			'outline-variant': '#3b494c',
  			'border-subtle': '#242d3d',
  			'border-neon': '#2e3a4e',
  			'border-active': '#00e5ff',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			'headline-xl': ['var(--font-space-grotesk)', 'sans-serif'],
  			'headline-lg': ['var(--font-space-grotesk)', 'sans-serif'],
  			'headline-md': ['var(--font-space-grotesk)', 'sans-serif'],
  			'headline-sm': ['var(--font-space-grotesk)', 'sans-serif'],
  			'body-lg': ['var(--font-inter)', 'sans-serif'],
  			'body-md': ['var(--font-inter)', 'sans-serif'],
  			'body-sm': ['var(--font-inter)', 'sans-serif'],
  			'label-md': ['var(--font-inter)', 'sans-serif'],
  			'badge-tag': ['var(--font-jetbrains-mono)', 'monospace'],
  			'label-mono': ['var(--font-jetbrains-mono)', 'monospace'],
  			'stat-display': ['var(--font-jetbrains-mono)', 'monospace'],
  			'stat-metric': ['var(--font-jetbrains-mono)', 'monospace']
  		},
  		fontSize: {
  			'headline-xl': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
  			'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.015em', fontWeight: '700' }],
  			'headline-md': ['22px', { lineHeight: '28px', fontWeight: '600' }],
  			'headline-sm': ['18px', { lineHeight: '24px', fontWeight: '600' }],
  			'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
  			'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
  			'body-sm': ['12px', { lineHeight: '18px', fontWeight: '400' }],
  			'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.04em', fontWeight: '600' }],
  			'label-mono': ['11px', { lineHeight: '14px', letterSpacing: '0.06em', fontWeight: '500' }],
  			'badge-tag': ['10px', { lineHeight: '12px', letterSpacing: '0.08em', fontWeight: '700' }],
  			'stat-display': ['28px', { lineHeight: '32px', letterSpacing: '-0.03em', fontWeight: '700' }],
  			'stat-metric': ['16px', { lineHeight: '20px', letterSpacing: '-0.01em', fontWeight: '600' }]
  		},
  		spacing: {
  			'space-xs': '0.25rem',
  			'space-sm': '0.5rem',
  			'space-md': '1rem',
  			'space-lg': '1.5rem',
  			'space-xl': '2rem',
  			'space-2xl': '3rem',
  			margin: '1rem',
  			'margin-tablet': '1.5rem',
  			'margin-desktop': '2.5rem',
  			gutter: '1rem',
  			'gutter-desktop': '1.5rem'
  		},
  		borderRadius: {
  			DEFAULT: '0.125rem',
  			lg: '0.25rem',
  			xl: '0.5rem',
  			full: '0.75rem',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
