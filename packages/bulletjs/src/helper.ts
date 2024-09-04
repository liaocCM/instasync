export const BULLET_CLASS = "__bullet-item-style";
export const BULLET_TEMP_CONTAINER_CLASS = "__bullet-temp-container";

export type DefaultTrackConfig = {
  speed: number;
};

export interface BulletOptions {
  /** bullet track height, unit: px
   * @default 50
   */
  trackHeight?: number;
  /**
   * default tracks config
   *
   * [{speed: 100}, {speed: 200}]
   * represents track 0 speed is 100, track 1 speed is 200
   */
  defaultTracks?: DefaultTrackConfig[];
  /** pause bullet when hover, default false */
  pauseOnHover?: boolean;
  /** pause bullet when click, default false */
  pauseOnClick?: boolean;
  /** Callback function triggered when a bullet starts animating */
  onStart?: Function | null;
  /** Callback function triggered when a bullet finishes animating */
  onEnd?: Function | null;
  /** bullet animation duration, unit: s
   * only work when speed is set to 0
   * @default 10s
   */
  duration?: number;
  /** bullet speed, unit: px/s
   * @default 100
   */
  speed?: number;
  /** bullet color, use white if not set */
  color?: string;
  /** id for bullet container */
  id?: string;
}

/**
 * Initialize the bullet styles and insert them into the document head
 * @param {*} width
 */
export const initializeBulletStyles = (width: number) => {
  let style = document.createElement("style");
  const animateClass = "BULLET_ANIMATE";
  style.classList.add(animateClass);

  const root = `:root { --bullet-width: ${width}px; }`;

  const from = `from { visibility: visible; transform: translateX(var(--bullet-width)); }`;
  const to = `to { visibility: visible; transform: translateX(-100%); }`;
  const animateString = `@keyframes RightToLeft { ${from} ${to} }`;

  const bulletContainer = `
  .${BULLET_CLASS} {
		cursor: pointer;
		position: absolute;
		left: 0;
		animation-name: RightToLeft;
		animation-timing-function: linear;
		overflow: hidden;
		display: inline-block;
		word-break: keep-all;
		white-space: nowrap;
    color: var(--bullet-text-color);
	}`;

  const bulletTempContainer = `
	.${BULLET_TEMP_CONTAINER_CLASS} {
		position: absolute;
		right: 9999px;
		visibility: hidden;
	}`;

  style.innerHTML = `${root}
${animateString}
${bulletContainer}
${bulletTempContainer}`;
  document.head.appendChild(style);
};

// 創建單條彈幕的容器
export const createBulletContainer = (
  id: string = Math.random().toString(36).substring(2)
): HTMLElement => {
  const bulletContainer = document.createElement("div");
  bulletContainer.id = id;
  bulletContainer.classList.add(BULLET_CLASS);
  return bulletContainer;
};

/**
 * 获取 [min, max] 的随机数
 * @param {*} min
 * @param {*} max
 */
export const getRandomNumber = (min: number, max: number): number =>
  parseInt((Math.random() * (max - min + 1)) as any) + min;

/**
 * 事件委托
 * @param {*} target 绑定事件的元素
 * @param {*} className 需要执行绑定事件的元素的 class
 * @param {*} cb 执行的回调
 */
export function eventDelegate(
  target: HTMLElement,
  event: "click" | "mouseover" | "mouseout" | "mousemove",
  className: string,
  cb: (el: HTMLElement) => void
) {
  target.addEventListener(event, (e) => {
    let el = e.target as HTMLElement;

    // 判断当前点击的元素是否为指定的classname，如果不是，执行以下的while循环
    while (!el.className.includes(className)) {
      // 如果点击的元素为target，直接跳出循环（代表未找到目标元素）
      if (el === target) {
        //@ts-ignore
        el = null;
        break;
      }
      //否则，将当前元素父元素赋给el
      // console.log('whild循环中...')
      el = el.parentNode as HTMLElement;
    }
    if (el) {
      // console.log('找到目标元素')
      cb(el);
    } else {
      // console.log('你触发的不是目标元素')
    }
  });
}
