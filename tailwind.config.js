/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"]
      },
      colors: {
        ink: "#0b0b0e",
        paper: "#f6f0e8",
        acid: "#32e875",
        ember: "#f04d23",
        slate: "#1c1c27",
        grit: "#9a8c7c"
      },
      boxShadow: {
        card: "0 18px 40px rgba(0,0,0,0.25)",
        glow: "0 0 40px rgba(50,232,117,0.35)",
        heat: "0 0 40px rgba(240,77,35,0.35)"
      }
    }
  },
  plugins: []
};
