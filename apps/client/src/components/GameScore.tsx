import { cn } from '@instasync/shared';
import { useRef, useEffect, useState } from 'react';

const GameScore = ({
  className,
  gameScore
}: {
  className?: string;
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
          `${Math.random() * 4 + 1}s`
        );
        gameScoreRef.current?.style.setProperty('--num', gameScore.toString());
      }, 1000);
    }
  }, [gameScore]);

  return (
    <div
      className={cn('flex items-center justify-center aspect-video', className)}
    >
      <h1
        ref={gameScoreRef}
        id="game-score"
        className="text-[30rem] font-bold text-primary"
        data-num={gameScore}
      ></h1>
    </div>
  );
};

export default GameScore;
