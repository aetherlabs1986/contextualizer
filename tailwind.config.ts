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
        background: "#0a0b0d", // os-bg
        foreground: "#cbd5e1", // slate-300
        border: "rgba(255, 255, 255, 0.08)",
        input: "rgba(19, 21, 26, 0.6)",
        ring: "#3b82f6",
        panel: "#13151a", // os-surface

        "os-bg": "#0a0b0d",
        "os-surface": "#13151a",
        primary: {
          DEFAULT: "#3b82f6",
          glow: "#60a5fa",
          foreground: "#ffffff",
        },
        "accent-purple": "#8b5cf6",
        "accent-cyan": "#22d3ee",
        "glass-border": "rgba(255, 255, 255, 0.08)",
        "glass-border-glow": "rgba(255, 255, 255, 0.15)",

        secondary: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "rgba(255, 255, 255, 0.03)",
          foreground: "#94a3b8", // slate-400
        },
        accent: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "rgba(19, 21, 26, 0.6)",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"],
        "sans": ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        'neon': '0 0 10px rgba(59, 130, 246, 0.5)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'glass-depth': '0 20px 40px -10px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'noise': "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\" opacity=\"0.05\"/%3E%3C/svg%3E')",
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
