import { useCallback, useEffect, useRef, useState } from 'react';
import { Bullet } from '@instasync/bulletjs';
import { Button } from '@instasync/ui/ui/button';
import { Card } from '@instasync/ui/ui/card';
import { useFullscreen } from '@/lib/hook';
import useWebSocketStore from '@/store/websocketStore';
import {
  WebSocketActionType,
  WebSocketMessageData,
  CommentType
} from '@instasync/shared';

import { QrcodeBlock } from '@/components/QrcodeBlock';
import { VIDEO_SOURCES } from '@/lib/constants';
import GameScore from '@/components/GameScore';
import { Input } from '@instasync/ui/ui/input';

export const VideoPlayer = () => {
  const sceneElRef = useRef<HTMLDivElement>(null);
  const videoElRef = useRef<HTMLVideoElement>(null);
  const screenElRef = useRef<HTMLDivElement>(null);
  const bulletInstance = useRef<Bullet | null>(null);

  const [displayGameScore, setDisplayGameScore] = useState<boolean>(false);
  const [gameScore, setGameScore] = useState<number>(0);

  const { toggleFullscreen } = useFullscreen(sceneElRef, () =>
    bulletInstance.current?.resize()
  );

  const subscribeWSMessage = useWebSocketStore((state) => state.subscribe);

  const handlePause = () => {
    bulletInstance.current?.pause(null);
    videoElRef.current?.pause();
  };

  const handleResume = () => {
    bulletInstance.current?.resume(null);
    videoElRef.current?.play();
  };

  const handleFireSampleBullet = () => {
    const length = Math.floor(Math.random() * 10 * 1);
    const ranMsg = `X${'D'.repeat(length)}`;
    bulletInstance.current?.push(ranMsg, {
      color: 'white',
      // speed: Math.round(Math.random() * 30 + 100)
      speed: 0,
      duration: Math.round(Math.random() * 2 + 7)
    });
  };

  const handleChangeSource = (src: string) => {
    if (videoElRef.current) {
      videoElRef.current.src = src;
      // videoElRef.current.load();
      videoElRef.current.play();
    }
  };

  const handleClear = () => {
    bulletInstance.current?.clear();
  };

  const handleKeyUp = (e: any) => {
    if (e.key === 'Control') {
      handleFireSampleBullet();
    }
  };

  const getContentSpeed = (content: string) => {
    const carEmoji = ['🚗', '🚙', '🚕', '🚚', '🚜'];
    const flightEmoji = ['✈️', '🛫', '🛬', '🛩', '💺', '🚁'];
    const rocketEmoji = ['🚀', '🛸', '🛰'];

    if (rocketEmoji.some((emoji) => content.includes(emoji))) {
      return 1.6;
    }
    if (flightEmoji.some((emoji) => content.includes(emoji))) {
      return 3;
    }
    if (carEmoji.some((emoji) => content.includes(emoji))) {
      return 5;
    }
    return Math.round(Math.random() * 2 + 7);
  };

  const onReceiveWebSocketMessage = useCallback(
    (message: WebSocketMessageData) => {
      switch (message.type) {
        case WebSocketActionType.ADD_COMMENT:
          if (message.data.type === CommentType.VIDEO) {
            const { content, color } = message.data;
            bulletInstance.current?.push(content, {
              id: message.data.id,
              color: color || 'white',
              duration: getContentSpeed(content),
              speed: 0
            });
          }
          break;
        case WebSocketActionType.HIDE_SHOW_COMMENT:
          if (message.data.type === CommentType.VIDEO && message.data.hidden) {
            bulletInstance.current?.clear(message.data.id);
          }
          break;
        case WebSocketActionType.BROADCAST_CLIENTS:
          if (message.data?.gameScore !== undefined) {
            setGameScore(message.data?.gameScore || 0);
          }
          break;
      }
    },
    []
  );

  useEffect(() => {
    if (!bulletInstance.current) {
      bulletInstance.current = new Bullet('.bullet-screen', {
        trackHeight: 40,
        speed: undefined,
        pauseOnClick: true,
        pauseOnHover: false,
        defaultTracks: []
      });
    }

    // play the first video by default
    handleChangeSource(VIDEO_SOURCES[1].src);

    document.addEventListener('keyup', handleKeyUp);
    const unsubscribe = subscribeWSMessage(onReceiveWebSocketMessage);

    return () => {
      document.removeEventListener('keyup', handleKeyUp);
      unsubscribe();
    };
  }, []);

  return (
    <>
      {/* Video Player and Game Score */}
      <Card
        className="relative w-[calc(100vw-4rem)] md:w-[calc(100vw-8rem)] border-0"
        onDoubleClick={toggleFullscreen}
        ref={sceneElRef}
      >
        <video
          ref={videoElRef}
          src="https://storage.googleapis.com/instasync-pics/real.mp4"
          className="bullet-video aspect-video w-full rounded-md"
          loop
          controls
          muted
          controlsList="nofullscreen"
        />

        {displayGameScore && (
          <GameScore
            gameScore={gameScore}
            className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-0%] bg-transparent text-white text-[17rem] font-bold"
          />
        )}
        <div
          className={`
            bullet-screen bg-gray z-50 absolute top-0 left-0 w-full h-[calc(100%-100px)] overflow-hidden`}
          ref={screenElRef}
        ></div>
        <QrcodeBlock
          className="absolute bottom-8 right-8 w-[6rem]"
          value={`${location.origin}/wedding/guest?mode=video`}
          color="hsl(var(--secondary))"
        />
      </Card>
      {/* Switch Video Sources or switch to Game Mode */}
      <div className="mt-4 flex flex-row space-x-8">
        <div className="flex-1 flex flex-col gap-3">
          {/* <span className="pl-1 border-l-4 border-primary">VIDEO</span> */}

          {VIDEO_SOURCES.map(({ label, src }) => (
            <Button
              key={src}
              size="xs"
              variant="default"
              onClick={() => handleChangeSource(src)}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <Button
            size="xs"
            variant="secondary"
            onClick={() => setDisplayGameScore((prev) => !prev)}
          >
            Toggle Game
          </Button>
          <Input
            placeholder="Game Score"
            className="h-7 focus-visible:ring-secondary"
            onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                setGameScore(Number((e.target as HTMLInputElement).value));
              }
            }}
          />
        </div>
        {/* Control Video and Bullet Screen */}
        <div className="flex-1 flex flex-col gap-2">
          <Button size="xs" variant="outline" onClick={handlePause}>
            Pause
          </Button>
          <Button size="xs" variant="outline" onClick={handleResume}>
            Resume
          </Button>
          <Button size="xs" variant="outline" onClick={handleFireSampleBullet}>
            Fire
          </Button>
          <Button size="xs" variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button size="xs" variant="outline" onClick={toggleFullscreen}>
            Fullscreen
          </Button>
        </div>
      </div>
    </>
  );
};
