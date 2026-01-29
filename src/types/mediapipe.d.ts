declare module '@mediapipe/hands' {
  export type NormalizedLandmark = {
    x: number;
    y: number;
    z: number;
    visibility?: number;
  };

  export type Results = {
    image: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement;
    multiHandLandmarks?: NormalizedLandmark[][];
    multiHandedness?: Array<{
      index: number;
      score: number;
      label: string;
    }>;
  };

  export type HandsOptions = {
    maxNumHands?: number;
    modelComplexity?: number;
    minDetectionConfidence?: number;
    minTrackingConfidence?: number;
  };

  export type HandsConfig = {
    locateFile: (file: string) => string;
  };

  export class Hands {
    constructor(config: HandsConfig);
    setOptions(options: HandsOptions): void;
    onResults(callback: (results: Results) => void): void;
    send(inputs: { image: HTMLVideoElement | HTMLImageElement }): Promise<void>;
    close(): void;
  }
}

declare module '@mediapipe/camera_utils' {
  export type CameraOptions = {
    onFrame: () => Promise<void> | void;
    width?: number;
    height?: number;
  };

  export class Camera {
    constructor(videoElement: HTMLVideoElement, options: CameraOptions);
    start(): Promise<void>;
    stop(): void;
  }
}

declare module '@mediapipe/drawing_utils' {
  export type DrawingOptions = {
    color?: string;
    lineWidth?: number;
    radius?: number;
  };

  export function drawConnectors(
    ctx: CanvasRenderingContext2D,
    landmarks: unknown[],
    connections: unknown[],
    options?: DrawingOptions
  ): void;

  export function drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: unknown[],
    options?: DrawingOptions
  ): void;

  export const HAND_CONNECTIONS: unknown[];
}
