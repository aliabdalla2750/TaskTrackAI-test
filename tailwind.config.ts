import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "0.75rem", // 12px
        md: "0.625rem", // 10px
        sm: "0.5rem", // 8px
        xl: "1rem", // 16px
        "2xl": "1.5rem", // 24px
      },
      colors: {
        // الألوان الأساسية الجديدة بناءً على التصميم المحدث
        primary: {
          DEFAULT: "#5A47FF", // اللون الأساسي
          hover: "#4938e0",
          light: "#7a6aff",
          dark: "#4735e0",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#00BFA6", // اللون الثانوي
          hover: "#00a892",
          light: "#33d6c2",
          dark: "#00a892",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#FF9800", // لون التمييز
          hover: "#e68900",
          light: "#ffc107",
          dark: "#e67700",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#10b981",
          hover: "#0ca975",
          light: "#34d399",
          dark: "#059669",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b",
          hover: "#d97706",
          light: "#fbbf24",
          dark: "#b45309",
          foreground: "#ffffff",
        },
        error: {
          DEFAULT: "#ef4444",
          hover: "#dc2626",
          light: "#f87171",
          dark: "#b91c1c",
          foreground: "#ffffff",
        },
        // الألوان العامة
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // ألوان المخططات البيانية
        chart: {
          "1": "hsl(var(--chart-1))", // اللون الأساسي
          "2": "hsl(var(--chart-2))", // اللون الثانوي
          "3": "hsl(var(--chart-3))", // لون التمييز
          "4": "hsl(var(--chart-4))", // لون رابع
          "5": "hsl(var(--chart-5))", // لون خامس
        },
        // ألوان الشريط الجانبي
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseLight: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.7' },
          '100%': { opacity: '1' },
        },
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '50%': { borderColor: 'transparent' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-right": "slideRight 0.4s ease-out",
        "pulse": "pulse 0.5s ease-in-out",
        "pulse-light": "pulseLight 2s infinite",
        "typing": "typing 2s steps(30, end)",
        "blink": "blink 0.75s step-end infinite",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        arabic: ['Cairo', 'sans-serif'],
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'button': 'var(--shadow-button)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'dropdown': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'input': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'toast': '0 8px 16px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(to right, #5A47FF, #7a6aff)',
        'gradient-secondary': 'linear-gradient(to right, #00BFA6, #33d6c2)',
        'gradient-accent': 'linear-gradient(to right, #FF9800, #ffc107)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'width': 'width',
        'transform': 'transform',
      },
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '85': '0.85',
        '95': '0.95',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
