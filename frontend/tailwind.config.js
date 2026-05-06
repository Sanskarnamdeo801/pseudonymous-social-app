export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                ink: {
                    950: "#09111c",
                    900: "#142030",
                    800: "#203247",
                },
                mist: {
                    50: "#f6f7fb",
                    100: "#eef1f7",
                    200: "#d7deea",
                },
                ember: {
                    400: "#f97316",
                    500: "#ea580c",
                    600: "#c2410c",
                },
                tealglass: {
                    400: "#2dd4bf",
                    500: "#14b8a6",
                },
            },
            fontFamily: {
                display: ["'Space Grotesk'", "sans-serif"],
                mono: ["'IBM Plex Mono'", "monospace"],
            },
            boxShadow: {
                soft: "0 22px 60px rgba(15, 23, 42, 0.12)",
            },
            backgroundImage: {
                aura: "radial-gradient(circle at top, rgba(45,212,191,0.18), transparent 32%), radial-gradient(circle at bottom right, rgba(249,115,22,0.14), transparent 28%)",
            },
        },
    },
    plugins: [],
};
