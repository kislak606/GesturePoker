import type { HandLandmarks, NormalizedLandmark } from '../types/hand-tracking.types.js';
import {
  calculateDistance,
  getFingerTip,
  getFingerMCP,
  getWrist,
  isFingerExtended,
  getFingerPIP,
} from '../utils/hand-geometry.js';

export type GestureDetectionResult = {
  readonly detected: boolean;
  readonly confidence: number;
};

const THUMB_UP_ANGLE_THRESHOLD = 0.3;
const OK_SYMBOL_DISTANCE_THRESHOLD = 0.1;
const CIRCLE_DISTANCE_THRESHOLD = 0.15;

type FingerJoints = {
  readonly tip: NormalizedLandmark;
  readonly pip: NormalizedLandmark;
  readonly mcp: NormalizedLandmark;
};

const getFingerJoints = (
  landmarks: HandLandmarks,
  finger: 'index' | 'middle' | 'ring' | 'pinky'
): FingerJoints => {
  return {
    tip: getFingerTip(landmarks, finger),
    pip: getFingerPIP(landmarks, finger),
    mcp: getFingerMCP(landmarks, finger),
  };
};

export const detectThumbsUp = (landmarks: HandLandmarks): GestureDetectionResult => {
  const wrist = getWrist(landmarks);
  const thumbTip = getFingerTip(landmarks, 'thumb');

  const index = getFingerJoints(landmarks, 'index');
  const middle = getFingerJoints(landmarks, 'middle');
  const ring = getFingerJoints(landmarks, 'ring');
  const pinky = getFingerJoints(landmarks, 'pinky');

  const isThumbUp = thumbTip.y < wrist.y - THUMB_UP_ANGLE_THRESHOLD;

  const indexCurled = !isFingerExtended(index.tip, index.pip, index.mcp, wrist);
  const middleCurled = !isFingerExtended(middle.tip, middle.pip, middle.mcp, wrist);
  const ringCurled = !isFingerExtended(ring.tip, ring.pip, ring.mcp, wrist);
  const pinkyCurled = !isFingerExtended(pinky.tip, pinky.pip, pinky.mcp, wrist);

  const otherFingersCurled = indexCurled && middleCurled && ringCurled && pinkyCurled;

  const detected = isThumbUp && otherFingersCurled;

  const confidence = detected ? 0.9 : 0.0;

  return { detected, confidence };
};

export const detectThumbsDown = (landmarks: HandLandmarks): GestureDetectionResult => {
  const wrist = getWrist(landmarks);
  const thumbTip = getFingerTip(landmarks, 'thumb');

  const index = getFingerJoints(landmarks, 'index');
  const middle = getFingerJoints(landmarks, 'middle');
  const ring = getFingerJoints(landmarks, 'ring');
  const pinky = getFingerJoints(landmarks, 'pinky');

  const isThumbDown = thumbTip.y > wrist.y + THUMB_UP_ANGLE_THRESHOLD;

  const indexCurled = !isFingerExtended(index.tip, index.pip, index.mcp, wrist);
  const middleCurled = !isFingerExtended(middle.tip, middle.pip, middle.mcp, wrist);
  const ringCurled = !isFingerExtended(ring.tip, ring.pip, ring.mcp, wrist);
  const pinkyCurled = !isFingerExtended(pinky.tip, pinky.pip, pinky.mcp, wrist);

  const otherFingersCurled = indexCurled && middleCurled && ringCurled && pinkyCurled;

  const detected = isThumbDown && otherFingersCurled;

  const confidence = detected ? 0.9 : 0.0;

  return { detected, confidence };
};

export const detectOkSymbol = (landmarks: HandLandmarks): GestureDetectionResult => {
  const wrist = getWrist(landmarks);
  const thumbTip = getFingerTip(landmarks, 'thumb');
  const indexTip = getFingerTip(landmarks, 'index');

  const middle = getFingerJoints(landmarks, 'middle');
  const ring = getFingerJoints(landmarks, 'ring');
  const pinky = getFingerJoints(landmarks, 'pinky');

  const thumbIndexDistance = calculateDistance(thumbTip, indexTip);
  const isCircleFormed = thumbIndexDistance < OK_SYMBOL_DISTANCE_THRESHOLD;

  const middleExtended = isFingerExtended(middle.tip, middle.pip, middle.mcp, wrist);
  const ringExtended = isFingerExtended(ring.tip, ring.pip, ring.mcp, wrist);
  const pinkyExtended = isFingerExtended(pinky.tip, pinky.pip, pinky.mcp, wrist);

  const otherFingersExtended = middleExtended && ringExtended && pinkyExtended;

  const detected = isCircleFormed && otherFingersExtended;

  const confidence = detected ? 0.85 : 0.0;

  return { detected, confidence };
};

