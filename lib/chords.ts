/**
 * The chord progressions the pixel ChordCraft shows, and the notes in each chord.
 * The same data draws the piano roll, plays through the speakers and lights the
 * keys of the MIDI keyboard in the room, so what is seen is what is heard.
 */
// Each mood gets its most familiar progression, played twice ("M" is minor, "^7" a major seventh):
//   sad     i - VI - iv - V in A minor
//   dreamy  major sevenths rocking between I and IV in C major
//   epic    i - VI - III - VII in D minor
export const SETS = [
  { key: "A MINOR", mood: 1, prompt: "SAD LO-FI IN A MINOR", bpm: "78", names: ["AM", "F", "DM", "E", "AM", "F", "DM", "E"] },
  { key: "C MAJOR", mood: 0, prompt: "DREAMY IN C MAJOR", bpm: "72", names: ["C^7", "F^7", "C^7", "F^7", "AM7", "F^7", "C^7", "F^7"] },
  { key: "D MINOR", mood: 2, prompt: "EPIC MOVIE TRAILER", bpm: "90", names: ["DM", "BB", "F", "C", "DM", "BB", "F", "C"] },
] as const;

/** MIDI note numbers, root first, all between middle C (60) and the C sharp above it (73). */
export const TONES: Record<string, number[]> = {
  C: [60, 64, 67],
  "C^7": [60, 64, 67, 71],
  DM: [62, 65, 69],
  E: [64, 68, 71],
  F: [65, 69, 72],
  "F^7": [65, 69, 72, 64],
  AM: [69, 72, 64],
  AM7: [69, 72, 64, 67],
  BB: [70, 62, 65],
};

export const LOW = 60; // the lowest note drawn: middle C
export const CHORD_TIME = 6.3 / 8; // seconds each chord lasts, the speed the pixel screen plays at
export const PLAY_TIME = CHORD_TIME * 8;
