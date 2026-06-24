import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand — main
        ink: "#272727",
        forest: "#152b1f",
        cream: "#f2da92",
        stone: "#b0aea5",
        bone: "#e8e6dc",
        // Brand — accents
        fawn: "#ddb962",
        teal: "#115a3f",
        moss: "#09402b",
      },
      fontFamily: {
        sans: ["var(--font-neue-haas)", "system-ui", "sans-serif"],
        display: ["var(--font-neue-haas)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "1280px",
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease-out both",
        "marquee": "marquee 40s linear infinite",
        "glow": "glow 2.8s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        // brilho pulsante (usado em marcos importantes do legado)
        glow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.98)" },
          "50%": { opacity: "0.85", transform: "scale(1.03)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
