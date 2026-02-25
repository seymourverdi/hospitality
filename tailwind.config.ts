import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // City Club Design System Colors - Extracted from Figma
      colors: {
        // Background colors (exact Figma values)
        background: {
          DEFAULT: 'hsl(var(--background))',
          secondary: 'hsl(var(--background-secondary))',
          tertiary: 'hsl(var(--background-tertiary))',
        },
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
          muted: 'hsl(var(--foreground-muted))',
        },

        // Sale module specific backgrounds - EXACT Figma values
        sale: {
          bg: '#292929',        // Main background (Figma: 292929)
          panel: '#404040',     // Order summary panel (Figma: 404040)
          card: '#3E3E3E',      // Input fields, buttons (Figma: 3E3E3E)
          cream: '#E6B357',     // Product card background (Figma: E6B357 golden)
          soldout: '#3E3E3E',   // Sold out card background
        },

        // Primary brand color (Green from Figma)
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
        },

        // Secondary colors
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },

        // Accent colors
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },

        // Semantic colors
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },

        // UI element colors
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // Category colors - EXACT Figma values
        category: {
          all: '#6366F1',       // Indigo - All Items
          snacks: '#EAB308',    // Yellow
          starters: '#EF6B6B',  // Coral/Red (updated from Figma)
          salads: '#22C55E',    // Green
          mains: '#D4A574',     // Tan/Beige (updated from Figma)
          beverage: '#14B8A6',  // Teal
          coffee: '#14B8A6',    // Teal (same as beverage)
          pastries: '#F472B6',  // Pink
          dessert: '#22C55E',   // Green
          sides: '#D4A574',     // Tan/Beige
        },

        // Routing badge colors
        routing: {
          kitchen: '#22C55E',  // Green - Daily/Kitchen
          bar: '#3B82F6',      // Blue - Bar
          heat: '#3B82F6',     // Blue - Heat required
        },

        // Status colors
        status: {
          incoming: '#374151',   // Gray
          fired: '#1F2937',      // Dark gray
          complete: '#22C55E',   // Green
          scheduled: '#3B82F6',  // Blue
        },

        // Sidebar colors
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          active: 'hsl(var(--sidebar-active))',
        },

        // Gray scale (from Figma)
        grey: {
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },

      // Typography
      fontSize: {
        // Headings
        'h1': ['28px', { lineHeight: '24px', fontWeight: '700' }],
        'h2': ['21px', { lineHeight: '18px', fontWeight: '600' }],
        'h3': ['18px', { lineHeight: '16px', fontWeight: '600' }],
        'h4': ['18px', { lineHeight: '16px', fontWeight: '500' }],
        // Body
        'body-lg': ['42px', { lineHeight: '36px', fontWeight: '700' }],
        'body-md': ['18px', { lineHeight: '16px', fontWeight: '400' }],
        'body-sm': ['18px', { lineHeight: '16px', fontWeight: '400' }],
        // Paragraphs
        'p1': ['14px', { lineHeight: '12px', fontWeight: '400' }],
        'p2': ['14px', { lineHeight: '10px', fontWeight: '400' }],
        'p3': ['8px', { lineHeight: '8px', fontWeight: '400' }],
        'p4': ['12px', { lineHeight: '10px', fontWeight: '400' }],
      },

      // Spacing
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
        '26': '104px',
        '30': '120px',
      },

      // Border radius
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': '24px',
      },

      // Box shadows
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'modal': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'sidebar': '2px 0 8px rgba(0, 0, 0, 0.1)',
        'toast': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },

      // Animations
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
        'slide-in-bottom': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-out-bottom': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(100%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-success': {
          '0%, 100%': { backgroundColor: 'hsl(var(--success))' },
          '50%': { backgroundColor: 'hsl(var(--success) / 0.7)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-out',
        'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
        'slide-out-bottom': 'slide-out-bottom 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'pulse-success': 'pulse-success 0.5s ease-in-out',
      },

      // Grid
      gridTemplateColumns: {
        'sale-desktop': '80px 1fr 380px', // Sidebar + Content + Order Summary
        'sale-tablet': '1fr 340px',
        'category-grid': 'repeat(auto-fill, minmax(120px, 1fr))',
        'product-grid': 'repeat(auto-fill, minmax(180px, 1fr))',
      },

      // Heights
      height: {
        'screen-minus-nav': 'calc(100vh - 80px)',
        'screen-minus-topbar': 'calc(100vh - 64px)',
      },

      // Min heights
      minHeight: {
        'card': '160px',
        'ticket': '120px',
      },

      // Z-index
      zIndex: {
        'sidebar': '40',
        'topbar': '30',
        'modal': '50',
        'toast': '60',
        'tooltip': '70',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
