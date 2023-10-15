import { ChickenTalent } from "./chickenTalent";

export enum CommentaryChickenSpeed {
  slow = "slow",
  medium = "medium",
  fast = "fast",
  veryFast = "very fast",
}

export interface CommentaryTalent {
  name: ChickenTalent;
  action: "deploying" | "hitting" | "using";
}

export interface CommentarySegment {
  duration: number;
  time: number;
  speed: CommentaryChickenSpeed;
  startPosition: number;
  endPosition: number;
  talent?: CommentaryTalent;
}

export interface CommentaryRaceData {
  chickenId: number;
  segments: CommentarySegment[];
}

// is talent active or passive (deploying or hitting)
export enum TalentType{
  deploying = 'deploying',
  hitting = 'hitting'
}
export interface CommentaryData{
  chickenId: number,
  chickenName: string,
  elapsed: number,
  type: TalentType,
  duration: number,
  startPosition: number,
  endPosition: number,
  talent: ChickenTalent,
}