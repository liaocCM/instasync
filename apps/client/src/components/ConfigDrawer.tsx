import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from '@instasync/ui/ui/drawer';

export const ConfigDrawer: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-[50%]">
        <div className="p-4 flex flex-col gap-2">
          <div>
            <span>當前模式: </span> XX
          </div>
          <div>
            <span>當前模式: </span> XX
          </div>
          <div>
            <span>當前模式: </span> XX
          </div>
          <div>
            <span>當前模式: </span> XX
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
