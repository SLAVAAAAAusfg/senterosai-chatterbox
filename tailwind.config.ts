
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				'fade-out': {
					from: { opacity: '1' },
					to: { opacity: '0' },
				},
				'slide-in-left': {
					from: { transform: 'translateX(-100%)' },
					to: { transform: 'translateX(0)' },
				},
				'slide-out-left': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(-100%)' },
				},
				'slide-in-right': {
					from: { transform: 'translateX(100%)' },
					to: { transform: 'translateX(0)' },
				},
				'slide-out-right': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(100%)' },
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'70%': { transform: 'scale(1.05)', opacity: '1' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				'pulse-opacity': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-in-out',
				'fade-out': 'fade-out 0.3s ease-in-out',
				'slide-in-left': 'slide-in-left 0.3s ease-in-out',
				'slide-out-left': 'slide-out-left 0.3s ease-in-out',
				'slide-in-right': 'slide-in-right 0.3s ease-in-out',
				'slide-out-right': 'slide-out-right 0.3s ease-in-out',
				'bounce-in': 'bounce-in 0.5s ease-out',
				'pulse-opacity': 'pulse-opacity 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: '80ch',
						color: 'var(--tw-prose-body)',
						'[class~="lead"]': {
							color: 'var(--tw-prose-lead)',
						},
						a: {
							color: 'var(--tw-prose-links)',
							textDecoration: 'underline',
							fontWeight: '500',
						},
						strong: {
							color: 'var(--tw-prose-bold)',
							fontWeight: '600',
						},
						'ol > li::marker': {
							color: 'var(--tw-prose-counters)',
						},
						'ul > li::marker': {
							color: 'var(--tw-prose-bullets)',
						},
						hr: {
							borderColor: 'var(--tw-prose-hr)',
							borderTopWidth: 1,
						},
						blockquote: {
							color: 'var(--tw-prose-quotes)',
							borderLeftWidth: '0.25rem',
							borderLeftColor: 'var(--tw-prose-quote-borders)',
							paddingLeft: '1rem',
						},
						h1: {
							color: 'var(--tw-prose-headings)',
							fontWeight: '800',
						},
						h2: {
							color: 'var(--tw-prose-headings)',
							fontWeight: '700',
						},
						h3: {
							color: 'var(--tw-prose-headings)',
							fontWeight: '600',
						},
						h4: {
							color: 'var(--tw-prose-headings)',
							fontWeight: '600',
						},
						'figure figcaption': {
							color: 'var(--tw-prose-captions)',
						},
						code: {
							color: 'var(--tw-prose-code)',
							fontWeight: '600',
						},
						'a code': {
							color: 'var(--tw-prose-links)',
						},
						pre: {
							color: 'var(--tw-prose-pre-code)',
							backgroundColor: 'var(--tw-prose-pre-bg)',
							overflowX: 'auto',
							fontWeight: '400',
						},
						'pre code': {
							backgroundColor: 'transparent',
							borderWidth: '0',
							borderRadius: '0',
							padding: '0',
							fontWeight: 'inherit',
							color: 'inherit',
							fontSize: 'inherit',
							fontFamily: 'inherit',
							lineHeight: 'inherit',
						},
						'pre code::after': {
							content: 'none',
						},
						'pre code::before': {
							content: 'none',
						},
					},
				},
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
