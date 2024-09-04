import { useGlobalStore } from '@/store/globalStore';
import { Loader } from 'lucide-react';
import backgroundImage from '@/assets/entry-background.png';

export const Loading: React.FC = () => {
  const loading = useGlobalStore((state) => state.loading);

  if (!loading) return null;

  return (
    <div
      className="fixed inset-0 w-full h-dvh-app flex items-center justify-center text-xl text-primary z-50 font-bold"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Loader className="mr-2 animate-spin duration-30000" /> LOADING...
    </div>
  );
};
