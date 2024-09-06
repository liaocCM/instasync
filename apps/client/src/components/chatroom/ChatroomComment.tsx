import { API_SERVICES } from '@/lib/api';
import { useUserStore } from '@/store/userStore';
import { AddCommentData, cn } from '@instasync/shared';
import { Button } from '@instasync/ui/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@instasync/ui/ui/popover';
import { toast } from '@instasync/ui/ui/sonner';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Ban, EyeOff } from 'lucide-react';

const darkenColor = (color: string, amount: number): string => {
  if (color === '' || color === '#fff' || color === '#ffffff') return '';
  const hex = color.replace('#', '');
  const rgb = parseInt(hex, 16);
  const r = Math.max(0, (rgb >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((rgb >> 8) & 0x00ff) - Math.round(255 * amount));
  const b = Math.max(0, (rgb & 0x0000ff) - Math.round(255 * amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export interface DisplayComment extends AddCommentData {
  isSystem: boolean;
  time?: string;
}

export const ChatroomComment: React.FC<{
  comment: DisplayComment;
}> = ({ comment }) => {
  // const queryClient = useQueryClient();
  const isAdmin = useUserStore((state) => state.computed.isAdmin);

  const { mutate: updateComment } = useMutation({
    mutationFn: (data: Partial<DisplayComment>) =>
      API_SERVICES.updateComment(comment.id, data)
    // onSuccess: (updatedComment) => {
    //   queryClient.invalidateQueries({
    //     queryKey: API_QUERY_KEYS.comment.base
    //   });
    // }
  });

  const handleHideComment = () => {
    updateComment({ hidden: true });
    toast.success(`已隱藏訊息`);
  };

  const handleBanUser = async () => {
    await API_SERVICES.updateUser(comment.userId, { banned: true });
    toast.success(`已封鎖使用者 ${comment.username}`);
  };

  const Comment = () => (
    <div className="text-left text-[0.8rem]">
      {isAdmin && (
        <span className="text-gray-400 w-[48px] inline-block">
          {dayjs(comment.timestamp).format('HH:mm')}
        </span>
      )}
      <b className={cn(isAdmin ? 'text-primary' : 'text-secondary')}>
        {comment.username}
      </b>
      <span
        style={{ color: darkenColor(comment.color, 0.4) }}
        className="text-[0.8rem]"
      >
        :{' '}
        {comment.hidden ? (
          <span className="text-[0.75rem] text-gray-400">
            {' <訊息已刪除>'}
          </span>
        ) : (
          comment.content
        )}
      </span>
    </div>
  );

  return (
    <div className="text-sm py-1 px-3">
      {comment.isSystem ? (
        <span className="text-gray-500 text-xs">{comment.content}</span>
      ) : (
        <span className="break-all flex items-center gap-[2px]">
          {isAdmin ? (
            <Popover>
              <PopoverTrigger>
                <Comment />
              </PopoverTrigger>
              <PopoverContent
                className="p-2 text-xs w-auto max-w-[80vw]"
                align="start"
                alignOffset={6}
                sideOffset={6}
                side="bottom"
              >
                <div className="font-bold border-b border-gray-200 pb-1 break-all">
                  {comment.username}
                  {': '}
                  <span
                    className={cn(
                      'text-xs font-normal',
                      comment.hidden && 'text-gray-400'
                    )}
                  >
                    {comment.content}
                  </span>
                </div>
                <div className="mt-1">
                  {!comment.hidden && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handleHideComment}
                    >
                      <EyeOff className="mr-1 w-3 h-3" />
                      隱藏訊息
                    </Button>
                  )}
                  <Button variant="ghost" size="xs" onClick={handleBanUser}>
                    <Ban className="mr-1 w-3 h-3" />
                    封鎖使用者
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Comment />
          )}
        </span>
      )}
    </div>
  );
};
