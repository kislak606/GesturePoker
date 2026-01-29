import { HandTrackingService } from './services/hand-tracking.service.js';
import type { HandDetectionResult } from './types/hand-tracking.types.js';
import {
  detectThumbsUp,
  detectThumbsDown,
  detectOkSymbol,
  detectCircleGesture,
  detectCircleWithPinky,
  detectOpenPalm,
  detectPointerFingerUp,
} from './gestures/static-gesture-detector.js';
import { TemporalGestureDetector } from './gestures/temporal-gesture-detector.js';
import { createGame } from './domain/game.js';
import { renderGameState } from './ui/poker-table-ui.js';
import { startNewHand, processPlayerAction } from './domain/game-actions.js';
import { decideAIAction } from './domain/ai-decision.js';
import type { PlayerAction } from './domain/game.js';
import {
  initializeGestureControlsPanel,
  updateGestureControlsPanel,
} from './ui/gesture-controls-panel.js';
import { evaluateShowdown, distributePot } from './domain/showdown.js';
import { showShowdownModal } from './ui/showdown-ui.js';
import {
  showCardZoom,
  hideCardZoom,
  isCardZoomVisible,
} from './ui/card-zoom-ui.js';

console.log('Poker Gesture Detection - Renderer Loaded');

const handTrackingService = new HandTrackingService();
const temporalGestureDetector = new TemporalGestureDetector();

// Initialize game state
let gameState = createGame();
console.log('Game initialized:', gameState);

// Track gesture confirmation for human player actions
let lastGestureType: string | null = null;
let gestureConfirmationFrames = 0;
const GESTURE_CONFIRMATION_THRESHOLD = 15; // ~0.5 seconds at 30fps

// Start the first hand
const startGame = (): void => {
  gameState = startNewHand(gameState);
  console.log('Hand started:', gameState);
  renderGameState(gameState);
  updateGestureControlsPanel(gameState, 0);

  // Process AI actions until it's the human player's turn
  processAITurns();
};

const processAITurns = (): void => {
  // Process AI turns until it's a human player's turn or game phase changes
  while (
    gameState.phase !== 'waiting' &&
    gameState.phase !== 'showdown' &&
    !gameState.players[gameState.currentPlayerIndex].isHuman &&
    gameState.players[gameState.currentPlayerIndex].status === 'active'
  ) {
    const aiAction = decideAIAction(gameState, gameState.currentPlayerIndex);
    console.log(`AI Player ${gameState.currentPlayerIndex} action:`, aiAction);
    gameState = processPlayerAction(gameState, aiAction);
    renderGameState(gameState);
    updateGestureControlsPanel(gameState, 0);
  }

  if (gameState.phase === 'showdown') {
    handleShowdown();
  }
};

const handleShowdown = (): void => {
  console.log('Showdown reached');
  const showdownResult = evaluateShowdown(gameState);

  showShowdownModal(showdownResult, () => {
    gameState = distributePot(gameState, showdownResult);

    const nextDealerIndex = (gameState.dealerIndex + 1) % gameState.players.length;
    gameState = {
      ...gameState,
      dealerIndex: nextDealerIndex,
      phase: 'waiting',
    };

    startGame();
  });
};

