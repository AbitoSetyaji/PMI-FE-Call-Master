/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        pmi: {
          red: "#DC2626",
          "red-dark": "#B91C1C",
          "red-light": "#FEE2E2",
        },
        status: {
          pending: "#EAB308",
          "pending-bg": "#FEF9C3",
          assigned: "#3B82F6",
          "assigned-bg": "#DBEAFE",
          "on-progress": "#F97316",
          "on-progress-bg": "#FFEDD5",
          completed: "#22C55E",
          "completed-bg": "#DCFCE7",
          cancelled: "#6B7280",
          "cancelled-bg": "#F3F4F6",
        },
      },
      animation: {
        "scale-in": "scaleIn 0.2s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "bounce-subtle": "bounceSubtle 0.5s ease-out",
      },
      keyframes: {
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
    },
  },
  plugins: [],
  darkMode: "media",
};
