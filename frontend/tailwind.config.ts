import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#ffffff",
                foreground: "#111111",
                primary: "#e8eff5", // Hinge-like soft grey/blue
                accent: "#e11d48", // Modern Rose/Red for Pune Dating
                error: "#ff4d4f",
                border: "#e5e5e5"
            },
            fontFamily: {
                sans: ["var(--font-inter)"],
                serif: ["var(--font-playfair)"],
            }
        },
    },
    plugins: [],
};
export default config;
