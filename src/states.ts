import { app, gameTicker, hammerManager, resetGameTicker, setState } from ".";
import {
  createMarinaSan,
  marinaFlyDown,
  createFlyingMarina,
  createFallingMarina,
} from "./marina";
import { barrel, curtain, createBarrel, gameOverCurtain } from "./objects";
import { ROWS, COLUMNS, BOX_SIZE, LEFT_BORDER } from "./config";
import {
  initRNG,
  nextCharacter,
  randomCharacter,
  fly,
  createPiece,
  showNextPiece,
  fall,
} from "./piece";
import { getOffset, getCoordinates, getMaxStackHeight } from "./utils";
import { CharacterData } from "./character-data";
import { findClearPieces } from "./clear";
import { michelleFall } from "./michelle";
import { createItem, items, fallItem } from "./items";

interface SpriteData {
  sprite: PIXI.Sprite;
  coordinates?: [number, number][];
  character?: Pick<CharacterData, "name">;
  isItem?: boolean;
}
let sprites: SpriteData[] = [];

let endAnimation: number | undefined;

let marinaStab: PIXI.AnimatedSprite;

let nextPiece: PIXI.Sprite;

let soundPlaying: PIXI.sound.Sound;

let created = false;

export let pieces: (string | null)[][] = Array(ROWS).map(() => [
  ...Array(COLUMNS).fill(null),
]);

const start = () => {
  sprites.forEach((sp) => {
    app.stage.removeChild(sp.sprite);
  });
  sprites = [];
  resetGameTicker();
  endAnimation = undefined;
  if (soundPlaying?.isPlaying) {
    soundPlaying.stop();
  }
  if (marinaStab) {
    app.stage.removeChild(marinaStab);
  }
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
  setState(create);
  if (nextCharacter) {
    showNextPiece(nextCharacter.preview ?? nextCharacter.file).then(
      (s) => (nextPiece = s),
    );
  }
};
export { start };

const create = async () => {
  if (created) return;
  const index = sprites.length;
  const maxHeight = getMaxStackHeight();
  if (maxHeight < 5 && Math.random() < 0.1) {
    const itemFile = items[Math.floor(Math.random() * items.length)];
    let dropped = [false, false];
    const onDropped = (id: number) => async (sprite: PIXI.Sprite) => {
      const { y } = getCoordinates(sprite);
      if (y < 0) {
        setState(end);
      } else {
        updateCoordinates(sprite, index + id, undefined, true);
        let chunk = findClearPieces(pieces);
        while (chunk !== undefined) {
          await clearChunk(chunk);
          chunk = findClearPieces(pieces);
        }
        dropped[id] = true;
        if (dropped.every((e) => e)) {
          setState(create);
          created = false;
        }
      }
    };
    const positions = Array(COLUMNS)
      .fill(0)
      .map((_, i) => i);

    const itemSprites = await Promise.all([
      createItem(
        itemFile,
        positions.splice(Math.floor(Math.random() * positions.length))[0],
        onDropped(0),
      ),
      createItem(
        itemFile,
        positions.splice(Math.floor(Math.random() * positions.length))[0],
        onDropped(1),
      ),
    ]);
    itemSprites.forEach((item) => {
      sprites.push({ sprite: item, isItem: true });
    });
  } else {
    const character = randomCharacter();
    const onDropped = async (sprite: PIXI.Sprite) => {
      const { y } = getCoordinates(sprite);
      const orientation = (Math.fround(sprite.rotation / Math.PI) * 2 + 2) % 4;

      if (character.sounds?.dropped) {
        if (soundPlaying?.isPlaying) {
          soundPlaying.destroy();
        }
        soundPlaying =
          app.loader.resources[
            character.sounds.dropped[
              Math.floor(Math.random() * character.sounds?.dropped.length)
            ]
          ].sound;
        soundPlaying.play({
          volume: 0.5,
        });
      }

      if (y < 0 || (orientation === 0 && y <= 0)) {
        setState(end);
      } else {
        updateCoordinates(sprite, index, character);
        let chunk = findClearPieces(pieces);
        while (chunk !== undefined) {
          await clearChunk(chunk);
          chunk = findClearPieces(pieces);
        }

        setState(create);
        created = false;
      }
    };

    if (nextPiece) {
      marinaStab.play();
      fly(nextPiece, async (s) => {
        marinaStab.gotoAndStop(0);
        app.stage.removeChild(s);
        if (nextCharacter) {
          nextPiece = await showNextPiece(
            nextCharacter.preview ?? nextCharacter.file,
          );
        }

        const piece = await createPiece(character.file, onDropped);

        sprites.push({ sprite: piece, character });
      });
    }

    if (character.sounds?.fall) {
      if (soundPlaying?.isPlaying) {
        soundPlaying.destroy();
      }
      soundPlaying =
        app.loader.resources[
          character.sounds.fall[
            Math.floor(Math.random() * character.sounds?.fall.length)
          ]
        ].sound;
      soundPlaying.play({
        volume: 0.5,
      });
    }
  }

  setState(falling);
};

const falling = () => {};

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

      const lastPieceOff = getOffset(sprites[sprites.length - 1].sprite);
      const lastPieceCoor = getCoordinates(sprites[sprites.length - 1].sprite);

      const overflow =
        lastPieceOff === 0 ? lastPieceCoor.y - 1 : lastPieceCoor.y;
      marinaFlyDown.x = LEFT_BORDER + BOX_SIZE / 2 + BOX_SIZE * lastPieceCoor.x;
      marinaFlyDown.y = (-1 + overflow) * BOX_SIZE + BOX_SIZE / 2;
      const speed = overflow === -2 ? 4 : 3;
      const moveDown = () => {
        sprites.forEach((sp) => (sp.sprite.y += speed));
        marinaFlyDown.y += speed;
      };
      const dur = overflow === -2 ? 2000 : 2000;
      app.ticker.add(moveDown);

      endAnimation = setTimeout(() => {
        app.ticker.remove(moveDown);
        gameOverCurtain(() => {
          setState(ended);
        });
      }, dur);
    }
  }
};

const ended = () => {
  const restartGame = () => {
    setState(start);
    hammerManager.off("tap", restartGame);
  };
  hammerManager.on("tap", restartGame);
};

export const updateCoordinates = (
  sprite: PIXI.Sprite,
  index: number,
  character?: Pick<CharacterData, "name">,
  isItem: boolean = false,
) => {
  const { x, y } = getCoordinates(sprite);
  const orientation = (Math.fround(sprite.rotation / Math.PI) * 2 + 2) % 4;
  if (isItem) {
    pieces[y][x] = "Item";
    sprites[index].coordinates = [[x, y]];
    // console.log(pieces.map((e) => e.map((e) => e ?? "x").join(" ")).join("\n"));
    return;
  }
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
      .map(({ sprite, coordinates, character, index, isItem }) => () =>
        new Promise<void>((resolve) => {
          if (coordinates) {
            coordinates.forEach(([x, y]) => (pieces[y][x] = null));
            if (isItem) {
              return fallItem(sprite, (sprite) => {
                updateCoordinates(sprite, index, character, true);
                resolve();
              });
            }
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
