import { Segment } from "./segment";

export interface RaceProfile {
  chickenId: number;
  segments: Segment[];
  metas?: any[];
}
