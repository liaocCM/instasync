import { useState, useEffect, useRef } from 'react';

export const useFullscreen = (
  elementRef?: React.RefObject<HTMLElement>,
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
    if (!elementRef) return;
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

/**
 * Rate Limiter
 * @param limit limit count
 * @param interval limit interval (ms)
 * @returns function to check if the limit is exceeded
 */
export const useRateLimiter = (limit: number, interval: number) => {
  const countRef = useRef(0);
  // Set initial time to 1970-01-01 to ensure the first check is true
  const [lastResetTime, setLastResetTime] = useState(
    new Date('1970-01-01').getTime()
  );

  const checkRateLimit = () => {
    const now = Date.now();
    if (now - lastResetTime >= interval) {
      countRef.current = 0;
      setLastResetTime(now);
    }

    if (countRef.current >= limit) {
      return false;
    }
    countRef.current += 1;
    return true;
  };

  return checkRateLimit;
};
