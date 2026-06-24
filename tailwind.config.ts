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
      },
    },
  },
  plugins: [],
};

export default config;
