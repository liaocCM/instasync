import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Pagination } from 'swiper/modules';
import { useQuery } from '@tanstack/react-query';
import Lottie from 'react-lottie';
//
import { Button } from '@instasync/ui/ui/button';

import { API_QUERIES, API_QUERY_KEYS, API_SERVICES } from '@/lib/api';
import { useUserStore } from '@/store/userStore';
import { EditPhotoPostDrawer } from './PhotoPostDrawer';
import emptyAnimationData from '@/assets/lottie/crying-yabi.json';
import { CommentCard } from '@/components/CommentCard';

import 'swiper/css/effect-cards';
import 'swiper/css/pagination';
import { cn, RoomMode, CommentType } from '@instasync/shared';
import { useGlobalStore } from '@/store/globalStore';
import { Spinner } from '@instasync/ui/ui/spinner';
import AnimationLoader, {
  AnimationVariant
} from '@/components/AnimationLoader';

export const PhotoPost: React.FC<{ className?: string }> = ({
  className = ''
}) => {
  const uiRoomMode = useGlobalStore((state) => state.uiRoomMode);
  const { data: serverRoom } = API_QUERIES.useGetDefaultRoom();
  const currentUser = useUserStore((state) => state.user);

  const { data: comments, isLoading } = useQuery({
    queryKey: API_QUERY_KEYS.comment.filter({
      userId: currentUser?.id || '',
      type: CommentType.PHOTO
    }),
    queryFn: () =>
      API_SERVICES.getComments({
        userId: currentUser?.id || '',
        type: CommentType.PHOTO,
        sortBy: 'createAt:desc'
      })
  });

  // must return null if not in photo mode because swiperjs requires DOM elements to do calculations
  if (uiRoomMode !== RoomMode.PHOTO) {
    return null;
  }

  if (!serverRoom?.enableModes.includes(RoomMode.PHOTO)) {
    return (
      <AnimationLoader
        variant={AnimationVariant.HEART}
        words={['祝福牆還沒開放哦', '晚點再過來看看吧！']}
      />
    );
  }

  if (isLoading) {
    return <Spinner />;
  }

  // const pagination = {
  //   clickable: true,
  //   renderBullet: function (index: number, className: string) {
  //     return '<span class="' + className + '">' + (index + 1) + '</span>';
  //   },
  // };

  return (
    <div id="photo-posted" className={cn('flex-1 flex flex-col', className)}>
      <div className="flex-1 overflow-y-auto basis-0 relative flex justify-center items-center overflow-x-hidden">
        {/* SWIPER */}
        {comments && comments?.length > 0 && (
          <>
            {/* <div className="absolute left-1/2 -translate-x-1/2 text-xs text-gray-500 top-[0.4rem]">
              左右滑動來查看上傳的祝福
            </div> */}
            <div className="swiper-container overflow-hidden absolute">
              <Swiper
                key={comments?.map((comment) => comment.id).join('-')}
                slidesPerView={2}
                centeredSlides={true}
                grabCursor={true}
                effect="cards"
                pagination={{
                  dynamicBullets: true
                }}
                modules={[EffectCards, Pagination]}
              >
                {comments?.map((comment) => (
                  <SwiperSlide key={comment.id}>
                    <CommentCard {...comment} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </>
        )}

        {/* EMPTY STATE */}
        {comments?.length === 0 && (
          <div className="text-center text-sm text-gray-500 absolute top-1/5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <Lottie
              speed={1.25}
              options={{
                loop: true,
                autoplay: true,
                animationData: emptyAnimationData,
                rendererSettings: {
                  preserveAspectRatio: 'xMidYMid slice'
                }
              }}
            />
            <div className="text-sm">噢... 宏修跟怡臻還沒有收到你的祝福</div>
          </div>
        )}
      </div>

      <div className="p-3 w-full text-center animate-ripple">
        <EditPhotoPostDrawer>
          <Button className="w-[75%] h-9">上傳照片</Button>
        </EditPhotoPostDrawer>
      </div>
    </div>
  );
};
