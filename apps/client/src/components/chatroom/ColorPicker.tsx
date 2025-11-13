import React, { useState } from 'react';
import { cn } from '@instasync/shared';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@instasync/ui/ui/popover';

const enabledColors = ['#CCD5AE', '#E9EDC9', '#ffffff', '#FAEDCD', '#D4A373'];

export const ColorPicker: React.FC<{
  className?: string;
  color: string;
  setColor: (color: string) => void;
}> = ({ className, color, setColor }) => {
  const [open, setOpen] = useState(false);

  const handleColorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const color = (e.target as HTMLDivElement).getAttribute('data-color');
    console.log(color);
    if (!color) return;
    setColor(color);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div
          className={cn(
            'flex items-center justify-center cursor-pointer',
            className
          )}
        >
          <div
            className="w-[1.1rem] h-[1.1rem] bg-white rounded-full border-2 border-gray-300 transition-all duration-300"
            style={{ backgroundColor: color }}
          ></div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-2 text-xs w-auto max-w-[60vw] bg-background"
        align="start"
        alignOffset={0}
        sideOffset={6}
        side="top"
      >
        <div className="flex flex-row gap-1" onClick={handleColorClick}>
          {enabledColors.map((color) => (
            <div
              key={color}
              className="cursor-pointer w-[1.1rem] h-[1.1rem] rounded-full border-2 border-gray-300"
              style={{ backgroundColor: color }}
              data-color={color}
            ></div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
