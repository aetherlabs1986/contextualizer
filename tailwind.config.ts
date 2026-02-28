import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8f9fc",
        foreground: "#1e293b",
        border: "#e2e8f0",
        input: "#ffffff",
        ring: "#2563eb",
        panel: "#ffffff",

        "os-bg": "#f8f9fc",
        "os-surface": "#ffffff",
        "text-main": "#1e293b",
        "text-secondary": "#64748b",
        "soft-border": "#e2e8f0",

        primary: {
          DEFAULT: "#2563eb",
          soft: "#eff6ff",
          glow: "#60a5fa",
          foreground: "#ffffff",
        },
        "accent-purple": "#8b5cf6",
        "accent-purple-soft": "#f5f3ff",
        "accent-cyan": "#06b6d4",
        "accent-cyan-soft": "#ecfeff",

        "glass-border": "#e2e8f0",
        "glass-border-glow": "#cbd5e1",

        secondary: {
          DEFAULT: "#f1f5f9",
          foreground: "#1e293b",
        },
        muted: {
          DEFAULT: "#f8fafc",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#2563eb",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1e293b",
        },
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 10px rgba(37, 99, 235, 0.2)",
        "inner-light": "inset 0 1px 0 0 rgba(255, 255, 255, 0.8)",
        "glass-depth": "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)",
        "soft-xl": "0 20px 40px -10px rgba(0,0,0,0.05)",
        "soft-2xl": "0 25px 50px -12px rgba(148, 163, 184, 0.15)",
        "card-hover": "0 20px 40px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.01)",
        float: "0 10px 30px -5px rgba(37, 99, 235, 0.15)",
      },
      borderRadius: {
        lg: "24px",
        md: "16px",
        sm: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
