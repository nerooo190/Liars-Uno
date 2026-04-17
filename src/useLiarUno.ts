import { useState, useEffect, useRef } from 'react';
import { UnoCard, CardColor, CardValue, Player, GamePhase, Claim } from './types';

const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];
const VALUES: CardValue[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', '+2'];

function createDeck(): UnoCard[] {
  let deck: UnoCard[] = [];
  let idCounter = 0;
  
  // Basic colors
  COLORS.forEach(color => {
    // One 0
    deck.push({ id: `c_${idCounter++}`, color, value: '0' });
    // Two of 1-9, skip, reverse, +2
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', '+2'].forEach(value => {
      deck.push({ id: `c_${idCounter++}`, color, value: value as CardValue });
      deck.push({ id: `c_${idCounter++}`, color, value: value as CardValue });
    });
  });
  
  // Wilds
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c_${idCounter++}`, color: 'wild', value: 'wild' });
    deck.push({ id: `c_${idCounter++}`, color: 'wild', value: '+4' });
  }
  
  return deck.sort(() => Math.random() - 0.5);
}

const AI_NAMES = ['Alex', 'Maya', 'Sam'];
const AI_AVATARS = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', // Alex
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', // Maya
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'  // Sam
];

type GameStateObj = {
  players: Player[];
  deck: UnoCard[];
  discard: UnoCard[];
  currentTurn: number;
  direction: 1 | -1;
  phase: GamePhase;
  pendingPlay: {playerIdx: number, actualCard: UnoCard, claimedCard: UnoCard} | null;
  challengeTimer: number;
  challengeState: {challengerIdx: number, isLie: boolean} | null;
  variants: Variants;
};

export function useLiarUno() {
  const [state, setState] = useState<GameStateObj>({
    players: [],
    deck: [],
    discard: [],
    currentTurn: 0,
    direction: 1,
    phase: 'MENU',
    pendingPlay: null,
    challengeTimer: 0,
    challengeState: null,
    variants: { jumpIn: false, stacking: false, sevenO: false, houseRules: false },
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const goToLobby = () => {
    setState(prev => ({...prev, phase: 'LOBBY'}));
  };

  const startGame = (difficulties: Difficulty[], variants: Variants) => {
    let fullDeck = createDeck();
    let initPlayers: Player[] = [
      { id: 'p1', name: 'You', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', hand: [], isAI: false },
      { id: 'p2', name: 'Alex', avatar: AI_AVATARS[0], hand: [], isAI: true, difficulty: difficulties[0] },
      { id: 'p3', name: 'Maya', avatar: AI_AVATARS[1], hand: [], isAI: true, difficulty: difficulties[1] },
      { id: 'p4', name: 'Sam', avatar: AI_AVATARS[2], hand: [], isAI: true, difficulty: difficulties[2] },
    ];
    
    // Deal 7 cards each
    initPlayers.forEach(p => {
      p.hand = fullDeck.splice(0, 7);
    });
    
    let firstCard = fullDeck.find(c => c.color !== 'wild');
    if (!firstCard) firstCard = fullDeck[0];
    fullDeck = fullDeck.filter(c => c.id !== firstCard!.id);
    
    setState({
      players: initPlayers,
      deck: fullDeck,
      discard: [firstCard],
      currentTurn: 0,
      direction: 1,
      phase: 'PLAYING',
      pendingPlay: null,
      challengeTimer: 0,
      challengeState: null,
      variants
    });
  };
  
  const isValidPlay = (card: UnoCard | Claim, top: UnoCard) => {
    if (card.color === 'wild') return true;
    if (top.color === 'wild') return true; 
    return card.color === top.color || card.value === top.value;
  };
  
  const playCard = (playerIdx: number, cardId: string, claim: Claim) => {
    setState(prev => {
      if (prev.phase !== 'PLAYING') return prev;
      
      const p = prev.players.map(player => ({...player, hand: [...player.hand]}));
      const cardIdx = p[playerIdx].hand.findIndex(c => c.id === cardId);
      if (cardIdx === -1) return prev;
      
      const playedCard = p[playerIdx].hand.splice(cardIdx, 1)[0];
      
      return {
        ...prev,
        players: p,
        pendingPlay: {
          playerIdx, 
          actualCard: playedCard,
          claimedCard: { id: playedCard.id, color: claim.color, value: claim.value }
        },
        phase: 'CHALLENGE_WINDOW',
        challengeTimer: 3
      };
    });
  };
  
  // Timer for Challenge Window
  useEffect(() => {
    if (state.phase === 'CHALLENGE_WINDOW' && state.challengeTimer > 0) {
      const t = setTimeout(() => setState(p => ({...p, challengeTimer: p.challengeTimer - 1})), 1000);
      return () => clearTimeout(t);
    } else if (state.phase === 'CHALLENGE_WINDOW' && state.challengeTimer === 0) {
      resolvePlay(); // No challenge
    }
  }, [state.phase, state.challengeTimer]);
  
  const callLiar = (challengerIdx: number) => {
    setState(prev => {
      if (prev.phase !== 'CHALLENGE_WINDOW' || !prev.pendingPlay) return prev;
      
      const isLie = prev.pendingPlay.actualCard.color !== prev.pendingPlay.claimedCard.color || 
                    prev.pendingPlay.actualCard.value !== prev.pendingPlay.claimedCard.value;
                    
      setTimeout(() => {
        resolveChallenge(isLie, challengerIdx);
      }, 3000);
      
      return {
        ...prev,
        phase: 'CHALLENGE_REVEAL',
        challengeState: { challengerIdx, isLie }
      };
    });
  };
  
  const resolveChallenge = (isLie: boolean, challengerIdx: number) => {
    setState(prev => {
      if (!prev.pendingPlay) return prev;
      
      let newDeck = [...prev.deck];
      let newPlayers = prev.players.map(p => ({...p, hand: [...p.hand]}));
      let newDiscard = [...prev.discard];
      let newTurn = prev.currentTurn;
      let newPhase = 'PLAYING' as GamePhase;
      let direction = prev.direction;
      
      const drawCardsMut = (idx: number, count: number) => {
        const drawn = newDeck.splice(0, count);
        newPlayers[idx].hand.push(...drawn);
      };
      
      if (isLie) {
          // Liar draws 4
          drawCardsMut(prev.pendingPlay.playerIdx, 4);
          newDiscard.push(prev.pendingPlay.actualCard);
          newTurn = (newTurn + direction + 4) % 4; // Move to next person
      } else {
          // Challenger draws 4
          drawCardsMut(challengerIdx, 4);
          
          // Apply card effect
          const card = prev.pendingPlay.claimedCard;
          newDiscard.push(card);
          
          let offset = 1;
          if (card.value === 'reverse') {
              direction = (direction * -1) as 1 | -1;
              if (newPlayers.length === 2) offset = 2;
          } else if (card.value === 'skip') {
              offset = 2;
          } else if (card.value === '+2') {
              drawCardsMut((newTurn + direction + 4) % 4, 2);
              offset = 2;
          } else if (card.value === '+4') {
              drawCardsMut((newTurn + direction + 4) % 4, 4);
              offset = 2;
          }
          
          if (newPlayers[newTurn].hand.length === 0) {
              newPhase = 'GAME_OVER';
          } else {
              newTurn = (newTurn + direction * offset + 4) % 4;
          }
      }
      
      return {
        ...prev,
        deck: newDeck,
        players: newPlayers,
        discard: newDiscard,
        currentTurn: newTurn,
        direction,
        phase: newPhase,
        pendingPlay: null,
        challengeState: null
      };
    });
  };
  
  const resolvePlay = () => {
    setState(prev => {
      if (!prev.pendingPlay) return prev;
      
      let newDeck = [...prev.deck];
      let newPlayers = prev.players.map(p => ({...p, hand: [...p.hand]}));
      let newDiscard = [...prev.discard];
      let newTurn = prev.currentTurn;
      let newPhase = 'PLAYING' as GamePhase;
      let direction = prev.direction;
      
      const drawCardsMut = (idx: number, count: number) => {
        const drawn = newDeck.splice(0, count);
        newPlayers[idx].hand.push(...drawn);
      };
      
      const card = prev.pendingPlay.claimedCard;
      newDiscard.push(card);
      let offset = 1;
      
      if (card.value === 'reverse') {
          direction = (direction * -1) as 1 | -1;
          if (newPlayers.length === 2) offset = 2;
      } else if (card.value === 'skip') {
          offset = 2;
      } else if (card.value === '+2') {
          drawCardsMut((newTurn + direction + 4) % 4, 2);
          offset = 2;
      } else if (card.value === '+4') {
          drawCardsMut((newTurn + direction + 4) % 4, 4);
          offset = 2;
      }
      
      if (newPlayers[newTurn].hand.length === 0) {
          newPhase = 'GAME_OVER';
      } else {
          newTurn = (newTurn + direction * offset + 4) % 4;
      }
      
      return {
        ...prev,
        deck: newDeck,
        players: newPlayers,
        discard: newDiscard,
        currentTurn: newTurn,
        direction,
        phase: newPhase,
        pendingPlay: null
      };
    });
  };

  // Basic AI Turn
  useEffect(() => {
    const currentState = stateRef.current;
    if (currentState.phase === 'PLAYING' && currentState.players[currentState.currentTurn] && currentState.players[currentState.currentTurn].isAI) {
      const topCard = currentState.pendingPlay ? currentState.pendingPlay.claimedCard : currentState.discard[currentState.discard.length - 1];
      
      const t = setTimeout(() => {
         const p = currentState.players[currentState.currentTurn];
         const difficulty = p.difficulty || 'MEDIUM';
         const validCards = p.hand.filter(c => isValidPlay(c, topCard));
         
         let lieChance = 0.15;
         let lieWhenNoValidChance = 0.5;
         
         if (difficulty === 'EASY') {
            lieChance = 0.4;
            lieWhenNoValidChance = 0.8;
         } else if (difficulty === 'HARD') {
            lieChance = 0.05;
            lieWhenNoValidChance = 0.2;
         }

         if (validCards.length > 0) {
             const card = validCards[Math.floor(Math.random() * validCards.length)];
             if (Math.random() < lieChance) {
                 const claimedVal = VALUES[Math.floor(Math.random() * VALUES.length)];
                 const claimedColor = card.color === 'wild' ? topCard.color : card.color;
                 playCard(currentState.currentTurn, card.id, {color: claimedColor, value: claimedVal});
             } else {
                 playCard(currentState.currentTurn, card.id, {color: card.color === 'wild' ? topCard.color : card.color, value: card.value});
             }
         } else {
             if (Math.random() < lieWhenNoValidChance) {
                 const card = p.hand[Math.floor(Math.random() * p.hand.length)];
                 let claimedVal: CardValue = topCard.value;
                 let claimedColor: CardColor = topCard.color === 'wild' ? 'red' : topCard.color;
                 
                 // Easy AI lies carelessly
                 if (difficulty === 'EASY') {
                     claimedVal = VALUES[Math.floor(Math.random() * VALUES.length)];
                     claimedColor = COLORS[Math.floor(Math.random() * COLORS.length)];
                 }
                 
                 playCard(currentState.currentTurn, card.id, {color: claimedColor, value: claimedVal});
             } else {
                 playerDrawAI(currentState.currentTurn);
             }
         }
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.currentTurn]);

  const playerDrawAI = (turnIdx: number) => {
    setState(prev => {
        let newDeck = [...prev.deck];
        let newPlayers = prev.players.map(p => ({...p, hand: [...p.hand]}));
        const drawn = newDeck.splice(0, 1);
        newPlayers[turnIdx].hand.push(...drawn);
        
        let nextTurn = (prev.currentTurn + prev.direction + 4) % 4;

        return {
            ...prev,
            deck: newDeck,
            players: newPlayers,
            currentTurn: nextTurn
        };
    });
  };

  // AI Challenge Logic
  useEffect(() => {
      if (state.phase === 'CHALLENGE_WINDOW' && state.pendingPlay && state.challengeTimer === 2) {
          // All AIs consider challenging the current pendingPlay
          let challenger: number | null = null;
          
          state.players.forEach((p, idx) => {
             if (idx === state.pendingPlay!.playerIdx || !p.isAI || challenger !== null) return;
             
             let challengeChance = 0.1;
             if (p.difficulty === 'EASY') challengeChance = 0.4;
             if (p.difficulty === 'HARD') challengeChance = 0.05;
             
             // Hard AI challenges +4 more often
             if (p.difficulty === 'HARD' && state.pendingPlay?.claimedCard.value === '+4') {
                challengeChance = 0.3;
             }
             
             if (Math.random() < challengeChance) {
                 challenger = idx;
             }
          });
          
          if (challenger !== null) {
             callLiar(challenger);
          }
      }
  }, [state.phase, state.challengeTimer]);

  const playerDraw = () => {
      if (stateRef.current.phase === 'PLAYING' && stateRef.current.currentTurn === 0) {
          playerDrawAI(0);
      }
  };

  const topCard = state.pendingPlay ? state.pendingPlay.claimedCard : state.discard[state.discard.length - 1];

  return {
    players: state.players,
    deck: state.deck,
    discard: state.discard,
    topCard,
    currentTurn: state.currentTurn,
    phase: state.phase,
    pendingPlay: state.pendingPlay,
    challengeTimer: state.challengeTimer,
    challengeState: state.challengeState,
    variants: state.variants,
    
    goToLobby,
    startGame,
    playCard,
    callLiar,
    playerDraw
  };
}
