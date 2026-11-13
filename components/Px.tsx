/** Small pixel icons, each drawn on a tiny grid so they stay crisp at any size. */
type P = { size?: number; className?: string };
const svg = (w: number, h: number, d: string, { size = 14, className }: P) => (
  <svg className={className} width={(size * w) / h} height={size} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
    <path fill="currentColor" d={d} />
  </svg>
);

/** Path for an icon drawn as rows of "#" (filled) and "." (empty). */
const rows = (lines: string[]) =>
  lines.map((line, y) => [...line.matchAll(/#+/g)].map((m) => `M${m.index} ${y}h${m[0].length}v1h-${m[0].length}z`).join("")).join("");

export const PxGitHub = (p: P) =>
  svg(11, 11, rows([".#.......#.", ".##.....##.", ".#########.", "###########", "###########", "###########", ".#########.", "..#######..", "#..##.##...", ".####.##...", "...##.##..."]), p);
export const PxLinkedIn = (p: P) =>
  svg(9, 9, rows([".#######.", "#########", "##.######", "#########", "##.#...##", "##.#.#.##", "##.#.#.##", "#########", ".#######."]), p);
export const PxMail = (p: P) => svg(9, 7, rows(["#########", "##.....##", "#.#...#.#", "#..#.#..#", "#...#...#", "#.......#", "#########"]), p);
export const PxOut = (p: P) => svg(7, 7, "M2 0h5v5h-1v-4h-4zM5 1h1v1h-1zM4 2h1v1h-1zM3 3h1v1h-1zM2 4h1v1h-1zM1 5h1v1h-1z", p);
export const PxDown = (p: P) => svg(6, 7, "M2 0h2v3h2v1h-1v1h-1v1h-2v-1h-1v-1h-1v-1h2zM0 6h6v1h-6z", p);
export const PxCursor = (p: P) => svg(4, 7, "M0 0h1v7h-1zM1 1h1v5h-1zM2 2h1v3h-1zM3 3h1v1h-1z", p);
export const PxMore = (p: P) => svg(7, 4, "M0 0h7v1h-7zM1 1h5v1h-5zM2 2h3v1h-3zM3 3h1v1h-1z", p);
export const PxPin = (p: P) => svg(6, 8, "M1 0h4v1h1v3h-1v1h-1v2h-1v1h-1v-3h-1v-1h-1v-3h1zM2 2v2h2v-2z", p);
export const PxSun = (p: P) => svg(7, 7, "M3 0h1v1h-1zM0 3h1v1h-1zM6 3h1v1h-1zM3 6h1v1h-1zM2 2h3v3h-3zM1 1h1v1h-1zM5 1h1v1h-1zM1 5h1v1h-1zM5 5h1v1h-1z", p);
export const PxMoon = (p: P) => svg(7, 7, "M2 0h3v1h-2v1h-1v3h1v1h2v1h-3v-1h-1v-1h-1v-3h1v-1h1z", p);
export const PxUp = (p: P) => svg(7, 4, "M3 0h1v1h-1zM2 1h3v1h-3zM1 2h5v1h-5zM0 3h7v1h-7z", p);
export const PxCopy = (p: P) => svg(7, 7, "M0 0h5v1h-4v4h-1zM2 2h5v5h-5zM3 3v3h3v-3z", p);
export const PxCheck = (p: P) => svg(7, 6, "M6 0h1v1h-1zM5 1h1v1h-1zM4 2h1v1h-1zM0 2h1v1h-1zM1 3h1v1h-1zM3 3h1v1h-1zM2 4h1v1h-1z", p);

/** The icons on the skill slots in the About section, each fitted into a square of `box` pixels. */
const SKILL = {
  code: ["......#....", "..#...#.#..", ".#...#...#.", "#....#....#", ".#...#...#.", "..#.#...#..", "....#......"],
  blocks: ["####..####", "####..#..#", "####..#..#", "####..####", "..........", "####..####", "####..####", "####..####", "####..####"],
  tree: ["....###....", "....###....", "....###....", ".....#.....", ".#########.", ".#.......#.", "###.....###", "###.....###", "###.....###"],
  chip: ["...#.#.#...", "...#.#.#...", "..#######..", "###.....###", "..#.###.#..", "###.###.###", "..#.###.#..", "###.....###", "..#######..", "...#.#.#...", "...#.#.#..."],
  database: [".#######.", "#########", ".#######.", ".........", ".#######.", "#########", ".#######.", ".........", ".#######.", "#########", ".#######."],
  cloud: ["....####...", "..#######..", ".#########.", "###########", "###########", ".#########."],
  check: [".........##", "........##.", ".......##..", "##....##...", ".##..##....", "..####.....", "...##......"],
  wrench: [".......##..", "......##...", "......##..#", "......#####", ".....#####.", "....###....", "...###.....", "..###......", ".###.......", "###........", "##........."],
};
export type SkillIcon = keyof typeof SKILL;
export const PxSkill = ({ name, box = 33 }: { name: SkillIcon; box?: number }) => {
  const lines = SKILL[name];
  const w = lines[0].length;
  const h = lines.length;
  return svg(w, h, rows(lines), { size: (box * h) / Math.max(w, h) });
};
