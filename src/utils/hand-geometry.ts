import type { NormalizedLandmark } from '../types/hand-tracking.types.js';

export type FingerName = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';

const FINGER_TIP_INDICES: Record<FingerName, number> = {
  thumb: 4,
  index: 8,
  middle: 12,
  ring: 16,
  pinky: 20,
};

const FINGER_PIP_INDICES: Record<FingerName, number> = {
  thumb: 3,
  index: 6,
  middle: 10,
  ring: 14,
  pinky: 18,
};

const FINGER_MCP_INDICES: Record<FingerName, number> = {
  thumb: 2,
  index: 5,
  middle: 9,
  ring: 13,
  pinky: 17,
};

const WRIST_INDEX = 0;

export const calculateDistance = (
  pointA: NormalizedLandmark,
  pointB: NormalizedLandmark
): number => {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;
  const dz = pointB.z - pointA.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export const calculateAngle = (
  pointA: NormalizedLandmark,
  pointB: NormalizedLandmark,
  pointC: NormalizedLandmark
): number => {
  const vectorBA = {
    x: pointA.x - pointB.x,
    y: pointA.y - pointB.y,
    z: pointA.z - pointB.z,
  };

  const vectorBC = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y,
    z: pointC.z - pointB.z,
  };

  const dotProduct =
    vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y + vectorBA.z * vectorBC.z;

  const magnitudeBA = Math.sqrt(
    vectorBA.x * vectorBA.x + vectorBA.y * vectorBA.y + vectorBA.z * vectorBA.z
  );

  const magnitudeBC = Math.sqrt(
    vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y + vectorBC.z * vectorBC.z
  );

  const cosAngle = dotProduct / (magnitudeBA * magnitudeBC);
  const angleRadians = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

  return (angleRadians * 180) / Math.PI;
};

export const isFingerExtended = (
  tip: NormalizedLandmark,
  _pip: NormalizedLandmark,
  mcp: NormalizedLandmark,
  wrist: NormalizedLandmark
): boolean => {
  const tipToWrist = calculateDistance(tip, wrist);
  const mcpToWrist = calculateDistance(mcp, wrist);

  return tipToWrist > mcpToWrist * 1.2;
};

export const getFingerTip = (
  landmarks: readonly NormalizedLandmark[],
  finger: FingerName
): NormalizedLandmark => {
  const tipIndex = FINGER_TIP_INDICES[finger];
  return landmarks[tipIndex];
};

export const getFingerPIP = (
  landmarks: readonly NormalizedLandmark[],
  finger: FingerName
): NormalizedLandmark => {
  const pipIndex = FINGER_PIP_INDICES[finger];
  return landmarks[pipIndex];
};

export const getFingerMCP = (
  landmarks: readonly NormalizedLandmark[],
  finger: FingerName
): NormalizedLandmark => {
  const mcpIndex = FINGER_MCP_INDICES[finger];
  return landmarks[mcpIndex];
};

export const getWrist = (
  landmarks: readonly NormalizedLandmark[]
): NormalizedLandmark => {
  return landmarks[WRIST_INDEX];
};
