import { cn, Comment } from '@instasync/shared';
import stringWidth from 'string-width';
import { formatDistanceToNow, getUserDefaultAvatarUrl } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { useFullscreen } from '@/lib/hook';

// Custom function to calculate name width
const calculateNameWidth = (name: string) => {
  return name.split('').reduce((width, char) => {
    // Check if the character is Chinese (CJK Unified Ideographs range)
    const isChinese = /[\u4e00-\u9fff]/.test(char);
    return width + (isChinese ? 4 : 1);
  }, 0);
};

export const CommentCard: React.FC<{
  comment: Comment;
  size?: 'default' | 'sm';
}> = ({ comment, size = 'default' }) => {
  const { photoUrl, thumbnailUrl, content, user, createdAt } = comment;
  const nameRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // const { isFullscreen } = useFullscreen();

  const updateFontSize = () => {
    if (nameRef.current) {
      const containerWidth = nameRef.current.offsetWidth;
      const nameWidth = calculateNameWidth(user?.name || '');

      // Base font size in pixels (assuming 16px as the browser default)
      const baseFontSize = size === 'sm' ? 8 : 10;

      // Calculate fontSize in rem, clamped between 0.875rem (14px) and 1.5rem (24px)
      const fontSize = Math.max(
        1,
        Math.min(2, containerWidth / nameWidth / baseFontSize)
      );

      nameRef.current.style.setProperty(
        '--dynamic-font-size',
        `${fontSize}rem`
      );
    }
    if (contentRef.current) {
      const containerWidth = contentRef.current.offsetWidth;
      const contentWidth = calculateNameWidth(content || '');

      // Base font size in pixels (assuming 16px as the browser default)
      const baseFontSize = size === 'sm' ? 6 : 8;

      // Calculate fontSize in rem, clamped between 0.875rem (14px) and 1.5rem (24px)
      const fontSize = Math.max(
        size === 'sm' ? 1.1 : 0.9,
        Math.min(1.8, containerWidth / contentWidth / baseFontSize)
      );

      // console.log('content width', containerWidth);
      // console.log('content width', contentWidth);
      // console.log('content fontSize', fontSize);

      contentRef.current.style.setProperty(
        '--dynamic-font-size',
        `${fontSize}rem`
      );
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      updateFontSize();
    }, 1000);
    return () => clearInterval(interval);
  }, [user?.name, content]);

  return (
    <div className="flex flex-col pt-1 md:pt-2 bg-background w-full h-full rounded-[inherit] overflow-hidden">
      {/* avatar and username */}
      <div className="flex items-center pb-[0.1rem] md:pb-[0.2rem]">
        <div
          className={cn(
            'avatar w-[10%] ml-[4%] mr-[3%] aspect-square rounded-full overflow-hidden border-2 border-gray-300',
            size === 'sm' && 'w-[13%]'
          )}
        >
          <img
            className="w-full h-full object-cover"
            src={user?.profilePicture || getUserDefaultAvatarUrl(user?.id)}
            alt={user?.name}
          />
        </div>

        <div className="flex-1 pr-2 text-left flex gap-1 items-center overflow-hidden text-stroke-sm">
          <span
            ref={nameRef}
            className="flex-1 truncate text-secondary"
            style={{ fontSize: 'var(--dynamic-font-size, 16px)' }}
          >
            {user?.name}
          </span>

          <span className="text-sm text-gray-400 whitespace-nowrap">
            {formatDistanceToNow(createdAt)}
          </span>
        </div>
      </div>
      {/* photo and comment */}
      {photoUrl && (
        <div className="w-full aspect-square relative overflow-hidden">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src={photoUrl || thumbnailUrl}
            alt={content}
          />
        </div>
      )}
      {/* basis-0 */}
      {/* rounded-xl border-2 border-muted */}
      <div className="flex-1 w-full rounded-[10px] text-secondary text-stroke-sm">
        <div
          ref={contentRef}
          className={cn(
            'max-h-[100%] top-[50%] relative translate-y-[-50%] overflow-hidden mx-[2%] p-[1%] whitespace-pre-wrap leading-2',
            photoUrl ? 'text-xl two-line-overflow-ellipsis' : 'text-3xl',
            // photoUrl && content.length >= 20 && 'text-lg',
            'whitespace-pre-wrap'
          )}
          style={photoUrl ? { fontSize: 'var(--dynamic-font-size, 16px)' } : {}}
        >
          {content || user?.name + ':'}
        </div>
      </div>
    </div>
  );
};
