import { describe, it, expect } from 'vitest';
import type { NormalizedLandmark } from '../types/hand-tracking.types';
import {
  calculateDistance,
  calculateAngle,
  isFingerExtended,
  getFingerTip,
} from './hand-geometry';

describe('Hand Geometry Utilities', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points in 2D space', () => {
      const pointA: NormalizedLandmark = { x: 0, y: 0, z: 0 };
      const pointB: NormalizedLandmark = { x: 3, y: 4, z: 0 };

      const distance = calculateDistance(pointA, pointB);

      expect(distance).toBe(5);
    });

    it('should calculate distance between same point as zero', () => {
      const pointA: NormalizedLandmark = { x: 0.5, y: 0.5, z: 0 };
      const pointB: NormalizedLandmark = { x: 0.5, y: 0.5, z: 0 };

      const distance = calculateDistance(pointA, pointB);

      expect(distance).toBe(0);
    });

    it('should calculate distance including z-axis', () => {
      const pointA: NormalizedLandmark = { x: 0, y: 0, z: 0 };
      const pointB: NormalizedLandmark = { x: 0, y: 0, z: 1 };

      const distance = calculateDistance(pointA, pointB);

      expect(distance).toBe(1);
    });
  });

  describe('calculateAngle', () => {
    it('should calculate 90 degree angle', () => {
      const pointA: NormalizedLandmark = { x: 0, y: 1, z: 0 };
      const pointB: NormalizedLandmark = { x: 0, y: 0, z: 0 };
      const pointC: NormalizedLandmark = { x: 1, y: 0, z: 0 };

      const angle = calculateAngle(pointA, pointB, pointC);

      expect(angle).toBeCloseTo(90, 1);
    });

    it('should calculate 180 degree angle for collinear points', () => {
      const pointA: NormalizedLandmark = { x: 0, y: 0, z: 0 };
      const pointB: NormalizedLandmark = { x: 0.5, y: 0, z: 0 };
      const pointC: NormalizedLandmark = { x: 1, y: 0, z: 0 };

      const angle = calculateAngle(pointA, pointB, pointC);

      expect(angle).toBeCloseTo(180, 1);
    });

    it('should calculate acute angle', () => {
      const pointA: NormalizedLandmark = { x: 1, y: 1, z: 0 };
      const pointB: NormalizedLandmark = { x: 0, y: 0, z: 0 };
      const pointC: NormalizedLandmark = { x: 1, y: 0, z: 0 };

      const angle = calculateAngle(pointA, pointB, pointC);

      expect(angle).toBeCloseTo(45, 1);
    });
  });

  describe('isFingerExtended', () => {
    it('should detect extended finger when tip is far from base', () => {
      const tip: NormalizedLandmark = { x: 0.5, y: 0.1, z: 0 };
      const pip: NormalizedLandmark = { x: 0.5, y: 0.3, z: 0 };
      const mcp: NormalizedLandmark = { x: 0.5, y: 0.5, z: 0 };
      const wrist: NormalizedLandmark = { x: 0.5, y: 0.9, z: 0 };

      const extended = isFingerExtended(tip, pip, mcp, wrist);

      expect(extended).toBe(true);
    });

    it('should detect curled finger when tip is close to base', () => {
      const tip: NormalizedLandmark = { x: 0.5, y: 0.6, z: 0 };
      const pip: NormalizedLandmark = { x: 0.5, y: 0.5, z: 0 };
      const mcp: NormalizedLandmark = { x: 0.5, y: 0.5, z: 0 };
      const wrist: NormalizedLandmark = { x: 0.5, y: 0.9, z: 0 };

      const extended = isFingerExtended(tip, pip, mcp, wrist);

      expect(extended).toBe(false);
    });
  });

  describe('getFingerTip', () => {
    it('should get thumb tip from landmarks', () => {
      const landmarks: readonly NormalizedLandmark[] = createMockHandLandmarks();

      const thumbTip = getFingerTip(landmarks, 'thumb');

      expect(thumbTip).toEqual(landmarks[4]);
    });

    it('should get index finger tip from landmarks', () => {
      const landmarks: readonly NormalizedLandmark[] = createMockHandLandmarks();

      const indexTip = getFingerTip(landmarks, 'index');

      expect(indexTip).toEqual(landmarks[8]);
    });

    it('should get middle finger tip from landmarks', () => {
      const landmarks: readonly NormalizedLandmark[] = createMockHandLandmarks();

      const middleTip = getFingerTip(landmarks, 'middle');

      expect(middleTip).toEqual(landmarks[12]);
    });

    it('should get ring finger tip from landmarks', () => {
      const landmarks: readonly NormalizedLandmark[] = createMockHandLandmarks();

      const ringTip = getFingerTip(landmarks, 'ring');

      expect(ringTip).toEqual(landmarks[16]);
    });

    it('should get pinky tip from landmarks', () => {
      const landmarks: readonly NormalizedLandmark[] = createMockHandLandmarks();

      const pinkyTip = getFingerTip(landmarks, 'pinky');

      expect(pinkyTip).toEqual(landmarks[20]);
    });
  });
});

const createMockHandLandmarks = (): readonly NormalizedLandmark[] => {
  return Array.from({ length: 21 }, (_, i) => ({
    x: i * 0.05,
    y: i * 0.05,
    z: 0,
  }));
};
