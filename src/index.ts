import * as PIXI from "pixi.js-legacy";
import * as Hammer from "hammerjs";
import "pixi-sound";
import land from "./assets/sounds/land.mp3";
import move from "./assets/sounds/move.mp3";
import bg from "./assets/bg.png";
import { bandData } from "./band-data";
import { characterData } from "./character-data";
import { marinaTextures } from "./marina";
import gameOver from "./assets/gameOver.png";
import marina from "./assets/chara/marina.png";
import barrelTexture from "./assets/objects/barrel.png";
import { start } from "./states";
import { items } from "./items";

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container

const { Application } = PIXI;

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
hammerManager.add(new Hammer.Press());

export let gameTicker = new PIXI.Ticker();
export const resetGameTicker = () => {
  gameTicker.destroy();
  gameTicker = new PIXI.Ticker();
};

let state: (delta: number) => void = start;
export const setState = (nextState: typeof state) => {
  state = nextState;
};


// load the texture we need
characterData.forEach((character) => {
  app.loader.add(character.file);
  if (character.preview) {
    app.loader.add(character.preview);
  }
  if (character.sounds) {
    character.sounds?.dropped?.forEach((sound) => app.loader.add(sound));
    character.sounds?.fall?.forEach((sound) => app.loader.add(sound));
  }
});
bandData.forEach((band)=>{
  app.loader.add(band.sounds);
  // if(band.sounds)
  //   band.sounds?.forEach((sound)=>app.loader.add(sound));
});
items.forEach((img) => {
  app.loader.add(img);
});
marinaTextures.forEach((t) => app.loader.add(t));
app.stage.sortableChildren = true;

const loading = new PIXI.Text("Loading...", {
  fontSize: 64,
  fill: 0xffffff,
  align: "center",
});

const updatePercent = () => {
  loading.text = "Loading... " + Math.floor(app.loader.progress) + "%";
};
loading.anchor.x = 0.5;
loading.anchor.y = 0.5;
loading.x = app.renderer.width / 2;
loading.y = app.renderer.height / 2;
app.stage.addChild(loading);
app.loader.onProgress.add(updatePercent);
app.loader
  .add(marina)
  .add("background", bg)
  .add(barrelTexture)
  .add("move", move)
  .add("land", land)
  .add("gameOver", gameOver)
  .load((_loader, resources) => {
    const bg = new PIXI.Sprite(resources.background?.texture);

    bg.position.x = 0;
    bg.position.y = 0;

    // app.stage.removeChild(loading);
    app.stage.addChild(bg);

    window.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() === "r" && state.name !== "end") {
        setState(start);
      }
    });

    app.ticker.add((delta) => {
      state(delta);
    });
  });
