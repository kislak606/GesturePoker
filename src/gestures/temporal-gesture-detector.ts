import type { HandLandmarks } from '../types/hand-tracking.types.js';
import { getFingerTip, getWrist } from '../utils/hand-geometry.js';

export type TemporalGestureResult = {
  readonly detected: boolean;
  readonly confidence: number;
  readonly dragDistance?: number;
  readonly isAllIn?: boolean;
  readonly isConfirmed?: boolean;
};

type FingerPosition = {
  readonly y: number;
  readonly timestamp: number;
};

type HandPosition = {
  readonly x: number;
  readonly y: number;
  readonly timestamp: number;
};

const MOVEMENT_THRESHOLD = 0.05;
const MIN_TAPS_FOR_CHECK = 2;
const TAP_WINDOW_MS = 1000;
const FLICK_DISTANCE_THRESHOLD = 0.15; // Minimum distance for a flick
const FLICK_TIME_WINDOW_MS = 500; // Flick must happen within this time
const FLICK_MIN_VELOCITY = 0.3; // Minimum velocity (distance per second) - lowered for easier detection
const DRAG_GRACE_PERIOD = 50; // 50 pixels grace period before counting drag
const ALL_IN_UPWARD_THRESHOLD = 0.1; // Upward movement threshold for all-in
const HOLD_STILL_CONFIRMATION_MS = 5000; // 5 seconds hold still to confirm
const HOLD_STILL_MOVEMENT_THRESHOLD = 0.02; // Threshold for "still" movement (allows small human error)

export class TemporalGestureDetector {
  private checkHistory: FingerPosition[] = [];
  private foldHistory: HandPosition[] = [];
  private betDragStartX: number | undefined = undefined;
  private betDragStartY: number | undefined = undefined;
  private betDragCurrentDistance = 0;
  private betDragHoldStillStartTime: number | undefined = undefined;
  private betDragLastX: number | undefined = undefined;
  private betDragLastY: number | undefined = undefined;

  detectCheck(landmarks: HandLandmarks): TemporalGestureResult {
    const indexTip = getFingerTip(landmarks, 'index');
    const middleTip = getFingerTip(landmarks, 'middle');
    const timestamp = Date.now();

    // Check that both fingers are close together in Y position
    const fingerDistanceY = Math.abs(indexTip.y - middleTip.y);
    if (fingerDistanceY > MOVEMENT_THRESHOLD * 2) {
      // Fingers are not moving together, reset
      this.checkHistory = [];
      return { detected: false, confidence: 0 };
    }

    const avgY = (indexTip.y + middleTip.y) / 2;

    // Remove old positions outside the time window
    this.checkHistory = this.checkHistory.filter(
      (pos) => timestamp - pos.timestamp < TAP_WINDOW_MS
    );

    // Add current position
    this.checkHistory.push({ y: avgY, timestamp });

    // Detect taps by counting direction changes
    let taps = 0;
    let lastDirection: 'up' | 'down' | undefined = undefined;

    for (let i = 1; i < this.checkHistory.length; i++) {
      const prev = this.checkHistory[i - 1];
      const current = this.checkHistory[i];
      const diff = current.y - prev.y;

      if (Math.abs(diff) > MOVEMENT_THRESHOLD) {
        const currentDirection: 'up' | 'down' = diff < 0 ? 'up' : 'down';

        if (lastDirection && currentDirection !== lastDirection) {
          taps++;
        }

        lastDirection = currentDirection;
      }
    }

    const detected = taps >= MIN_TAPS_FOR_CHECK;

    if (detected) {
      // Reset to prevent immediate re-detection
      this.checkHistory = [];
      return { detected: true, confidence: 0.85 };
    }

    return { detected: false, confidence: 0 };
  }

