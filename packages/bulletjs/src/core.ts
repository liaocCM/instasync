import {
  initializeBulletStyles,
  createBulletContainer,
  getRandomNumber,
  eventDelegate,
  BulletOptions,
  BULLET_CLASS,
  BULLET_TEMP_CONTAINER_CLASS,
} from "./helper";

const defaultOptions: BulletOptions = {
  trackHeight: 50,
  defaultTracks: [{ speed: 200 }, { speed: 300 }],
  pauseOnHover: false,
  pauseOnClick: false,
  onStart: null,
  onEnd: null,
  duration: 10,
  speed: 100,
};

type ItrackStatus = "running" | "idle";
type IBulletInfo = {
  width: number;
};

// 用戶自己發送的彈幕，多增加一個 item(html 字符串) 作為用戶 push 的內容
type IQueue = { item: string; opts: BulletOptions };

export class Bullet {
  ele: string | HTMLElement;
  options: BulletOptions;
  targetPos: DOMRect = new DOMRect();

  target: HTMLElement | null = null;
  tempContanier: HTMLElement = document.createElement("div"); // 临时弹幕容器

  bulletInfo: IBulletInfo = { width: 0 }; // 当前push的弹幕对象信息
  bullets: HTMLElement[][] = []; // 彈幕存儲器 ==> 各跑道內所對應的彈幕
  tracks: ItrackStatus[] = []; // 軌道列表
  queues: IQueue[] = []; // 用戶自己發送的的彈幕存儲列表
  targetW: number = 0; // 舞台寬度
  pauseArrs: HTMLElement[] = []; // 暫停隊列
  isAllPaused: boolean = false; // 是否全部暂停

  private queueInterval: number | null = null;
  private readonly QUEUE_INTERVAL_MS = 1000; // Adjust this value as needed
  private readonly QUEUE_PROCESS_NUM = 5; // 每次重新處理的彈幕數量

  constructor(ele: string | HTMLElement, opts: BulletOptions = defaultOptions) {
    this.options = Object.assign(defaultOptions, opts);
    this.ele = ele;
    // 初始化舞台
    this.initScreen();
    // 初始化全局参数
    this.initOpt();
    // 初始化临时弹幕容器
    this.initTempContainer();
    this._addEventDelegation();
    this._startQueueProcessor();
  }

  private _startQueueProcessor() {
    this.queueInterval = window.setInterval(() => {
      if (this.queues.length && !this.isAllPaused) {
        for (let i = 0; i < this.QUEUE_PROCESS_NUM; i++) {
          const bullet = this.queues.shift();
          if (bullet) {
            const randomDelay = Math.random() * 500; // Random delay between 0-1000ms
            setTimeout(() => {
              this.push(bullet.item, bullet.opts);
            }, randomDelay);
          }
        }
      }
    }, this.QUEUE_INTERVAL_MS);
  }

  // 设置弹幕目标
  private initScreen() {
    if (typeof this.ele === "string") {
      const target = document.querySelector(this.ele);
      if (target) {
        this.target = target as HTMLElement;
      } else {
        throw new Error("The display target does not exist");
      }
    } else if (this.ele instanceof HTMLElement) {
      this.target = this.ele;
    } else {
      throw new Error("The display target of the barrage must be set");
    }
  }

  // 初始化配置
  private initOpt(isResize: boolean = false) {
    if (!this.target) return;
    const { trackHeight } = this.options;
    this.targetPos = this.target.getBoundingClientRect();
    const trackNum = Math.floor(this.targetPos.height / trackHeight);
    this.tracks = new Array(trackNum).fill("idle");
    this.bullets = new Array(trackNum).fill([]);
    this.targetW = this.targetPos.width;

    // 屏幕目标必须具备的CSS样式
    const { position } = getComputedStyle(this.target);
    if (position === "static") {
      this.target.style.position = "relative";
      this.target.style.overflow = "hidden";
    }

    // 插入css animation
    if (!isResize) {
      initializeBulletStyles(this.targetW);
    } else {
      document.documentElement.style.setProperty(
        "--bullet-width",
        this.targetW + "px"
      );
    }
  }

  public resize() {
    this.initOpt(true);
    // if (!this.target) return;

    // this.targetPos = this.target.getBoundingClientRect();
    // this.targetW = this.targetPos.width;
    // console.log('this.targetW', this.targetW);
    // initBulletAnimate(this.targetW);
  }

  // 初始化一个弹幕临时容器，为后期获取高度
  private initTempContainer() {
    this.tempContanier = document.createElement("div");
    this.tempContanier.classList.add(BULLET_TEMP_CONTAINER_CLASS);
    document.body.appendChild(this.tempContanier);
  }

