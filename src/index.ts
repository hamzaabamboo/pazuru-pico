import * as PIXI from "pixi.js";
import * as Hammer from "hammerjs";
import "pixi-sound";
import land from "./assets/sounds/land.mp3";
import move from "./assets/sounds/move.mp3";
import bg from "./assets/bg.png";
import { characterData, CharacterData } from "./character-data";
import {
  createPiece,
  randomCharacter,
  showNextPiece,
  nextCharacter,
  initRNG,
  fly,
  fall,
} from "./piece";
import { COLUMNS, ROWS } from "./config";
import { getCoordinates } from "./utils";
import { findClearPieces } from "./clear";
import { createMarinaSan, marinaTextures } from "./marina";
import { michelleFall } from "./michelle";
import gameOver from "./assets/gameOver.png";
import { gameOverCurtain, curtain, createBarrel, barrel } from "./objects";
import {
  createFallingMarina,
  createFlyingMarina,
  marinaFlyDown,
  marinaFly,
} from "./marina";
import marina from "./assets/chara/marina.png";
import barrelTexture from "./assets/objects/barrel.png";

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

const main = document.querySelector(".main");
window.addEventListener("resize", () => {
  (main as HTMLDivElement).style.height = window.innerHeight + "px";
});

export const hammerManager = new Hammer.Manager(app.view);
hammerManager.add(new Hammer.Swipe());
hammerManager.add(new Hammer.Tap());

export let pieces: (string | null)[][] = Array(ROWS).map(() => [
  ...Array(COLUMNS).fill(null),
]);
interface SpriteData {
  sprite: PIXI.Sprite;
  coordinates?: [number, number][];
  character?: Pick<CharacterData, "name">;
}
let sprites: SpriteData[] = [];

export let gameTicker = new PIXI.Ticker();

let endAnimation: number | undefined;

