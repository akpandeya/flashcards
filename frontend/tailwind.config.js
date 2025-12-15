/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0e7490",
                    "50": "#ecfeff",
                    "100": "#cffafe",
                    "200": "#a5f3fc",
                    "300": "#67e8f9",
                    "400": "#22d3ee",
                    "500": "#06b6d4",
                    "600": "#0891b2",
                    "700": "#0e7490",
                    "800": "#155e75",
                    "900": "#164e63",
                    "950": "#083344"
                },
                secondary: {
                    DEFAULT: "#f97316",
                    "50": "#fff7ed",
                    "100": "#ffedd5",
                    "200": "#fed7aa",
                    "300": "#fdba74",
                    "400": "#fb923c",
                    "500": "#f97316",
                    "600": "#ea580c",
                    "700": "#c2410c",
                    "800": "#9a3412",
                    "900": "#7c2d12",
                    "950": "#431407"
                }
            }
        },
    },
    plugins: [],
}
