import Lottie from 'react-lottie';
import loadingAnimationData1 from '@/assets/lottie/loading-1.json';
import loadingAnimationData2 from '@/assets/lottie/loading-2.json';
import { cn } from '@instasync/shared';

export enum AnimationVariant {
  DOG = 'DOG',
  HEART = 'HEART'
}

const AnimationLoader = ({
  variant,
  words,
  className
}: {
  variant: AnimationVariant;
  words: string[];
  className?: string;
}) => {
  return (
    <div className={cn('flex-1 flex items-center', className)}>
      <div className="pt-3 border-2 shadow-md border-gray-300 rounded-lg mx-auto w-[70%] flex flex-col items-center">
        <div className="text-sm text-gray-500 leading-normal text-center">
          {words.map((word, index) => (
            <div key={word}>
              <span>{word}</span>
              {index < words.length - 1 && <br />}
            </div>
          ))}
        </div>
        <div
          className={
            variant === AnimationVariant.DOG
              ? 'w-[80%]'
              : 'w-[50%] -mt-[8%] mr-[2%]'
          }
        >
          <Lottie
            speed={1}
            isClickToPauseDisabled={true}
            options={{
              loop: true,
              autoplay: true,
              animationData:
                variant === AnimationVariant.DOG
                  ? loadingAnimationData1
                  : loadingAnimationData2,
              rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimationLoader;
