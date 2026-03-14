/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F3F7FC",
        card: "#FFFFFF",
        border: "#D7E3EF",
        primary: "#4F8CFF",
        secondary: "#22C55E",
        danger: "#EF4444",
        text: {
          primary: "#102033",
          secondary: "#5E7189",
        },
      },
      boxShadow: {
        panel: "0 20px 45px rgba(148, 163, 184, 0.18)",
        glow: "0 0 0 1px rgba(79, 140, 255, 0.12), 0 0 28px rgba(79, 140, 255, 0.12)",
      },
      backgroundImage: {
        "cyber-grid":
          "linear-gradient(rgba(79, 140, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 140, 255, 0.06) 1px, transparent 1px)",
      },
      fontFamily: {
        sans: ["Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
