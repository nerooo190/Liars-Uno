export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'skip' | 'reverse' | '+2' | 'wild' | '+4';

export interface UnoCard {
  id: string;
  color: CardColor;
  value: CardValue;
}

export interface Claim {
  color: CardColor;
  value: CardValue;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  hand: UnoCard[];
  isAI: boolean;
  difficulty?: Difficulty;
}

export type GamePhase = 'MENU' | 'LOBBY' | 'PLAYING' | 'CHALLENGE_WINDOW' | 'CHALLENGE_REVEAL' | 'GAME_OVER';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type Variants = {
  jumpIn: boolean;
  stacking: boolean;
  sevenO: boolean;
  houseRules: boolean;
};

export interface GameState {
  players: Player[];
  variants?: Variants;
  drawPile: UnoCard[];
  discardPile: UnoCard[];
  currentTurnIdx: number;
  direction: 1 | -1;
  phase: GamePhase;
  
  // Challenge State
  pendingPlay: {
    playerIdx: number;
    actualCard: UnoCard;
    claimedCard: UnoCard;  // Represents the "Claim"
  } | null;
  
  challengeTimer: number; // e.g., 3000ms down to 0
  
  challengerIdx: number | null; // Who pressed Liar!
  challengeResult: 'TRUTH' | 'LIE' | null;
  
  winnerIdx: number | null;
}
