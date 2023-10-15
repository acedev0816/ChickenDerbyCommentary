import { Chicken } from "./chicken";

export interface Lane {
  id: number;
  laneNumber: number;
  chicken: Chicken;
}
