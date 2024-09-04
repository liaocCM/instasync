import { Drawer, DrawerContent } from '@instasync/ui/ui/drawer';
import { Comment, CommentStatus } from '@instasync/shared';
import { formatDistanceToNow } from '@/lib/utils';
import {
  Loader,
  CircleCheck,
  XCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@instasync/ui/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_QUERY_KEYS, API_SERVICES } from '@/lib/api';

export const CommentDetails: React.FC<{
  open: boolean;
  comment: Comment | null;
  setOpen: (open: boolean) => void;
}> = ({ open, setOpen, comment }) => {
  if (!comment) return null;
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <div className="flex flex-col gap-3 items-center pt-5 pb-10">
          <div className="flex space-x-3 mx-auto w-[90%] items-start">
            {comment.thumbnailUrl && (
              <img
                src={comment.thumbnailUrl}
                alt="comment"
                className="w-[40%] object-cover rounded-md mt-1"
              />
            )}
            <div className="flex-1 flex flex-col gap-2 text-sm p-1">
              <div>
                <CommentStatusIcon status={comment.status} withText={true} />
              </div>
              <div>
                <span className="font-bold mr-2">{comment.user?.name}</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(comment.createdAt)}
                </span>
              </div>
              <i className="text-muted-foreground"> {comment.content}</i>
            </div>
          </div>
          <div className="text-center">
            <CommentActionButtons
              comment={comment}
              withText={true}
              onUpdate={() => setOpen(false)}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export const CommentStatusIcon: React.FC<{
  status: CommentStatus;
  withText?: boolean;
}> = ({ status, withText = false }) => {
  const statusConfig = {
    [CommentStatus.PENDING]: {
      icon: Loader,
      className: 'text-blue-500',
      iconClass: 'animate-spin duration-1000',
      text: '審核中'
    },
    [CommentStatus.APPROVED]: {
      icon: CircleCheck,
      className: 'text-green-700',
      iconClass: '',
      text: '已發佈'
    },
    [CommentStatus.REJECTED]: {
      icon: XCircle,
      className: 'text-orange-500',
      iconClass: '',
      text: '已禁止'
    }
  };

  const config = statusConfig[status];
  if (!config) return null;

  return (
    <span className={`flex items-center space-x-1 ${config.className}`}>
      <config.icon className={`w-5 h-5 ${config.iconClass}`} />
      {withText && <span className="font-bold">{config.text}</span>}
    </span>
  );
};

export const CommentActionButtons: React.FC<{
  comment: Comment;
  withText?: boolean;
  onUpdate?: (comment: Comment) => void;
}> = ({ comment, withText = false, onUpdate }) => {
  const queryClient = useQueryClient();

  const { mutate: updateComment } = useMutation({
    mutationFn: (data: Partial<Comment>) =>
      API_SERVICES.updateComment(comment.id, data),
    onSuccess: (updatedComment) => {
      queryClient.invalidateQueries({
        queryKey: API_QUERY_KEYS.comment.base
      });
      onUpdate?.(updatedComment);
      // queryClient.setQueryData(
      //   API_QUERY_KEYS.comment.base,
      //   (oldData: Comment[] | undefined) => {
      //     if (!oldData) return oldData;
      //     return oldData.map((c) =>
      //       c.id === updatedComment.id ? updatedComment : c
      //     );
      //   }
      // );
    }
  });

  const handleApprove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    updateComment({ status: CommentStatus.APPROVED });
  };

  const handleReject = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    updateComment({ status: CommentStatus.REJECTED });
  };

  const toggleDisplay = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    updateComment({ hidden: !comment.hidden });
  };

  return (
    <div className="flex justify-center">
      {(comment.status === CommentStatus.PENDING ||
        comment.status === CommentStatus.REJECTED) && (
        <>
          {comment.status !== CommentStatus.REJECTED && (
            <Button
              size="xs"
              className="mr-1"
              variant="outline"
              onClick={handleReject}
            >
              <XCircle className="w-4 h-4" />
              {withText && <span className="font-bold ml-1">拒絕</span>}
            </Button>
          )}
          <Button size="xs" variant="secondary" onClick={handleApprove}>
            <CheckCircle className="w-4 h-4" />
            {withText && <span className="font-bold ml-1">通過</span>}
          </Button>
        </>
      )}
      {comment.status === CommentStatus.APPROVED && (
        <Button size="xs" variant="outline" onClick={toggleDisplay}>
          {comment.hidden ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
          {withText && (
            <span className="font-bold ml-1">
              {comment.hidden ? '顯示' : '隱藏'}
            </span>
          )}
        </Button>
      )}
    </div>
  );
};
