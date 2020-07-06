import { app } from ".";
import * as PIXI from "pixi.js";
import {
  MARINA_X,
  MARINA_Y,
  LEFT_BORDER,
  RIGHT_BORDER,
  BOX_SIZE,
} from "./config";
import { fly, showNextPiece } from "./piece";
import marina from "./assets/chara/marina.png";
import marina1 from "./assets/objects/marina-1.png";
import marina2 from "./assets/objects/marina-2.png";
import marina3 from "./assets/objects/marina-3.png";

export const marinaTextures = [marina1, marina2, marina3];
export const createMarinaSan = () => {
  const textureArray = [marina1, marina2, marina3].map((e) =>
    PIXI.Texture.from(e),
  );
  const marina = new PIXI.AnimatedSprite(textureArray);
  marina.animationSpeed = 0.2;
  marina.x = MARINA_X;
  marina.y = MARINA_Y;

  marina.zIndex = 99;

  marina.loop = false;

  return marina;
};

export let marinaFlyDown: PIXI.Sprite;

export const createFallingMarina = () => {
  marinaFlyDown = new PIXI.Sprite(app.loader.resources[marina].texture);

  marinaFlyDown.x = (LEFT_BORDER + RIGHT_BORDER) / 2 - BOX_SIZE / 2;
  marinaFlyDown.y = -BOX_SIZE / 2;

  marinaFlyDown.anchor.x = 0.5;
  marinaFlyDown.anchor.y = 0.25;

  marinaFlyDown.rotation = Math.PI;

  app.stage.addChild(marinaFlyDown);

  return marinaFlyDown;
};

export let marinaFly: PIXI.Sprite;

export const createFlyingMarina = async (
  onExit: (sprite: PIXI.Sprite) => void = () => {},
) => {
  marinaFly = await showNextPiece(marina);
  fly(marinaFly, () => {
    onExit(marinaFly);
  });
  app.stage.addChild(marinaFly);
  return marinaFly;
};
