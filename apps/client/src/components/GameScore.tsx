import { cn } from '@instasync/shared';
import { useRef, useEffect, useState } from 'react';

const GameScore = ({
  className,
  gameScore
}: {
  className?: string;
  scoreClassName?: string;
  gameScore: number;
}) => {
  const gameScoreRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (gameScoreRef.current) {
      gameScoreRef.current.style.setProperty('--num', '0');
      gameScoreRef.current.style.setProperty('--duration', '1s');
      setTimeout(() => {
        gameScoreRef.current?.style.setProperty(
          '--duration',
          `${Math.random() * 3 + 1}s`
        );
        gameScoreRef.current?.style.setProperty('--num', gameScore.toString());
      }, 1000);
    }
  }, [gameScore]);

  return (
    <h1
      ref={gameScoreRef}
      id="game-score"
      className={cn('font-bold', className)}
      data-num={gameScore}
    ></h1>
  );
};

export default GameScore;
