import React from 'react';
import { motion } from 'framer-motion';
import { UnoCard, CardColor, CardValue } from '../types';
import { cn } from '../lib/utils';

export function CardComp({ 
  card, 
  claimColor, 
  isFaceDown = false,
  className,
  onClick,
  style
}: { 
  card?: UnoCard | null, 
  claimColor?: CardColor,
  isFaceDown?: boolean,
  className?: string,
  onClick?: () => void,
  style?: React.CSSProperties
}) {
  if (isFaceDown || !card) {
    return (
      <motion.div 
        onClick={onClick}
        className={cn(
          "w-16 h-24 sm:w-[100px] sm:h-[150px] rounded-lg bg-[#111] border-[4px] border-[#222] flex items-center justify-center cursor-pointer relative overflow-hidden shadow-[4px_6px_0_rgba(0,0,0,0.5)]",
          className
        )}
        style={style}
      >
        <div className="absolute inset-0 flex flex-wrap opacity-[0.03] text-white text-[8px] font-black uppercase text-justify overflow-hidden leading-tight pointer-events-none p-1">
           {Array(20).fill("LIAR'S UNO ").join('')}
        </div>
        <div className="absolute top-2 w-full text-center text-white/90 text-[8px] sm:text-[10px] font-black tracking-[2px] uppercase">
          Trust No One
        </div>
        <div className="flex flex-col items-center justify-center rotate-[-8deg] z-10 w-full px-2 mt-4">
          <div className="text-[var(--uno-red)] font-black text-xl sm:text-3xl leading-[0.8] mb-1" style={{ WebkitTextStroke: '1px black' }}>LIAR'S</div>
          <div className="text-white font-black text-3xl sm:text-5xl leading-[0.8]" style={{ WebkitTextStroke: '2px var(--uno-yellow)' }}>UNO</div>
        </div>
      </motion.div>
    );
  }

  const { color, value } = card;
  const isWild = color === 'wild';
  
  const themeColors: Record<CardColor, string> = {
    red: 'var(--uno-red)',
    blue: 'var(--uno-blue)',
    green: 'var(--uno-green)',
    yellow: 'var(--uno-yellow)',
    wild: '#222'
  };

  const displayColor = claimColor || color;
  const hex = themeColors[displayColor] || themeColors.wild;
  const displayValue = value === 'skip' ? '⊘' : value === 'reverse' ? '⇄' : value;

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "w-16 h-24 sm:w-[100px] sm:h-[150px] rounded-[10px] bg-black border border-[#333] shadow-[4px_6px_0_rgba(0,0,0,0.5)] select-none cursor-pointer relative overflow-hidden group",
        className
      )}
      style={style}
    >
      {isWild && color === 'wild' ? (
        <div className="absolute inset-0 flex flex-wrap">
           <div className="w-1/2 h-1/2 bg-[var(--uno-red)]" />
           <div className="w-1/2 h-1/2 bg-[var(--uno-blue)]" />
           <div className="w-1/2 h-1/2 bg-[var(--uno-yellow)]" />
           <div className="w-1/2 h-1/2 bg-[var(--uno-green)]" />
           <div className="absolute inset-0 m-auto w-[75%] h-[65%] bg-black rounded-[50%] flex items-center justify-center border-4 border-[#222]">
             {value === 'wild' ? (
               <div className="grid grid-cols-2 grid-rows-2 gap-[2px] w-[50%] h-[50%] rotate-45 transform">
                 <div className="bg-[var(--uno-red)] rounded-[2px]" />
                 <div className="bg-[var(--uno-blue)] rounded-[2px]" />
                 <div className="bg-[var(--uno-yellow)] rounded-[2px]" />
                 <div className="bg-[var(--uno-green)] rounded-[2px]" />
               </div>
             ) : (
               <span className="text-white text-3xl sm:text-5xl font-black">{displayValue}</span>
             )}
           </div>
        </div>
      ) : (
        <>
          {/* Main Color Blob background bleeding out */}
          <div className="absolute top-[10%] bottom-[10%] left-[-10%] right-[10%] sm:left-[-20%] sm:right-[15%] flex justify-center items-center">
            <div 
              className="w-[150%] h-[120%] rounded-[30%] opacity-90"
              style={{ backgroundColor: hex, border: '4px solid #111' }}
            />
          </div>

          {/* Central Black Hole for Value */}
          <div className="absolute inset-0 m-auto w-[65%] h-[55%] sm:w-[70%] sm:h-[60%] bg-[#0a0a0a] rounded-[50%] flex flex-col items-center justify-center transform -rotate-12 border-2 border-black shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
             <span className="text-white text-[32px] sm:text-[54px] font-black leading-none drop-shadow-md transform rotate-12" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>
               {displayValue}
             </span>
          </div>

          {/* Corner Decorators */}
          <div className="absolute top-1 left-2 flex flex-col items-center">
             <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-[2px] flex items-center justify-center" style={{ backgroundColor: hex }}>
               <span className="text-white font-black text-[10px] sm:text-[12px] leading-none text-center transform -translate-y-px">{displayValue === '+2' ? '2' : displayValue}</span>
             </div>
             {displayValue === '+2' && <span className="text-white text-[8px] font-black">+</span>}
          </div>

          <div className="absolute bottom-1 right-2 flex flex-col items-center rotate-180">
             <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-[2px] flex items-center justify-center" style={{ backgroundColor: hex }}>
               <span className="text-white font-black text-[10px] sm:text-[12px] leading-none text-center transform -translate-y-px">{displayValue === '+2' ? '2' : displayValue}</span>
             </div>
             {displayValue === '+2' && <span className="text-white text-[8px] font-black">+</span>}
          </div>
        </>
      )}
    </motion.div>
  );
}
