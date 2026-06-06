import { createTheme } from "@mantine/core";

const theme = createTheme({
    cursorType: "pointer",
    primaryColor: "dark",
    primaryShade: 0,
    fontFamily: "var(--font-britti-sans-trial), sans-serif",
    colors: {
        dark: [
            "#0d1624", // 0 — primary
            "#151d2d", // 1
            "#1d2639", // 2
            "#252f45", // 3
            "#2d384d", // 4
            "#354155", // 5
            "#3d4a5d", // 6
            "#454d65", // 7
            "#4d566d", // 8
            "#555f75", // 9
        ],
    },
});

export default theme;
export type ThemeType = typeof theme;