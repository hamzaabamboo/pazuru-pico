import * as PIXI from "pixi.js";
import "pixi-sound";
import { app, pieces, gameTicker } from ".";
import {
  LEFT_BORDER,
  RIGHT_BORDER,
  BOX_SIZE,
  COLUMNS,
  SPEED,
  NEXT_CHARACTER_Y,
  NEXT_CHARACTER_X,
  OFFSET_BOTTOM,
} from "./config";
import {
  getCoordinates,
  willCollide,
  getStackHeight,
  getOffset,
} from "./utils";
import { characterData, CharacterData } from "./character-data";
import { createMichelle } from "./michelle";

export let nextCharacter: CharacterData | undefined;
let characterList = [...characterData];

export const fly = (
  sprite: PIXI.Sprite,
  onExit: (sprite: PIXI.Sprite) => void,
) => {
  const handleFly = () => {
    sprite.y -= 25 * SPEED;
    if (sprite.y + 2 * BOX_SIZE < 0) {
      gameTicker.remove(handleFly);
      onExit(sprite);
    }
  };
  gameTicker.add(handleFly);
};
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
  kasumi.anchor.x = 0.5;
  kasumi.anchor.y = 1;

  kasumi.y = NEXT_CHARACTER_Y;
  kasumi.x = NEXT_CHARACTER_X;

  app.stage.addChild(kasumi);
  return kasumi;
};

export const createPiece = async (
  file: string,
  onDropped: (sprite: PIXI.Sprite) => void,
) => {
  // load the texture we need

  if (file.includes("michelle")) return await createMichelle(file, onDropped);
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
  let speed = SPEED;

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      speed = SPEED;
    }
  };

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
      case "Shift":
        if (!willCollide(x, y, kasumi.rotation - Math.PI / 2)) {
          kasumi.rotation -= Math.PI / 2;
          pressed = true;
        }
        break;
      case "Control":
        if (!willCollide(x, y, kasumi.rotation - Math.PI / 2)) {
          kasumi.rotation -= Math.PI / 2;
          pressed = true;
        }
        break;
      case "ArrowDown":
        speed = SPEED * 4;
        break;
      case " ":
        const offset = getOffset(kasumi);
        const stackHeight = getStackHeight(kasumi);
        kasumi.y =
          app.renderer.height -
          (BOX_SIZE / 2 + OFFSET_BOTTOM) -
          (offset === 2 ? BOX_SIZE : 0) -
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
  window.addEventListener("keyup", handleKeyUp, false);

  app.stage.addChild(kasumi);

  const cleanup = () => {
    window.removeEventListener("keydown", handleKeyPress, false);
    gameTicker.remove(checkOffset);
    onDropped(kasumi);
  };
  const checkOffset = () => {
    // each frame we spin the bunny around a bit
    const offset = getOffset(kasumi);
    const stackHeight = getStackHeight(kasumi);
    const dropHeight =
      app.renderer.height -
      (BOX_SIZE / 2 + OFFSET_BOTTOM) -
      BOX_SIZE * stackHeight;
    if (kasumi.y + (offset === 2 ? BOX_SIZE : 0) < dropHeight) {
      kasumi.y += speed;
    } else {
      if (!dropped) {
        dropped = setTimeout(() => {
          app.loader.resources.land.sound.play({ volume: 0.5 });
          kasumi.y =
            app.renderer.height -
            (BOX_SIZE / 2 + OFFSET_BOTTOM) -
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
