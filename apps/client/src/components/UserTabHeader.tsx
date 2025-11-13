import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@instasync/ui/ui/tabs';
import { useUserStore } from '@/store/userStore';
import { getUserDefaultAvatarUrl } from '@/lib/utils';
import { useGlobalStore } from '@/store/globalStore';
import { cn, RoomMode } from '@instasync/shared';
import { useShallow } from 'zustand/react/shallow';
import { Settings, Swords } from 'lucide-react';
import { Button } from '@instasync/ui/ui/button';
import { useNavigate } from 'react-router-dom';
import { ConfigDrawer } from './ConfigDrawer';

interface UserTabHeaderProps {
  isAdminMode?: boolean;
}

export const UserTabHeader: React.FC<UserTabHeaderProps> = ({
  isAdminMode = false
}) => {
  const navigate = useNavigate();
  const { uiRoomMode, setState } = useGlobalStore((state) => ({
    uiRoomMode: state.uiRoomMode,
    setState: state.setState
  }));

  const { currentUser } = useUserStore(
    useShallow((state) => ({
      currentUser: state.user
    }))
  );

  const [pressTimer, setPressTimer] = React.useState<number | null>(null);

  const handlePressStart = () => {
    setPressTimer(
      setTimeout(() => {
        navigate(`/${isAdminMode ? 'wedding/guest' : 'admin'}${location.search}`);
      }, 3000)
    );
  };

  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  return (
    <div className="flex justify-between items-center px-3 py-2 border-b-2 border-gray-300">
      <div className="flex items-center gap-2">
        <img
          className="w-8"
          src={
            currentUser?.profilePicture ||
            getUserDefaultAvatarUrl(currentUser?.id ?? '')
          }
          alt={currentUser?.name}
        />
        <span
          className={cn(
            'text-xs whitespace-nowrap flex items-center gap-1 font-bold',
            isAdminMode ? 'text-primary' : 'text-secondary'
          )}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
        >
          {isAdminMode && <Swords className="w-4 h-4" />}
          {currentUser?.name}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Tabs
          value={uiRoomMode}
          onValueChange={(value) => {
            setState({ uiRoomMode: value as RoomMode });
          }}
          className="text-center"
        >
          <TabsList
            className={cn('gap-1 h-8 px-2', isAdminMode ? 'bg-card' : '')}
          >
            <TabsTrigger
              value={RoomMode.VIDEO}
              className="text-xs px-[0.6rem] py-1"
              variant={isAdminMode ? 'primary' : 'secondary'}
            >
              聊天室
            </TabsTrigger>
            <TabsTrigger
              value={RoomMode.PHOTO}
              className="text-xs px-[0.6rem] py-1"
              variant={isAdminMode ? 'primary' : 'secondary'}
            >
              祝福牆
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {isAdminMode && (
          <ConfigDrawer>
            <Button
              size="xs"
              variant="default"
              className="text-muted-foreground bg-card text-primary hover:bg-card py-4 px-2"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </ConfigDrawer>
        )}
      </div>
    </div>
  );
};
