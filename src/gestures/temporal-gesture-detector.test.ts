import { describe, it, expect, vi } from 'vitest';
import {
  TemporalGestureDetector,
  type TemporalGestureResult,
} from './temporal-gesture-detector.js';
import type { HandLandmarks } from '../types/hand-tracking.types.js';

const createMockLandmarks = (overrides: {
  wristY?: number;
  indexTipY?: number;
  middleTipY?: number;
  wristX?: number;
}): HandLandmarks => {
  const landmarks = Array.from({ length: 21 }, (_, i) => ({
    x: 0.5,
    y: 0.5,
    z: 0,
  }));

  if (overrides.wristY !== undefined) {
    landmarks[0].y = overrides.wristY;
  }
  if (overrides.indexTipY !== undefined) {
    landmarks[8].y = overrides.indexTipY;
  }
  if (overrides.middleTipY !== undefined) {
    landmarks[12].y = overrides.middleTipY;
  }
  if (overrides.wristX !== undefined) {
    landmarks[0].x = overrides.wristX;
  }

  return landmarks as HandLandmarks;
};

describe('TemporalGestureDetector', () => {
  describe('Check gesture (index and middle finger tapping)', () => {
    it('should not detect check gesture with single frame', () => {
      const detector = new TemporalGestureDetector();
      const landmarks = createMockLandmarks({
        indexTipY: 0.3,
        middleTipY: 0.3,
      });

      const result = detector.detectCheck(landmarks);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('should detect check gesture with up-down-up motion', () => {
      const detector = new TemporalGestureDetector();

      // Frame 1: Fingers down
      detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.5, middleTipY: 0.5 })
      );

      // Frame 2: Fingers up
      detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.3, middleTipY: 0.3 })
      );

      // Frame 3: Fingers down
      detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.5, middleTipY: 0.5 })
      );

      // Frame 4: Fingers up again - should trigger detection
      const result = detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.3, middleTipY: 0.3 })
      );

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should not detect check if only one finger moves', () => {
      const detector = new TemporalGestureDetector();

      detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.5, middleTipY: 0.5 })
      );
      detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.3, middleTipY: 0.5 })
      );
      detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.5, middleTipY: 0.5 })
      );

      const result = detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.3, middleTipY: 0.5 })
      );

      expect(result.detected).toBe(false);
    });

    it('should reset check detection after successful detection', () => {
      const detector = new TemporalGestureDetector();

      // First successful detection
      detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.5, middleTipY: 0.5 })
      );
      detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.3, middleTipY: 0.3 })
      );
      detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.5, middleTipY: 0.5 })
      );
      const firstResult = detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.3, middleTipY: 0.3 })
      );

      expect(firstResult.detected).toBe(true);

      // Next frame should not immediately trigger again
      const secondResult = detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.3, middleTipY: 0.3 })
      );

      expect(secondResult.detected).toBe(false);
    });
  });

  describe('Fold gesture (wave away)', () => {
    it('should not detect fold with single frame', () => {
      const detector = new TemporalGestureDetector();
      const landmarks = createMockLandmarks({ wristX: 0.5 });

      const result = detector.detectFold(landmarks);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('should detect fold gesture with quick flick (left-to-right)', () => {
      vi.useFakeTimers();
      const detector = new TemporalGestureDetector();

      // Start position at t=0
      vi.setSystemTime(0);
      detector.detectFold(createMockLandmarks({ wristX: 0.3 }));

      // Quick flick - move 0.2 units in 100ms = velocity of 2.0 (well above threshold)
      vi.advanceTimersByTime(100);
      const result = detector.detectFold(createMockLandmarks({ wristX: 0.5 }));

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);

      vi.useRealTimers();
    });

    it('should detect fold gesture with quick flick (right-to-left)', () => {
      vi.useFakeTimers();
      const detector = new TemporalGestureDetector();

      // Start position at t=0
      vi.setSystemTime(0);
      detector.detectFold(createMockLandmarks({ wristX: 0.7 }));

      // Quick flick - move 0.2 units in 100ms = velocity of 2.0
      vi.advanceTimersByTime(100);
      const result = detector.detectFold(createMockLandmarks({ wristX: 0.5 }));

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);

      vi.useRealTimers();
    });

    it('should not detect fold if movement is too small', () => {
      vi.useFakeTimers();
      const detector = new TemporalGestureDetector();

      // Small movements should not trigger flick (only 0.05 distance)
      vi.setSystemTime(0);
      detector.detectFold(createMockLandmarks({ wristX: 0.5 }));

      vi.advanceTimersByTime(100);
      const result = detector.detectFold(createMockLandmarks({ wristX: 0.55 }));

      expect(result.detected).toBe(false);

      vi.useRealTimers();
    });

    it('should reset fold detection after successful detection', () => {
      vi.useFakeTimers();
      const detector = new TemporalGestureDetector();

      // First flick
      vi.setSystemTime(0);
      detector.detectFold(createMockLandmarks({ wristX: 0.3 }));

      vi.advanceTimersByTime(100);
      const firstResult = detector.detectFold(
        createMockLandmarks({ wristX: 0.5 })
      );

      expect(firstResult.detected).toBe(true);

      // Next frame should not immediately trigger again (history was reset)
      vi.advanceTimersByTime(50);
      const secondResult = detector.detectFold(
        createMockLandmarks({ wristX: 0.6 })
      );

      expect(secondResult.detected).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('Bet drag gesture (OK symbol dragged left-to-right)', () => {
    it('should not detect bet drag with single frame', () => {
      const detector = new TemporalGestureDetector();
      const landmarks = createMockLandmarks({ wristX: 0.5 });

      const result = detector.detectBetDrag(landmarks);

      expect(result.detected).toBe(false);
      expect(result.dragDistance).toBe(0);
    });

    it('should track drag distance when OK symbol is held', () => {
      const detector = new TemporalGestureDetector();

      // Start with OK symbol at x=0.3
      detector.detectBetDrag(createMockLandmarks({ wristX: 0.3 }));

      // Drag to x=0.4
      detector.detectBetDrag(createMockLandmarks({ wristX: 0.4 }));

      // Drag to x=0.5
      const result = detector.detectBetDrag(
        createMockLandmarks({ wristX: 0.5 })
      );

      expect(result.detected).toBe(true);
      expect(result.dragDistance).toBeGreaterThan(0);
    });

    it('should track drag in both directions (bidirectional)', () => {
      const detector = new TemporalGestureDetector();

      // Start at middle
      detector.detectBetDrag(createMockLandmarks({ wristX: 0.5 }));

      // Move right (increase)
      const result1 = detector.detectBetDrag(
        createMockLandmarks({ wristX: 0.6 })
      );
      expect(result1.dragDistance).toBeGreaterThan(0);

      // Move left (decrease)
      const result2 = detector.detectBetDrag(
        createMockLandmarks({ wristX: 0.4 })
      );
      expect(result2.dragDistance).toBeLessThan(0);
    });

    it('should reset drag tracking when bet is confirmed', () => {
      const detector = new TemporalGestureDetector();

      // Build up drag distance
      detector.detectBetDrag(createMockLandmarks({ wristX: 0.3 }));
      detector.detectBetDrag(createMockLandmarks({ wristX: 0.5 }));

      // Reset
      detector.resetBetDrag();

      const result = detector.detectBetDrag(
        createMockLandmarks({ wristX: 0.6 })
      );

      // Should start tracking fresh
      expect(result.dragDistance).toBe(0);
    });
  });

  describe('reset()', () => {
    it('should reset all temporal gesture tracking', () => {
      const detector = new TemporalGestureDetector();

      // Build up state for multiple gestures
      detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.5, middleTipY: 0.5 })
      );
      detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.3, middleTipY: 0.3 })
      );

      detector.detectFold(createMockLandmarks({ wristX: 0.3 }));
      detector.detectFold(createMockLandmarks({ wristX: 0.5 }));

      detector.detectBetDrag(createMockLandmarks({ wristX: 0.3 }));
      detector.detectBetDrag(createMockLandmarks({ wristX: 0.5 }));

      // Reset all
      detector.reset();

      // All gestures should be at initial state
      const checkResult = detector.detectCheck(
        createMockLandmarks({ indexTipY: 0.3, middleTipY: 0.3 })
      );
      const foldResult = detector.detectFold(
        createMockLandmarks({ wristX: 0.6 })
      );
      const betResult = detector.detectBetDrag(
        createMockLandmarks({ wristX: 0.6 })
      );

      expect(checkResult.detected).toBe(false);
      expect(foldResult.detected).toBe(false);
      expect(betResult.dragDistance).toBe(0);
    });
  });
});
