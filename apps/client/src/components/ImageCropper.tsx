import { forwardRef, useRef, useImperativeHandle } from 'react';
import {
  FixedCropper,
  FixedCropperRef,
  ImageRestriction
} from 'react-advanced-cropper';

import 'react-advanced-cropper/dist/style.css';

export interface ImageCropperProps {
  imageUrl: string;
  stencilSize: number;
}

export interface ImageCropperRef {
  getCroppedImageUrl: () => string;
  getCroppedImageFile: () => Promise<File>;
}

export const ImageCropper = forwardRef<ImageCropperRef, ImageCropperProps>(
  ({ imageUrl, stencilSize }, ref) => {
    const cropperRef = useRef<FixedCropperRef>(null);

    const DEFAULT_DRAW_OPTIONS = {
      minHeight: 500,
      minWidth: 500,
      maxHeight: 800,
      maxWidth: 800
    };

    useImperativeHandle(ref, () => ({
      getCroppedImageUrl: () => {
        return (
          cropperRef.current?.getCanvas(DEFAULT_DRAW_OPTIONS)?.toDataURL() ?? ''
        );
      },
      getCroppedImageFile: () => {
        return new Promise<File>((resolve, reject) => {
          const canvas = cropperRef.current?.getCanvas(DEFAULT_DRAW_OPTIONS);
          if (canvas) {
            canvas.toBlob((blob) => {
              if (blob) {
                const file = new File([blob], `croppedImg-${+Date.now()}.png`, {
                  type: blob.type
                });
                resolve(file);
              } else {
                reject(new Error('Failed to convert canvas to blob'));
              }
            }, 'image/png');
          } else {
            reject(new Error('Canvas is null'));
          }
        });
      }
      //   const canvas = cropperRef.current?.getCanvas();
      //   if (canvas) {
      //     canvas.toBlob((blob) => {
      //       if (blob) {
      //         const file = new File([blob], 'croppedImg.png', {
      //           type: blob.type
      //         });
      //         return file;
      //       }
      //     }, 'image/png');
      //   }
      //   return null;
      // }
    }));

    const defaultSize = ({ imageSize, visibleArea }: any) => {
      return {
        width: (visibleArea || imageSize).width,
        height: (visibleArea || imageSize).height
      };
    };

    return (
      <div data-vaul-no-drag>
        <FixedCropper
          defaultSize={defaultSize}
          ref={cropperRef}
          src={imageUrl}
          stencilProps={{
            handlers: false,
            lines: false,
            movable: false,
            resizable: false
          }}
          stencilSize={{
            width: stencilSize,
            height: stencilSize
          }}
          imageRestriction={ImageRestriction.stencil}
        />
      </div>
    );
  }
);

ImageCropper.displayName = 'ImageCropper';
