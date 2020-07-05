import { ROWS, COLUMNS } from "./config";
import { characterData } from "./character-data";

const __test = [
  [null, null, "Yukina", null, null, null],
  [null, null, "Yukina", null, null, null],
  ["Himari", "Tae", "Arisa", "Arisa", "Yukina", "Risa"],
  ["Himari", "Tae", "Arisa", "Arisa", "Yukina", "Risa"],
  ["Tae", "Tae", "Kasumi", "Tae", "Risa", "Risa"],
  ["Tae", "Tae", "Kasumi", "Tae", "Risa", "Risa"],
  ["Kasumi", "Arisa", "Tae", "Tae", "Yukina", "Risa"],
  ["Kasumi", "Arisa", "Tae", "Tae", "Yukina", "Risa"],
];
const pieces = __test;

const groupMap = Object.fromEntries(
  characterData.map((e) => [e.name, e.group]),
);

const groupMembers = characterData.reduce((acc, curr) => {
  return {
    ...acc,
    [curr.group]: acc[curr.group]
      ? [...acc[curr.group], curr.name]
      : [curr.name],
  };
}, {} as { [key: string]: string[] });

export const findClearPieces = (pieces: (string | null)[][]) => {
  const chunks: [number, number][][][] = Array(ROWS)
    .fill(null)
    .map(() => [...Array(COLUMNS).fill(null)]);
  pieces.forEach((row, y) => {
    row.forEach((group, x) => {
      if (group === null) return;
      const visited: boolean[][] = Array(ROWS)
        .fill(null)
        .map(() => [...Array(COLUMNS).fill(false)]);
      const queue: [number, number][] = [[x, y]];
      const ret: [number, number][] = [];
      while (queue.length > 0) {
        const [x, y] = queue.pop()!;
        if (
          x === undefined ||
          y === undefined ||
          y > pieces.length ||
          x > row.length ||
          visited[y][x]
        )
          continue;
        ret.push([x, y]);
        if (x - 1 >= 0 && groupMap[pieces[y][x - 1] ?? ""] === groupMap[group])
          queue.push([x - 1, y]);
        if (y - 1 >= 0 && groupMap[pieces[y - 1][x] ?? ""] === groupMap[group])
          queue.push([x, y - 1]);
        if (
          x + 1 < row.length &&
          groupMap[pieces[y][x + 1] ?? ""] === groupMap[group]
        )
          queue.push([x + 1, y]);
        if (
          y + 1 < pieces.length &&
          groupMap[pieces[y + 1][x] ?? ""] === groupMap[group]
        )
          queue.push([x, y + 1]);
        visited[y][x] = true;
      }
      chunks[y][x] = ret;
    });
  });
  const members = chunks
    .reduce((acc, curr) => {
      return [...acc, ...curr];
    }, [] as [number, number][][])
    .filter((e) => e != null)
    .filter((chunk) => {
      const members = Array.from(
        new Set(chunk.map(([x, y]) => pieces[y][x] as string)),
      );
      return groupMembers[groupMap[members[0]]]?.length === members.length;
    })
    .reduce((acc, curr) => (acc.length > curr.length ? acc : curr), []);

  return members.length > 0 ? members : undefined;
};
