// Shrinks the artwork PokéIQ shows on its Pokédex (playpokeiq.com/art/160/<number>.webp, saved to
// mocks/out/art) into small pixel sprites for the Pokédex tab of the pixel PokéIQ: lib/dex.ts.
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const DEX = [
  ["BULBASAUR", ["GRASS", "POISON"]], ["IVYSAUR", ["GRASS", "POISON"]], ["VENUSAUR", ["GRASS", "POISON"]],
  ["CHARMANDER", ["FIRE"]], ["CHARMELEON", ["FIRE"]], ["CHARIZARD", ["FIRE", "FLYING"]],
  ["SQUIRTLE", ["WATER"]], ["WARTORTLE", ["WATER"]], ["BLASTOISE", ["WATER"]],
  ["CATERPIE", ["BUG"]], ["METAPOD", ["BUG"]], ["BUTTERFREE", ["BUG", "FLYING"]],
];
const N = 28;
const CH = "0123456789abcdefghijklmnopqrstuvwxyz";
const out = [];
for (let n = 1; n <= DEX.length; n++) {
  const trimmed = await sharp(join(here, "out", "art", `${n}.webp`)).trim().toBuffer();
  const small = await sharp(trimmed).resize(N, N, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: "lanczos3" }).png().toBuffer();
  const { data, info } = await sharp(small).png({ palette: true, colours: 9, dither: 0 }).toBuffer().then((b) => sharp(b).ensureAlpha().raw().toBuffer({ resolveWithObject: true }));
  const colors = [];
  const grid = Array.from({ length: N + 2 }, () => new Array(N + 2).fill("."));
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const i = (y * info.width + x) * 4;
      if (data[i + 3] < 140) continue;
      const hex = "#" + [data[i], data[i + 1], data[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join("");
      let k = colors.indexOf(hex);
      if (k < 0) k = colors.push(hex) - 1;
      grid[y + 1][x + 1] = CH[k];
    }
  const solid = (x, y) => grid[y]?.[x] !== undefined && grid[y][x] !== "." && grid[y][x] !== "#";
  for (let y = 0; y < N + 2; y++) for (let x = 0; x < N + 2; x++) if (grid[y][x] === "." && (solid(x + 1, y) || solid(x - 1, y) || solid(x, y + 1) || solid(x, y - 1))) grid[y][x] = "#";
  out.push({ name: DEX[n - 1][0], types: DEX[n - 1][1], colors, rows: grid.map((line) => line.join("")) });
}
writeFileSync(join(here, "..", "lib", "dex.ts"), `// The first twelve Pokémon for the Pokédex tab of the pixel PokéIQ, shrunk from the artwork PokéIQ
// itself shows on its Pokédex (made by mocks/dex-sprites.mjs). Rows use the same letters as lib/sprites.ts.
import type { Sprite } from "./sprites";

export const DEX: { name: string; types: string[]; art: Sprite }[] = [
${out.map((d) => `  { name: "${d.name}", types: ${JSON.stringify(d.types)}, art: { w: ${N + 2}, h: ${N + 2}, colors: ${JSON.stringify(d.colors)}, rows: ${JSON.stringify(d.rows)} } },`).join("\n")}
];
`);
console.log(out.map((d) => d.name + ":" + d.colors.length).join(" "));
