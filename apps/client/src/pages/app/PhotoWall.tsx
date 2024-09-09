import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Virtual, Keyboard } from 'swiper/modules';
import { Card } from '@instasync/ui/ui/card';
import backgroundImage from '@/assets/background.png';

import { useFullscreen } from '@/lib/hook';
import { useQuery } from '@tanstack/react-query';
import { API_QUERY_KEYS, API_SERVICES } from '@/lib/api';
import {
  cn,
  CommentStatus,
  CommentType,
  WebSocketActionType
} from '@instasync/shared';
import { CommentCard } from '@/components/CommentCard';
import { SYSTEM_DEFAULT_COMMENTS } from '@/lib/constants';
import useWebSocketStore from '@/store/websocketStore';
import { QrcodeBlock } from '@/components/QrcodeBlock';
import { Loader } from 'lucide-react';

const DISPLAY_COMMENTS_COUNT = 20;
const DURATION_PER_PHOTO = 2000;

export const PhotoWall = () => {
  const swiperStageRef = useRef<HTMLDivElement>(null);
  const { toggleFullscreen } = useFullscreen(swiperStageRef, () => {});
  const swiperRef = useRef<SwiperRef | null>(null);
  const [isPhotoRandom, setIsPhotoRandom] = useState(false);

  const {
    data: comments,
    isLoading,
    isFetching,
    refetch
  } = useQuery({
    queryKey: API_QUERY_KEYS.comment.filter({
      status: CommentStatus.APPROVED,
      hidden: false,
      type: CommentType.PHOTO,
      size: DISPLAY_COMMENTS_COUNT
    }),
    queryFn: async () => {
      const swiper = swiperRef.current?.swiper;

      swiper?.autoplay?.stop();

      const comments = await API_SERVICES.getComments({
        status: CommentStatus.APPROVED,
        hidden: false,
        type: CommentType.PHOTO,
        size: DISPLAY_COMMENTS_COUNT,
        isRandom: isPhotoRandom
      });

      // trigger autoplay in next tick to fix autoplay not working after updating photos
      setTimeout(() => {
        swiper?.autoplay?.start();
      }, 150);

      if (
        SYSTEM_DEFAULT_COMMENTS.length + comments.length <
        DISPLAY_COMMENTS_COUNT
      ) {
        const populatedComments = [
          ...SYSTEM_DEFAULT_COMMENTS.slice(
            0,
            DISPLAY_COMMENTS_COUNT - comments.length
          ),
          ...comments
        ];
        if (isPhotoRandom) {
          return populatedComments.sort(() => Math.random() - 0.5);
        }
        return populatedComments;
      }

      return comments;
    },
    refetchInterval: DURATION_PER_PHOTO * DISPLAY_COMMENTS_COUNT,
    staleTime: 0
  });

  const subscribeWSMessage = useWebSocketStore((state) => state.subscribe);

  useEffect(() => {
    const unsubscribe = subscribeWSMessage((message) => {
      if (message.type === WebSocketActionType.BROADCAST_CLIENTS) {
        if (message.data.photoWall?.random !== undefined) {
          setIsPhotoRandom(message.data.photoWall.random);
        }
        if (message.data.photoWall?.doRefresh) {
          refetch();
        }
      }
    });
    return () => {
      unsubscribe();
    };
  }, [refetch]);

  if (!comments) return <div>Loading...</div>;

  return (
    <>
      <Card
        id="photo-wall"
        ref={swiperStageRef}
        className={`relative w-[calc(100vw-1rem)] md:w-[calc(100vw-8rem)] aspect-video 
          flex items-center justify-center bg-foreground text-secondary border-0`}
        onDoubleClick={toggleFullscreen}
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* text-background */}
        <div className="absolute left-[50%] translate-x-[-50%] top-[5%] text-6xl text-secondary text-stroke-lg">
          宏修 & 怡臻
        </div>

        {isFetching && (
          <div
            className={cn('absolute left-0 bottom-0 flex text-sm font-bold')}
          >
            {isPhotoRandom && 'R'}
            <Loader className="w-4 h-4 animate-spin" />
          </div>
        )}

        <Swiper
          ref={swiperRef}
          slidesPerView={3}
          centeredSlides={true}
          spaceBetween={10}
          loop
          loopAdditionalSlides={2}
          grabCursor={true}
          autoplay={{
            delay: DURATION_PER_PHOTO,
            disableOnInteraction: false
          }}
          // virtual
          effect="coverflow"
          coverflowEffect={{
            rotate: 40,
            stretch: 0,
            depth: 350,
            scale: 0.95,
            modifier: 1,
            slideShadows: true
          }}
          modules={[EffectCoverflow, Autoplay, Virtual, Keyboard]}
          keyboard={{
            enabled: true
          }}
        >
          {comments?.map((comment) => (
            <SwiperSlide key={comment.id}>
              <CommentCard comment={comment} />
            </SwiperSlide>
          ))}
        </Swiper>

        <QrcodeBlock
          className="absolute bottom-1 right-1 w-[4rem]"
          value={`${location.origin}/wedding/guest?mode=photo`}
          color="hsl(var(--secondary))"
        />
      </Card>
    </>
  );
};
