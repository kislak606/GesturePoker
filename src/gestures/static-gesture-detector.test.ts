import { describe, it, expect } from 'vitest';
import type { HandLandmarks, NormalizedLandmark } from '../types/hand-tracking.types';
import {
  detectThumbsUp,
  detectThumbsDown,
  detectOkSymbol,
  detectCircleGesture,
  detectCircleWithPinky,
  detectFist,
  detectOpenPalm,
  detectPointerFingerUp,
} from './static-gesture-detector';

describe('Static Gesture Detector', () => {
  describe('detectThumbsUp', () => {
    it('should detect thumbs up when thumb is extended and other fingers are curled', () => {
      const landmarks = createThumbsUpLandmarks();

      const result = detectThumbsUp(landmarks);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should not detect thumbs up when all fingers are extended', () => {
      const landmarks = createOpenHandLandmarks();

      const result = detectThumbsUp(landmarks);

      expect(result.detected).toBe(false);
    });

    it('should not detect thumbs up when thumb is down', () => {
      const landmarks = createThumbsDownLandmarks();

      const result = detectThumbsUp(landmarks);

      expect(result.detected).toBe(false);
    });
  });

  describe('detectOkSymbol', () => {
    it('should detect OK symbol when thumb and index finger form circle', () => {
      const landmarks = createOkSymbolLandmarks();

      const result = detectOkSymbol(landmarks);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should not detect OK symbol when fingers are extended', () => {
      const landmarks = createOpenHandLandmarks();

      const result = detectOkSymbol(landmarks);

      expect(result.detected).toBe(false);
    });

    it('should not detect OK symbol when all fingers are curled', () => {
      const landmarks = createFistLandmarks();

      const result = detectOkSymbol(landmarks);

      expect(result.detected).toBe(false);
    });
  });

  describe('detectCircleGesture', () => {
    it('should detect circle when thumb and index finger tips are close', () => {
      const landmarks = createCircleLandmarks();

      const result = detectCircleGesture(landmarks);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should not detect circle when fingers are far apart', () => {
      const landmarks = createOpenHandLandmarks();

      const result = detectCircleGesture(landmarks);

      expect(result.detected).toBe(false);
    });

    it('should not detect circle when it is actually an OK symbol (other fingers extended)', () => {
      const landmarks = createOkSymbolLandmarks();

      const result = detectCircleGesture(landmarks);

      expect(result.detected).toBe(false);
    });
  });

  describe('detectCircleWithPinky', () => {
    it('should detect circle with pinky when circle is formed and pinky is extended', () => {
      const landmarks = createCircleWithPinkyLandmarks();

      const result = detectCircleWithPinky(landmarks);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should not detect circle with pinky when circle is formed but pinky is curled', () => {
      const landmarks = createCircleLandmarks();

      const result = detectCircleWithPinky(landmarks);

      expect(result.detected).toBe(false);
    });

    it('should not detect circle with pinky when no circle is formed', () => {
      const landmarks = createOpenHandLandmarks();

      const result = detectCircleWithPinky(landmarks);

      expect(result.detected).toBe(false);
    });
  });
});

const createThumbsUpLandmarks = (): HandLandmarks => {
  const landmarks: NormalizedLandmark[] = Array.from({ length: 21 }, (_, i) => ({
    x: 0.5,
    y: 0.5,
    z: 0,
  }));

  landmarks[0] = { x: 0.5, y: 0.9, z: 0 };
  landmarks[4] = { x: 0.5, y: 0.1, z: 0 };
  landmarks[3] = { x: 0.5, y: 0.3, z: 0 };
  landmarks[2] = { x: 0.5, y: 0.5, z: 0 };

  landmarks[8] = { x: 0.6, y: 0.7, z: 0 };
  landmarks[12] = { x: 0.5, y: 0.7, z: 0 };
  landmarks[16] = { x: 0.4, y: 0.7, z: 0 };
  landmarks[20] = { x: 0.3, y: 0.7, z: 0 };

  return landmarks;
};

const createThumbsDownLandmarks = (): HandLandmarks => {
  const landmarks: NormalizedLandmark[] = Array.from({ length: 21 }, (_, i) => ({
    x: 0.5,
    y: 0.5,
    z: 0,
  }));

  landmarks[0] = { x: 0.5, y: 0.1, z: 0 };
  landmarks[4] = { x: 0.5, y: 0.9, z: 0 };

  return landmarks;
};

