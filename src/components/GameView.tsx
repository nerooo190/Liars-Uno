import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UnoCard, CardColor, CardValue, GameState, Player, Claim } from '../types';
import { CardComp } from './CardComp';
import { cn } from '../lib/utils';
import { Menu, MessageCircle, Settings } from 'lucide-react';

interface GameViewProps {
  gameState: ReturnType<typeof import('../useLiarUno').useLiarUno>;
}

export function GameView({ gameState }: GameViewProps) {
  const { 
    players, discard, topCard, currentTurn, phase,
    pendingPlay, challengeTimer, challengeState,
    playCard, callLiar, playerDraw
  } = gameState;

  const [selectedCard, setSelectedCard] = useState<UnoCard | null>(null);
  const [claimColor, setClaimColor] = useState<CardColor>('red');
  const [claimValue, setClaimValue] = useState<CardValue>('0');

  const me = players[0];
  const aiPlayers = players.slice(1);

  // Auto-play claim logic as earlier

  const handleCardClick = (card: UnoCard) => {
    if (phase !== 'PLAYING' || currentTurn !== 0) return;
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
      // Auto-set claim to true values by default or topCard values if invalid
      const isValid = card.color === 'wild' || topCard.color === 'wild' || card.color === topCard.color || card.value === topCard.value;
      if (isValid) {
        setClaimColor(card.color === 'wild' ? (topCard.color === 'wild' ? 'red' : topCard.color) : card.color);
        setClaimValue(card.value);
      } else {
        setClaimColor(topCard.color === 'wild' ? 'red' : topCard.color);
        setClaimValue(card.value === 'wild' ? '0' : card.value);
      }
    }
  };

  const handlePlay = () => {
    if (!selectedCard) return;
    playCard(0, selectedCard.id, { color: claimColor, value: claimValue });
    setSelectedCard(null);
  };

  const getPlayerClasses = (playerIndex: number) => {
    const isActive = currentTurn === playerIndex && phase === 'PLAYING';
    const isChallenger = challengeState?.challengerIdx === playerIndex;
    
    let ringColor = 'border-[var(--text-gold)] scale-100';
    if (isActive) ringColor = 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]';
    if (isChallenger) ringColor = 'border-[var(--uno-red)] scale-110 shadow-[0_0_15px_var(--uno-red)]';
    
    return cn(
      "relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3px] transition-all duration-300 flex items-center justify-center font-bold text-2xl",
      ringColor
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[radial-gradient(circle,var(--table-green)_0%,var(--table-dark)_100%)] border-[12px] border-[var(--table-dark)] text-white font-sans overflow-hidden relative">

      {/* Turn indicator background text */}
      {currentTurn === 0 && phase === 'PLAYING' && (
        <div className="absolute left-8 top-10 font-black text-white/20 uppercase leading-[0.8] text-[60px] sm:text-[80px] pointer-events-none z-0">
          YOUR<br/>TURN
        </div>
      )}

      {/* Top AI Opponents */}
      <div className="relative z-10 flex justify-between items-start pt-8 px-6 sm:px-12 w-full max-w-4xl mx-auto">
        {aiPlayers.map((p, idx) => (
          <div key={p.id} className="flex flex-col items-center gap-2">
            <div className={getPlayerClasses(idx + 1)} style={{ background: ['#e67e22', '#9b59b6', '#2ecc71'][idx] }}>
              {p.name.charAt(0)}
            </div>
            {/* Draw mini hand cards overlapping */}
            <div className="flex -mt-4 z-10">
               {[...Array(p.hand.length)].map((_, i) => (
                  <div key={i} className="w-4 h-6 sm:w-5 sm:h-7 bg-[var(--uno-red)] border border-white rounded-[2px] -mx-1 shadow-sm" />
               ))}
            </div>
            <span className="text-sm font-medium mt-1">{p.name}</span>
          </div>
        ))}
      </div>

      {/* Center Action Area */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center mt-[-40px]">
        {/* Play Piles */}
        <div className="flex items-center gap-8 relative">
          
          {/* Claim display when card is played */}
          {pendingPlay && phase === 'CHALLENGE_WINDOW' && (
             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-[80px] bg-[var(--ui-panel)] px-5 py-2 rounded-[20px] font-bold border border-[var(--text-gold)] text-[var(--card-white)] whitespace-nowrap uppercase z-30 drop-shadow-lg text-sm sm:text-lg">
                CLAIM: {pendingPlay.claimedCard.color} {pendingPlay.claimedCard.value}
             </div>
          )}

          {/* Draw Pile */}
          <CardComp isFaceDown onClick={playerDraw} className="hover:-translate-y-1 transition-transform z-10" />

          {/* Discard / Top Card */}
          <div className="relative">
            {pendingPlay ? (
               <motion.div
                 initial={{ scale: 1.2, x: 50, opacity: 0 }}
                 animate={{ scale: 1, x: 0, opacity: 1 }}
                 className="relative z-20"
               >
                 <CardComp 
                   card={phase === 'CHALLENGE_REVEAL' ? pendingPlay.actualCard : pendingPlay.claimedCard} 
                   className={phase === 'CHALLENGE_REVEAL' && challengeState?.isLie ? 'animate-shake border-red-500' : ''}
                 />
               </motion.div>
            ) : (
               <CardComp card={topCard} className="z-10" />
            )}
          </div>
        </div>

        {/* Liar Button Region */}
        <div className="mt-8 h-16 flex justify-center items-center relative z-30">
          <AnimatePresence>
            {phase === 'CHALLENGE_WINDOW' && pendingPlay?.playerIdx !== 0 && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => callLiar(0)}
                className="px-12 py-3 rounded-[30px] border-none bg-[#e74c3c] text-white font-black text-2xl uppercase tracking-widest shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgba(0,0,0,0.3)] transition-all flex items-center gap-2"
              >
                 <span>LIAR!</span> <span className="opacity-80 text-sm">({challengeTimer})</span>
              </motion.button>
            )}
            
            {phase === 'CHALLENGE_REVEAL' && challengeState && (
               <motion.div 
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className={cn(
                    "px-8 py-2 rounded-full border-[3px] text-2xl sm:text-3xl font-black tracking-widest bg-[var(--ui-panel)]",
                    challengeState.isLie ? 'text-green-400 border-green-500' : 'text-red-500 border-red-500'
                 )}
               >
                 {challengeState.isLie ? 'LIE CAUGHT!' : 'TRUTH!'}
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Player Hand Area */}
      <div className="relative z-20 pb-[80px] w-full pt-12 flex justify-center" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
        
        {/* Play Action Modal (Inline) */}
        <AnimatePresence>
          {selectedCard && phase === 'PLAYING' && currentTurn === 0 ? (
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 20, opacity: 0 }}
               className="absolute -top-[70px] sm:-top-6 left-0 right-0 flex justify-center items-center gap-2 z-50 flex-wrap"
            >
               <div className="bg-[var(--ui-panel)] p-3 rounded-xl border border-white/20 flex items-center gap-3 shadow-[0_10px_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
                 <select value={claimColor} onChange={e => setClaimColor(e.target.value as CardColor)} className="bg-[var(--table-dark)] font-black border-2 border-[var(--uno-red)] rounded px-3 py-2 text-sm outline-none text-white uppercase text-center w-24 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
                    <option value="red" className="text-[var(--uno-red)]">Red</option>
                    <option value="blue" className="text-[var(--uno-blue)]">Blue</option>
                    <option value="green" className="text-[var(--uno-green)]">Green</option>
                    <option value="yellow" className="text-[var(--uno-yellow)]">Yellow</option>
                 </select>
                 <select value={claimValue} onChange={e => setClaimValue(e.target.value as CardValue)} className="bg-[var(--table-dark)] font-black border-2 border-[var(--uno-blue)] rounded px-3 py-2 text-sm outline-none w-20 text-white uppercase text-center shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
                    {['0','1','2','3','4','5','6','7','8','9','skip','reverse','+2'].map(v => <option key={v} value={v}>{v}</option>)}
                 </select>
                 <button onClick={handlePlay} className="px-6 py-2 bg-[var(--uno-yellow)] text-black font-black uppercase rounded-[30px] shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgba(0,0,0,0.3)] transition-all">
                   UNO!
                 </button>
               </div>
            </motion.div>
          ) : (
            currentTurn === 0 && phase === 'PLAYING' && (
              <motion.div 
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="absolute -top-12 left-0 right-0 flex justify-center items-center gap-4 z-50"
              >
                 <button className="px-6 sm:px-10 py-3 bg-[var(--uno-yellow)] text-black font-black uppercase text-lg sm:text-xl rounded-[30px] shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:translate-y-[2px] transition-all border-none">UNO!</button>
                 <button onClick={() => callLiar(0)} disabled className="px-6 sm:px-10 py-3 bg-[var(--uno-red)] text-white font-black uppercase text-lg sm:text-xl rounded-[30px] shadow-[0_4px_0_rgba(0,0,0,0.3)] opacity-50 cursor-not-allowed border-none">LIAR!</button>
                 <button onClick={playerDraw} className="px-6 sm:px-10 py-3 bg-white text-gray-900 font-black uppercase text-lg sm:text-xl rounded-[30px] shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:translate-y-[2px] transition-all border-none">DRAW</button>
              </motion.div>
            )
          )}
        </AnimatePresence>

        <div className="flex justify-center items-end h-32 sm:h-40 px-4">
          {me.hand.map((card, idx) => {
            const isSelected = selectedCard?.id === card.id;
            // Fan out hand slightly
            const centerIdx = (me.hand.length - 1) / 2;
            const offset = (idx - centerIdx);
            const rotation = offset * 3;
            
            return (
              <motion.div
                key={card.id}
                layout
                onClick={() => handleCardClick(card)}
                className="origin-bottom relative -mx-3 sm:-mx-4 group cursor-pointer"
                animate={{
                  rotate: isSelected ? 0 : rotation,
                  y: isSelected ? -30 : Math.abs(offset) * 2,
                  scale: isSelected ? 1.05 : 1,
                  zIndex: isSelected ? 50 : idx
                }}
                whileHover={!isSelected ? { y: -15, zIndex: 40 } : {}}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <CardComp card={card} className="shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Bottom Nav / Sidebar stats replacement */}
      <div className="absolute right-6 top-[150px] w-48 bg-[var(--ui-panel)] border border-white/20 rounded-xl p-4 hidden lg:block text-sm z-10 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
         <h3 className="text-[var(--text-gold)] tracking-[2px] uppercase font-bold border-b border-white/10 pb-2 mb-3">Multiplier</h3>
         <div className="flex justify-between font-bold mb-1">
            <span>Current</span>
            <span className="font-mono text-white">x2.5</span>
         </div>
         <div className="flex justify-between font-bold text-gray-400">
            <span>Bluffs</span>
            <span className="font-mono">3</span>
         </div>
      </div>

      <div className="absolute bottom-2 left-0 right-0 flex justify-center text-[var(--text-gold)]/80 text-xs font-bold uppercase tracking-widest z-0 pointer-events-none">
         VARIANT: BLUFF MASTER
      </div>

      {/* Game Over Screen */}
      <AnimatePresence>
         {phase === 'GAME_OVER' && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50"
            >
               <h2 className="text-6xl font-black text-[var(--text-gold)] drop-shadow-[0_5px_0_rgba(0,0,0,1)] mb-4 uppercase">Game Over</h2>
               <p className="text-3xl text-white mb-8 font-bold">{players.find(p => p.hand.length === 0)?.name} Wins!</p>
               
               <div className="flex gap-4">
                  <button onClick={() => window.location.reload()} className="px-8 py-3 bg-[var(--uno-blue)] rounded-[30px] font-black text-xl text-white shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:translate-y-[2px] uppercase border-none">Play Again</button>
                  <button 
                     onClick={() => {
                        const win = players.find(p => p.hand.length === 0)?.name;
                        const text = `I just played Liar's UNO and ${win === 'You' ? 'won!' : 'lost to ' + win + '!'} Can you beat my score?`;
                        if (navigator.share) navigator.share({ title: "Liar's Uno", text, url: window.location.href});
                        else alert('Share: ' + text);
                     }} 
                     className="px-8 py-3 bg-[var(--ui-panel)] border-2 border-[var(--text-gold)] text-[var(--text-gold)] rounded-[30px] font-black text-xl shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:translate-y-[2px] uppercase"
                  >
                     Share Score
                  </button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
