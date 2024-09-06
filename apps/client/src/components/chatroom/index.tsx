import { useEffect, useRef, useState } from 'react';
import { ChevronsDown, SendHorizontal, TriangleAlert } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import dayjs from 'dayjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@instasync/ui/ui/input';
import { ScrollArea } from '@instasync/ui/ui/scroll-area';
import { toast } from '@instasync/ui/ui/sonner';
import {
  cn,
  RoomMode,
  Comment,
  WebSocketActionType,
  WebSocketMessageData,
  CommentType
} from '@instasync/shared';
import { debounce } from '@/lib/utils';
import { useRateLimiter } from '@/lib/hook';
import { API_QUERIES, API_QUERY_KEYS, API_SERVICES } from '@/lib/api';
import { WELCOME_COMMENT } from '@/lib/constants';
import { useGlobalStore } from '@/store/globalStore';
import { useUserStore } from '@/store/userStore';
import useWebSocketStore from '@/store/websocketStore';
import AnimationLoader, { AnimationVariant } from '../AnimationLoader';
import { ChatroomComment, DisplayComment } from './ChatroomComment';
import { ColorPicker } from './ColorPicker';
export const Chatroom: React.FC<{
  className?: string;
  prefetchCommentsize?: number;
}> = ({ className = '', prefetchCommentsize = 20 }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isRateLimitReached, setIsRateLimitReached] = useState(false);
  const [displayComments, setDisplayComments] = useState<DisplayComment[]>([
    WELCOME_COMMENT
  ]);
  const [inputWasFocused, setInputWasFocused] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');

  const clearFocusTimeout = useRef<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const checkRateLimit = useRateLimiter(2, 5000);

  const { data: room } = API_QUERIES.useGetDefaultRoom();
  const uiRoomMode = useGlobalStore((state) => state.uiRoomMode);
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

  const { currentUser, isUserAdmin } = useUserStore((state) => ({
    currentUser: state.user,
    isUserAdmin: state.computed.isAdmin
  }));

  const { subscribeWSMessage } = useWebSocketStore(
    useShallow((state) => ({
      sendMessage: state.sendMessage,
      subscribeWSMessage: state.subscribe
    }))
  );

  const { mutate: createComment } = useMutation({
    mutationFn: API_SERVICES.createComment
  });

  useEffect(() => {
    if (displayComments.length === 1 && prevComments) {
      setDisplayComments((currentDisplayComments) => [
        ...currentDisplayComments,
        ...prevComments.map((comment) => ({
          ...comment,
          isSystem: false,
          username: comment.user.name,
          timestamp: comment.createdAt ? +new Date(comment.createdAt) : 0,
          color: comment.color || '',
          photoUrl: comment.photoUrl || '',
          hidden: false
        }))
      ]);
    }
    scrollToBottom();
  }, [prevComments]);

  const scrollToBottom = () => {
    setTimeout(
      () =>
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        }),
      200
    );
  };

  const handleSendMessage = (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation();
    if (!inputMessage) return;
    if (inputMessage.length > 20) {
      toast.warning('訊息長度不可超過20個字...');
      return;
    }

    // Use setTimeout to refocus after the click event has finished processing
    if (inputWasFocused) {
      inputRef.current?.focus();
      setInputWasFocused(true);
      if (clearFocusTimeout.current) {
        clearTimeout(clearFocusTimeout.current);
      }
    }

    if (!checkRateLimit() && !isUserAdmin) {
      // toast.warning('您傳送訊息的速度過快，請稍後再試');
      setIsRateLimitReached(true);
      setTimeout(() => {
        setIsRateLimitReached(false);
      }, 2500);
      return;
    }

    createComment({
      userId: currentUser?.id ?? '',
      content: inputMessage.trim(),
      type: CommentType.VIDEO,
      roomId: room?.id ?? '',
      color: selectedColor
    });

    setInputMessage('');

    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

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

  // Add focus and blur event listeners to track the delayed focus state
  // for fixing the issue on mobile browser
  useEffect(() => {
    const inputElement = inputRef.current;
    const handleFocus = () => setInputWasFocused(true);
    const handleBlur = () => {
      clearFocusTimeout.current = setTimeout(() => {
        setInputWasFocused(false);
      }, 100);
    };
    inputElement?.addEventListener('focus', handleFocus);
    inputElement?.addEventListener('blur', handleBlur);

    return () => {
      inputElement?.removeEventListener('focus', handleFocus);
      inputElement?.removeEventListener('blur', handleBlur);
    };
  }, []);

  if (uiRoomMode !== RoomMode.VIDEO) {
    return null;
  }

  if (!room?.enableModes.includes(RoomMode.VIDEO) && !isUserAdmin) {
    return (
      <AnimationLoader
        variant={AnimationVariant.DOG}
        words={['聊天室暫時關閉', '晚點再過來看看吧!']}
      />
    );
  }

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
        {/* Scroll to bottom hint */}
        <div
          className={cn(
            'absolute bottom-3 rounded-md border border-gray-300 p-2 left-1/2 -translate-x-1/2 text-xs bg-background cursor-pointer transition-all duration-300 ease-in-out shadow-md',
            isAtBottom
              ? 'opacity-0 pointer-events-none translate-y-2'
              : 'opacity-100 translate-y-0'
          )}
          onClick={scrollToBottom}
        >
          <div className="flex flex-row gap-1 items-center">
            查看最新訊息{' '}
            <ChevronsDown className="w-4 h-4 animate-chevron-down" />
          </div>
        </div>
      </ScrollArea>
      {/* Input Area */}
      <div
        className={cn(
          'p-[0.625rem] transition-[padding] duration-300 ease-in-out relative border-t border-gray-200',
          isRateLimitReached && 'pt-8'
        )}
      >
        {/* Hint Message */}
        <div
          className={cn(
            'text-xs text-gray-500 flex flex-row gap-1 items-center whitespace-nowrap',
            'absolute left-1/2 -translate-x-1/2 top-2',
            'transition-[opacity] duration-300 ease-in-out',
            isRateLimitReached ? 'opacity-100 pointer-events-none' : 'opacity-0'
          )}
        >
          <TriangleAlert className="w-3 h-3 mt-[0rem]" />
          您傳送訊息的速度過快，請稍後再試
        </div>

        <div className={cn('flex flex-row relative items-center')}>
          {/* Color Picker */}
          <ColorPicker
            color={selectedColor}
            setColor={setSelectedColor}
            className="pr-2"
          />
          {/* Message Input */}
          <Input
            ref={inputRef}
            className={cn(
              'bg-gray-100 focus-visible:border-0 h-8 py-1 px-2',
              'transition-[width] duration-300 ease-in-out',
              !isUserAdmin && 'focus-visible:ring-secondary'
            )}
            style={{
              width:
                inputWasFocused || inputMessage
                  ? 'calc(100% - 4rem)'
                  : 'calc(100% - 1.5rem)'
            }}
            placeholder="請輸入訊息"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            maxLength={20}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(e);
              }
            }}
          />
          {/* Send Button */}
          <div
            className={cn(
              'p-2 pr-3 transition-all duration-350 text-primary absolute top-1/2 -translate-y-1/2 -right-1.5 cursor-pointer',
              inputWasFocused || inputMessage
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 pointer-events-none -translate-x-2',
              'active:scale-75'
            )}
            onClick={handleSendMessage}
          >
            <SendHorizontal
              className={cn('w-5 h-5', !isUserAdmin && 'text-secondary')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