  // push 可针对具体一条弹幕设置特殊配置
  public push(
    item: string,
    opts: Partial<BulletOptions> = this.options
    // isSelf: boolean = false 大流量場景才需要
  ): number | string | undefined {
    if (this.isAllPaused) return; // 如果是全部暂停状态，停止push，停止render
    const options = Object.assign({}, this.options, opts);

    const canIndex = this._getAvailableTrackIndex();
    if (canIndex === -1) {
      this.queues.push({ item, opts });
    } else {
      const bulletContainer = this._getBulletItem(item, options, canIndex);
      // 塞入弹幕存储器
      if (this.bullets[canIndex].length) {
        this.bullets[canIndex].push(bulletContainer);
      } else {
        this.bullets[canIndex] = [bulletContainer];
      }
      this._renderBullet(bulletContainer, canIndex);
      this._addBulletLifeCycleEvent(bulletContainer, canIndex, options);
      return bulletContainer.id;
    }
  }

  // 根据参数获取弹幕实体
  private _getBulletItem(
    item: string,
    options: BulletOptions,
    canIndex: number
  ) {
    const bulletContainer = createBulletContainer(options.id);
    // !!!此处有极大风险会出现 xss漏洞，注意切忌一定要对用户输入进行过滤，采用 innerHTML 主要是为了方便开发者可以自定义样式!!!
    // !!!故开发者一定要对用户输入内容进行转义过滤!!!
    bulletContainer.innerText = item;
    // 为了获取当前弹幕的宽度，故必须要将其先插入到document中(为了实现 弹幕防止重叠)
    this.tempContanier!.innerText = "";
    this.tempContanier!.appendChild(bulletContainer);
    this.bulletInfo = { width: bulletContainer.offsetWidth };

    let duration = 0;
    const speed = options.defaultTracks?.[canIndex]?.speed || options.speed;
    console.log("speed", speed);
    if (speed) {
      duration = (this.targetW + this.bulletInfo.width) / speed;
    } else {
      duration = options.duration;
    }

    // 将duration作为弹幕固有属性存储
    bulletContainer.dataset.duration = duration + "";
    bulletContainer.dataset.textcontent = item;
    bulletContainer.style.setProperty(
      "--bullet-text-color",
      options.color || "#fff"
    );
    // 控制速度
    bulletContainer.style.animationDuration = duration * 1000 + "ms";
    // 删除临时存储弹幕容器里的弹幕
    bulletContainer.remove();
    return bulletContainer;
  }

  // 獲取可發送彈幕的軌道Index
  private _getAvailableTrackIndex() {
    let readyIdxs: number[] = [];
    let index = -1;
    // 優先去 idle 狀態的軌道
    this.tracks.forEach((v, idx) => v === "idle" && readyIdxs.push(idx));
    if (readyIdxs.length) {
      const random = getRandomNumber(0, readyIdxs.length - 1);
      index = readyIdxs[random];
      this.tracks[index] = "running";
      return index;
    }

    // 沒有多餘軌道，從上到下巡檢各軌道，選出可執行彈幕的軌道
    for (let i = 0; i < this.bullets.length; i++) {
      const len = this.bullets[i].length;
      if (len) {
        // 取出此軌道的最後一個彈幕來進行判斷是否可執行彈幕
        const item = this.bullets[i][len - 1];
        if (item && this._checkTrack(item)) {
          return i;
        }
      }
    }
    return index;
  }

  // 判斷該條軌道是否可執行彈幕
  private _checkTrack(item: HTMLElement): boolean {
    // 思路來源 https://www.zhihu.com/question/370464345
    const itemPos = item.getBoundingClientRect();
    // 轨道中最后一个元素尚未完全进入展示区域，直接跳出
    if (itemPos.right > this.targetPos.right) {
      return false;
    }

    // 轨道中最后一个元素已完全进去展示区域

    // 速度相同，只要初始条件满足即可，不用去关系追及问题
    if (this.options.speed || this.options.defaultTracks?.length) {
      if (itemPos.right < this.targetPos.right) return true;
    } else {
      // 不设速度，纯靠 duration 控制，弹幕越长速度越快
      const duration = +item.dataset.duration!;
      // 原弹幕速度
      const v1 = (this.targetW + itemPos.width) / duration;
      /**
       * 新弹幕
       * s2：全程距离
       * t2：全程时间
       * v2：速度
       */
      const s2 = this.targetW + this.bulletInfo.width;
      const t2 = duration;
      const v2 = s2 / t2;

      if (v2 <= v1) {
        return true;
      } else {
        // 小学时代的追及问题：t = s / v  比较时间：t1, t2

        // 原弹幕跑完剩余全程所需要的时间
        const t1 = (itemPos.right - this.targetPos.left) / v1;
        // 新弹幕头部跑完全程所需要的时间
        const t2 = this.targetW / v2;
        // console.log('前面的--->', t1, t2, '后面的时间', v1)
        if (t2 < t1) {
          return false;
        }
      }
    }
    return true;
  }

