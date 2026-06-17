/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // RGB channels for Tailwind opacity modifiers (rgb(var(--x) / <alpha-value>))
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "accent-soft": "rgb(var(--color-accent-soft) / <alpha-value>)",
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 6px 24px -8px rgb(var(--color-accent) / 0.25)",
      },
      fontFamily: {
        sans: ["Inter", "Avenir", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
