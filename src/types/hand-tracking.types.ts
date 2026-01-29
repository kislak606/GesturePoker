export type NormalizedLandmark = {
  readonly x: number;
  readonly y: number;
  readonly z: number;
};

export type HandLandmarks = readonly NormalizedLandmark[];

export type HandDetectionResult = {
  readonly multiHandLandmarks: readonly HandLandmarks[];
  readonly multiHandedness: ReadonlyArray<{
    readonly label: string;
    readonly score: number;
  }>;
};

export type HandTrackingCallback = (result: HandDetectionResult) => void;
