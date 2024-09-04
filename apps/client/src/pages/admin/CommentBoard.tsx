import { API_QUERY_KEYS, API_SERVICES } from '@/lib/api';
import {
  cn,
  CommentType,
  WebSocketActionType
} from '@instasync/shared';
import { Button } from '@instasync/ui/ui/button';
import { Input } from '@instasync/ui/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@instasync/ui/ui/table';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from '@/lib/utils';
import { Comment } from '@instasync/shared';
import { ScrollArea } from '@instasync/ui/ui/scroll-area';
import {
  CommentDetails,
  CommentActionButtons,
  CommentStatusIcon
} from './CommontDetail';
import useWebSocketStore from '@/store/websocketStore';
import { toast } from '@instasync/ui/ui/sonner';

const queryFilter = { type: CommentType.PHOTO, sortBy: 'createdAt:desc' };

export const CommentBoard: React.FC<{ className?: string }> = ({
  className = ''
}) => {
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isOpenCommentDetails, setIsOpenCommentDetails] = useState(false);

  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [pendingCommentsCount, setPendingCommentsCount] = useState(0);
  const subscribeWSMessage = useWebSocketStore((state) => state.subscribe);

  const {
    data: comments,
    isLoading,
    refetch
  } = useQuery({
    queryKey: API_QUERY_KEYS.comment.filter(queryFilter),
    queryFn: () => API_SERVICES.getComments(queryFilter),
    staleTime: 30 * 1000
  });

  const filteredComments =
    comments?.filter((comment) =>
      comment.content.toLowerCase().includes(filter.toLowerCase())
    ) || [];

  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);
  const paginatedComments = filteredComments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const unsubscribe = subscribeWSMessage((message) => {
      if (
        message.type === WebSocketActionType.ADD_COMMENT &&
        message.data.type === CommentType.PHOTO
      ) {
        setPendingCommentsCount((prev) => prev + 1);
      }
    });
    return () => unsubscribe();
  }, []);

  const onOpenCommentDetails = (comment: Comment) => {
    setSelectedComment(comment);
    setIsOpenCommentDetails(true);
  };

  const handleRefresh = () => {
    refetch().then(() => {
      setPendingCommentsCount(0);
      toast.info('資料已更新');
    });
  };

  return (
    <div className={cn('flex flex-col space-y-4 px-2 h-full', className)}>
      {/* Table with filters */}
      <ScrollArea className="flex-1 overflow-y-auto basis-0 text-xs">
        <div className="flex items-center mt-1 justify-between">
          <Input
            placeholder="搜尋留言"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-[200px] h-7 text-xs mt-1"
          />
          <div
            className={cn(
              'flex items-center gap-1 text-xs text-gray-500 font-bold pr-2 border border-gray-200 rounded p-1 px-2 cursor-pointer',
              pendingCommentsCount > 0 && 'text-primary animate-pulse',
              isLoading && 'animate-bounce'
            )}
            onClick={handleRefresh}
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh ({pendingCommentsCount})
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead size="xs" className="w-[13%] text-center">
                IMG
              </TableHead>
              <TableHead size="xs" className="text-center">
                DETAILS
              </TableHead>
              <TableHead size="xs" className="w-[10%]"></TableHead>
              <TableHead size="xs" className="w-[10%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedComments.map((comment) => (
              <TableRow
                key={comment.id}
                onClick={() => {
                  onOpenCommentDetails(comment);
                }}
                className="cursor-pointer"
              >
                <TableCell size="xs" className="text-center p-0">
                  {comment.thumbnailUrl ? (
                    <img
                      src={comment.thumbnailUrl}
                      alt="thumbnail"
                      className="w-full object-cover rounded"
                    />
                  ) : (
                    '🗒️'
                  )}
                </TableCell>
                <TableCell size="xs">
                  <div className="text-[12px] text-secondary font-bold">
                    {comment.user?.name}:
                  </div>
                  <div className="one-line-overflow-ellipsis text-[12px]">
                    {comment.content}
                  </div>
                  <div className="text-gray-400 text-[10px]">
                    {formatDistanceToNow(comment.createdAt)}
                  </div>
                </TableCell>
                <TableCell size="xs">
                  <CommentStatusIcon status={comment.status} />
                </TableCell>
                <TableCell size="xs" className="text-center">
                  <CommentActionButtons comment={comment} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      {/* Pagination */}
      <div className="flex justify-between items-center pb-2 px-2 text-xs">
        <span className="text-gray-500 font-bold">
          Page {currentPage} of {totalPages}
        </span>

        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            variant="outline"
            size="xs"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <CommentDetails
        open={isOpenCommentDetails}
        setOpen={setIsOpenCommentDetails}
        comment={selectedComment}
      />
    </div>
  );
};
