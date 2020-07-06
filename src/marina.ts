import marina1 from "./assets/objects/marina-1.png";
import marina2 from "./assets/objects/marina-2.png";
import marina3 from "./assets/objects/marina-3.png";
import { app } from ".";
import * as PIXI from "pixi.js";
import { MARINA_X, MARINA_Y } from "./config";

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
  app.stage.addChild(marina);

  marina.loop = false;

  return marina;
};
