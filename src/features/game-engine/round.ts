import { createRng, nextSeed } from '@lib/rng';

import { SEAT_COLORS } from './constants';
import { createDeck, deal, dealerForFirstRound, leftOf, shuffle } from './deck';
import { PHASES } from './phases';
import { handPoints } from './scoring';
import { currentPlayer, fail, nextActive } from './turnState';
import type { GameState, PhaseNumber, Player, PlayerCount, Result } from './types';

function isPlayerCount(count: number): count is PlayerCount {
  return Number.isInteger(count) && count >= 2 && count <= 6;
}

function nextPhase(phase: PhaseNumber): PhaseNumber {
  return PHASES.find((requirement) => requirement.phase === phase + 1)?.phase ?? phase;
}

export function startGame(names: readonly string[], seed: number): Result<GameState> {
  const count = names.length;
  if (!isPlayerCount(count)) {
    return fail('Choose 2 to 6 players.');
  }
  const trimmed = names.map((name) => name.trim());
  if (trimmed.some((name) => name === '')) {
    return fail('Every player needs a name.');
  }
  const players = trimmed.map((name, i): Player => ({
    id: `p${i + 1}`,
    name,
    color: SEAT_COLORS[i],
    phase: 1,
    score: 0,
    hand: [],
    laidGroups: [],
    hasLaidDown: false,
    isSkipped: false,
    wasSkippedThisRound: false,
    isSittingOut: false,
  }));
  return {
    ok: true,
    value: startRound({
      players,
      drawPile: [],
      discardPile: [],
      dealerIndex: dealerForFirstRound(count),
      currentPlayerIndex: 0,
      round: 1,
      turnStep: 'draw',
      view: 'handoff',
      lastAction: null,
      rngSeed: seed,
      winnerId: null,
    }),
  };
}

export function startNextRound(state: GameState): Result<GameState> {
  if (state.view !== 'roundSummary') {
    return fail('The round is still being played.');
  }
  const dealerIndex = leftOf(state.dealerIndex, state.players.length);
  return { ok: true, value: startRound({ ...state, dealerIndex, round: state.round + 1 }) };
}

// Deals only to players who aren't sitting out, starting left of the dealer.
function startRound(state: GameState): GameState {
  const rng = createRng(state.rngSeed);
  const active = state.players.filter((player) => !player.isSittingOut);
  const first = nextActive(state.players, state.dealerIndex);
  const firstSeat = active.findIndex((p) => p.id === state.players[first].id);
  const dealt = deal(
    shuffle(createDeck(), rng),
    active.length,
    (firstSeat + active.length - 1) % active.length
  );
  const startsWithSkip = dealt.discardPile.at(-1)?.kind === 'skip';
  const players = state.players.map((player, i) => {
    const seat = active.findIndex((p) => p.id === player.id);
    return {
      ...player,
      hand: seat === -1 ? [] : dealt.hands[seat],
      laidGroups: [],
      hasLaidDown: false,
      isSkipped: false,
      wasSkippedThisRound: startsWithSkip && i === first,
    };
  });
  return {
    ...state,
    players,
    drawPile: dealt.drawPile,
    discardPile: dealt.discardPile,
    currentPlayerIndex: startsWithSkip ? nextActive(players, first) : first,
    turnStep: 'draw',
    view: 'handoff',
    lastAction: startsWithSkip
      ? `The first card is a Skip · ${players[first].name}'s turn was skipped`
      : null,
    rngSeed: nextSeed(rng),
    winnerId: null,
  };
}

export function endRound(state: GameState): GameState {
  const wentOut = currentPlayer(state);
  const isTiebreak = state.players.some((player) => player.isSittingOut);
  const finisherIds = state.players
    .filter((player) => player.phase === 10 && player.hasLaidDown)
    .map((player) => player.id);
  const players = state.players.map((player) => ({
    ...player,
    score: player.score + handPoints(player.hand),
    phase: player.hasLaidDown ? nextPhase(player.phase) : player.phase,
  }));
  const ended = {
    ...state,
    players,
    turnStep: 'done' as const,
    lastAction: `${wentOut.name} went out`,
  };
  if (isTiebreak) {
    return { ...ended, view: 'gameOver', winnerId: wentOut.id };
  }
  const finishers = players.filter((player) => finisherIds.includes(player.id));
  if (finishers.length === 0) {
    return { ...ended, view: 'roundSummary' };
  }
  const best = Math.min(...finishers.map((player) => player.score));
  const tiedIds = finishers.filter((player) => player.score === best).map((player) => player.id);
  if (tiedIds.length === 1) {
    return { ...ended, view: 'gameOver', winnerId: tiedIds[0] };
  }
  return {
    ...ended,
    view: 'roundSummary',
    players: players.map((player) => ({ ...player, isSittingOut: !tiedIds.includes(player.id) })),
  };
}
