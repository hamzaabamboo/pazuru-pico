import ksm from "./assets/chara/kasumi.png";
import otae from "./assets/chara/otae.png";
import rimi from "./assets/chara/rimi.png";
import saaya from "./assets/chara/saaya.png";
import arisa from "./assets/chara/arisa.png";

import yukina from "./assets/chara/yukina.png";
import ako from "./assets/chara/ako.png";
import risa from "./assets/chara/risa.png";
import rinko from "./assets/chara/rinko.png";
import sayo from "./assets/chara/sayo.png";

import aya from "./assets/chara/aya.png";
import chisato from "./assets/chara/chisato.png";
import eve from "./assets/chara/eve.png";
import hina from "./assets/chara/hina.png";
import maya from "./assets/chara/maya.png";

import kokoro from "./assets/chara/kokoro.png";
import hagumi from "./assets/chara/hagumi.png";
import kanon from "./assets/chara/kanon.png";
import kaoru from "./assets/chara/kaoru.png";
import michelle from "./assets/chara/michelle.png";
// import himari from "./assets/chara/himari.png";

export interface CharacterData {
  name: string;
  file: string;
  group: string;
}
export const characterData: CharacterData[] = [
  {
    name: "Kasumi",
    file: ksm,
    group: "Popipa",
  },
  {
    name: "Arisa",
    file: arisa,
    group: "Popipa",
  },
  {
    name: "Rimi",
    file: rimi,
    group: "Popipa",
  },
  {
    name: "Saya",
    file: saaya,
    group: "Popipa",
  },
  {
    name: "Tae",
    file: otae,
    group: "Popipa",
  },
  {
    name: "Yukina",
    file: yukina,
    group: "Roselia",
  },
  {
    name: "Risa",
    file: risa,
    group: "Roselia",
  },
  {
    name: "Sayo",
    file: sayo,
    group: "Roselia",
  },
  {
    name: "Rinko",
    file: rinko,
    group: "Roselia",
  },
  {
    name: "Ako",
    file: ako,
    group: "Roselia",
  },
  {
    name: "Aya",
    file: aya,
    group: "Pastel Palletes",
  },
  {
    name: "Chisato",
    file: chisato,
    group: "Pastel Palletes",
  },
  {
    name: "Maya",
    file: maya,
    group: "Pastel Palletes",
  },
  {
    name: "Eve",
    file: eve,
    group: "Pastel Palletes",
  },
  {
    name: "Hina",
    file: hina,
    group: "Pastel Palletes",
  },
  {
    name: "Kokoro",
    file: kokoro,
    group: "Hello ! Happy World",
  },
  {
    name: "Hagumi",
    file: hagumi,
    group: "Hello ! Happy World",
  },
  {
    name: "Kanon",
    file: kanon,
    group: "Hello ! Happy World",
  },
  {
    name: "Michelle",
    file: michelle,
    group: "Hello ! Happy World",
  },
  {
    name: "Kaoru",
    file: kaoru,
    group: "Hello ! Happy World",
  },
];
