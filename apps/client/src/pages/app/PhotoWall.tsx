import { useEffect, useRef } from 'react';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Virtual, Keyboard } from 'swiper/modules';
import { Card } from '@instasync/ui/ui/card';
import backgroundImage from '@/assets/background.png';

import { useFullscreen } from '@/lib/hook';
import { useQuery } from '@tanstack/react-query';
import { API_QUERY_KEYS, API_SERVICES } from '@/lib/api';
import {
  CommentStatus,
  CommentType,
  WebSocketActionType
} from '@instasync/shared';
import { CommentCard } from '@/components/CommentCard';
import { SYSTEM_DEFAULT_COMMENTS } from '@/lib/constants';
import useWebSocketStore from '@/store/websocketStore';
import { QrcodeBlock } from '@/components/QrcodeBlock';

export const PhotoWall = () => {
  const swiperStageRef = useRef<HTMLDivElement>(null);
  const { toggleFullscreen } = useFullscreen(swiperStageRef, () => {});
  const swiperRef = useRef<SwiperRef | null>(null);

  const {
    data: comments,
    isLoading,
    refetch
  } = useQuery({
    queryKey: API_QUERY_KEYS.comment.filter({
      status: CommentStatus.APPROVED,
      hidden: false,
      type: CommentType.PHOTO,
      size: 15
    }),
    queryFn: async () => {
      const swiper = swiperRef.current?.swiper;

      swiper?.autoplay.stop();
      const comments = await API_SERVICES.getComments({
        status: CommentStatus.APPROVED,
        hidden: false,
        type: CommentType.PHOTO,
        size: 15
      });
      // trigger autoplay in next tick to fix autoplay not working after updating photos
      setTimeout(() => {
        swiper?.autoplay.start();
      }, 100);

      if (comments.length < 10) {
        return [...SYSTEM_DEFAULT_COMMENTS, ...comments];
      }
      return comments;
      // .sort(() => Math.random() - 0.5);
    },
    refetchInterval: 30000
  });

  const subscribeWSMessage = useWebSocketStore((state) => state.subscribe);

  useEffect(() => {
    const unsubscribe = subscribeWSMessage((message) => {
      if (message.type === WebSocketActionType.REFRESH_PHOTO_WALL) {
        refetch();
      }
    });
    return () => {
      unsubscribe();
    };
  }, [refetch]);

  if (isLoading || !comments) return <div>Loading...</div>;

  return (
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

      <Swiper
        ref={swiperRef}
        slidesPerView={3}
        centeredSlides={true}
        spaceBetween={10}
        loop
        loopAdditionalSlides={2}
        grabCursor={true}
        autoplay={{
          delay: 2000,
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
            <CommentCard {...comment} />
          </SwiperSlide>
        ))}
      </Swiper>

      <QrcodeBlock
        className="absolute bottom-6 right-6 w-20"
        value={`${location.origin}/guest?mode=photo`}
      />
    </Card>
  );
};
