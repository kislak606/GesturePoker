import type { ShowdownResult } from '../domain/showdown.js';
import type { Card } from '../domain/card.js';
import { getHandRankingDisplayName } from '../domain/showdown.js';

const SUIT_SYMBOLS: Record<Card['suit'], string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const createCardElement = (card: Card): HTMLDivElement => {
  const cardEl = document.createElement('div');
  cardEl.className = 'card';
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

export const showShowdownModal = (
  showdownResult: ShowdownResult,
  onContinue: () => void
): void => {
  const modal = document.getElementById('showdown-modal');
  const winnersContainer = document.getElementById('showdown-winners');
  const allHandsContainer = document.getElementById('showdown-all-hands');
  const continueBtn = document.getElementById('showdown-continue');

  if (!modal || !winnersContainer || !allHandsContainer || !continueBtn) {
    console.error('Showdown modal elements not found');
    return;
  }

  winnersContainer.innerHTML = '';
  allHandsContainer.innerHTML = '';

  const winnerSection = document.createElement('div');
  winnerSection.className = 'showdown-winner-section';

  const winnerTitle = document.createElement('div');
  winnerTitle.className = 'showdown-winner-title';
  winnerTitle.textContent =
    showdownResult.winners.length > 1 ? 'Winners (Split Pot)' : 'Winner';
  winnerSection.appendChild(winnerTitle);

  for (const winner of showdownResult.winners) {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'showdown-player';

    const playerInfo = document.createElement('div');
    playerInfo.className = 'showdown-player-info';

    const playerName = document.createElement('div');
    playerName.className = 'showdown-player-name';
    playerName.textContent = winner.player.name;
    playerInfo.appendChild(playerName);

    const handRanking = document.createElement('div');
    handRanking.className = 'showdown-hand-ranking';
    handRanking.textContent = getHandRankingDisplayName(winner.evaluation);
    playerInfo.appendChild(handRanking);

    playerDiv.appendChild(playerInfo);

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'showdown-player-cards';
    for (const card of winner.bestHand) {
      cardsContainer.appendChild(createCardElement(card));
    }
    playerDiv.appendChild(cardsContainer);

    winnerSection.appendChild(playerDiv);
  }

  const amountDiv = document.createElement('div');
  amountDiv.className = 'showdown-amount';
  amountDiv.textContent = `+$${showdownResult.potPerWinner} per winner`;
  winnerSection.appendChild(amountDiv);

  winnersContainer.appendChild(winnerSection);

  const sectionTitle = document.createElement('div');
  sectionTitle.className = 'showdown-section-title';
  sectionTitle.textContent = 'All Hands';
  allHandsContainer.appendChild(sectionTitle);

  for (const result of showdownResult.allPlayerResults) {
    const isWinner = showdownResult.winners.some(
      (w) => w.playerIndex === result.playerIndex
    );

    if (isWinner) continue;

    const playerDiv = document.createElement('div');
    playerDiv.className = 'showdown-player';

    const playerInfo = document.createElement('div');
    playerInfo.className = 'showdown-player-info';

    const playerName = document.createElement('div');
    playerName.className = 'showdown-player-name';
    playerName.textContent = result.player.name;
    playerInfo.appendChild(playerName);

    const handRanking = document.createElement('div');
    handRanking.className = 'showdown-hand-ranking';
    handRanking.textContent = getHandRankingDisplayName(result.evaluation);
    playerInfo.appendChild(handRanking);

    playerDiv.appendChild(playerInfo);

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'showdown-player-cards';
    for (const card of result.bestHand) {
      cardsContainer.appendChild(createCardElement(card));
    }
    playerDiv.appendChild(cardsContainer);

    allHandsContainer.appendChild(playerDiv);
  }

  continueBtn.onclick = () => {
    hideShowdownModal();
    onContinue();
  };

  modal.classList.add('visible');
};

export const hideShowdownModal = (): void => {
  const modal = document.getElementById('showdown-modal');
  if (modal) {
    modal.classList.remove('visible');
  }
};
