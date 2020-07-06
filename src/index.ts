import * as PIXI from "pixi.js";
import "pixi-sound";
import land from "./assets/sounds/land.mp3";
import move from "./assets/sounds/move.mp3";
import bg from "./assets/bg.png";
import { characterData } from "./character-data";
import {
  createPiece,
  randomCharacter,
  showNextPiece,
  nextCharacter,
  initRNG,
} from "./piece";
import { COLUMNS, ROWS } from "./config";
import { getCoordinates } from "./utils";
import { findClearPieces } from "./clear";
// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container

const { Application, Sprite, Loader } = PIXI;

export const app = new Application({
  width: 1920,
  height: 1080,
});

// The application will create a canvas element for you that you
// can then insert into the DOM
document.querySelector(".game")?.appendChild(app.view);

export let pieces: (string | null)[][] = Array(ROWS).map(() => [
  ...Array(COLUMNS).fill(null),
]);

let sprites: { sprite: PIXI.Sprite; coordinates?: [number, number][] }[] = [];

export let gameTicker = new PIXI.Ticker();
const end = () => {
  // console.log("end");
  // sprites.forEach((sp) => sp.y += 10);
  // console.log('end!!!');
  // app.ticker.add((delta) => sprites.forEach((sp) => sp.y += 10));
};

const clearChunk = (chunk: [number, number][]) => {
  const toRemove = sprites.filter((sprite) => {
    return (
      sprite.coordinates &&
      chunk.find((e) => sprite.coordinates?.[0].join(",") === e.join(","))
    );
  });
  console.log(chunk, toRemove);
  toRemove.forEach((sp) => {
    sp.coordinates?.forEach(([x, y]) => {
      pieces[y][x] = null;
    });
    app.stage.removeChild(sp.sprite);
    sprites = sprites.filter((s) => s.sprite !== sp.sprite);
  });
};

const start = () => {
  sprites.forEach((sp) => {
    app.stage.removeChild(sp.sprite);
  });
  sprites = [];
  gameTicker.destroy();
  gameTicker = new PIXI.Ticker();
  pieces = Array(ROWS)
    .fill(null)
    .map(() => [...Array(COLUMNS).fill(null)]);
  if (nextPiece) {
    app.stage.removeChild(nextPiece);
  }
  initRNG();
  gameTicker.start();
  state = create;
};

let nextPiece: PIXI.Sprite;

const create = async () => {
  const character = randomCharacter();
  const index = sprites.length;
  const piece = await createPiece(character.file, (sprite) => {
    const { x, y } = getCoordinates(sprite);
    const orientation = (Math.fround(sprite.rotation / Math.PI) * 2 + 2) % 4;
    // console.log(
    //   x,
    //   y,
    //   pieces.map((e) => e.map((e) => e ?? ".").join(" ")).join("\n"),
    // );
    const isMichelle = character.name === "Michelle";
    if (y < 0 || (orientation === 0 && y <= 0)) {
      state = end;
    } else {
      if (isMichelle) {
        pieces[y - 1][x] = character.name;
        pieces[y - 1][x - 1] = character.name;
        pieces[y][x] = character.name;
        pieces[y][x - 1] = character.name;
        sprites[index].coordinates = [
          [x, y],
          [x - 1, y],
          [x, y - 1],
          [x - 1, y - 1],
        ];
      } else {
        switch (orientation) {
          case 0:
            pieces[y][x] = character.name;
            pieces[y - 1][x] = character.name;
            sprites[index].coordinates = [
              [x, y],
              [x, y - 1],
            ];
            break;
          case 1:
            pieces[y][x] = character.name;
            pieces[y][x + 1] = character.name;
            sprites[index].coordinates = [
              [x, y],
              [x + 1, y],
            ];
            break;
          case 2:
            pieces[y][x] = character.name;
            pieces[y + 1][x] = character.name;
            sprites[index].coordinates = [
              [x, y],
              [x, y + 1],
            ];
            break;
          case 3:
            pieces[y][x] = character.name;
            pieces[y][x - 1] = character.name;
            sprites[index].coordinates = [
              [x, y],
              [x - 1, y],
            ];
            break;
        }
      }

      state = create;
      let chunk = findClearPieces(pieces);
      while (chunk !== undefined) {
        clearChunk(chunk);
        chunk = findClearPieces(pieces);
      }
    }
  });

  if (nextCharacter?.file) {
    if (nextPiece) {
      app.stage.removeChild(nextPiece);
    }
    nextPiece = await showNextPiece(nextCharacter.file);
  }

  sprites.push({ sprite: piece });
  state = falling;
};
const falling = () => {};

let state: (delta: number) => void = start;

// load the texture we need
characterData.forEach((character) => app.loader.add(character.file));
app.loader.add("move", move);
app.loader.add("land", land);

app.loader.add("background", bg).load((loader, resources) => {
  // This creates a texture from a 'bunny.png' image
  const bg = new PIXI.Sprite(resources.background?.texture);

  bg.position.x = 0;
  bg.position.y = 0;

  // Add the bunny to the scene we are building

  app.stage.addChild(bg);

  window.addEventListener("keydown", (event) => {
    if (event.key === "r") {
      state = start;
    }
  });

  app.ticker.add((delta) => {
    state(delta);
  });

  // app.stage.addChild(bunny);
});