const createOpenHandLandmarks = (): HandLandmarks => {
  const landmarks: NormalizedLandmark[] = Array.from({ length: 21 }, (_, i) => ({
    x: 0.5,
    y: 0.5,
    z: 0,
  }));

  landmarks[0] = { x: 0.5, y: 0.9, z: 0 };
  landmarks[4] = { x: 0.1, y: 0.1, z: 0 };
  landmarks[8] = { x: 0.3, y: 0.1, z: 0 };
  landmarks[12] = { x: 0.5, y: 0.1, z: 0 };
  landmarks[16] = { x: 0.7, y: 0.1, z: 0 };
  landmarks[20] = { x: 0.9, y: 0.1, z: 0 };

  return landmarks;
};

const createFistLandmarks = (): HandLandmarks => {
  const landmarks: NormalizedLandmark[] = Array.from({ length: 21 }, (_, i) => ({
    x: 0.5,
    y: 0.5,
    z: 0,
  }));

  landmarks[0] = { x: 0.5, y: 0.9, z: 0 };
  landmarks[4] = { x: 0.5, y: 0.5, z: 0 };
  landmarks[8] = { x: 0.5, y: 0.5, z: 0 };
  landmarks[12] = { x: 0.5, y: 0.5, z: 0 };
  landmarks[16] = { x: 0.5, y: 0.5, z: 0 };
  landmarks[20] = { x: 0.5, y: 0.5, z: 0 };

  return landmarks;
};

const createOkSymbolLandmarks = (): HandLandmarks => {
  const landmarks: NormalizedLandmark[] = Array.from({ length: 21 }, (_, i) => ({
    x: 0.5,
    y: 0.5,
    z: 0,
  }));

  landmarks[0] = { x: 0.5, y: 0.9, z: 0 };
  landmarks[4] = { x: 0.45, y: 0.4, z: 0 };
  landmarks[8] = { x: 0.52, y: 0.4, z: 0 };

  landmarks[10] = { x: 0.5, y: 0.3, z: 0 };
  landmarks[9] = { x: 0.5, y: 0.5, z: 0 };
  landmarks[12] = { x: 0.5, y: 0.05, z: 0 };

  landmarks[14] = { x: 0.6, y: 0.3, z: 0 };
  landmarks[13] = { x: 0.6, y: 0.5, z: 0 };
  landmarks[16] = { x: 0.6, y: 0.05, z: 0 };

  landmarks[18] = { x: 0.7, y: 0.3, z: 0 };
  landmarks[17] = { x: 0.7, y: 0.5, z: 0 };
  landmarks[20] = { x: 0.7, y: 0.05, z: 0 };

  return landmarks;
};

const createCircleLandmarks = (): HandLandmarks => {
  const landmarks: NormalizedLandmark[] = Array.from({ length: 21 }, (_, i) => ({
    x: 0.5,
    y: 0.5,
    z: 0,
  }));

  landmarks[0] = { x: 0.5, y: 0.9, z: 0 };
  landmarks[4] = { x: 0.45, y: 0.4, z: 0 };
  landmarks[8] = { x: 0.55, y: 0.4, z: 0 };

  landmarks[12] = { x: 0.5, y: 0.5, z: 0 };
  landmarks[16] = { x: 0.5, y: 0.5, z: 0 };
  landmarks[20] = { x: 0.5, y: 0.5, z: 0 };

  return landmarks;
};

const createCircleWithPinkyLandmarks = (): HandLandmarks => {
  const landmarks: NormalizedLandmark[] = Array.from({ length: 21 }, (_, i) => ({
    x: 0.5,
    y: 0.5,
    z: 0,
  }));

  landmarks[0] = { x: 0.5, y: 0.9, z: 0 };
  landmarks[4] = { x: 0.45, y: 0.4, z: 0 };
  landmarks[8] = { x: 0.55, y: 0.4, z: 0 };

  landmarks[12] = { x: 0.5, y: 0.5, z: 0 };
  landmarks[16] = { x: 0.5, y: 0.5, z: 0 };
  landmarks[20] = { x: 0.3, y: 0.1, z: 0 };
  landmarks[17] = { x: 0.3, y: 0.5, z: 0 };

  return landmarks;
};

