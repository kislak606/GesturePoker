const ANIMATION_DURATION = 500; // ms
const CHIP_COUNT = 8; // Number of chip elements to animate per winner

type Position = {
  readonly x: number;
  readonly y: number;
};

const getElementPosition = (element: HTMLElement): Position => {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
};

const createChipElement = (startPos: Position): HTMLDivElement => {
  const chip = document.createElement('div');
  chip.className = 'pot-chip-animation';
  chip.style.position = 'fixed';
  chip.style.left = `${startPos.x}px`;
  chip.style.top = `${startPos.y}px`;
  chip.style.width = '30px';
  chip.style.height = '30px';
  chip.style.borderRadius = '50%';
  chip.style.backgroundColor = '#FFD700';
  chip.style.border = '3px solid #FFA500';
  chip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
  chip.style.zIndex = '2500';
  chip.style.transition = `all ${ANIMATION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
  chip.style.pointerEvents = 'none';

  return chip;
};

const animateChipToPosition = (chip: HTMLDivElement, endPos: Position): void => {
  // Use requestAnimationFrame to ensure the initial position is rendered before animating
  requestAnimationFrame(() => {
    chip.style.left = `${endPos.x}px`;
    chip.style.top = `${endPos.y}px`;
    chip.style.opacity = '0';
    chip.style.transform = 'scale(0.5)';
  });
};

export const animatePotDistribution = (
  winnerIndices: readonly number[],
  _potAmount: number,
  onComplete: () => void
): void => {
  const potArea = document.getElementById('pot-area');
  if (!potArea) {
    console.error('Pot area not found');
    onComplete();
    return;
  }

  const potPosition = getElementPosition(potArea);
  const chipElements: HTMLDivElement[] = [];

  for (const winnerIndex of winnerIndices) {
    const playerSeat = document.querySelector(
      `.player-seat[data-player-index="${winnerIndex}"]`
    ) as HTMLElement | null;

    if (!playerSeat) {
      console.warn(`Player seat not found for index ${winnerIndex}`);
      continue;
    }

    const playerPosition = getElementPosition(playerSeat);

    // Create multiple chip elements for visual effect
    for (let i = 0; i < CHIP_COUNT; i++) {
      const chip = createChipElement(potPosition);
      document.body.appendChild(chip);
      chipElements.push(chip);

      // Add slight delay and random offset for each chip
      const delay = i * 50;
      const randomOffset = {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20,
      };

      setTimeout(() => {
        animateChipToPosition(chip, {
          x: playerPosition.x + randomOffset.x,
          y: playerPosition.y + randomOffset.y,
        });
      }, delay);
    }
  }

  // Clean up and call onComplete after all animations finish
  setTimeout(() => {
    for (const chip of chipElements) {
      chip.remove();
    }
    onComplete();
  }, ANIMATION_DURATION + CHIP_COUNT * 50 + 100);
};
