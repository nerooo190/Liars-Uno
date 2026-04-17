import React from 'react';
import { motion } from 'framer-motion';
import { Users, Home, Store, User, Layers } from 'lucide-react';
import { CardComp } from './CardComp';

export function MainMenu({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="h-screen bg-[radial-gradient(circle,var(--table-green)_0%,var(--table-dark)_100%)] flex flex-col relative overflow-hidden font-sans pb-[60px] border-[12px] border-[var(--table-dark)]">
      
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 pt-8">
        {/* Logo Area */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="z-10 flex flex-col items-center mb-12"
        >
          <div className="bg-[var(--uno-red)] px-6 py-1 rounded-none border-[3px] border-white shadow-[4px_4px_0_rgba(0,0,0,0.5)] rotate-[-2deg] mb-1">
            <h2 className="text-white font-black text-3xl tracking-widest uppercase">Liar's</h2>
          </div>
          <h1 className="text-[var(--text-gold)] font-black text-8xl sm:text-[120px] tracking-tighter drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '4px #3d2b1f' }}>
            UNO
          </h1>
          <div className="bg-[var(--uno-blue)] px-8 py-2 transform rotate-[1deg] mt-2 shadow-[2px_2px_0_rgba(0,0,0,0.5)] border-2 border-white">
             <p className="text-white font-bold text-xl sm:text-2xl tracking-widest uppercase relative z-10">Trust No One</p>
          </div>
        </motion.div>

        {/* Buttons & Fanned Cards */}
        <div className="relative w-full max-w-sm flex flex-col items-center gap-6 px-6">
          {/* Fake fanned cards behind buttons */}
          <div className="absolute inset-x-0 -top-16 flex justify-center -z-10 opacity-90 pointer-events-none">
             {[...Array(5)].map((_, i) => (
                <motion.div
                   key={i}
                   initial={{ y: 50, rotate: 0 }}
                   animate={{ y: 0, rotate: (i - 2) * 20 }}
                   className="absolute origin-bottom"
                >
                    <CardComp 
                       card={{ id: 'x', color: ['red', 'blue', 'green', 'yellow'][i%4] as any, value: String(i+1) as any }} 
                       className="scale-[0.6] shadow-[2px_4px_10px_rgba(0,0,0,0.3)]" 
                    />
                </motion.div>
             ))}
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlay}
            className="w-full bg-[var(--uno-yellow)] rounded-[30px] py-4 flex items-center justify-center gap-4 relative z-20 shadow-[0_6px_0_rgba(0,0,0,0.4)] border-none"
          >
            <span className="text-black font-black text-3xl tracking-widest">PLAY NOW</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-[var(--uno-blue)] rounded-[30px] py-4 flex items-center justify-center gap-4 relative z-20 shadow-[0_6px_0_rgba(0,0,0,0.4)] border-none"
          >
            <span className="text-white font-black text-3xl tracking-widest">JOIN ROOM</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-[var(--uno-red)] rounded-[30px] py-4 flex items-center justify-center gap-4 relative z-20 shadow-[0_6px_0_rgba(0,0,0,0.4)] border-none"
          >
            <span className="text-white font-black text-3xl tracking-widest">FRIENDS</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-[var(--ui-panel)] border-t border-[rgba(255,255,255,0.2)] flex justify-around items-center px-6 z-30">
         <div className="flex flex-col items-center text-[var(--text-gold)] cursor-pointer">
           <Home size={28} className="drop-shadow-md" />
         </div>
         <div className="flex flex-col items-center text-white/50 hover:text-[var(--text-gold)] transition-colors cursor-pointer relative">
           <Layers size={28} />
           <div className="absolute -top-1 -right-2 bg-[var(--uno-red)] w-3 h-3 rounded-full border border-[var(--ui-panel)]" />
         </div>
         <div className="flex flex-col items-center text-white/50 hover:text-[var(--text-gold)] transition-colors cursor-pointer">
           <Store size={28} />
         </div>
         <div className="flex flex-col items-center text-white/50 hover:text-[var(--text-gold)] transition-colors cursor-pointer">
           <User size={28} />
         </div>
      </div>
    </div>
  );
}
