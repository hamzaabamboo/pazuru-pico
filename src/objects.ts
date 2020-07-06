import { app } from ".";
import * as PIXI from "pixi.js";
import barrelTexture from "./assets/objects/barrel.png";
import { MARINA_X, MARINA_Y } from "./config";

export let curtain: PIXI.Sprite;

export const gameOverCurtain = (onFinish: () => void = () => {}) => {
  curtain = new PIXI.Sprite(app.loader.resources["gameOver"].texture);
  curtain.anchor.x = 0;
  curtain.anchor.y = 1;
  curtain.x = 0;
  curtain.y = 0;
  curtain.zIndex = 9999;
  let bounce = 0;
  const moveDown = () => {
    if (
      bounce % 2 == 0
        ? curtain.y < app.renderer.height
        : curtain.y > app.renderer.height - 80
    ) {
      curtain.y += ((bounce % 2) * -2 + 1) * 10;
    } else {
      if (bounce < 2) {
        bounce++;
      } else {
        app.ticker.remove(moveDown);
        onFinish();
      }
    }
  };
  app.stage.addChild(curtain);
  app.ticker.add(moveDown);
};

export let barrel: PIXI.Sprite;
export const createBarrel = () => {
  barrel = new PIXI.Sprite(app.loader.resources[barrelTexture].texture);

  barrel.x = MARINA_X;
  barrel.y = MARINA_Y;

  barrel.zIndex = 99;

  app.stage.addChild(barrel);
  return barrel;
};
