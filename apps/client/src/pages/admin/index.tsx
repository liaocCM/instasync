import React from 'react';
import { CommentBoard } from './CommentBoard';
import { Chatroom } from '../../components/chatroom';
import { cn, RoomMode } from '@instasync/shared';
import { UserTabHeader } from '@/components/UserTabHeader';
import { useGlobalStore } from '@/store/globalStore';

export const AdminControlPanel: React.FC = () => {
  const { uiRoomMode } = useGlobalStore((state) => ({
    uiRoomMode: state.uiRoomMode
  }));

  return (
    <div className="flex flex-col gap-0 h-full">
      <UserTabHeader isAdminMode />
      <Chatroom
        className={cn(uiRoomMode !== RoomMode.VIDEO && 'hidden')}
        prefetchCommentsize={50}
      />
      <CommentBoard className={cn(uiRoomMode !== RoomMode.PHOTO && 'hidden')} />
    </div>
  );
};