const processHumanGesture = (action: PlayerAction): void => {
  if (gameState.phase === 'waiting') {
    console.log('Game not started yet');
    return;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  if (!currentPlayer.isHuman) {
    console.log('Not human player turn');
    return;
  }

  console.log('Processing human gesture:', action);
  gameState = processPlayerAction(gameState, action);
  renderGameState(gameState);
  updateGestureControlsPanel(gameState, 0);

  if (gameState.phase === 'showdown') {
    handleShowdown();
    return;
  }

  // Process AI turns after human action
  setTimeout(() => processAITurns(), 500);
};

const onHandsDetected = (result: HandDetectionResult): void => {
  console.log('Hand detection callback fired', result);

  const gestureIndicator = document.getElementById('gesture-indicator');
  if (!gestureIndicator) {
    console.error('Gesture indicator element not found');
    return;
  }

  const handCount = result.multiHandLandmarks.length;
  console.log('Detected hands:', handCount);

  if (handCount === 0) {
    gestureIndicator.textContent = 'No hands detected';
    gestureIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';

    // Reset temporal detector when no hands detected
    temporalGestureDetector.reset();

    const gameStatusEl = document.getElementById('game-state');
    if (gameStatusEl) {
      gameStatusEl.innerHTML = `
        <h3>Camera Status</h3>
        <p>✅ Camera Active</p>
        <p>👋 Hands Detected: 0</p>
        <p>💡 Show your hand to the camera</p>
      `;
    }
    return;
  }

  const landmarks = result.multiHandLandmarks[0];
  console.log('Processing landmarks for hand 0, total landmarks:', landmarks.length);

  // Detect static gestures
  const thumbsUp = detectThumbsUp(landmarks);
  const thumbsDown = detectThumbsDown(landmarks);
  const openPalm = detectOpenPalm(landmarks);
  const pointerFingerUp = detectPointerFingerUp(landmarks);
  const okSymbol = detectOkSymbol(landmarks);
  const circle = detectCircleGesture(landmarks);
  const circleWithPinky = detectCircleWithPinky(landmarks);

  // Detect bet drag when OK symbol is held
  let betDrag = { detected: false, confidence: 0, dragDistance: 0, isAllIn: false, isConfirmed: false };

  if (okSymbol.detected) {
    const dragResult = temporalGestureDetector.detectBetDrag(landmarks);
    betDrag = {
      detected: dragResult.detected,
      confidence: dragResult.confidence,
      dragDistance: dragResult.dragDistance ?? 0,
      isAllIn: dragResult.isAllIn ?? false,
      isConfirmed: dragResult.isConfirmed ?? false,
    };
  } else {
    // Reset drag tracking when OK symbol is not detected
    temporalGestureDetector.resetBetDrag();
  }

  console.log('Gesture results:', {
    thumbsUp,
    thumbsDown,
    openPalm,
    pointerFingerUp,
    okSymbol,
    circle,
    circleWithPinky,
    betDrag,
  });

  let detectedGesture = 'No gesture recognized';
  let confidence = 0;
  let currentGestureType: string | null = null;

  // Static gestures - determine which gesture is detected
  // Open palm is now the safe/neutral hand (no action)
  if (openPalm.detected && openPalm.confidence > confidence) {
    detectedGesture = '✋ SAFE HAND (Neutral)';
    confidence = openPalm.confidence;
    currentGestureType = null; // No action - safe state
  }

  if (thumbsDown.detected && thumbsDown.confidence > confidence) {
    detectedGesture = '👎 FOLD';
    confidence = thumbsDown.confidence;
    currentGestureType = 'fold';
  }

  if (thumbsUp.detected && thumbsUp.confidence > confidence) {
    detectedGesture = '👍 CALL';
    confidence = thumbsUp.confidence;
    currentGestureType = 'call';
  }

  // Pointer finger up is now CHECK
  if (pointerFingerUp.detected && pointerFingerUp.confidence > confidence) {
    detectedGesture = '☝ CHECK';
    confidence = pointerFingerUp.confidence;
    currentGestureType = 'check';
  }

  // Track gesture confirmation
  if (currentGestureType === lastGestureType && confidence > 0.7) {
    gestureConfirmationFrames++;

    if (gestureConfirmationFrames >= GESTURE_CONFIRMATION_THRESHOLD) {
      // Gesture confirmed! Execute action
      const activePlayer = gameState.players[gameState.currentPlayerIndex];
      if (
        activePlayer.isHuman &&
        gameState.phase !== 'waiting' &&
        gameState.phase !== 'showdown'
      ) {
        console.log(`Gesture confirmed: ${currentGestureType}`);

        // Convert gesture to action
        let action: PlayerAction | null = null;
        if (currentGestureType === 'fold') {
          action = { type: 'fold' };
        } else if (currentGestureType === 'check') {
          // Only allow check if no bet to call
          if (activePlayer.bet >= gameState.currentBet) {
            action = { type: 'check' };
          }
        } else if (currentGestureType === 'call') {
          action = { type: 'call' };
        }

        if (action) {
          processHumanGesture(action);
          // Reset confirmation after executing action
          gestureConfirmationFrames = 0;
          lastGestureType = null;
        }
      }
    }
  } else {
    // Different gesture or low confidence - reset
    lastGestureType = currentGestureType;
    gestureConfirmationFrames = 0;
  }

  if (betDrag.isConfirmed) {
    // Held still for 5 seconds - raise confirmed!
    const activePlayer = gameState.players[gameState.currentPlayerIndex];
    if (
      activePlayer.isHuman &&
      gameState.phase !== 'waiting' &&
      gameState.phase !== 'showdown'
    ) {
      console.log('Raise gesture confirmed!');

      let action: PlayerAction | null = null;
      if (betDrag.isAllIn) {
        action = { type: 'all-in' };
        detectedGesture = `✅ ALL-IN CONFIRMED!`;
        confidence = 1.0;
      } else {
        const PIXELS_PER_INCREMENT = 10;
        const ASSUMED_WIDTH = 1280;
        const pixelDistance = betDrag.dragDistance * ASSUMED_WIDTH;
        const betIncrements = Math.floor(pixelDistance / PIXELS_PER_INCREMENT);
        const raiseIncrement = Math.max(0, betIncrements * 10); // Each increment = $10, minimum 0

        // Total raise amount = current bet + raise increment (must be > current table bet)
        const totalRaiseAmount = gameState.currentBet + raiseIncrement;

        action = { type: 'raise', amount: totalRaiseAmount };
        detectedGesture = `✅ RAISE CONFIRMED: $${raiseIncrement}`;
        confidence = 1.0;
      }

      if (action) {
        processHumanGesture(action);
        // Reset bet drag after executing action
        temporalGestureDetector.resetBetDrag();
      }
    }
  } else if (okSymbol.detected && okSymbol.confidence > confidence) {
    // Calculate bet amount based on drag distance (bidirectional)
    const PIXELS_PER_INCREMENT = 10;
    const ASSUMED_WIDTH = 1280;
    const pixelDistance = betDrag.dragDistance * ASSUMED_WIDTH;
    const betIncrements = Math.floor(pixelDistance / PIXELS_PER_INCREMENT);
    const betAmount = Math.max(0, betIncrements * 10); // Each increment = $10, minimum 0

    if (betDrag.isAllIn) {
      detectedGesture = `👌 ALL-IN ⬆️ - Hold still 5s to confirm`;
      confidence = okSymbol.confidence;
    } else if (betDrag.detected) {
      const direction = betDrag.dragDistance > 0 ? '(move ← to decrease, → to increase)' : '(move → to increase, ← to decrease)';
      detectedGesture = `👌 RAISE: $${betAmount} ${direction} - Hold still 5s to confirm`;
      confidence = okSymbol.confidence;
    } else {
      detectedGesture = '👌 RAISE (drag ← → to set amount or ⬆️ all-in, hold still 5s to confirm)';
      confidence = okSymbol.confidence;
    }
  }

  // Circle gesture for zooming table cards - only check priority first
  if (circle.detected && circle.confidence > confidence) {
    detectedGesture = '⭕ ZOOM TABLE CARDS';
    confidence = circle.confidence;
  }

  // Shaka gesture (thumb + pinky) for zooming table cards
  if (circleWithPinky.detected && circleWithPinky.confidence > confidence) {
    detectedGesture = '🤙 ZOOM TABLE CARDS';
    confidence = circleWithPinky.confidence;
  }

  // Only activate zoom if circle/circleWithPinky won the priority check (is in detectedGesture)
  const isZoomGesture = detectedGesture.includes('ZOOM TABLE CARDS');

  if (isZoomGesture) {
    if (!isCardZoomVisible()) {
      const cardsToShow = gameState.communityCards.length > 0
        ? gameState.communityCards
        : gameState.players[0].hand;
      showCardZoom(cardsToShow);
    }
  } else {
    if (isCardZoomVisible()) {
      hideCardZoom();
    }
  }

  console.log('Final gesture:', detectedGesture, 'confidence:', confidence);

  gestureIndicator.textContent = `${detectedGesture} (${Math.round(confidence * 100)}%)`;
  gestureIndicator.style.backgroundColor = confidence > 0.7 ? 'rgba(0, 255, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)';

  const gameStatusEl = document.getElementById('game-state');
  if (gameStatusEl) {
    const PIXELS_PER_INCREMENT = 10;
    const ASSUMED_WIDTH = 1280;
    const pixelDistance = betDrag.dragDistance * ASSUMED_WIDTH;
    const betIncrements = Math.floor(pixelDistance / PIXELS_PER_INCREMENT);
    const betAmount = betIncrements * 10;

    gameStatusEl.innerHTML = `
      <h3>Camera Status</h3>
      <p>✅ Camera Active</p>
      <p>👋 Hands Detected: ${handCount}</p>
      <p>📊 Landmarks: ${landmarks.length}</p>
      ${betDrag.detected ? `<p>💰 Bet Drag: ${pixelDistance.toFixed(0)}px → $${betAmount}</p>` : ''}
      ${betDrag.detected ? `<p>📏 Drag Distance: ${(betDrag.dragDistance * 100).toFixed(1)}%</p>` : ''}
    `;
  }

  drawLandmarks(landmarks);
};

const drawLandmarks = (landmarks: any): void => {
  const canvas = document.getElementById('canvas-overlay') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < landmarks.length; i++) {
    const landmark = landmarks[i];
    const x = landmark.x * canvas.width;
    const y = landmark.y * canvas.height;

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = i === 0 ? 'red' : i === 4 ? 'yellow' : i === 8 ? 'green' : 'blue';
    ctx.fill();
  }
};

