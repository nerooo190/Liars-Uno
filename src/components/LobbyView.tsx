import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Difficulty, Variants } from '../types';

export function LobbyView({ onStart, onBack }: { onStart: (difficulties: Difficulty[], variants: Variants) => void, onBack: () => void }) {
  const [difficulties, setDifficulties] = useState<Difficulty[]>(['MEDIUM', 'MEDIUM', 'MEDIUM']);
  const [variants, setVariants] = useState<Variants>({
    jumpIn: false,
    stacking: false,
    sevenO: false,
    houseRules: false
  });

  const toggleVariant = (key: keyof Variants) => {
    setVariants(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateDifficulty = (idx: number, level: Difficulty) => {
    setDifficulties(prev => {
      const copy = [...prev];
      copy[idx] = level;
      return copy;
    });
  };

  return (
    <div className="h-screen bg-[radial-gradient(circle,var(--table-green)_0%,var(--table-dark)_100%)] flex flex-col font-sans border-[12px] border-[var(--table-dark)] overflow-y-auto">
      <div className="p-6 md:p-12 max-w-4xl w-full mx-auto flex flex-col gap-8 text-white relative z-10">
        
        <button onClick={onBack} className="text-[var(--text-gold)] self-start font-bold uppercase hover:underline">
          &larr; Back
        </button>

        <h1 className="text-5xl font-black uppercase text-[var(--text-gold)] mb-8 tracking-wider">Game Setup</h1>

        {/* AI Opponents */}
        <section className="bg-[var(--ui-panel)] p-6 rounded-2xl border-2 border-white/20 shadow-xl">
          <h2 className="text-2xl font-bold uppercase mb-6 text-[var(--uno-red)]">Opponents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Alex', 'Maya', 'Sam'].map((name, idx) => (
              <div key={name} className="flex flex-col gap-3 bg-black/40 p-4 rounded-xl border border-white/10">
                <span className="font-bold text-lg">{name}</span>
                <select 
                  className="bg-zinc-800 text-white font-bold p-2 rounded outline-none w-full uppercase border border-zinc-600"
                  value={difficulties[idx]}
                  onChange={e => updateDifficulty(idx, e.target.value as Difficulty)}
                >
                  <option value="EASY">Easy (Random/Honest)</option>
                  <option value="MEDIUM">Medium (Balanced)</option>
                  <option value="HARD">Hard (Sneaky/Smart)</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Variants */}
        <section className="bg-[var(--ui-panel)] p-6 rounded-2xl border-2 border-white/20 shadow-xl">
          <h2 className="text-2xl font-bold uppercase mb-6 text-[var(--uno-blue)]">House Rules & Variants</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <label className="flex items-start gap-3 p-3 bg-black/40 rounded-xl cursor-pointer border border-white/10 hover:border-[var(--uno-yellow)] transition-colors">
              <input type="checkbox" checked={variants.jumpIn} onChange={() => toggleVariant('jumpIn')} className="mt-1 w-5 h-5 accent-[var(--uno-yellow)]" />
              <div>
                <span className="font-bold block uppercase text-[var(--uno-yellow)]">Jump-In</span>
                <span className="text-sm text-gray-400">Play out of turn if you have the exact matching card.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-black/40 rounded-xl cursor-pointer border border-white/10 hover:border-[var(--uno-yellow)] transition-colors">
              <input type="checkbox" checked={variants.stacking} onChange={() => toggleVariant('stacking')} className="mt-1 w-5 h-5 accent-[var(--uno-yellow)]" />
              <div>
                <span className="font-bold block uppercase text-[var(--uno-yellow)]">Stacking</span>
                <span className="text-sm text-gray-400">Pass draw penalties by playing another +2 or +4 card.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-black/40 rounded-xl cursor-pointer border border-white/10 hover:border-[var(--uno-yellow)] transition-colors">
              <input type="checkbox" checked={variants.sevenO} onChange={() => toggleVariant('sevenO')} className="mt-1 w-5 h-5 accent-[var(--uno-yellow)]" />
              <div>
                <span className="font-bold block uppercase text-[var(--uno-yellow)]">Seven-O</span>
                <span className="text-sm text-gray-400">Play 7 to swap hands. Play 0 everyone passes hands.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-black/40 rounded-xl cursor-pointer border border-white/10 hover:border-[var(--uno-yellow)] transition-colors">
              <input type="checkbox" checked={variants.houseRules} onChange={() => toggleVariant('houseRules')} className="mt-1 w-5 h-5 accent-[var(--uno-yellow)]" />
              <div>
                <span className="font-bold block uppercase text-[var(--uno-yellow)]">Liar's Draw</span>
                <span className="text-sm text-gray-400">Keep drawing until you get a playable card.</span>
              </div>
            </label>

          </div>
        </section>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart(difficulties, variants)}
          className="w-full mt-4 bg-[var(--uno-green)] text-white font-black text-3xl py-5 rounded-[30px] uppercase shadow-[0_6px_0_rgba(0,0,0,0.5)] hover:translate-y-[2px] transition-all"
        >
          Start Game
        </motion.button>
      </div>
    </div>
  );
}
