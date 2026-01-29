import type { Card } from '../domain/card.js';

const SUIT_SYMBOLS: Record<Card['suit'], string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const createZoomedCardElement = (card: Card): HTMLDivElement => {
  const cardEl = document.createElement('div');
  cardEl.className = 'zoomed-card';
  cardEl.classList.add(card.suit);

  const rankEl = document.createElement('div');
  rankEl.className = 'zoomed-card-rank';
  rankEl.textContent = card.rank;

  const suitEl = document.createElement('div');
  suitEl.className = 'zoomed-card-suit';
  suitEl.textContent = SUIT_SYMBOLS[card.suit];

  cardEl.appendChild(rankEl);
  cardEl.appendChild(suitEl);

  return cardEl;
};

export const showCardZoom = (cards: readonly Card[]): void => {
  const overlay = document.getElementById('card-zoom-overlay');
  const container = document.getElementById('card-zoom-container');

  if (!overlay || !container) {
    console.error('Card zoom elements not found');
    return;
  }

  container.innerHTML = '';

  for (const card of cards) {
    const cardEl = createZoomedCardElement(card);
    container.appendChild(cardEl);
  }

  overlay.classList.add('visible');
};

export const hideCardZoom = (): void => {
  const overlay = document.getElementById('card-zoom-overlay');
  if (overlay) {
    overlay.classList.remove('visible');
  }
};

export const isCardZoomVisible = (): boolean => {
  const overlay = document.getElementById('card-zoom-overlay');
  return overlay?.classList.contains('visible') ?? false;
};