const initializeApp = async (): Promise<void> => {
  const loadingElement = document.getElementById('loading');
  const videoElement = document.getElementById('camera-feed') as HTMLVideoElement;

  console.log('Initializing app...');

  if (!videoElement) {
    console.error('Video element not found');
    if (loadingElement) {
      loadingElement.textContent = 'Error: Video element not found';
    }
    return;
  }

  try {
    if (loadingElement) {
      loadingElement.textContent = 'Requesting camera access...';
    }

    console.log('Requesting camera permissions...');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log('Camera access granted');

    stream.getTracks().forEach(track => track.stop());

    if (loadingElement) {
      loadingElement.textContent = 'Initializing MediaPipe...';
    }

    console.log('Initializing hand tracking service...');
    await handTrackingService.initialize(videoElement, onHandsDetected);
    console.log('Hand tracking initialized successfully');

    // Initialize gesture controls panel
    initializeGestureControlsPanel();
    console.log('Gesture controls panel initialized');

    // Render initial game state
    renderGameState(gameState);
    console.log('Initial game state rendered');

    // Start the game
    startGame();
    console.log('Game started');

    if (loadingElement) {
      loadingElement.textContent = 'Application Ready';
      setTimeout(() => {
        loadingElement.style.display = 'none';
      }, 1000);
    }
  } catch (error) {
    console.error('Failed to initialize:', error);
    if (loadingElement) {
      if (error instanceof Error) {
        loadingElement.textContent = `Error: ${error.message}`;
      } else {
        loadingElement.textContent = 'Failed to initialize. Check console for details.';
      }
    }
  }
};

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - starting initialization');
  initializeApp().catch((error) => {
    console.error('Initialization failed with error:', error);
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.textContent = `Fatal Error: ${error.message || String(error)}`;
    }
  });
});