  // 绑定事件
  private _addBulletLifeCycleEvent(
    bulletContainer: HTMLElement,
    canIndex: number,
    options: BulletOptions
  ) {
    const { onStart, onEnd } = options;
    // 监听弹幕开始的事件
    bulletContainer.addEventListener("animationstart", () => {
      if (onStart) onStart.call(window, bulletContainer.id, this);
    });

    // 监听弹幕完成的事件
    bulletContainer.addEventListener("animationend", () => {
      if (onEnd) onEnd.call(window, bulletContainer.id, this);
      // 从集合中剔除已经结束的动画
      this.bullets[canIndex] = this.bullets[canIndex].filter(
        (v) => v.id !== bulletContainer.id
      );

      if (!this.bullets[canIndex].length) {
        this.tracks[canIndex] = "idle";
      }
      bulletContainer.style.willChange = "auto";
      bulletContainer.remove();
    });
  }

  // 監聽點擊或hover事件做一些額外的處理
  private _addEventDelegation() {
    if (!this.target) return;

    // if pauseOnClick is set to true,
    // register these listeners to pause or resume the bullet animation when click
    if (this.options.pauseOnClick) {
      eventDelegate(this.target, "click", BULLET_CLASS, (el) => {
        let currStatus = el.style.animationPlayState;
        if (currStatus == "paused" && el.dataset.clicked) {
          el.dataset.clicked = "";
          this._toggleAnimateStatus(el, "running");
        } else {
          el.dataset.clicked = "true";
          this._toggleAnimateStatus(el, "paused");
        }
      });
    }

    // if pauseOnHover is set to true,
    // register these listeners to pause the bullet animation when mouseover
    // and resume the bullet animation when mouseout
    if (this.options.pauseOnHover) {
      eventDelegate(this.target, "mouseover", BULLET_CLASS, (el) => {
        this._toggleAnimateStatus(el, "paused");
      });

      eventDelegate(this.target, "mouseout", BULLET_CLASS, (el) => {
        this._toggleAnimateStatus(el, "running");
      });
    }
  }

  private _renderBullet = (container: HTMLElement, track: number) => {
    if (!this.target) return;
    /**
     * container：弹幕容器
     * track：跑道索引
     */
    if (this.isAllPaused) return; // 如果是全部暂停状态，停止push，停止render
    container.dataset.track = track + "";
    container.style.top = track * this.options.trackHeight + "px";
    container.style.willChange = "transform";
    this.target.appendChild(container);
  };

  /**
   *
   * 额外操作 api ========================================================
   * */

  /**
   * 獲取彈幕列表
   * @returns 彈幕列表
   */
  public getBulletsList() {
    return this.bullets.reduce((acc, cur) => [...cur, ...acc], []);
  }

  // 切換彈幕動畫狀態
  private _toggleAnimateStatus = (el: HTMLElement, status = "paused") => {
    if (el) {
      if (status === "running") {
        el.style.animationPlayState = "running";
        el.style.zIndex = "0";
        el.classList.remove("bullet-item-paused");
      } else {
        el.style.animationPlayState = "paused";
        el.style.zIndex = "99999";
        el.classList.add("bullet-item-paused");
      }
      return;
    }

    if (this.pauseArrs.length && status == "paused") return;
    this.pauseArrs = this.getBulletsList();
    this.pauseArrs.forEach((item) => {
      item.style.animationPlayState = status;
    });
    this.pauseArrs = [];
  };

  /**
   * 暫停彈幕動畫
   * @param el 彈幕元素，若不傳，則暫停所有彈幕動畫
   */
  public pause(el: HTMLElement | null = null) {
    this._toggleAnimateStatus(el, "paused");
    if (el === null) {
      this.isAllPaused = true;
      if (this.queueInterval !== null) {
        clearInterval(this.queueInterval);
        this.queueInterval = null;
      }
    }
  }

  /**
   * 繼續彈幕動畫
   * @param el 彈幕元素，若不傳，則繼續所有彈幕動畫
   */
  public resume(el: HTMLElement | null = null) {
    this._toggleAnimateStatus(el, "running");
    this.isAllPaused = false;
    if (this.queueInterval === null) {
      this._startQueueProcessor();
    }
  }

  // clear bullet container by id
  // if id is not provided, clear all bullet containers at the moment
  public clear(id?: string) {
    if (id) {
      // Clear specific bullet container
      const bulletContainer = document.getElementById(id);
      if (bulletContainer) {
        bulletContainer.style.display = "none";
        // Remove from this.bullets array
        this.bullets = this.bullets.map((track) =>
          track.filter((bullet) => bullet.id !== id)
        );
      }
    } else {
      // Clear all bullet containers
      const bulletContainers = document.querySelectorAll(`.${BULLET_CLASS}`);
      bulletContainers.forEach((container) => {
        if (container instanceof HTMLElement) {
          container.style.display = "none";
        }
      });
      // Reset bullets array
      this.bullets = this.bullets.map(() => []);
    }
  }
}
