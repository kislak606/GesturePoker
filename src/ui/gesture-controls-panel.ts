import type { GameState } from '../domain/game.js';

type GestureAvailability = {
  readonly call: boolean;
  readonly fold: boolean;
  readonly check: boolean;
  readonly raise: boolean;
};

export const getAvailableGestures = (
  gameState: GameState,
  humanPlayerIndex: number
): GestureAvailability => {
  const isHumanTurn = gameState.currentPlayerIndex === humanPlayerIndex;

  if (!isHumanTurn) {
    return {
      call: false,
      fold: false,
      check: false,
      raise: false,
    };
  }

  const humanPlayer = gameState.players[humanPlayerIndex];
  const hasChips = humanPlayer.chips > 0;
  const amountToCall = gameState.currentBet - humanPlayer.bet;
  const canAffordCall = humanPlayer.chips >= amountToCall;

  return {
    call: amountToCall > 0 && canAffordCall,
    fold: true,
    check: amountToCall === 0,
    raise: hasChips && (amountToCall === 0 || canAffordCall),
  };
};

export const initializeGestureControlsPanel = (): void => {
  const toggleBtn = document.getElementById('gesture-controls-toggle');
  const panel = document.getElementById('gesture-controls-panel');
  const closeBtn = document.getElementById('close-panel');

  if (!toggleBtn || !panel || !closeBtn) {
    console.error('Gesture controls panel elements not found');
    return;
  }

  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('visible');
    toggleBtn.textContent = panel.classList.contains('visible')
      ? 'Hide Controls'
      : 'Show Controls';
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('visible');
    if (toggleBtn) {
      toggleBtn.textContent = 'Show Controls';
    }
  });
};

export const updateGestureControlsPanel = (
  gameState: GameState,
  humanPlayerIndex: number
): void => {
  const availability = getAvailableGestures(gameState, humanPlayerIndex);

  const thumbsUp = document.querySelector(
    '[data-gesture="thumbs-up"]'
  ) as HTMLElement;
  const thumbsDown = document.querySelector(
    '[data-gesture="thumbs-down"]'
  ) as HTMLElement;
  const openPalm = document.querySelector(
    '[data-gesture="open-palm"]'
  ) as HTMLElement;
  const okSymbol = document.querySelector(
    '[data-gesture="ok-symbol"]'
  ) as HTMLElement;

  if (thumbsUp) {
    if (availability.call) {
      thumbsUp.classList.add('available');
      thumbsUp.classList.remove('unavailable');
    } else {
      thumbsUp.classList.remove('available');
      thumbsUp.classList.add('unavailable');
    }
  }

  if (thumbsDown) {
    if (availability.fold) {
      thumbsDown.classList.add('available');
      thumbsDown.classList.remove('unavailable');
    } else {
      thumbsDown.classList.remove('available');
      thumbsDown.classList.add('unavailable');
    }
  }

  if (openPalm) {
    if (availability.check) {
      openPalm.classList.add('available');
      openPalm.classList.remove('unavailable');
    } else {
      openPalm.classList.remove('available');
      openPalm.classList.add('unavailable');
    }
  }

  if (okSymbol) {
    if (availability.raise) {
      okSymbol.classList.add('available');
      okSymbol.classList.remove('unavailable');
    } else {
      okSymbol.classList.remove('available');
      okSymbol.classList.add('unavailable');
    }
  }
};
