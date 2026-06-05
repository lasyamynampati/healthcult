import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand teal — primary actions, links, accents
        brand: {
          50:  "hsl(185 80% 96%)",
          100: "hsl(185 75% 90%)",
          200: "hsl(185 70% 78%)",
          300: "hsl(185 65% 63%)",
          400: "hsl(185 60% 48%)",
          500: "hsl(185 65% 38%)",
          600: "hsl(185 70% 30%)",
          700: "hsl(185 75% 22%)",
          800: "hsl(185 80% 16%)",
          900: "hsl(185 85% 10%)",
        },
        // Surface tokens — map to CSS variables
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          overlay: "var(--surface-overlay)",
        },
        // Text tokens
        text: {
          primary:   "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted:     "var(--text-muted)",
        },
        // Border tokens
        border: {
          DEFAULT: "var(--border)",
          strong:  "var(--border-strong)",
        },
        // Risk band semantics — accessible (not pure red/green)
        risk: {
          low:        "hsl(158 55% 40%)",
          "low-bg":   "hsl(158 55% 96%)",
          "low-ring": "hsl(158 55% 80%)",
          mod:        "hsl(38  90% 42%)",
          "mod-bg":   "hsl(38  90% 96%)",
          "mod-ring": "hsl(38  90% 75%)",
          high:       "hsl(355 65% 45%)",
          "high-bg":  "hsl(355 65% 96%)",
          "high-ring":"hsl(355 65% 78%)",
        },
      },
      fontFamily: {
        sans: ["Inter var", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card:    "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-md": "0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        "card-lg": "0 8px 24px 0 rgb(0 0 0 / 0.10), 0 4px 8px -4px rgb(0 0 0 / 0.06)",
        fab:     "0 4px 16px 0 rgb(0 0 0 / 0.18)",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-down": {
          "0%":   { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
        "meter-fill": {
          "0%":   { "stroke-dashoffset": "251" },
          "100%": { "stroke-dashoffset": "var(--meter-offset)" },
        },
        "hero-reveal": {
          "0%":   { opacity: "0", transform: "translateY(32px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float-gentle": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "glow-pulse": {
          "0%, 100%": { "box-shadow": "0 0 20px hsl(185 65% 38% / 0.3)" },
          "50%":      { "box-shadow": "0 0 30px hsl(185 65% 38% / 0.5)" },
        },
        "mesh-drift": {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "25%":      { transform: "translate(10px, -5px) rotate(1deg)" },
          "50%":      { transform: "translate(-5px, 10px) rotate(-0.5deg)" },
          "75%":      { transform: "translate(-10px, -5px) rotate(0.5deg)" },
        },
      },
      animation: {
        "fade-up":    "fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":    "fade-in 0.3s ease both",
        "slide-down": "slide-down 0.25s ease both",
        pulse:        "pulse 1.8s ease-in-out infinite",
        "meter-fill": "meter-fill 1s cubic-bezier(0.16,1,0.3,1) forwards",
        "hero-reveal": "hero-reveal 0.8s cubic-bezier(0.16,1,0.3,1) both",
        "float-gentle": "float-gentle 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "mesh-drift": "mesh-drift 20s ease-in-out infinite",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
};

export default config;