const start = () => {
  sprites.forEach((sp) => {
    app.stage.removeChild(sp.sprite);
  });
  sprites = [];
  gameTicker.destroy();
  gameTicker = new PIXI.Ticker();
  endAnimation = undefined;
  marinaStab = createMarinaSan();
  app.stage.addChild(marinaStab);
  app.stage.removeChild(marinaFlyDown);
  app.stage.removeChild(barrel);
  app.stage.removeChild(curtain);
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

const end = async () => {
  if (!endAnimation) {
    if (nextCharacter?.file) {
      app.stage.removeChild(marinaStab);
      if (nextPiece) {
        app.stage.removeChild(nextPiece);
      }
      createBarrel();
      await createFlyingMarina();
      const marinaFlyDown = createFallingMarina();

      const moveDown = () => {
        sprites.forEach((sp) => (sp.sprite.y += 2));
        marinaFlyDown.y += 2;
      };

      app.ticker.add(moveDown);

      endAnimation = setTimeout(() => {
        app.ticker.remove(moveDown);
        gameOverCurtain(() => {
          state = ended;
        });
      }, 2000);
    }
  }
};

const ended = () => {
  const restartGame = () => {
    state = start;
    hammerManager.off("tap", restartGame);
  };
  hammerManager.on("tap", restartGame);
};

const findBottom = (sprite: SpriteData) => {
  const coordinates = sprite.coordinates;
  const maxY = coordinates?.reduce(
    (acc, [x, y]) => {
      return y > acc[1] ? [x, y] : acc;
    },
    [0, 0],
  ) as [number, number];
  return coordinates?.filter(([_, y]) => y === maxY[1]) ?? [];
};

const fallChunk = async (sprites: SpriteData[]) => {
  let canFall = sprites
    .map((e, index) => ({ ...e, index }))
    .filter(({ sprite, coordinates }) =>
      findBottom({ sprite, coordinates }).every(([x, y]) => {
        return y + 1 < pieces.length && pieces[y + 1][x] === null;
      }),
    );
  if (canFall.length > 0) {
    await canFall
      .map(({ sprite, coordinates, character, index }) => () =>
        new Promise<void>((resolve) => {
          if (coordinates) {
            coordinates.forEach(([x, y]) => (pieces[y][x] = null));
            if (character?.name === "Michelle") {
              michelleFall(sprite, (sprite) => {
                updateCoordinates(sprite, index, character);
                resolve();
              });
            } else {
              fall(sprite, (sprite) => {
                updateCoordinates(sprite, index, character);
                resolve();
              });
            }
          }
        }),
      )
      .reduce((acc, p) => {
        return acc.then(p);
      }, Promise.resolve());
    await fallChunk(sprites);
  }
};

const clearChunk = async (chunk: [number, number][]) => {
  const toRemove = sprites.filter((sprite) => {
    return (
      sprite.coordinates &&
      chunk.find((e) => sprite.coordinates?.[0].join(",") === e.join(","))
    );
  });
  toRemove.forEach((sp) => {
    sp.coordinates?.forEach(([x, y]) => {
      pieces[y][x] = null;
    });
    app.stage.removeChild(sp.sprite);
  });
  sprites = sprites.filter(
    (s) => !toRemove.find((sp) => s.sprite === sp.sprite),
  );
  if (toRemove.length > 0) {
    await fallChunk(sprites);
  }
};

let nextPiece: PIXI.Sprite;

const create = async () => {
  const character = randomCharacter();
  const index = sprites.length;
  const piece = await createPiece(character.file, (sprite) => {
    const { y } = getCoordinates(sprite);
    const orientation = (Math.fround(sprite.rotation / Math.PI) * 2 + 2) % 4;
    // console.log(
    //   x,
    //   y,
    //   pieces.map((e) => e.map((e) => e ?? ".").join(" ")).join("\n"),
    // );
    if (y < 0 || (orientation === 0 && y <= 0)) {
      app.stage.removeChild(sprite);
      state = end;
    } else {
      updateCoordinates(sprite, index, character);
      marinaStab.play();
      fly(nextPiece, async () => {
        marinaStab.gotoAndStop(0);
        let chunk = findClearPieces(pieces);
        while (chunk !== undefined) {
          await clearChunk(chunk);
          chunk = findClearPieces(pieces);
        }
        state = create;
      });
    }
  });

  if (nextCharacter?.file) {
    if (nextPiece) {
      app.stage.removeChild(nextPiece);
    }
    nextPiece = await showNextPiece(
      nextCharacter.preview ?? nextCharacter.file,
    );
  }

  sprites.push({ sprite: piece, character });
  state = falling;
};

const falling = () => {};

let state: (delta: number) => void = start;
let marinaStab: PIXI.AnimatedSprite;
// load the texture we need
characterData.forEach((character) => {
  app.loader.add(character.file);
  if (character.preview) {
    app.loader.add(character.preview);
  }
});
marinaTextures.forEach((t) => app.loader.add(t));
app.stage.sortableChildren = true;
app.loader.add(marina);
app.loader.add(barrelTexture);
app.loader.add("move", move);
app.loader.add("land", land);
app.loader.add("gameOver", gameOver);
app.loader.add("background", bg).load((loader, resources) => {
  // This creates a texture from a 'bunny.png' image
  const bg = new PIXI.Sprite(resources.background?.texture);

  bg.position.x = 0;
  bg.position.y = 0;

  // Add the bunny to the scene we are building

  app.stage.addChild(bg);

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "r" && state.name !== "end") {
      state = start;
    }
  });

  app.ticker.add((delta) => {
    state(delta);
  });

  // app.stage.addChild(bunny);
});

export const updateCoordinates = (
  sprite: PIXI.Sprite,
  index: number,
  character?: Pick<CharacterData, "name">,
) => {
  const { x, y } = getCoordinates(sprite);
  const orientation = (Math.fround(sprite.rotation / Math.PI) * 2 + 2) % 4;
  if (character) {
    if (character.name === "Michelle") {
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
      return;
    }
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
};
