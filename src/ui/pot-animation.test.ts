import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { animatePotDistribution } from './pot-animation.js';

describe('Pot distribution animation', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="poker-table">
        <div id="pot-area" style="position: absolute; left: 640px; top: 360px;">
          <div id="pot-amount">$100</div>
        </div>
        <div class="player-seat" data-player-index="0" style="position: absolute; left: 100px; top: 100px;">
          <div class="player-chips">$500</div>
        </div>
        <div class="player-seat" data-player-index="1" style="position: absolute; left: 1100px; top: 100px;">
          <div class="player-chips">$500</div>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should create chip elements for each winner', () => {
    const winnerIndices = [0];
    const potAmount = 100;

    animatePotDistribution(winnerIndices, potAmount, () => {});

    const chipElements = document.querySelectorAll('.pot-chip-animation');
    expect(chipElements.length).toBeGreaterThan(0);
  });

  it('should call onComplete callback after animation', async () => {
    const winnerIndices = [0];
    const potAmount = 100;
    let callbackCalled = false;

    animatePotDistribution(winnerIndices, potAmount, () => {
      callbackCalled = true;
    });

    // Wait for animation to complete (500ms duration)
    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(callbackCalled).toBe(true);
  });

  it('should handle multiple winners (split pot)', () => {
    const winnerIndices = [0, 1];
    const potAmount = 100;

    animatePotDistribution(winnerIndices, potAmount, () => {});

    const chipElements = document.querySelectorAll('.pot-chip-animation');
    // Should have chips for both winners
    expect(chipElements.length).toBeGreaterThan(0);
  });

  it('should remove chip elements after animation completes', async () => {
    const winnerIndices = [0];
    const potAmount = 100;

    animatePotDistribution(winnerIndices, potAmount, () => {});

    // Chips should exist during animation
    let chipElements = document.querySelectorAll('.pot-chip-animation');
    expect(chipElements.length).toBeGreaterThan(0);

    // Wait for animation and cleanup
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Chips should be removed after animation
    chipElements = document.querySelectorAll('.pot-chip-animation');
    expect(chipElements.length).toBe(0);
  });
});
