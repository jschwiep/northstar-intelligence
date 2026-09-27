import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Claude-like warm neutral palette
        canvas: "#f5f4ef", // warm off-white app background
        surface: "#faf9f5", // slightly lighter card surface
        panel: "#ffffff",
        ink: {
          DEFAULT: "#2b2a27", // primary dark neutral text
          soft: "#57544e", // secondary text
          faint: "#8a867d", // tertiary / captions
        },
        line: {
          DEFAULT: "#e7e4dc", // subtle borders
          strong: "#d8d4ca",
        },
        accent: {
          DEFAULT: "#c8663d", // restrained Claude terracotta
          soft: "#e9d9cf",
          wash: "#f6ede7",
        },
        signal: {
          high: "#3f7a5d",
          med: "#b07b2c",
          low: "#a05a4a",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        card: "0 1px 2px rgba(43, 42, 39, 0.04)",
        drawer: "-8px 0 30px rgba(43, 42, 39, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
