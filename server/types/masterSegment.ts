export interface MasterSegment {
  segment: number;
  endSpeed: number;
  segmentSize: number;
  cumulativeSegmentSize: number;
  segmentLocked?: string;
}