export const detectCircleGesture = (
  landmarks: HandLandmarks
): GestureDetectionResult => {
  const wrist = getWrist(landmarks);
  const thumbTip = getFingerTip(landmarks, 'thumb');
  const indexTip = getFingerTip(landmarks, 'index');

  const middle = getFingerJoints(landmarks, 'middle');
  const ring = getFingerJoints(landmarks, 'ring');
  const pinky = getFingerJoints(landmarks, 'pinky');

  const thumbIndexDistance = calculateDistance(thumbTip, indexTip);
  const isCircleFormed = thumbIndexDistance < CIRCLE_DISTANCE_THRESHOLD;

  // Check if other fingers are extended (which would make it an OK symbol)
  const middleExtended = isFingerExtended(middle.tip, middle.pip, middle.mcp, wrist);
  const ringExtended = isFingerExtended(ring.tip, ring.pip, ring.mcp, wrist);
  const pinkyExtended = isFingerExtended(pinky.tip, pinky.pip, pinky.mcp, wrist);

  // If ANY of the three fingers are extended, it's likely an OK symbol, not a circle
  const anyFingerExtended = middleExtended || ringExtended || pinkyExtended;

  // Circle gesture is detected only when circle is formed AND other fingers are ALL curled
  const detected = isCircleFormed && !anyFingerExtended;

  const confidence = detected ? 0.8 : 0.0;

  return { detected, confidence };
};

export const detectCircleWithPinky = (
  landmarks: HandLandmarks
): GestureDetectionResult => {
  const wrist = getWrist(landmarks);
  const thumbTip = getFingerTip(landmarks, 'thumb');
  const indexTip = getFingerTip(landmarks, 'index');

  const pinky = getFingerJoints(landmarks, 'pinky');

  // Check if thumb and index form a circle
  const thumbIndexDistance = calculateDistance(thumbTip, indexTip);
  const isCircleFormed = thumbIndexDistance < CIRCLE_DISTANCE_THRESHOLD;

  // Check if pinky is extended
  const pinkyExtended = isFingerExtended(pinky.tip, pinky.pip, pinky.mcp, wrist);

  // Circle gesture with pinky extended
  const detected = isCircleFormed && pinkyExtended;

  const confidence = detected ? 0.85 : 0.0;

  return { detected, confidence };
};

export const detectFist = (landmarks: HandLandmarks): GestureDetectionResult => {
  const wrist = getWrist(landmarks);

  const index = getFingerJoints(landmarks, 'index');
  const middle = getFingerJoints(landmarks, 'middle');
  const ring = getFingerJoints(landmarks, 'ring');
  const pinky = getFingerJoints(landmarks, 'pinky');

  // Check if all fingers are curled (not extended)
  const indexCurled = !isFingerExtended(index.tip, index.pip, index.mcp, wrist);
  const middleCurled = !isFingerExtended(middle.tip, middle.pip, middle.mcp, wrist);
  const ringCurled = !isFingerExtended(ring.tip, ring.pip, ring.mcp, wrist);
  const pinkyCurled = !isFingerExtended(pinky.tip, pinky.pip, pinky.mcp, wrist);

  const allFingersCurled = indexCurled && middleCurled && ringCurled && pinkyCurled;

  const detected = allFingersCurled;
  const confidence = detected ? 0.85 : 0.0;

  return { detected, confidence };
};

export const detectOpenPalm = (landmarks: HandLandmarks): GestureDetectionResult => {
  const wrist = getWrist(landmarks);
  const thumbTip = getFingerTip(landmarks, 'thumb');

  const index = getFingerJoints(landmarks, 'index');
  const middle = getFingerJoints(landmarks, 'middle');
  const ring = getFingerJoints(landmarks, 'ring');
  const pinky = getFingerJoints(landmarks, 'pinky');

  // Check if all fingers are extended
  const indexExtended = isFingerExtended(index.tip, index.pip, index.mcp, wrist);
  const middleExtended = isFingerExtended(middle.tip, middle.pip, middle.mcp, wrist);
  const ringExtended = isFingerExtended(ring.tip, ring.pip, ring.mcp, wrist);
  const pinkyExtended = isFingerExtended(pinky.tip, pinky.pip, pinky.mcp, wrist);

  // Check if thumb is not touching index finger (to avoid OK symbol detection)
  const thumbIndexDistance = calculateDistance(thumbTip, index.tip);
  const thumbNotTouchingIndex = thumbIndexDistance > OK_SYMBOL_DISTANCE_THRESHOLD;

  const allFingersExtended = indexExtended && middleExtended && ringExtended && pinkyExtended;

  const detected = allFingersExtended && thumbNotTouchingIndex;
  const confidence = detected ? 0.9 : 0.0;

  return { detected, confidence };
};

export const detectPointerFingerUp = (landmarks: HandLandmarks): GestureDetectionResult => {
  const wrist = getWrist(landmarks);

  const index = getFingerJoints(landmarks, 'index');
  const middle = getFingerJoints(landmarks, 'middle');
  const ring = getFingerJoints(landmarks, 'ring');
  const pinky = getFingerJoints(landmarks, 'pinky');

  // Check if index finger is extended
  const indexExtended = isFingerExtended(index.tip, index.pip, index.mcp, wrist);

  // Check if other fingers are curled (not extended)
  const middleCurled = !isFingerExtended(middle.tip, middle.pip, middle.mcp, wrist);
  const ringCurled = !isFingerExtended(ring.tip, ring.pip, ring.mcp, wrist);
  const pinkyCurled = !isFingerExtended(pinky.tip, pinky.pip, pinky.mcp, wrist);

  const otherFingersCurled = middleCurled && ringCurled && pinkyCurled;

  const detected = indexExtended && otherFingersCurled;
  const confidence = detected ? 0.9 : 0.0;

  return { detected, confidence };
};
