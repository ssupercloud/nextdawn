import type { Config } from "tailwindcss";

const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: ["'Playfair Display'", "serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        "news-black": "#0a0a0a",
        "news-gray": "#505050",
        "paper-beige": "#f4ebdd",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;

