import { useState, useEffect } from 'react';

export const useFullscreen = (
  elementRef: React.RefObject<HTMLElement>,
  onToggle?: () => void,
  useParentNode: boolean = false
) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenChange = () => {
    const isFullscreen = !!document.fullscreenElement;
    setIsFullscreen(isFullscreen);

    if (isFullscreen) {
      document.documentElement.classList.add('fullscreen');
    } else {
      document.documentElement.classList.remove('fullscreen');
    }
  };

  const toggleFullscreen = async () => {
    const elem = (
      useParentNode ? elementRef.current?.parentNode : elementRef.current
    ) as HTMLElement;
    if (!elem) return;
    // const isSysFullscreen = window.innerWidth == screen.width && window.innerHeight == screen.height;

    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      }

      // else if (elem.mozRequestFullScreen) {
      //   // Firefox
      //   await elem.mozRequestFullScreen();
      // } else if (elem.webkitRequestFullscreen) {
      //   // Chrome, Safari and Opera
      //   await elem.webkitRequestFullscreen();
      // } else if (elem.msRequestFullscreen) {
      //   // IE/Edge
      //   await elem.msRequestFullscreen();
      // }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }

      // else if (document.mozCancelFullScreen) {
      //   // Firefox
      //   await document.mozCancelFullScreen();
      // } else if (document.webkitExitFullscreen) {
      //   // Chrome, Safari and Opera
      //   await document.webkitExitFullscreen();
      // } else if (document.msExitFullscreen) {
      //   // IE/Edge
      //   await document.msExitFullscreen();
      // }
    }

    if (onToggle) {
      setTimeout(onToggle, 500);
    }
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return { isFullscreen, toggleFullscreen };
};
