import * as PIXI from "pixi.js";
import "pixi-sound";
import { app, pieces, gameTicker } from ".";
import { LEFT_BORDER, RIGHT_BORDER, BOX_SIZE, COLUMNS, SPEED } from "./config";
import { getCoordinates, willCollide } from "./utils";
import { characterData, CharacterData } from "./character-data";

export let nextCharacter: CharacterData | undefined;
let characterList = [...characterData];
export const initRNG = () => {
  nextCharacter = undefined;
  characterList = [...characterData];
};
export const randomCharacter = (): CharacterData => {
  if (characterList.length < 1) {
    characterList = [...characterData];
  }
  let res: CharacterData;
  if (!nextCharacter) {
    res = characterList[Math.floor(Math.random() * characterList.length)];
    characterList = characterList.filter((e) => e.name !== res?.name);
  } else {
    res = { ...nextCharacter };
  }
  nextCharacter =
    characterList[Math.floor(Math.random() * characterList.length)];
  characterList = characterList.filter((e) => e.name !== nextCharacter?.name);
  return res;
};

export const showNextPiece = async (file: string) => {
  const texture =
    app.loader.resources[file]?.texture ??
    (await new Promise((resolve) => {
      app.loader
        .add(file)
        .load((_, resources) => resolve(resources[file]?.texture));
    }));

  const kasumi = new PIXI.Sprite(texture);
  kasumi.y = 150;
  kasumi.x = 965;

  app.stage.addChild(kasumi);
  return kasumi;
};

export const createPiece = async (
  file: string,
  onDropped: (sprite: PIXI.Sprite) => void,
) => {
  // load the texture we need
  const texture =
    app.loader.resources[file]?.texture ??
    (await new Promise((resolve) => {
      app.loader
        .add(file)
        .load((_, resources) => resolve(resources[file]?.texture));
    }));

  const kasumi = new PIXI.Sprite(texture);

  kasumi.x = (LEFT_BORDER + RIGHT_BORDER) / 2 - BOX_SIZE / 2;
  kasumi.y = -BOX_SIZE / 2;

  kasumi.anchor.x = 0.5;
  kasumi.anchor.y = 0.25;

  kasumi.rotation = Math.PI;
  // app.stage.addChild(bunny);

  let dropped: number | undefined = undefined;

  const handleKeyPress = (event: KeyboardEvent) => {
    const { x, y } = getCoordinates(kasumi, "ceil");
    let pressed = false;
    switch (event.key) {
      case "ArrowLeft":
        if (x > 0 && !willCollide(x - 1, y, kasumi.rotation)) {
          kasumi.x -= BOX_SIZE;
          pressed = true;
        }
        break;
      case "ArrowRight":
        if (x < COLUMNS - 1 && !willCollide(x + 1, y, kasumi.rotation)) {
          kasumi.x += BOX_SIZE;
          pressed = true;
        }
        break;
      case "ArrowUp":
        if (!willCollide(x, y, kasumi.rotation + Math.PI / 2)) {
          kasumi.rotation += Math.PI / 2;
          pressed = true;
        }
        break;
      case "ArrowDown":
        if (!willCollide(x, y, kasumi.rotation - Math.PI / 2)) {
          kasumi.rotation -= Math.PI / 2;
          pressed = true;
        }
        break;
      case " ":
        const offset = (Math.fround(kasumi.rotation / Math.PI) * 2 + 2) % 4;
        const stackHeight =
          offset % 2 === 0
            ? pieces
                .map((row) => row[x])
                .filter((_, index) => index > y)
                .reverse()
                .reduce((acc, row, index) => (row ? index + 1 : acc), 0)
            : pieces
                .map((row) =>
                  offset === 1 ? [row[x], row[x + 1]] : [row[x - 1], row[x]],
                )
                .filter((_, index) => index > y)
                .reverse()
                .reduce(
                  (acc, row, index) => (row[0] || row[1] ? index + 1 : acc),
                  0,
                );
        kasumi.y =
          app.renderer.height -
          (BOX_SIZE / 2 + 10) -
          (offset === 2 ? kasumi.height / 2 : 0) -
          BOX_SIZE * stackHeight;
        break;
    }
    if (pressed) {
      if (dropped) {
        clearTimeout(dropped);
        dropped = undefined;
      }
      const sound = app.loader.resources.move.sound;
      if (sound.isPlaying) {
        sound.stop();
      }
      sound.play({ volume: 0.05 });
    }
  };

  window.addEventListener("keydown", handleKeyPress, false);

  app.stage.addChild(kasumi);

  const cleanup = () => {
    window.removeEventListener("keydown", handleKeyPress, false);
    gameTicker.remove(checkOffset);
    onDropped(kasumi);
  };
  const checkOffset = () => {
    // each frame we spin the bunny around a bit
    const offset = (Math.fround(kasumi.rotation / Math.PI) * 2 + 2) % 4;
    const { x, y } = getCoordinates(kasumi);
    const stackHeight =
      offset % 2 === 0
        ? pieces
            .map((row) => row[x])
            .filter((_, index) => index > y)
            .reverse()
            .reduce((acc, row, index) => (row ? index + 1 : acc), 0)
        : pieces
            .map((row) =>
              offset === 1 ? [row[x], row[x + 1]] : [row[x - 1], row[x]],
            )
            .filter((_, index) => index > y)
            .reverse()
            .reduce(
              (acc, row, index) => (row[0] || row[1] ? index + 1 : acc),
              0,
            );
    const dropHeight =
      app.renderer.height - (BOX_SIZE / 2 + 10) - BOX_SIZE * stackHeight;
    if (kasumi.y + (offset === 2 ? kasumi.height / 2 : 0) < dropHeight) {
      kasumi.y += SPEED;
    } else {
      if (!dropped) {
        dropped = setTimeout(() => {
          app.loader.resources.land.sound.play({ volume: 0.5 });
          kasumi.y =
            app.renderer.height -
            (BOX_SIZE / 2 + 10) -
            (offset === 2 ? BOX_SIZE : 0) -
            BOX_SIZE * stackHeight;
          cleanup();
        }, 200);
      }
    }
  };
  // Listen for frame updates
  gameTicker.add(checkOffset);

  return kasumi;
};
