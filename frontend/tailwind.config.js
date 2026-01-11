/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom Momentum colors from inspiration
        'momentum-dark': '#202125',
        'momentum-cream': '#FEECBA',
        'momentum-offwhite': '#F8F8FC',
        'momentum-lavender-light': '#EFECFE',
        'momentum-lavender': '#D6D0FD',
        // Pastel palette for badges and tags
        'pastel-peach': '#dfbbb1',
        'pastel-cyan': '#cefdff',
        'pastel-lilac': '#dcc6dd',
        'pastel-mauve': '#c591ae',
        'pastel-pink': '#e590b9',
        'pastel-periwinkle': '#bfd2f7',
        'pastel-sage': '#97ba9a',
        'pastel-plum': '#ae5b7f',
        'pastel-lavender': '#d6c6f3',
        'pastel-lime': '#d9f9a5',
        'pastel-red': '#F9AEAE',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
