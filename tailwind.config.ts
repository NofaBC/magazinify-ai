import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",          // catch-all safety
  ],
  theme: {
    extend: {
      borderRadius: {
        "2xl": "1rem",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
