import { Button } from '@instasync/ui/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@instasync/ui/ui/drawer';
import { ArrowDownUp, ImagePlus, Trash2 } from 'lucide-react';
import { Textarea } from '@instasync/ui/ui/textarea';
import { useRef, useState } from 'react';
import { cn, CommentType } from '@instasync/shared';
import { toast } from '@instasync/ui/ui/sonner';
import {
  ImageCropper,
  ImageCropperRef
} from '../../../components/ImageCropper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_QUERIES, API_QUERY_KEYS, API_SERVICES } from '@/lib/api';
import { useUserStore } from '@/store/userStore';

const MAX_COMMENT_LENGTH = 50;

export const EditPhotoPostDrawer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isCommentError, setIsCommentError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageCropperRef = useRef<ImageCropperRef>(null);

  const currentUser = useUserStore((state) => state.user);
  const { data: room } = API_QUERIES.useGetDefaultRoom();

  const queryClient = useQueryClient();
  const { mutate: createComment, isPending } = useMutation({
    mutationFn: API_SERVICES.createComment,
    onSuccess: async () => {
      await API_SERVICES.delay(500);
      toast.dismiss();
      toast.success('上傳成功');
      queryClient.invalidateQueries({
        queryKey: API_QUERY_KEYS.comment.filter({
          userId: currentUser?.id || '',
          type: CommentType.PHOTO
        })
      });
      setOpen(false);
    }
  });

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(file);

      if (file.size > 5 * 1024 * 1024) {
        toast.error('圖片大小需小於 5 MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setPreviewImageUrl(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetData = () => {
    setPreviewImageUrl(null);
    setComment('');
  };

  const handleSubmit = async () => {
    if (!comment) {
      toast.error('請輸入留言');
      setIsCommentError(true);
      return;
    }
    toast.loading('上傳中...');
    // Create form data for API request
    // const formData = new FormData();
    // formData.append('userId', currentUser?.id ?? '');
    // formData.append('content', comment);
    // formData.append('type', RoomMode.PHOTO);

    // Add cropped image as file if user has uploaded an image
    let photoFile: File | null = null;
    if (previewImageUrl) {
      photoFile = await imageCropperRef.current?.getCroppedImageFile()!;
    }

    createComment({
      userId: currentUser?.id ?? '',
      content: comment,
      type: CommentType.PHOTO,
      roomId: room?.id ?? '',
      ...(photoFile && { photoFile })
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} onClose={resetData}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="font-medium text-center">上傳照片</div>
        <div
          className={cn(
            'w-full flex flex-col gap-3 text-center pt-0 pb-4 px-4'
          )}
        >
          <div className="flex-1 w-[80%] md:max-w-[300px] mx-auto flex flex-col">
            {/* COMMENT */}
            <Textarea
              value={comment}
              onChange={(e) => (
                setComment(e.target.value), setIsCommentError(false)
              )}
              className={cn(
                'mt-2',
                isCommentError && 'border-red-500 border-2'
              )}
              placeholder="請輸入留言"
              rows={3}
              maxLength={MAX_COMMENT_LENGTH}
            ></Textarea>
            <div className="text-[0.6rem] text-gray-500 text-left p-1 flex justify-between">
              <span>若同時有上傳照片，留言會顯示在照片下方</span>
              <span>
                {comment.length}/{MAX_COMMENT_LENGTH}
              </span>
            </div>

            {/* IMAGE */}
            <div
              ref={imageContainerRef}
              className={cn(
                'w-full md:w-[80%] aspect-square mx-auto transition-all duration-300',
                'relative border-4 border-dashed border-gray-200 rounded-lg pb-[100%] md:pb-[80%] overflow-hidden cursor-pointer',
                previewImageUrl && 'bg-black border-0'
                // isElementActive ? 'w-[0%] h-[0%] pb-[0%] border-0' : ''
              )}
              onClick={() => {
                !previewImageUrl && inputRef.current?.click();
              }}
            >
              <div className="flex flex-col gap-1 absolute inset-0 justify-center items-center">
                {previewImageUrl ? (
                  <ImageCropper
                    ref={imageCropperRef}
                    imageUrl={previewImageUrl}
                    stencilSize={
                      (imageContainerRef.current?.clientWidth ?? 0) * 0.8
                    }
                  />
                ) : (
                  <>
                    <ImagePlus className="w-12 h-12" />
                    <span className="text-sm font-medium text-gray-500">
                      點擊來上傳照片
                    </span>
                    <span className="text-[0.6rem] text-gray-500">
                      也可以不用上傳照片，直接輸入留言哦
                    </span>
                  </>
                )}
              </div>
              <span className="text-[0.6rem] text-white absolute top-1 left-1/2 -translate-x-1/2 p-1 whitespace-nowrap">
                ＊滑動或是縮放圖片來調整位置
              </span>
              <div className="absolute bottom-[0.4rem] left-1/2 -translate-x-1/2 text-white flex gap-5 text-[0.6rem] z-10">
                <span
                  className="cursor-pointer flex items-center gap-1"
                  onClick={() => {
                    setPreviewImageUrl(null);
                  }}
                >
                  <Trash2 className="w-[0.8rem] h-[0.8rem]" />
                  刪除
                </span>
                <span
                  className="cursor-pointer flex items-center gap-1"
                  onClick={() => inputRef.current?.click()}
                >
                  <ArrowDownUp className="w-[0.8rem] h-[0.8rem]" />
                  換一張圖
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              className={cn('basis-1/3')}
              onClick={() => setOpen(false)}
            >
              取消
            </Button>
            <Button
              size="sm"
              className={cn('basis-1/3')}
              onClick={handleSubmit}
              disabled={isPending}
            >
              上傳
            </Button>
          </div>
        </div>

        <input
          id="file"
          type="file"
          accept="image/*"
          hidden
          ref={inputRef}
          onChange={handleUploadImage}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </DrawerContent>
    </Drawer>
  );
};
