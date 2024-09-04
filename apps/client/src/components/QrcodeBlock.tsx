import { cn } from '@instasync/shared';
import { QRCodeSVG } from 'qrcode.react';

export const QrcodeBlock: React.FC<{
  className?: string;
  color?: string;
  value?: string;
}> = ({ className, color = '#000', value = 'https://www.google.com' }) => {
  return (
    <div
      className={cn(
        'p-1 pt-1 bg-white rounded opacity-90',
        'flex flex-col items-center justify-center border-2',
        className
      )}
      style={{ color }}
    >
      <QRCodeSVG width={'100%'} height={'100%'} fgColor={color} value={value} />
      <div className="mt-1">掃描留言</div>
    </div>
  );
};
