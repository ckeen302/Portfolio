/** The two pixel-art palettes. Every canvas on the site draws with these keys ("i" is ink: navy by day, cream by night; "s" is the sky in the window, "g" that sky when it is overcast, "c" a cloud against it, "w" falling rain). */
export type Pal = Record<string, string>;

export const DAY: Pal = { 0: "#f4f0dc", 1: "#bccbb4", 2: "#6f8a86", 3: "#2f4858", k: "#182630", o: "#f26b3a", y: "#f2c14e", d: "#f4f0dc", i: "#182630", s: "#8ec5d6", g: "#93a7ad", c: "#c9d3cf", w: "#eef2ee" };
export const NIGHT: Pal = { 0: "#f4f0dc", 1: "#24384c", 2: "#1b2c3d", 3: "#101b26", k: "#070c12", o: "#f26b3a", y: "#f2c14e", d: "#2f4a63", i: "#f4f0dc", s: "#101b26", g: "#1c2833", c: "#2e3f4f", w: "#7c97ad" };
