import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        white: "#FFFFFF",
        mist: "#F7FAF8",
        forest: "#063C29",
        emerald: { DEFAULT: "#08794D", light: "#18B777" },
        ink: "#121816",
      },
      fontFamily: {
        display: ["'Bricolage Grotesque Variable'", "system-ui", "sans-serif"],
        sans: ["'Manrope Variable'", "system-ui", "sans-serif"],
      },
      maxWidth: { grid: "1280px" },
      boxShadow: {
        soft: "0 1px 0 rgba(6,60,41,.04), 0 24px 48px -24px rgba(6,60,41,.18)",
        glow: "0 0 0 1px rgba(8,121,77,.4), 0 10px 40px -8px rgba(24,183,119,.55)",
      },
    },
  },
  plugins: [],
};
export default config;
