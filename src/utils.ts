import { BOX_SIZE, LEFT_BORDER, COLUMNS, ROWS } from "./config";
import { pieces } from ".";

export const getCoordinates = (
  sprite: PIXI.Sprite,
  method: "floor" | "ceil" | "round" = "ceil",
): { x: number; y: number } => {
  return {
    x: Math[method]((sprite.x - BOX_SIZE / 2 - LEFT_BORDER) / BOX_SIZE),
    y: Math[method]((sprite.y - BOX_SIZE / 2) / BOX_SIZE),
  };
};

export const willCollide = (
  x: number,
  y: number,
  rotation: number,
): boolean => {
  try {
    if (x === undefined || y === undefined) return true;
    const offset = (Math.fround(rotation / Math.PI) * 2 + 2) % 4;
    if (y < 1) {
      switch (offset) {
        case 2:
        case 0:
          return x < 0 || x > COLUMNS || !!pieces[0][x];
        case 1:
          return (
            x < 0 || x + 1 >= COLUMNS || !!pieces[0][x] || !!pieces[0][x + 1]
          );
        case 3:
          return (
            x - 1 < 0 || x > COLUMNS || !!pieces[0][x] || !!pieces[0][x - 1]
          );
        default:
          return false;
      }
    } else {
      if (x < 0 || x > COLUMNS || y > ROWS) return true;
      switch (offset) {
        case 0:
          return !!pieces[y][x] || !!pieces[y - 1][x];
        case 1:
          return x + 1 > COLUMNS - 1 || !!pieces[y][x] || !!pieces[y][x + 1];
        case 2:
          return !!pieces[y][x] || !!pieces[y + 1][x];
        case 3:
          return x - 1 < 0 || !!pieces[y][x] || !!pieces[y][x - 1];
        default:
          return false;
      }
    }
  } catch {
    console.log(x, y);
    return false;
  }
};
