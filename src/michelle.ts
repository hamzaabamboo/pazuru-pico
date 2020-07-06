import { app, pieces, gameTicker } from ".";
import {
  LEFT_BORDER,
  RIGHT_BORDER,
  BOX_SIZE,
  SPEED,
  COLUMNS,
  OFFSET_BOTTOM,
  FALL_DELAY,
  FALL_SPEED,
} from "./config";
import * as PIXI from "pixi.js";
import "pixi-sound";

export const createMichelle = async (
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

  const michelle = new PIXI.Sprite(texture);

  michelle.x = (LEFT_BORDER + RIGHT_BORDER) / 2 - BOX_SIZE;
  michelle.y = -BOX_SIZE / 2;

  michelle.anchor.x = 0.5;
  michelle.anchor.y = 0.5;

  michelle.rotation = Math.PI;
  // app.stage.addChild(bunny);

  let dropped: number | undefined = undefined;
  let speed = SPEED;

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      speed = SPEED;
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    const { x, y } = getMichelleCoordinates(michelle, "ceil");
    let pressed = false;
    switch (event.key) {
      case "ArrowLeft":
        if (y <= 0 && x > 0 && !pieces[0][x - 1]) {
          michelle.x -= BOX_SIZE;
          pressed = true;
        } else if (x > 0 && !pieces[y][x - 1] && !pieces[y + 1][x - 1]) {
          michelle.x -= BOX_SIZE;
          pressed = true;
        }
        break;
      case "ArrowRight":
        if (y <= 0 && x + 2 < COLUMNS && !pieces[0][x + 2]) {
          michelle.x += BOX_SIZE;
          pressed = true;
        } else if (
          x + 2 < COLUMNS &&
          !pieces[y][x + 2] &&
          !pieces[y + 1][x + 2]
        ) {
          michelle.x += BOX_SIZE;
          pressed = true;
        }
        break;
      case "ArrowUp":
        michelle.rotation += Math.PI / 2;
        pressed = true;
        break;
      case "Control":
        michelle.rotation -= Math.PI / 2;
        pressed = true;
        break;
      case "ArrowDown":
        speed = SPEED * 4;
        break;
      case " ":
        const stackHeight = getMichelleStackHeight(michelle);
        michelle.y =
          app.renderer.height -
          OFFSET_BOTTOM -
          BOX_SIZE * stackHeight -
          BOX_SIZE;
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

  app.stage.addChild(michelle);

  const cleanup = () => {
    window.removeEventListener("keydown", handleKeyPress, false);
    gameTicker.remove(checkOffset);
    onDropped(michelle);
  };
  const checkOffset = () => {
    // each frame we spin the bunny around a bit
    const stackHeight = getMichelleStackHeight(michelle);
    const dropHeight =
      app.renderer.height - (BOX_SIZE + OFFSET_BOTTOM) - BOX_SIZE * stackHeight;
    if (michelle.y < dropHeight) {
      michelle.y += speed;
    } else {
      if (!dropped) {
        dropped = setTimeout(() => {
          app.loader.resources.land.sound.play({ volume: 0.5 });
          michelle.y =
            app.renderer.height -
            OFFSET_BOTTOM -
            BOX_SIZE * stackHeight -
            BOX_SIZE;
          cleanup();
        }, 200);
      }
    }
  };
  // Listen for frame updates
  gameTicker.add(checkOffset);

  return michelle;
};

export const michelleFall = (
  sprite: PIXI.Sprite,
  onFell: (sprite: PIXI.Sprite) => void,
) => {
  let timer: number;
  const cleanup = () => {
    gameTicker.remove(checkOffset);
    onFell(sprite);
  };
  const checkOffset = () => {
    // each frame we spin the bunny around a bit
    const stackHeight = getMichelleStackHeight(sprite);
    const dropHeight =
      app.renderer.height - (BOX_SIZE + OFFSET_BOTTOM) - BOX_SIZE * stackHeight;
    if (sprite.y < dropHeight) {
      sprite.y += FALL_SPEED;
      if (timer) clearTimeout(timer);
    } else {
      if (!timer) {
        timer = setTimeout(() => {
          sprite.y =
            app.renderer.height -
            OFFSET_BOTTOM -
            BOX_SIZE * stackHeight -
            BOX_SIZE;
          cleanup();
        }, FALL_DELAY);
      }
    }
  };
  // Listen for frame updates
  gameTicker.add(checkOffset);
};

export const getMichelleCoordinates = (
  sprite: PIXI.Sprite,
  method: "floor" | "ceil" | "round" = "ceil",
): { x: number; y: number } => {
  return {
    x: Math[method]((sprite.x - BOX_SIZE - LEFT_BORDER) / BOX_SIZE),
    y: Math[method]((sprite.y - BOX_SIZE) / BOX_SIZE),
  };
};

export const getMichelleStackHeight = (sprite: PIXI.Sprite): number => {
  const { x, y } = getMichelleCoordinates(sprite);
  // console.log(x);
  return pieces
    .map((row) => [row[x + 1], row[x]])
    .filter((_, index) => index + 1 > y)
    .reverse()
    .reduce((acc, row, index) => (row[0] || row[1] ? index + 1 : acc), 0);
};
