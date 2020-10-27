import { COLUMNS, ROWS } from "./config";
import { characterData } from "./character-data";
import { bandData } from "./band-data";
import { app } from "./index";

let soundPlaying: PIXI.sound.Sound;

const groupMap = characterData
  .map((e) => [e.name, e.group])
  .reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {} as { [name: string]: string });
const groupMembers = characterData.reduce((acc, curr) => {
  return {
    ...acc,
    [curr.group]: acc[curr.group]
      ? [...acc[curr.group], curr.name]
      : [curr.name],
  };
}, {} as { [key: string]: string[] });

export const findClearPieces =(pieces: (string | null)[][]) => {
  var pieces_copy=JSON.parse(JSON.stringify(pieces));
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
        if (
          x - 1 >= 0 &&
          (groupMap[pieces[y][x - 1] ?? ""] === groupMap[group] ||
            pieces[y][x - 1] === "Item")
        )
          queue.push([x - 1, y]);
        if (
          y - 1 >= 0 &&
          (groupMap[pieces[y - 1][x] ?? ""] === groupMap[group] ||
            pieces[y - 1][x] === "Item")
        )
          queue.push([x, y - 1]);
        if (
          x + 1 < row.length &&
          (groupMap[pieces[y][x + 1] ?? ""] === groupMap[group] ||
            pieces[y][x + 1] === "Item")
        )
          queue.push([x + 1, y]);
        if (
          y + 1 < pieces.length &&
          (groupMap[pieces[y + 1][x] ?? ""] === groupMap[group] ||
            pieces[y + 1][x] === "Item")
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
      ).filter((n) => n !== "Item");
      return groupMembers[groupMap[members[0]]]?.length === members.length;
    })
    .reduce((acc, curr) => (acc.length > curr.length ? acc : curr), []);

  if(members.length>0){
    var groupToClear; //literally the name of the group to be cleared
    for(let i=0;i<members.length;i++) {
      if (pieces_copy[members[i][1]][members[i][0]] != "item") {
        groupToClear = groupMap[pieces_copy[members[i][1]][members[i][0]]];
        break;
      }//The loop here is for averting the case of "item",
    }// thus ensuring a non-undefined value from the "groupMap".
    for(let i=0;i<bandData.length;i++) {
      if (bandData[i].name === groupToClear) {
        //From here randomly play the voice clip of the band
        if(bandData[i].sounds) {
          if (soundPlaying?.isPlaying) {
            soundPlaying.destroy();
          }
          // @ts-ignore
          soundPlaying = app.loader.resources[bandData[i].sounds[Math.floor(Math.random() * bandData[i].sounds?.length)]].sound;
          soundPlaying.play({ volume: 1, });
        }
        //From here you may code for the animation. You can use bandData[i] for the BandData object in this clear process.
        //...(your code please)
        break;
      }
    }

    return members;
  }
  // return members.length > 0 ? members : undefined;
  return undefined;
};
