import { ChickenTalent } from "../types/chickenTalent";
import { CommentaryTalent } from "../types/commentary";

export const talentMeta: {
  [talent: string]: {
    name: ChickenTalent;
    type: "offensive" | "speed";
    frequency: "high" | "medium" | "low";
    tagline: string;
    description: string;
  };
} = {
  [ChickenTalent.Anvil]: {
    name: ChickenTalent.Anvil,
    type: "offensive",
    frequency: "high",
    tagline: "Where did this come from?",
    description:
      "Chickens on your tail and a weight slowing you down? Well pull that anvil out of your pocket and pass it on to your competitors. I’m sure it’s theirs anyway.",
  },
  [ChickenTalent.BlueRooster]: {
    name: ChickenTalent.BlueRooster,
    type: "speed",
    frequency: "medium",
    tagline: "But I already have wings.",
    description:
      "Feeling tired and low on energy? Drink a can of Blue Rooster energy drink, to make you feel alert and alive for 4 seconds.",
  },
  [ChickenTalent.Chickenapult]: {
    name: ChickenTalent.Chickenapult,
    type: "speed",
    frequency: "medium",
    tagline: "Order now and get a free ball of fire.",
    description:
      "In the 14th century, as a cheap alternative to carrier pigeons, the Chickenapult was used to send important messages long distances quickly. Few chickens survived. The modern Chickenapult covers a much shorter range but is 18% less fatal.",
  },
  [ChickenTalent.Dig]: {
    name: ChickenTalent.Dig,
    type: "speed",
    frequency: "medium",
    tagline: "Thankfully, chickens are not a flying type.",
    description:
      "A talent gained by training with moles for 4 years, Dig will have your chicken burrowing through the ground to sneak up on the lead.",
  },
  [ChickenTalent.CK47]: {
    name: ChickenTalent.CK47,
    type: "offensive",
    frequency: "high",
    tagline: "I’ll be bawk.",
    description:
      "Capable of firing 600 7.62 x 39mm rounds per minute, the CK-47 is the weapon of choice for the modern chicken. Unleash a barrage of lead to slow down the competition.",
  },
  [ChickenTalent.Coober]: {
    name: ChickenTalent.Coober,
    type: "speed",
    frequency: "medium",
    tagline: "Ride with Coober.",
    description:
      "When running late, Coober is the fast and cheap way to get where you need to go. Our Coober cars can pick you up from anywhere, and then drop you off somewhere else.",
  },
  [ChickenTalent.Flight]: {
    name: ChickenTalent.Flight,
    type: "speed",
    frequency: "medium",
    tagline: "If I just think happy thoughts.",
    description:
      "Long since bound to the ground, the chicken has known only dirt. But with enough belief, even the flightless can soar. Sometimes.",
  },
  [ChickenTalent.Growth]: {
    name: ChickenTalent.Growth,
    type: "speed",
    frequency: "medium",
    tagline: "I ordered the XL portion.",
    description:
      "Using a strange potion created by the deranged Dr. Droob, your chicken will quadruple in size, giving them a steady speed advantage that will trounce the competition.",
  },
  [ChickenTalent.Machete]: {
    name: ChickenTalent.Machete,
    type: "offensive",
    frequency: "high",
    tagline: "Whose the headless one now!?",
    description:
      "The only thing scarier than a trained chicken with a knife, is an untrained chicken with a knife. Your chicken will wildly wield its machete, decapitating any opponents who dare get in the way.",
  },
  [ChickenTalent.Rollerblades]: {
    name: ChickenTalent.Rollerblades,
    type: "speed",
    frequency: "low",
    tagline: "Why fly when you can glide.",
    description:
      "After strapping on their fashionable blades, your chicken will gain a burst of speed and shall glide forward with ease.",
  },
  [ChickenTalent.Teleport]: {
    name: ChickenTalent.Teleport,
    type: "speed",
    frequency: "medium",
    tagline:
      "The melting of the first test subject, was more of a learning experience than a problem.",
    description:
      "An early prototype from Dr. Droob, the short-range teleporter has the ability to instantly move a chicken up to 10 meters away. Funding was dropped when the teleporter was outperformed by a 12-year-old child with a cricket bat.",
  },
  [ChickenTalent.BlueEgg]: {
    name: ChickenTalent.BlueEgg,
    type: "offensive",
    frequency: "high",
    tagline: "I’m a chicken, I'm a-gonna win.",
    description:
      "A hen exclusive ability, the Blue Egg will seek out a leading chicken and take them down in a devastating blast.",
  },
  [ChickenTalent.FanGroup]: {
    name: ChickenTalent.FanGroup,
    type: "speed",
    frequency: "medium",
    tagline: "CHICKENZ NO.1 4EVA",
    description:
      "A flock of chicken-crazed fans storm the race track in a desperate attempt to get an autograph from their favourite racer. Your chicken will gain speed so as to escape the debauched devotees.",
  },
  [ChickenTalent.Helicopter]: {
    name: ChickenTalent.Helicopter,
    type: "offensive",
    frequency: "high",
    tagline: "Charlie, Hotel, Kilo, November. Ready to deploy.",
    description:
      "Chickens can fly, with the aid of a C-22 Osprey. Your chicken will call down the metal bird that’ll safely airlift them forwards, while firing off a couple of homing missiles to take out the opposition.",
  },
  [ChickenTalent.Jetpack]: {
    name: ChickenTalent.Jetpack,
    type: "speed",
    frequency: "medium",
    tagline: "Chicken + Explosive Propulsion = Good",
    description:
      "This jetpack uses the latest high-speed poultry engine, with a top speed of 120mph. Includes a 2-year warranty and a life raft for water landings.",
  },
  [ChickenTalent.ColdSnap]: {
    name: ChickenTalent.ColdSnap,
    type: "offensive",
    frequency: "high",
    tagline: "Frostius-makit-coldus!",
    description:
      "A powerful spell that will send a chill to the tender bones of several nearby chickens. They’ll be frozen in their tracks, allowing your chicken to take the lead.",
  },
  [ChickenTalent.Devolution]: {
    name: ChickenTalent.Devolution,
    type: "offensive",
    frequency: "high",
    tagline: "200 million years of evolution, for this.",
    description:
      "Unleash the wrath of your inner dinosaur. Your chicken will revert back to its prehistoric form and charge ahead, while calling on some help from the pack to hunt the opposition. This, is the land before chickens.",
  },
  [ChickenTalent.MovingWalkway]: {
    name: ChickenTalent.MovingWalkway,
    type: "speed",
    frequency: "medium",
    tagline: "Why are they only in airports?",
    description:
      "A crack construction crew will quickly turn your chicken's lane into a luxury moving walkway. Your chicken can recover their strength and glide past other racers with ease.",
  },
  [ChickenTalent.BlackHole]: {
    name: ChickenTalent.BlackHole,
    type: "offensive",
    frequency: "low",
    tagline: "A hawk taught me this one.",
    description:
      "The most devastating force in the universe. Unleash a powerful black hole that’ll suck in your opponents, giving your chicken a chance, for victory.",
  },
  [ChickenTalent.RoyalProcession]: {
    name: ChickenTalent.RoyalProcession,
    type: "speed",
    frequency: "low",
    tagline: "Make way for the Queen's Chicken!",
    description:
      "Roll out the red carpet as a golden horse-drawn carriage will guide your chicken to victory.",
  },
  [ChickenTalent.FeatherRain]: {
    name: ChickenTalent.FeatherRain,
    type: "offensive",
    frequency: "low",
    tagline: "Now you're truly plucked.",
    description:
      "A hail storm of feathers rain from the sky, piercing unsuspecting chickens like needles.",
  },
  [ChickenTalent.RunicRush]: {
    name: ChickenTalent.RunicRush,
    type: "speed",
    frequency: "low",
    tagline: "Blink and you'll miss it.",
    description:
      "Summoning powers from its core, the chicken transforms itself into pure energy, to surge forward in the blink of an eye.",
  },
};

