import { useCallback, useEffect, useRef } from 'react';
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

export const VideoPlayer = () => {
  const videoElRef = useRef<HTMLVideoElement>(null);
  const screenElRef = useRef<HTMLDivElement>(null);
  const bulletInstance = useRef<Bullet | null>(null);

  const { toggleFullscreen } = useFullscreen(
    videoElRef,
    () => bulletInstance.current?.resize(),
    true
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
      color: 'red',
      speed: 100
    });
  };

  const handleClear = () => {
    bulletInstance.current?.clear();
  };

  const handleKeyUp = (e: any) => {
    if (e.key === 'Control') {
      handleFireSampleBullet();
    }
  };

  const onReceiveWebSocketMessage = useCallback(
    (message: WebSocketMessageData) => {
      switch (message.type) {
        case WebSocketActionType.ADD_COMMENT:
          if (message.data.type === CommentType.VIDEO) {
            const { content } = message.data;
            bulletInstance.current?.push(content, { id: message.data.id });
          }
          break;
        case WebSocketActionType.HIDE_SHOW_COMMENT:
          if (message.data.type === CommentType.VIDEO && message.data.hidden) {
            bulletInstance.current?.clear(message.data.id);
          }
          break;
        // case WebSocketActionType.SET_DISPLAY_MODE:
        //   break;
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
        pauseOnHover: false
      });

      //@ts-ignore
      window.BULLET = bulletInstance.current;
    }

    document.addEventListener('keyup', handleKeyUp);
    const unsubscribe = subscribeWSMessage(onReceiveWebSocketMessage);

    return () => {
      document.removeEventListener('keyup', handleKeyUp);
      unsubscribe();
    };
  }, []);

  return (
    <>
      <Card
        className="relative w-[calc(100vw-2rem)] md:w-[calc(100vw-8rem)] border-0"
        onDoubleClick={toggleFullscreen}
      >
        <video
          ref={videoElRef}
          src="https://storage.googleapis.com/instasync-pics/real.mp4"
          className="bullet-video aspect-video w-full rounded-md"
          autoPlay
          loop
          controls
          muted
          controlsList="nofullscreen"
        />
        <div
          // border-dashed border-2 border-sky-white rounded-md p-1
          className={`
            bullet-screen bg-gray z-50 absolute top-0 left-0 w-full h-[calc(100%-100px)] overflow-hidden`}
          ref={screenElRef}
        ></div>
        <QrcodeBlock
          className="absolute bottom-8 right-8 w-20"
          value={`${location.origin}/guest?mode=video`}
        />
        {/* <img
          src={QrcodeImage}
          className="absolute bottom-10 right-10 w-20 h-20 rounded-xl"
        /> */}
      </Card>
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="secondary" onClick={handlePause}>
          Pause
        </Button>
        <Button size="sm" variant="default" onClick={handleResume}>
          Resume
        </Button>
        <Button size="sm" variant="default" onClick={handleFireSampleBullet}>
          Fire
        </Button>
        <Button size="sm" variant="default" onClick={handleClear}>
          Clear
        </Button>
        <Button size="sm" variant="default" onClick={toggleFullscreen}>
          Fullscreen
        </Button>
      </div>
    </>
  );
};
