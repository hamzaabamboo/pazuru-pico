import ksm from "./assets/chara/kasumi.png";
import yukina from "./assets/chara/yukina.png";
import risa from "./assets/chara/risa.png";
import arisa from "./assets/chara/arisa.png";
import otae from "./assets/chara/otae.png";
import himari from "./assets/chara/himari.png";

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
    name: "Himari",
    file: himari,
    group: "Afterglow",
  },
];
