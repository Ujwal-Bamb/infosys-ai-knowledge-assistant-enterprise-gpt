import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#060E1A",
          900: "#0B192C", // Dark navy sidebar
          850: "#0E213B",
          800: "#132742",
          700: "#1B365D",
          600: "#274C82",
        },
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#2563EB",
          600: "#1E60FF", // Primary bright blue from reference UI
          700: "#1551E5",
          800: "#0F3EB5",
        },
        surface: {
          50: "#F8FAFC",  // Off-white / light slate
          100: "#F1F5F9",
          200: "#E2E8F0", // Borders
          300: "#CBD5E1",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
