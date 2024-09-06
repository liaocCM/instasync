import React, { useRef, useState } from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from '@instasync/ui/ui/drawer';
import { Switch } from '@instasync/ui/ui/switch';
import { API_QUERIES, API_SERVICES } from '@/lib/api';
import { RoomMode, WebSocketActionType } from '@instasync/shared';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@instasync/ui/ui/input';
import { Button } from '@instasync/ui/ui/button';
import { toast } from '@instasync/ui/ui/sonner';
import useWebSocketStore from '@/store/websocketStore';

export const ConfigDrawer: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [open, setOpen] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: room } = API_QUERIES.useGetDefaultRoom();
  const sendWSMessage = useWebSocketStore((state) => state.sendMessage);

  if (!room) return <>Cannot find room</>;

  const { mutate: updateRoom } = useMutation({
    mutationFn: (enableModes: RoomMode[]) => {
      return API_SERVICES.updateRoom(room.id, { enableModes });
    }
  });

  const toggleMode = (mode: RoomMode) => {
    const newModes = room.enableModes.includes(mode)
      ? room.enableModes.filter((m) => m !== mode)
      : [...room.enableModes, mode];
    updateRoom(newModes);
  };

  const handleUpdateGameScore = () => {
    inputRef.current?.focus();
    sendWSMessage({
      type: WebSocketActionType.BROADCAST_CLIENTS,
      data: {
        gameScore
      }
    });

    toast.success('更新成功', {
      position: 'bottom-center'
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-[50%]">
        <div className="p-4 px-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span>聊天室狀態: </span>
            <Switch
              size="sm"
              checked={room?.enableModes.includes(RoomMode.VIDEO)}
              onCheckedChange={() => toggleMode(RoomMode.VIDEO)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span>祝福牆狀態: </span>
            <Switch
              size="sm"
              checked={room?.enableModes.includes(RoomMode.PHOTO)}
              onCheckedChange={() => toggleMode(RoomMode.PHOTO)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="whitespace-nowrap">遊戲分數: </div>
            <Input
              ref={inputRef}
              type="number"
              onChange={(e) => setGameScore(+e.target.value)}
              placeholder="請輸入遊戲分數"
              className="h-8 max-w-[200px]"
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateGameScore();
                }
              }}
            />
            <Button size="xs" onClick={handleUpdateGameScore}>
              更新
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
