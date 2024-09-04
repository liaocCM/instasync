import React from 'react';
import { Chatroom } from '../../components/chatroom';
import { PhotoPost } from './photo-post/PhotoPost';
import { cn, RoomMode } from '@instasync/shared';
import { UserTabHeader } from '@/components/UserTabHeader';
import { useGlobalStore } from '@/store/globalStore';

export const Guest: React.FC = () => {
  const { uiRoomMode } = useGlobalStore((state) => ({
    uiRoomMode: state.uiRoomMode
  }));

  return (
    <div className="flex flex-col gap-2 h-full">
      <UserTabHeader />

      <Chatroom className={cn(uiRoomMode !== RoomMode.VIDEO && 'hidden')} />
      <PhotoPost className={cn(uiRoomMode !== RoomMode.PHOTO && 'hidden')} />
    </div>
  );
};
