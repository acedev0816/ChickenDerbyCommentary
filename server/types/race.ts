import { Lane } from "./lane";
import { Terrain } from "./terrain";

export interface Race {
  id: number;

  name: string;

  peckingOrder: string;

  distance: number;

  fee: number;

  feeUSD: number;

  prizePool: number;

  prizePoolUSD: number;

  maxCapacity: number;

  location: string;

  terrain: Terrain;

  lanes: Lane[];
}
