import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['"Nunito Sans"', 'sans-serif'],
  			serif: ['Fraunces', 'Georgia', 'serif'],
  			hand: ['Caveat', 'cursive'],
  		},
  		screens: {
  			xs: '475px'
  		},
  		colors: {
  			detroit: {
  				'50': '#f0f7ff',
  				'100': '#e0effe',
  				'200': '#bae0fd',
  				'300': '#7cc8fb',
  				'400': '#38acf6',
  				'500': '#0e91e9',
  				'600': '#0074c8',
  				'700': '#005da3',
  				'800': '#004f86',
  				'900': '#064270',
  				'950': '#042a4a'
  			},
  			sage: {
  				'50': '#f4f7f4',
  				'100': '#e5ebe5',
  				'200': '#ced9ce',
  				'300': '#adc0ad',
  				'400': '#83a083',
  				'500': '#648164',
  				'600': '#4d654d',
  				'700': '#3f523f',
  				'800': '#354335',
  				'900': '#2d382d',
  				'950': '#181e18'
  			},
			michigan: {
				navy: '#00274C',
				maize: '#FFCB05',
				coral: '#FF8C42',
				blue: '#4DB8FF',
			},
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
  			}
  		},
  		animation: {
  			float: 'float 6s ease-in-out infinite',
  			'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
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
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
}
