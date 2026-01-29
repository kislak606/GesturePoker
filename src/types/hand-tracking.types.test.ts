import { describe, it, expect } from 'vitest';
import type { HandDetectionResult, NormalizedLandmark, HandLandmarks } from './hand-tracking.types';

describe('Hand Tracking Types', () => {
  it('should create valid NormalizedLandmark', () => {
    const landmark: NormalizedLandmark = {
      x: 0.5,
      y: 0.5,
      z: 0,
    };

    expect(landmark.x).toBe(0.5);
    expect(landmark.y).toBe(0.5);
    expect(landmark.z).toBe(0);
  });

  it('should create valid HandDetectionResult with no hands', () => {
    const result: HandDetectionResult = {
      multiHandLandmarks: [],
      multiHandedness: [],
    };

    expect(result.multiHandLandmarks).toHaveLength(0);
    expect(result.multiHandedness).toHaveLength(0);
  });

  it('should create valid HandDetectionResult with one hand', () => {
    const landmarks: HandLandmarks = [
      { x: 0.1, y: 0.1, z: 0 },
      { x: 0.2, y: 0.2, z: 0 },
    ];

    const result: HandDetectionResult = {
      multiHandLandmarks: [landmarks],
      multiHandedness: [{ label: 'Right', score: 0.95 }],
    };

    expect(result.multiHandLandmarks).toHaveLength(1);
    expect(result.multiHandedness[0].label).toBe('Right');
    expect(result.multiHandedness[0].score).toBe(0.95);
  });
});
