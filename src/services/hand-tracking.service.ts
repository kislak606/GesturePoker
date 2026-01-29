import type { HandDetectionResult, HandTrackingCallback } from '../types/hand-tracking.types.js';

declare const Hands: any;
declare const Camera: any;
declare const Results: any;

export class HandTrackingService {
  private hands: any;
  private camera: any;
  private callback: HandTrackingCallback | undefined;

  constructor() {
    this.hands = undefined;
    this.camera = undefined;
    this.callback = undefined;
  }

  async initialize(
    videoElement: HTMLVideoElement,
    onResults: HandTrackingCallback
  ): Promise<void> {
    this.callback = onResults;

    this.hands = new (window as any).Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`;
      },
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    this.hands.onResults((results: any) => {
      this.handleResults(results);
    });

    this.camera = new (window as any).Camera(videoElement, {
      onFrame: async () => {
        if (this.hands) {
          await this.hands.send({ image: videoElement });
        }
      },
      width: 1280,
      height: 720,
    });

    await this.camera.start();
  }

  private handleResults(results: any): void {
    if (!this.callback) {
      return;
    }

    const handDetectionResult: HandDetectionResult = {
      multiHandLandmarks: results.multiHandLandmarks || [],
      multiHandedness: results.multiHandedness || [],
    };

    this.callback(handDetectionResult);
  }

  stop(): void {
    if (this.camera) {
      this.camera.stop();
    }
  }
}
