import dayjs from 'dayjs';

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function onDisplayVirtualKeyboard(): Promise<void> {
  if (window.innerWidth > 640) return;

  await sleep(1000);
  const { innerHeight } = window;
  document.body.style.setProperty('--input-height', `${innerHeight}px`);
  // 需要的话，可以在这里插入一个滚动
}
export async function onBlurVirtualKeyboard(): Promise<void> {
  await sleep(1000);
  document.body.style.removeProperty('--input-height');
}

export function debounce(func: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: unknown, ...args: any[]) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

export function getThumbnailUrl(photoUrl: string) {
  return photoUrl.replace('original', 'thumbnail');
}

export const formatDistanceToNow = (createdAt: Date) => {
  const now = dayjs();
  const createdAtDate = dayjs(createdAt);

  if (now.diff(createdAtDate, 'minute') < 1) {
    return '剛剛';
  } else {
    return createdAtDate.fromNow();
  }
};

export const getHashNumber = (input: string, max: number): number => {
  const hash = input
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % max) + 1;
};

export const getUserDefaultAvatarUrl = (id: string) => {
  if (!id) return '';
  return `/images/avatar/variant-${getHashNumber(id, 5)}.png`;
};
