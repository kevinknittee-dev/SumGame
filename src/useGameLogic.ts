import { useState, useEffect, useCallback, useRef } from 'react';
import { Block, GameMode, COLS, ROWS, INITIAL_ROWS, TIME_LIMIT } from './types';
import confetti from 'canvas-confetti';

const generateId = () => Math.random().toString(36).substr(2, 9);

const getRandomValue = () => Math.floor(Math.random() * 9) + 1;

const applyGravity = (blocks: Block[]): Block[] => {
  const result = blocks.map(b => ({ ...b }));
  for (let x = 0; x < COLS; x++) {
    const columnBlocks = result
      .filter((b) => b.x === x)
      .sort((a, b) => b.y - a.y); // Bottom to top (highest Y first)
    
    columnBlocks.forEach((b, index) => {
      b.y = ROWS - 1 - index;
    });
  }
  return result;
};

export function useGameLogic(mode: GameMode | null) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [targetSum, setTargetSum] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [level, setLevel] = useState(1);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateNewTarget = useCallback((currentBlocks: Block[]) => {
    if (currentBlocks.length === 0) {
      setTargetSum(10);
      return;
    }
    // Pick 2-4 random blocks and sum them to ensure a solution exists
    const count = Math.min(currentBlocks.length, Math.floor(Math.random() * 3) + 2);
    const shuffled = [...currentBlocks].sort(() => 0.5 - Math.random());
    const sum = shuffled.slice(0, count).reduce((acc, b) => acc + b.value, 0);
    setTargetSum(sum);
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    const initialBlocks: Block[] = [];
    for (let row = 0; row < INITIAL_ROWS; row++) {
      for (let x = 0; x < COLS; x++) {
        initialBlocks.push({
          id: generateId(),
          value: getRandomValue(),
          x,
          y: ROWS - 1 - row, // Fill from bottom up
        });
      }
    }
    setBlocks(initialBlocks);
    setScore(0);
    setGameOver(false);
    setSelectedIds([]);
    setTimeLeft(TIME_LIMIT);
    setLevel(1);
    generateNewTarget(initialBlocks);
  }, [generateNewTarget]);

  const addRow = useCallback(() => {
    setBlocks((prev) => {
      // Check if any block is at the top row (y=0)
      const willHitTop = prev.some((b) => b.y <= 0);
      if (willHitTop) {
        setGameOver(true);
        return prev;
      }

      // Move existing blocks up
      const movedBlocks = prev.map((b) => ({ ...b, y: b.y - 1 }));
      
      // Add new row at the bottom (y = ROWS - 1)
      const newRow: Block[] = [];
      for (let x = 0; x < COLS; x++) {
        newRow.push({
          id: generateId(),
          value: getRandomValue(),
          x,
          y: ROWS - 1,
          isNew: true,
        });
      }
      
      const nextBlocks = applyGravity([...movedBlocks, ...newRow]);
      generateNewTarget(nextBlocks);
      return nextBlocks;
    });
  }, [generateNewTarget]);

  // Handle selection
  const toggleBlock = (id: string) => {
    if (gameOver) return;
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      return [...prev, id];
    });
  };

  // Check sum
  useEffect(() => {
    if (selectedIds.length === 0) return;

    const selectedBlocks = blocks.filter((b) => selectedIds.includes(b.id));
    const currentSum = selectedBlocks.reduce((acc, b) => acc + b.value, 0);

    if (currentSum === targetSum && targetSum > 0) {
      // Success!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });

      const removedCount = selectedIds.length;
      const points = targetSum * removedCount * level;
      setScore((s) => s + points);
      
      setBlocks((prev) => {
        const remaining = prev.filter((b) => !selectedIds.includes(b.id));
        const afterGravity = applyGravity(remaining);
        
        if (mode === 'classic') {
          // Check if any block is at the top row (y=0)
          const willHitTop = afterGravity.some((b) => b.y <= 0);
          if (willHitTop) {
            setGameOver(true);
            return afterGravity;
          }

          // Move existing blocks up
          const movedBlocks = afterGravity.map((b) => ({ ...b, y: b.y - 1 }));
          
          // Add new row at the bottom
          const newRow: Block[] = [];
          for (let x = 0; x < COLS; x++) {
            newRow.push({
              id: generateId(),
              value: getRandomValue(),
              x,
              y: ROWS - 1,
              isNew: true,
            });
          }
          
          const nextBlocks = applyGravity([...movedBlocks, ...newRow]);
          generateNewTarget(nextBlocks);
          return nextBlocks;
        }
        
        generateNewTarget(afterGravity);
        return afterGravity;
      });
      
      setSelectedIds([]);
      if (mode === 'time') {
        setTimeLeft(TIME_LIMIT);
      }
    } else if (currentSum > targetSum) {
      // Failed - sum exceeded
      setSelectedIds([]);
    }
  }, [selectedIds, targetSum, mode, level, generateNewTarget, blocks]);

  // Timer logic for Time Mode
  useEffect(() => {
    if (mode === 'time' && !gameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up
            addRow();
            return TIME_LIMIT;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, gameOver, addRow]);

  // Level up logic
  useEffect(() => {
    const newLevel = Math.floor(score / 1000) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
    }
  }, [score, level]);

  return {
    blocks,
    targetSum,
    selectedIds,
    score,
    gameOver,
    timeLeft,
    level,
    toggleBlock,
    initGame,
  };
}