export const talentByAnimations: { [name: string]: CommentaryTalent } = {
  Anvil_Throw: {
    name: ChickenTalent.Anvil,
    action: "deploying",
  },
  BlueRooster_Drink: {
    name: ChickenTalent.BlueRooster,
    action: "deploying",
  },
  Chickenapult_Spawn: {
    name: ChickenTalent.Chickenapult,
    action: "deploying",
  },
  Dig_Dive: {
    name: ChickenTalent.Dig,
    action: "deploying",
  },
  "CK-47_Draw": {
    name: ChickenTalent.CK47,
    action: "deploying",
  },
  Coober_Call: {
    name: ChickenTalent.Coober,
    action: "deploying",
  },
  Flight_TakeOff: {
    name: ChickenTalent.Flight,
    action: "deploying",
  },
  Growth_Grow: {
    name: ChickenTalent.Growth,
    action: "deploying",
  },
  Machete_Draw: {
    name: ChickenTalent.Machete,
    action: "deploying",
  },
  Rollerblades_Spawn: {
    name: ChickenTalent.Rollerblades,
    action: "deploying",
  },
  Teleporter_Button_Press: {
    name: ChickenTalent.Teleport,
    action: "deploying",
  },
  BlueEgg_Launch: {
    name: ChickenTalent.BlueEgg,
    action: "deploying",
  },
  FanGroup_Startle: {
    name: ChickenTalent.FanGroup,
    action: "deploying",
  },
  Helicopter_Mount_Ladder: {
    name: ChickenTalent.Helicopter,
    action: "deploying",
  },
  Jetpack_TransitionRed: {
    name: ChickenTalent.Jetpack,
    action: "deploying",
  },
  Jetpack_Transition: {
    name: ChickenTalent.Jetpack,
    action: "deploying",
  },
  ColdSnap_Manta: {
    name: ChickenTalent.ColdSnap,
    action: "deploying",
  },
  Devolution_Transform: {
    name: ChickenTalent.Devolution,
    action: "deploying",
  },
  MovingWalkway_GetOn: {
    name: ChickenTalent.MovingWalkway,
    action: "deploying",
  },
  BlackHole_Spit: {
    name: ChickenTalent.BlackHole,
    action: "deploying",
  },
  RoyalProcession_Appear: {
    name: ChickenTalent.RoyalProcession,
    action: "deploying",
  },
  FeatherRain_Call: {
    name: ChickenTalent.FeatherRain,
    action: "deploying",
  },
  RunicBlink_Disappear: {
    name: ChickenTalent.RunicRush,
    action: "deploying",
  },
  Anvil_Lands_1: {
    name: ChickenTalent.Anvil,
    action: "hitting",
  },
  "CK-47_Wince": {
    name: ChickenTalent.CK47,
    action: "hitting",
  },
  Machete_Decapitate: {
    name: ChickenTalent.Machete,
    action: "hitting",
  },
  Teleporter_Dematerialising: {
    name: ChickenTalent.Teleport,
    action: "hitting",
  },
  ColdSnap_GotSnap: {
    name: ChickenTalent.ColdSnap,
    action: "hitting",
  },
  Helicopter_Missile_Hit_1: {
    name: ChickenTalent.Helicopter,
    action: "hitting",
  },
  Devolution_FightCloud: {
    name: ChickenTalent.Devolution,
    action: "hitting",
  },
  BlueEgg_Impact_1: {
    name: ChickenTalent.BlueEgg,
    action: "hitting",
  },
  FeatherRain_Struck: {
    name: ChickenTalent.FeatherRain,
    action: "hitting",
  },
};