const createPointerFingerUpLandmarks = (): HandLandmarks => {
  const landmarks: NormalizedLandmark[] = Array.from({ length: 21 }, (_, i) => ({
    x: 0.5,
    y: 0.5,
    z: 0,
  }));

  // Wrist
  landmarks[0] = { x: 0.5, y: 0.9, z: 0 };

  // Thumb - curled
  landmarks[4] = { x: 0.3, y: 0.7, z: 0 };
  landmarks[3] = { x: 0.35, y: 0.75, z: 0 };
  landmarks[2] = { x: 0.4, y: 0.8, z: 0 };

  // Index finger - extended upward (tip much higher than MCP)
  landmarks[5] = { x: 0.5, y: 0.8, z: 0 }; // MCP (knuckle)
  landmarks[6] = { x: 0.5, y: 0.6, z: 0 }; // PIP
  landmarks[7] = { x: 0.5, y: 0.3, z: 0 }; // DIP
  landmarks[8] = { x: 0.5, y: 0.05, z: 0 }; // TIP (very high)

  // Middle finger - curled (tip below MCP)
  landmarks[9] = { x: 0.6, y: 0.8, z: 0 };  // MCP
  landmarks[10] = { x: 0.6, y: 0.75, z: 0 }; // PIP
  landmarks[11] = { x: 0.6, y: 0.7, z: 0 };  // DIP
  landmarks[12] = { x: 0.6, y: 0.85, z: 0 }; // TIP (below MCP = curled)

  // Ring finger - curled (tip below MCP)
  landmarks[13] = { x: 0.65, y: 0.8, z: 0 };  // MCP
  landmarks[14] = { x: 0.65, y: 0.75, z: 0 }; // PIP
  landmarks[15] = { x: 0.65, y: 0.7, z: 0 };  // DIP
  landmarks[16] = { x: 0.65, y: 0.85, z: 0 }; // TIP (below MCP = curled)

  // Pinky - curled (tip below MCP)
  landmarks[17] = { x: 0.7, y: 0.8, z: 0 };  // MCP
  landmarks[18] = { x: 0.7, y: 0.75, z: 0 }; // PIP
  landmarks[19] = { x: 0.7, y: 0.7, z: 0 };  // DIP
  landmarks[20] = { x: 0.7, y: 0.85, z: 0 }; // TIP (below MCP = curled)

  return landmarks;
};

describe('detectFist', () => {
  it('should detect fist when all fingers are curled', () => {
    const landmarks = createFistLandmarks();

    const result = detectFist(landmarks);

    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it('should not detect fist when hand is open', () => {
    const landmarks = createOpenHandLandmarks();

    const result = detectFist(landmarks);

    expect(result.detected).toBe(false);
  });

  it('should not detect fist when OK symbol is shown', () => {
    const landmarks = createOkSymbolLandmarks();

    const result = detectFist(landmarks);

    expect(result.detected).toBe(false);
  });
});

describe('detectThumbsDown', () => {
  it('should detect thumbs down when thumb points down and other fingers are curled', () => {
    const landmarks = createThumbsDownLandmarks();

    const result = detectThumbsDown(landmarks);

    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should not detect thumbs down when thumb points up', () => {
    const landmarks = createThumbsUpLandmarks();

    const result = detectThumbsDown(landmarks);

    expect(result.detected).toBe(false);
  });

  it('should not detect thumbs down when all fingers are extended', () => {
    const landmarks = createOpenHandLandmarks();

    const result = detectThumbsDown(landmarks);

    expect(result.detected).toBe(false);
  });

  it('should not detect thumbs down when fist is shown', () => {
    const landmarks = createFistLandmarks();

    const result = detectThumbsDown(landmarks);

    expect(result.detected).toBe(false);
  });
});

describe('detectOpenPalm', () => {
  it('should detect open palm when all fingers are extended', () => {
    const landmarks = createOpenHandLandmarks();

    const result = detectOpenPalm(landmarks);

    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should not detect open palm when fist is shown', () => {
    const landmarks = createFistLandmarks();

    const result = detectOpenPalm(landmarks);

    expect(result.detected).toBe(false);
  });

  it('should not detect open palm when thumbs up is shown', () => {
    const landmarks = createThumbsUpLandmarks();

    const result = detectOpenPalm(landmarks);

    expect(result.detected).toBe(false);
  });

  it('should not detect open palm when OK symbol is shown', () => {
    const landmarks = createOkSymbolLandmarks();

    const result = detectOpenPalm(landmarks);

    expect(result.detected).toBe(false);
  });
});

describe('detectPointerFingerUp', () => {
  it('should detect pointer finger up when only index finger is extended', () => {
    const landmarks = createPointerFingerUpLandmarks();

    const result = detectPointerFingerUp(landmarks);

    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should not detect pointer finger up when all fingers are extended', () => {
    const landmarks = createOpenHandLandmarks();

    const result = detectPointerFingerUp(landmarks);

    expect(result.detected).toBe(false);
  });

  it('should not detect pointer finger up when fist is shown', () => {
    const landmarks = createFistLandmarks();

    const result = detectPointerFingerUp(landmarks);

    expect(result.detected).toBe(false);
  });

  it('should not detect pointer finger up when thumbs up is shown', () => {
    const landmarks = createThumbsUpLandmarks();

    const result = detectPointerFingerUp(landmarks);

    expect(result.detected).toBe(false);
  });
});
