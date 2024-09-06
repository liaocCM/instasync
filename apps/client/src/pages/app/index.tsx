import React from 'react';

import { RoomMode } from '@instasync/shared';
import { UserTabHeader } from '@/components/UserTabHeader';
import { useGlobalStore } from '@/store/globalStore';
import { PhotoWall } from './PhotoWall';
import { VideoPlayer } from './VideoPlayer';

export const DisplayApp: React.FC = () => {
  const { uiRoomMode } = useGlobalStore((state) => ({
    uiRoomMode: state.uiRoomMode
  }));

  return (
    <div className="flex flex-col gap-3 h-full">
      <UserTabHeader isAdminMode />

      <div className="w-full flex-1 flex flex-col items-center">
        {uiRoomMode === RoomMode.PHOTO && <PhotoWall />}
        {uiRoomMode === RoomMode.VIDEO && <VideoPlayer />}
      </div>
    </div>
  );
};
