import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#090909",
          900: "#111111",
          800: "#1a1a1a",
        },
        mist: {
          50: "#f6eddc",
          100: "#eadbb9",
          200: "#d6c197",
        },
        ember: {
          400: "#FFA726",
          500: "#FF8C00",
          600: "#E67700",
        },
        tealglass: {
          400: "#8a8067",
          500: "#5e5542",
        },
        smoke: {
          300: "#b2ab9d",
          400: "#8c8475",
          500: "#625b4e",
        },
      },
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        sans: ["'Manrope'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        soft: "0 28px 70px rgba(0, 0, 0, 0.35)",
        glow: "0 0 0 1px rgba(255, 140, 0, 0.12), 0 24px 60px rgba(255, 140, 0, 0.4)",
      },
      backgroundImage: {
        aura: "radial-gradient(circle at 18% 16%, rgba(255, 140, 0, 0.22), transparent 28%), radial-gradient(circle at 82% 14%, rgba(255, 167, 38, 0.14), transparent 20%), radial-gradient(circle at 50% 82%, rgba(246, 237, 220, 0.08), transparent 32%)",
        noise: "linear-gradient(135deg, rgba(255,255,255,0.015) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,0.015) 25%, transparent 25%), linear-gradient(315deg, rgba(255,255,255,0.015) 25%, transparent 25%), linear-gradient(45deg, rgba(255,255,255,0.015) 25%, transparent 25%)",
        brand: "linear-gradient(135deg, #FF8C00 0%, #FFA726 55%, #FFD180 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
