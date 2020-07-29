# Puzzle \* Pico

Puyo-puyo-ish game inspired from [BanG Dream! Girls Band Party!☆PICO ～ OHMORI ～ Episode 9](https://www.youtube.com/watch?v=q5YETLAebUY). Created with PixiJS and TypeScript

\*\* Internet Explorer is not supported \*\*

## How To Play ?

Match members of same group to clear the line. Don't let the board fill up because Marina-san will come for you !

### Controls

#### Keyboard

- **Arrow Left/ Arrow Right** : Go Left and Right
- **Arrow Up, X** : Rotate Clockwise
- **Control, Z** : Rotate Counter Clockwise
- **Arrow Down** : Soft Drop (a.k.a drop faster)
- **Space bar** : Hard Drop (a.k.a drop quickly)
- **Shift + arrow up** : Fly with kokoro
- **R** : Reset

#### Mobile

- **Swipe Left** : Move Left
- **Swipe Right** : Move Right
- **Swipe Down** : Hard drop
- **Tap on left half of the screen** : Rotate Counter Clockwise
- **Tap on right half of the screen** : Rotate Clockwise
- **Long press** : Soft drop

## Development

Install `yarn install`
Serve `yarn start`

## Features

- [x] Basic Gameplay
- [x] Michelle
- [x] Mobile Control
- [x] Kokoro god mode
- [x] Choco Coronet, Coffee & Croquette (Missing Croquette)
- [ ] Scoring system
- [ ] Combos
- [ ] Rimi-rin cutin
- [ ] More sounds
- [ ] Welcome screen
- [ ] Moving Logo

## Contribution

Feel free to contribute or contact me ! (日本語も OK)

### Things still need help

- [ ] More sounds
- [ ] Fonts

### Adding dropping & falling sounds

Sounds when dropping or falling can be added to [`character-data.ts`](src/character-data.ts). Each character is an object which contains name, group, image file and sound files. Files can be imported by using import statement. The data for falling and dropping sounds are array which is randomized. If anyone has sound they wants to get included, feel free to make a pull request!

```js
import ksm from "./assets/chara/kasumi.png";
import ksm_fall_1 from "./assets/sounds/chara/kasumi_fall_1.wav";

{
    name: "Kasumi",
    file: ksm,
    group: "Popipa",
    sounds: {
        fall: [ksm_fall_1],
        dropping: []
    }
},
```

## Disclaimer

This project aims serves as my fun side project for creating a game and as a fan-made game. I do not own any assets/ sounds for this project. All the assets are copyrighted by Bushiroad. The assets are screen captured from [BanG Dream! Girls Band Party!☆PICO ～ OHMORI ～ Episode 9](https://www.youtube.com/watch?v=q5YETLAebUY)
