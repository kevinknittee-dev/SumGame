/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Timer, 
  RotateCcw, 
  Play, 
  Zap, 
  LayoutGrid, 
  ChevronLeft,
  Info
} from 'lucide-react';
import { useGameLogic } from './useGameLogic';
import { GameMode, COLS, ROWS } from './types';

export default function App() {
  const [mode, setMode] = useState<GameMode | null>(null);
  const {
    blocks,
    targetSum,
    selectedIds,
    score,
    gameOver,
    timeLeft,
    level,
    toggleBlock,
    initGame,
  } = useGameLogic(mode);

  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (mode) {
      initGame();
    }
  }, [mode, initGame]);

  const currentSum = blocks
    .filter((b) => selectedIds.includes(b.id))
    .reduce((acc, b) => acc + b.value, 0);

  if (!mode) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter text-[#141414] uppercase italic">
              Sum Strike
            </h1>
            <p className="text-[#141414]/60 font-medium uppercase tracking-widest text-xs">
              Mathematical Elimination Protocol
            </p>
          </div>

          <div className="grid gap-4">
            <button
              onClick={() => setMode('classic')}
              className="group relative overflow-hidden bg-[#141414] text-[#E4E3E0] p-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <LayoutGrid className="w-6 h-6" />
                <Zap className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold uppercase italic">Classic Mode</h3>
              <p className="text-sm opacity-60">Clear sums to survive. New rows added on success.</p>
            </button>

            <button
              onClick={() => setMode('time')}
              className="group relative overflow-hidden border-2 border-[#141414] text-[#141414] p-6 rounded-2xl transition-all hover:bg-[#141414] hover:text-[#E4E3E0] hover:scale-[1.02] active:scale-[0.98] text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <Timer className="w-6 h-6" />
                <Zap className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
              </div>
              <h3 className="text-xl font-bold uppercase italic">Time Mode</h3>
              <p className="text-sm opacity-60">Race against the clock. New rows added on timeout.</p>
            </button>
          </div>

          <button 
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-2 mx-auto text-xs font-bold uppercase tracking-widest text-[#141414]/40 hover:text-[#141414] transition-colors"
          >
            <Info className="w-4 h-4" />
            How to play
          </button>

          <AnimatePresence>
            {showInstructions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden text-left bg-white/50 rounded-xl p-4 text-sm text-[#141414]/80 space-y-2"
              >
                <p>• Select numbers that add up to the <strong>Target</strong>.</p>
                <p>• Numbers don't need to be adjacent.</p>
                <p>• Don't let the blocks reach the top!</p>
                <p>• <strong>Classic</strong>: Success adds a row.</p>
                <p>• <strong>Time</strong>: Timeout adds a row.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-[#E4E3E0]/80 backdrop-blur-md border-b border-[#141414]/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button 
            onClick={() => setMode(null)}
            className="p-2 hover:bg-[#141414]/5 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Target Sum</span>
            <motion.span 
              key={targetSum}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-black italic"
            >
              {targetSum}
            </motion.span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-widest opacity-40">Score</span>
              <span className="text-xl font-black italic">{score.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="pt-24 pb-32 px-4 max-w-lg mx-auto h-screen flex flex-col">
        {/* Status Bar */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 opacity-40" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Level {level}</span>
          </div>
          
          {mode === 'time' && (
            <div className="flex items-center gap-2">
              <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'opacity-40'}`} />
              <span className={`text-xs font-mono font-bold ${timeLeft <= 5 ? 'text-red-500' : 'opacity-60'}`}>
                00:{timeLeft.toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Grid Container */}
        <div className="relative flex-1 bg-white/30 rounded-2xl border-2 border-[#141414]/10 overflow-hidden shadow-inner">
          {/* Grid Lines */}
          <div className="absolute inset-0 grid grid-cols-6 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-r border-[#141414]/5" />
            ))}
          </div>
          <div className="absolute inset-0 grid grid-rows-10 pointer-events-none">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border-b border-[#141414]/5" />
            ))}
          </div>

          {/* Blocks */}
          <div className="absolute inset-0">
            <AnimatePresence initial={false}>
              {blocks.map((block) => {
                const isSelected = selectedIds.includes(block.id);
                return (
                  <motion.button
                    key={block.id}
                    initial={block.isNew ? { opacity: 0, scale: 0.5 } : { opacity: 1 }}
                    animate={{ 
                      left: `${block.x * (100 / COLS)}%`, 
                      top: `${block.y * (100 / ROWS)}%`,
                      opacity: 1,
                      scale: isSelected ? 0.9 : 1,
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 500, 
                      damping: 40
                    }}
                    onClick={() => toggleBlock(block.id)}
                    className="absolute w-[16.66%] h-[10%] p-[1px] z-10"
                  >
                    <div className={`
                      w-full h-full rounded-md flex items-center justify-center text-2xl font-black italic transition-all duration-200
                      ${isSelected 
                        ? 'bg-[#141414] text-[#E4E3E0] shadow-lg scale-95' 
                        : 'bg-white text-[#141414] hover:bg-[#141414]/5 border border-[#141414]/20 shadow-sm'
                      }
                    `}>
                      {block.value}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Danger Zone Indicator */}
          <div className="absolute top-0 left-0 right-0 h-[10%] bg-red-500/10 pointer-events-none border-b-2 border-red-500/20 flex items-center justify-center">
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-red-500/40">Danger Zone</span>
          </div>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#E4E3E0]/80 backdrop-blur-md border-t border-[#141414]/10 p-6 z-20">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <div className="flex-1 bg-white rounded-2xl p-4 border border-[#141414]/10 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Current Sum</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black italic ${currentSum > targetSum ? 'text-red-500' : ''}`}>
                  {currentSum}
                </span>
                <span className="text-sm font-bold opacity-20">/ {targetSum}</span>
              </div>
            </div>
            
            <div className="flex gap-1">
              {selectedIds.map((id) => (
                <div key={id} className="w-2 h-2 rounded-full bg-[#141414]" />
              ))}
            </div>
          </div>

          <button 
            onClick={() => initGame()}
            className="p-4 bg-white border border-[#141414]/10 rounded-2xl hover:bg-[#141414] hover:text-[#E4E3E0] transition-all shadow-sm group"
          >
            <RotateCcw className="w-6 h-6 group-active:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </footer>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#141414]/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#E4E3E0] w-full max-w-sm rounded-[2rem] p-8 text-center space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-5xl font-black italic uppercase tracking-tighter">Game Over</h2>
                <p className="text-[#141414]/60 font-bold uppercase tracking-widest text-xs">Final Transmission</p>
              </div>

              <div className="bg-white/50 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase opacity-40">Final Score</span>
                  <span className="text-2xl font-black italic">{score.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase opacity-40">Level Reached</span>
                  <span className="text-2xl font-black italic">{level}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode(null)}
                  className="p-4 border-2 border-[#141414] rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-[#141414]/5 transition-colors"
                >
                  Menu
                </button>
                <button
                  onClick={() => initGame()}
                  className="p-4 bg-[#141414] text-[#E4E3E0] rounded-2xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Retry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
