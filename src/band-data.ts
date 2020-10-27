import logo_poppinparty from "./assets/objects/logo_poppinparty.png";
import logo_afterglow from "./assets/objects/logo_afterglow.png";
import logo_pastelpalettes from "./assets/objects/logo_pastelpalettes.png";
import logo_roselia from "./assets/objects/logo_roselia.png";
import logo_hellohappyworld from "./assets/objects/logo_hello-happy-world.png";

//The following clips are from 「BanG Dream! ガルパ ピコ～大盛り～」episode 9
import poppinparty_sound_1 from "./assets/sounds/band/poppinparty-original.mp3";
import afterglow_sound_1 from "./assets/sounds/band/afterglow-original.mp3";
import pastelpalettes_sound_1 from "./assets/sounds/band/pastelpalettes-original.mp3";
import roselia_sound_1 from "./assets/sounds/band/roselia-original.mp3";
import hellohappyworld_sound_1 from "./assets/sounds/band/hellohappyworld-original.mp3";

//You may add more SE if you like.


export interface BandData{
  name:string;
  sounds?:string[];
  logo:string;
}
export const bandData: BandData[]=[{
  name:"Popipa",
  sounds:[poppinparty_sound_1],
  logo:logo_poppinparty,
},
  {
    name:"Afterglow",
    sounds:[afterglow_sound_1],
    logo:logo_afterglow,
  },
  {
    name:"Pastel Palettes",
    sounds:[pastelpalettes_sound_1],
    logo:logo_pastelpalettes
  },
  {
    name:"Roselia",
    sounds:[roselia_sound_1],
    logo:logo_roselia
  },
  {
    name:"Hello ! Happy World",
    sounds:[hellohappyworld_sound_1],
    logo:logo_hellohappyworld,
  }

]
