import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Paleta "Cauce" — inspirada en el embalse, el agua en movimiento y la energía.
        basalt: {
          950: "#0B1A1F",
          900: "#0F232A",
          800: "#153039",
          700: "#1D3F4A"
        },
        cauce: {
          400: "#3FD6C4",
          500: "#1FB6A6",
          600: "#149387"
        },
        ember: {
          400: "#F2A464",
          500: "#E8935B",
          600: "#D97A3D"
        },
        mist: {
          50: "#F4F7F6",
          100: "#E7EEEC",
          200: "#CBDAD7"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        md: "4px",
        lg: "6px"
      },
      boxShadow: {
        none: "none"
      }
    }
  },
  plugins: []
};

export default config;
