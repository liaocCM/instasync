import { cn, Comment } from '@instasync/shared';
// import { Textfit } from 'react-textfit';

// import defaultPhoto1 from '@/assets/default-photo-1.jpg';
import { formatDistanceToNow, getUserDefaultAvatarUrl } from '@/lib/utils';

export const CommentCard: React.FC<Comment> = (props) => {
  const { photoUrl, thumbnailUrl, content, user, createdAt } = props;

  return (
    <div className="flex flex-col pt-2 bg-background w-full h-full rounded-[inherit] overflow-hidden">
      {/* avatar and username */}
      <div className="flex items-center pb-2">
        <div className="avatar w-[10%] ml-[5%] mr-[3%] aspect-square rounded-full overflow-hidden border-2 border-gray-300">
          <img
            className="w-full h-full object-cover"
            src={user.profilePicture || getUserDefaultAvatarUrl(user.id)}
            alt={user.name}
          />
        </div>
        <div className="flex-1 pr-4 text-left flex gap-1 items-center overflow-hidden text-stroke-sm">
          <span
            className={cn(
              'flex-1 truncate text-secondary',
              user.name.length >= 5 ? 'text-md' : 'text-2xl'
            )}
          >
            {user.name}
          </span>
          <span className="text-lg text-gray-500">
            {formatDistanceToNow(createdAt)}
          </span>
        </div>
      </div>
      {/* photo and comment */}
      {photoUrl && (
        <div className="h-0 w-full pb-[100%] relative overflow-hidden">
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
          className={cn(
            'max-h-[100%] top-[50%] relative translate-y-[-50%] overflow-hidden mx-[2%] p-[1%]',
            photoUrl ? 'text-2xl two-line-overflow-ellipsis' : 'text-3xl',
            photoUrl && content.length >= 20 && 'text-lg'
          )}
        >
          {content}
        </div>
      </div>
    </div>
  );
};
