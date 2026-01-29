import type { GameState, Player } from '../domain/game.js';
import type { Card } from '../domain/card.js';

const SUIT_SYMBOLS: Record<Card['suit'], string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const createCardElement = (card: Card, faceDown = false): HTMLDivElement => {
  const cardEl = document.createElement('div');
  cardEl.className = 'card';

  if (faceDown) {
    cardEl.classList.add('back');
    cardEl.textContent = '?';
    return cardEl;
  }

  cardEl.classList.add(card.suit);

  const rankEl = document.createElement('div');
  rankEl.className = 'card-rank';
  rankEl.textContent = card.rank;

  const suitEl = document.createElement('div');
  suitEl.className = 'card-suit';
  suitEl.textContent = SUIT_SYMBOLS[card.suit];

  cardEl.appendChild(rankEl);
  cardEl.appendChild(suitEl);

  return cardEl;
};

export const renderCommunityCards = (cards: readonly Card[]): void => {
  const container = document.getElementById('community-cards');
  if (!container) return;

  container.innerHTML = '';

  for (const card of cards) {
    const cardEl = createCardElement(card);
    container.appendChild(cardEl);
  }
};

export const renderPlayerCards = (
  playerIndex: number,
  cards: readonly Card[],
  faceDown = false
): void => {
  const playerEl = document.getElementById(`player-${playerIndex}`);
  if (!playerEl) return;

  const cardsContainer = playerEl.querySelector('.player-cards');
  if (!cardsContainer) return;

  cardsContainer.innerHTML = '';

  for (const card of cards) {
    const cardEl = createCardElement(card, faceDown);
    cardsContainer.appendChild(cardEl);
  }
};

export const updatePlayerDisplay = (
  playerIndex: number,
  player: Player,
  isCurrentPlayer: boolean
): void => {
  const playerEl = document.getElementById(`player-${playerIndex}`);
  if (!playerEl) return;

  const nameEl = playerEl.querySelector('.player-name');
  if (nameEl) {
    nameEl.textContent = player.name;
  }

  const chipsEl = playerEl.querySelector('.player-chips');
  if (chipsEl) {
    chipsEl.textContent = `$${player.chips}`;
  }

  const betEl = playerEl.querySelector('.player-bet');
  if (betEl) {
    if (player.bet > 0) {
      betEl.textContent = `Bet: $${player.bet}`;
    } else {
      betEl.textContent = '';
    }
  }

  // Update active state
  if (isCurrentPlayer) {
    playerEl.classList.add('active');
  } else {
    playerEl.classList.remove('active');
  }

  // Update folded state
  if (player.status === 'folded') {
    playerEl.classList.add('folded');
  } else {
    playerEl.classList.remove('folded');
  }
};

export const updatePotDisplay = (pot: number): void => {
  const potEl = document.getElementById('pot-display');
  if (potEl) {
    potEl.textContent = `Pot: $${pot}`;
  }
};

export const updateGameInfo = (
  phase: string,
  currentPlayerName: string,
  currentBet: number
): void => {
  const phaseEl = document.getElementById('game-phase');
  if (phaseEl) {
    phaseEl.textContent = `Phase: ${phase}`;
  }

  const playerEl = document.getElementById('current-player');
  if (playerEl) {
    playerEl.textContent = `Current: ${currentPlayerName}`;
  }

  const betEl = document.getElementById('current-bet');
  if (betEl) {
    betEl.textContent = `To Call: $${currentBet}`;
  }
};

export const showDealerButton = (playerIndex: number): void => {
  // Hide all dealer buttons first
  for (let i = 0; i < 3; i++) {
    const playerEl = document.getElementById(`player-${i}`);
    const dealerBtn = playerEl?.querySelector('.dealer-button') as HTMLElement;
    if (dealerBtn) {
      dealerBtn.style.display = 'none';
    }
  }

  // Show dealer button for specified player
  const playerEl = document.getElementById(`player-${playerIndex}`);
  const dealerBtn = playerEl?.querySelector('.dealer-button') as HTMLElement;
  if (dealerBtn) {
    dealerBtn.style.display = 'flex';
  }
};

export const renderGameState = (gameState: GameState): void => {
  // Render community cards
  renderCommunityCards(gameState.communityCards);

  // Update pot
  updatePotDisplay(gameState.pot);

  // Update each player
  gameState.players.forEach((player, index) => {
    const isCurrentPlayer = index === gameState.currentPlayerIndex;
    updatePlayerDisplay(index, player, isCurrentPlayer);

    // Render player cards (face down for non-human players)
    if (player.hand.length > 0) {
      const faceDown = !player.isHuman;
      renderPlayerCards(index, player.hand, faceDown);
    }
  });

  // Show dealer button
  showDealerButton(gameState.dealerIndex);

  // Update game info
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  updateGameInfo(
    gameState.phase,
    currentPlayer?.name || '-',
    gameState.currentBet
  );
};
