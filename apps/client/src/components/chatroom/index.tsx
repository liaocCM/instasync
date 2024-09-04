import { useEffect, useRef, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import useWebSocketStore from '@/store/websocketStore';
import {
  cn,
  RoomMode,
  Comment,
  WebSocketActionType,
  WebSocketMessageData,
  CommentType
} from '@instasync/shared';
// import { Button } from '@instasync/ui/ui/button';
import { Input } from '@instasync/ui/ui/input';
import { ChevronsDown, SendHorizontal } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { ScrollArea } from '@instasync/ui/ui/scroll-area';
import { debounce } from '@/lib/utils';
import dayjs from 'dayjs';
import { ChatroomComment, DisplayComment } from './ChatroomComment';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_QUERY_KEYS, API_SERVICES } from '@/lib/api';
import { useGlobalStore } from '@/store/globalStore';
import { toast } from '@instasync/ui/ui/sonner';

const WELCOME_COMMENT = {
  id: '-',
  isSystem: true,
  userId: 'SYSTEM',
  username: 'SYSTEM',
  content: '歡迎來到聊天室，輸入訊息來發送彈幕 :D',
  type: CommentType.VIDEO,
  photoUrl: '',
  hidden: false
};

export const Chatroom: React.FC<{
  className?: string;
  prefetchCommentsize?: number;
}> = ({ className = '', prefetchCommentsize = 20 }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);

  const queryClient = useQueryClient();

  const { data: prevComments } = useQuery({
    queryKey: API_QUERY_KEYS.comment.filter({
      type: RoomMode.VIDEO,
      size: prefetchCommentsize
    }),
    queryFn: () =>
      API_SERVICES.getComments({
        type: CommentType.VIDEO,
        size: prefetchCommentsize
      }),
    staleTime: 5 * 1000
  });

  const [displayComments, setDisplayComments] = useState<DisplayComment[]>([
    WELCOME_COMMENT
  ]);

  useEffect(() => {
    if (displayComments.length === 1) {
      setDisplayComments([
        ...displayComments,
        ...(prevComments?.map((comment) => ({
          ...comment,
          isSystem: false,
          username: comment.user.name,
          timestamp: comment.createdAt ? +new Date(comment.createdAt) : 0
        })) || [])
      ]);
    }
    scrollToBottom();
  }, [prevComments, displayComments]);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentUser = useUserStore((state) => state.user);
  const room = useGlobalStore((state) => state.room);
  const { subscribeWSMessage } = useWebSocketStore(
    useShallow((state) => ({
      sendMessage: state.sendMessage,
      subscribeWSMessage: state.subscribe
    }))
  );

  const { mutate: createComment, isPending } = useMutation({
    mutationFn: API_SERVICES.createComment
  });

  const scrollToBottom = () => {
    setTimeout(() =>
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    ),
      100;
  };

  const [messageCount, setMessageCount] = useState(0);
  const [lastResetTime, setLastResetTime] = useState(Date.now());
  const MESSAGE_LIMIT = 5;
  const RESET_INTERVAL = 10000; // 10 seconds

  const handleSendMessage = (e: any) => {
    e.stopPropagation();
    if (!inputMessage) return;

    const now = Date.now();
    if (now - lastResetTime >= RESET_INTERVAL) {
      setMessageCount(0);
      setLastResetTime(now);
    }

    if (messageCount >= MESSAGE_LIMIT) {
      toast.warning('您傳送訊息的速度過快，請稍後再試');
      return;
    }

    createComment({
      userId: currentUser?.id ?? '',
      content: inputMessage.trim(),
      type: CommentType.VIDEO,
      roomId: room?.id ?? ''
    });

    setMessageCount((prevCount) => prevCount + 1);
  };

  // setInputMessage('');
  // if (document.activeElement === inputRef.current) {
  // inputRef.current?.focus();
  // }
  // setTimeout(() => {
  //   scrollToBottom();
  // }, 100);
  const onReceiveWebSocketMessage = (message: WebSocketMessageData) => {
    switch (message.type) {
      case WebSocketActionType.ADD_COMMENT:
        if (message.data.type === CommentType.VIDEO) {
          // TODO: Adjust logic
          setDisplayComments((prev) => {
            const shouldReduceMessage =
              prev.length > 100 && prev.length % 50 === 0;
            return [
              ...(shouldReduceMessage ? prev.slice(50) : prev),
              {
                ...message.data,
                isSystem: false,
                time: dayjs().format('HH:mm')
              }
            ];
          });

          const container = chatContainerRef.current;
          if (container) {
            const isAtBottom =
              container.scrollHeight -
                container.scrollTop -
                container.clientHeight <
              200;

            if (isAtBottom) {
              scrollToBottom();
            }
            setIsAtBottom(isAtBottom);
          }
        }
        break;
      case WebSocketActionType.HIDE_SHOW_COMMENT:
        setDisplayComments((prevData) => {
          return prevData.map((item) =>
            item.id === message.data.id
              ? { ...item, hidden: message.data.hidden }
              : item
          );
        });
        queryClient.setQueryData(
          API_QUERY_KEYS.comment.base,
          (prevData: Comment[]) => {
            if (!prevData) return prevData;
            return prevData.map((item) =>
              item.id === message.data.id
                ? { ...item, hidden: message.data.hidden }
                : item
            );
          }
        );
        break;
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeWSMessage(onReceiveWebSocketMessage);

    const container = chatContainerRef.current;
    const detectScrollPosition = debounce(() => {
      if (container) {
        const isAtBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          100;
        setIsAtBottom(isAtBottom);
      }
    }, 200);

    if (container) {
      container.addEventListener('scroll', detectScrollPosition);
    }
    return () => {
      unsubscribe();
      container?.removeEventListener('scroll', detectScrollPosition);
    };
  }, []);

  return (
    <div className={cn('flex-1 flex flex-col', className)}>
      {/* Message Container */}
      <ScrollArea
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto basis-0"
      >
        {displayComments.map((comment, index) => (
          <ChatroomComment key={index} comment={comment} />
        ))}

        <div
          className={cn(
            'absolute bottom-3 rounded-md border border-gray-200 p-2 left-1/2 -translate-x-1/2 text-xs bg-background cursor-pointer transition-all duration-300 ease-in-out',
            isAtBottom
              ? 'opacity-0 pointer-events-none translate-y-2'
              : 'opacity-100 translate-y-0'
          )}
          onClick={scrollToBottom}
        >
          <div className="flex flex-row gap-1 items-center">
            查看最新訊息 <ChevronsDown className="w-4 h-4" />
          </div>
        </div>
      </ScrollArea>
      {/* Input Area */}
      <div className="p-3">
        <div className="flex flex-row gap-2 items-center relative">
          <Input
            ref={inputRef}
            className={cn(
              'bg-gray-100 focus-visible:border-0 h-8 py-1 px-2',
              'transition-[width] duration-200 ease-in-out'
            )}
            style={{
              width: inputMessage ? 'calc(100% - 2.5rem)' : '100%'
            }}
            placeholder="請輸入訊息"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            maxLength={45}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(e);
              }
            }}
          />

          <SendHorizontal
            onClick={(e) => handleSendMessage(e)}
            className={cn(
              'w-4 h-4 transition-all duration-300 text-primary absolute right-2 cursor-pointer',
              !inputMessage
                ? 'opacity-0 pointer-events-none translate-x-2 translate-y-2'
                : 'opacity-100 translate-x-0 translate-y-0'
            )}
          />

          {/* <Button
            className={cn(
              'h-7 transition-all duration-300 absolute right-0',
              !message ? 'opacity-0 pointer-events-none' : 'opacity-100'
            )}
            variant="ghost"
            size="icon"
            onClick={(e) => handleSendMessage(e)}
            // disabled={!message}
          >
            <SendHorizontal
              onClick={(e) => handleSendMessage(e)}
              className={cn(
                'w-4 h-4 transition-all duration-300 text-primary',
                // message ? '-rotate-[30deg]' : 'rotate-0'
              )}
            />
          </Button> */}
        </div>
      </div>
    </div>
  );
};
