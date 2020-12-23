import { GamePlayState } from '0g';
import { useCallback, useEffect, useState } from 'react';
import { useGame } from './useGame';

export function usePlayState() {
  const game = useGame();
  const [isPlaying, setIsPlaying] = useState(!game.isPaused);
  useEffect(() => {
    function handleChange(playState: GamePlayState) {
      setIsPlaying(playState === 'running');
    }
    game.on('playStateChanged', handleChange);
    return () => void game.off('playStateChanged', handleChange);
  }, [game]);
  const setOrToggle = useCallback(
    (play?: boolean) => {
      if (play) game.resume();
      else if (play === false) game.pause();
      else if (game.isPaused) game.resume();
      else game.pause();
    },
    [game]
  );

  return [isPlaying, setOrToggle] as const;
}
