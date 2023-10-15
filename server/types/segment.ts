import { MasterSegment } from "./masterSegment";

export interface Segment extends MasterSegment {
  startSpeed: number;
  segmentChickenAnimation?: string;
}