  detectFold(landmarks: HandLandmarks): TemporalGestureResult {
    const wrist = getWrist(landmarks);
    const timestamp = Date.now();

    // Remove old positions outside the flick time window
    this.foldHistory = this.foldHistory.filter(
      (pos) => timestamp - pos.timestamp < FLICK_TIME_WINDOW_MS
    );

    // Add current position
    this.foldHistory.push({ x: wrist.x, y: wrist.y, timestamp });

    if (this.foldHistory.length < 2) {
      return { detected: false, confidence: 0 };
    }

    // Check for quick flick motion
    const startPos = this.foldHistory[0];
    const endPos = this.foldHistory[this.foldHistory.length - 1];

    const distance = Math.abs(endPos.x - startPos.x);
    const timeDelta = (endPos.timestamp - startPos.timestamp) / 1000; // Convert to seconds

    // Avoid division by zero
    if (timeDelta === 0) {
      return { detected: false, confidence: 0 };
    }

    const velocity = distance / timeDelta;

    // Detect flick: fast movement over a significant distance
    const isFlick = distance > FLICK_DISTANCE_THRESHOLD && velocity > FLICK_MIN_VELOCITY;

    if (isFlick) {
      // Reset history after detecting flick
      this.foldHistory = [];
      return { detected: true, confidence: 0.9 };
    }

    return { detected: false, confidence: 0 };
  }

  detectBetDrag(landmarks: HandLandmarks): TemporalGestureResult {
    const wrist = getWrist(landmarks);
    const currentTime = Date.now();

    // Initialize drag start position if not set
    if (this.betDragStartX === undefined || this.betDragStartY === undefined) {
      this.betDragStartX = wrist.x;
      this.betDragStartY = wrist.y;
      this.betDragCurrentDistance = 0;
      this.betDragLastX = wrist.x;
      this.betDragLastY = wrist.y;
      this.betDragHoldStillStartTime = currentTime;
      return { detected: false, confidence: 0, dragDistance: 0, isAllIn: false, isConfirmed: false };
    }

    // Check for upward motion for all-in
    const upwardDistance = this.betDragStartY - wrist.y; // Negative Y is up
    const isAllIn = upwardDistance > ALL_IN_UPWARD_THRESHOLD;

    // Calculate horizontal drag distance from starting position
    const rawDistance = wrist.x - this.betDragStartX;

    // Convert to pixels (assuming 1280px width for grace period calculation)
    const ASSUMED_WIDTH = 1280;
    const pixelDistance = Math.abs(rawDistance * ASSUMED_WIDTH);

    // Apply grace period - only start counting after 50 pixels
    let adjustedDistance = 0;
    if (pixelDistance > DRAG_GRACE_PERIOD) {
      // Subtract grace period from the distance
      const pixelsAfterGrace = pixelDistance - DRAG_GRACE_PERIOD;
      // Convert back to normalized coordinates
      adjustedDistance = (pixelsAfterGrace / ASSUMED_WIDTH) * Math.sign(rawDistance);
    }

    // Update current distance (allows both increase and decrease)
    this.betDragCurrentDistance = adjustedDistance;

    // Check if hand is holding still (small movements allowed for human error)
    const deltaX = Math.abs(wrist.x - (this.betDragLastX ?? wrist.x));
    const deltaY = Math.abs(wrist.y - (this.betDragLastY ?? wrist.y));
    const isMoving = deltaX > HOLD_STILL_MOVEMENT_THRESHOLD || deltaY > HOLD_STILL_MOVEMENT_THRESHOLD;

    if (isMoving) {
      // Reset hold still timer if hand is moving
      this.betDragHoldStillStartTime = currentTime;
      this.betDragLastX = wrist.x;
      this.betDragLastY = wrist.y;
    }

    // Check if confirmed (held still for 5 seconds)
    const holdStillDuration = currentTime - (this.betDragHoldStillStartTime ?? currentTime);
    const isConfirmed = holdStillDuration >= HOLD_STILL_CONFIRMATION_MS;

    const detected = Math.abs(this.betDragCurrentDistance) > 0 || isAllIn;

    if (isAllIn) {
      return {
        detected: true,
        confidence: 0.9,
        dragDistance: 0,
        isAllIn: true,
        isConfirmed,
      };
    }

    return {
      detected,
      confidence: detected ? 0.8 : 0,
      dragDistance: this.betDragCurrentDistance,
      isAllIn: false,
      isConfirmed,
    };
  }

  resetBetDrag(): void {
    this.betDragStartX = undefined;
    this.betDragStartY = undefined;
    this.betDragCurrentDistance = 0;
    this.betDragHoldStillStartTime = undefined;
    this.betDragLastX = undefined;
    this.betDragLastY = undefined;
  }

  reset(): void {
    this.checkHistory = [];
    this.foldHistory = [];
    this.betDragStartX = undefined;
    this.betDragStartY = undefined;
    this.betDragCurrentDistance = 0;
    this.betDragHoldStillStartTime = undefined;
    this.betDragLastX = undefined;
    this.betDragLastY = undefined;
  }
}
