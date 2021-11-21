import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import DefaultSpinner from "./DefaultSpinner";
import "./CommonPullToRefresh.scss";

const DEFAULT_TARGET_MARGIN_TRANSITION_FOR_NO_BOUNCE =
  "transform 0.35s cubic-bezier(.23, 1, .32, 1)";
const DEFAULT_TARGET_MARGIN_TRANSITION_FOR_BOUNCE =
  "margin 0.7s cubic-bezier(0, 0, 0, 1)";

const SPINNER_SIZE = 32;
const TRANSITION_DURATION = 350;
const SPINNER_SPIN_DEGREE = 360;

export type PullToRefreshState =
  | "idle"
  | "pulling"
  | "triggerReady"
  | "refreshing"
  | "complete";

export interface CommonPullToRefreshProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  targetRef: React.RefObject<HTMLElement>;
  originTop?: number; // top of target where pullToRefresh starts (based on clientRects)
  originMarginTop?: number;
  triggerHeight?: number; // The height at which pullToRefresh is triggered
  progressHeight?: number; // height to keep during refresh
  onRefresh: VoidFunction;
  refreshDelay?: number;
  isRefreshing: boolean;
  spinnerSize?: number;
  customSpinner?: React.ReactNode;
  onPull?: (progress: number) => void; // progress is 0 to 1
  onRelease?: VoidFunction;
  onChangeState?: (state: PullToRefreshState) => void;
  completeDelay?: number;
  isBounceSupported?: boolean;
  tension?: number;
  isSpinnerHiddenDuringRefreshing?: boolean;
  hideDelay?: number;
  isDarkMode?: boolean;
  spinnerZIndex?: number;
  isDisabled?: boolean;
}

const CommonPullToRefresh: React.FC<CommonPullToRefreshProps> = ({
  targetRef,
  originTop = 0,
  originMarginTop = 0,
  triggerHeight = 80,
  progressHeight = 50,
  onRefresh,
  refreshDelay = 0,
  isRefreshing,
  style,
  tension = 0.8,
  className,
  spinnerSize = SPINNER_SIZE,
  customSpinner,
  onPull,
  onRelease,
  onChangeState,
  completeDelay = 0,
  isBounceSupported,
  isSpinnerHiddenDuringRefreshing,
  hideDelay,
  isDarkMode,
  spinnerZIndex,
  isDisabled,
  ...restProps
}: CommonPullToRefreshProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const $pullToRefresh = wrapperRef.current;
  const spinnerRef = useRef<HTMLImageElement>(null);
  const $spinner = spinnerRef.current;
  const $target = targetRef.current;
  let touchStartY = useRef<number>(0).current;
  let isDisabledInternally = useRef<boolean>(false).current;
  let isRefreshingInternally = useRef<boolean>(false).current;
  let touchStartFunc = useRef<(e: TouchEvent) => void>(() => undefined).current;
  let touchMoveFunc = useRef<(e: TouchEvent) => void>(() => undefined).current;
  let touchEndFunc = useRef<(e: TouchEvent) => void>(() => undefined).current;
  let state = useRef<PullToRefreshState>("idle").current;
  let pullToRefreshTimer = useRef<number>(null).current;
  let targetTimer = useRef<number>(null).current;
  const [isSpinnerSpinning, setIsSpinnerSpinning] = useState(isRefreshing);

  const DEFAULT_TARGET_MARGIN_TRANSITION = useMemo(() => {
    return isBounceSupported
      ? DEFAULT_TARGET_MARGIN_TRANSITION_FOR_BOUNCE
      : DEFAULT_TARGET_MARGIN_TRANSITION_FOR_NO_BOUNCE;
  }, [isBounceSupported]);

  const [initialized, setInitialized] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const resetHeightToDOM = useCallback(async () => {
    const nextState = state === "refreshing" ? "complete" : "idle";
    onChangeState?.(nextState);
    state = nextState;
    if ($pullToRefresh) {
      nextState === "complete" &&
        (await new Promise((resolve) => setTimeout(resolve, completeDelay)));
      $pullToRefresh.classList.add("transition-enabled");
      $pullToRefresh.style.opacity = "0";
      pullToRefreshTimer = window.setTimeout(() => {
        $pullToRefresh.classList.remove("transition-enabled");
        isRefreshingInternally = isRefreshing;
        if (state !== "idle") {
          onChangeState?.("idle");
          state = "idle";
          setIsSpinnerSpinning(false);
        }
      }, TRANSITION_DURATION);
    }
    if ($target) {
      if (isBounceSupported) {
        $target.style.marginTop = `${originMarginTop}px`;
        $target.style.transition = "margin 0.2s cubic-bezier(0, 0, 0, 1)";
      } else {
        $target.style.transform = "translateY(0px)";
        $target.style.transition = DEFAULT_TARGET_MARGIN_TRANSITION;
      }
      targetTimer = window.setTimeout(() => {
        $target.style.transition = isBounceSupported
          ? DEFAULT_TARGET_MARGIN_TRANSITION
          : "none";
      }, TRANSITION_DURATION);
    }
  }, [
    onChangeState,
    targetRef,
    completeDelay,
    isRefreshing,
    isBounceSupported,
    originMarginTop,
    DEFAULT_TARGET_MARGIN_TRANSITION,
  ]);

  const refresh = useCallback(() => {
    if ($target) {
      if (!isBounceSupported) {
        $target.style.transition = DEFAULT_TARGET_MARGIN_TRANSITION;
        $target.style.transform = `translateY(${progressHeight}px)`;
      } else {
        $target.style.marginTop = `${progressHeight + originMarginTop}px`;
      }
    }
    isRefreshingInternally = true;
    if (state !== "refreshing") {
      onChangeState?.("refreshing");
      state = "refreshing";
      setIsSpinnerSpinning(true);
    }
    setShouldRefresh(false);
    if (refreshDelay) {
      setTimeout(() => {
        onRefresh();
      }, refreshDelay);
    } else {
      onRefresh();
    }
  }, [
    targetRef,
    refreshDelay,
    isBounceSupported,
    DEFAULT_TARGET_MARGIN_TRANSITION,
    progressHeight,
    originMarginTop,
    onChangeState,
    onRefresh,
  ]);

  const checkOffsetPosition = useCallback(() => {
    if (isBounceSupported) {
      if ($target) {
        isDisabledInternally = $target.getClientRects()[0].top < originTop;
      }
    } else {
      // -1 is for some android mobile browser like firefox.
      // It sometimes calculate scrollY on the top as like 0.788968612
      if (state === "idle") {
        isDisabledInternally = window.scrollY - 1 > originTop;
      }
    }
    return isDisabledInternally;
  }, [isBounceSupported, targetRef, originTop]);

  const checkConditionAndRun = useCallback(
    (fn, hasToCheckOffsetPosition?: boolean) => {
      hasToCheckOffsetPosition && checkOffsetPosition();
      if (!(isRefreshingInternally || isDisabledInternally || isRefreshing)) {
        fn();
      }
    },
    [checkOffsetPosition, isRefreshing],
  );

  const showSpinner = useCallback(
    (height: number) => {
      if ($pullToRefresh) {
        if ($target && !isBounceSupported && !isRefreshingInternally) {
          $target.style.transform = `translateY(${height}px)`;
        }
        if (height < triggerHeight) {
          setShouldRefresh(false);
          const progress = height / triggerHeight;
          onPull?.(progress);
          if (state !== "pulling") {
            onChangeState?.("pulling");
            state = "pulling";
          }
          $pullToRefresh.style.opacity = `${height / triggerHeight}`;
          if ($spinner) {
            const rotate = `rotate(${(height / triggerHeight) * SPINNER_SPIN_DEGREE}deg)`;
            $spinner.style.webkitTransform = rotate;
            $spinner.style.transform = rotate;
            $spinner.classList.remove("bump");
          }
        } else {
          onPull?.(1);
          $pullToRefresh.style.opacity = "1";
          if (state !== "triggerReady") {
            onChangeState?.("triggerReady");
            state = "triggerReady";
          }
          setShouldRefresh(true);
          if ($spinner) {
            const rotate = `rotate(${SPINNER_SPIN_DEGREE}deg)`;
            $spinner.style.webkitTransform = rotate;
            $spinner.style.transform = rotate;
            $spinner.classList.add("bump");
          }
        }
      }
    },
    [targetRef, triggerHeight, onChangeState, onPull, isBounceSupported],
  );

  const handleOnTouchMove = useCallback(
    (e) => {
      if (isBounceSupported) {
        const $target = targetRef.current;
        if ($target) {
          const height = $target.getClientRects()[0].top - originTop;
          if (height <= 0 || isNaN(height)) {
            return;
          }
          showSpinner(height);
        }
      } else {
        if (state !== "idle") {
          e.preventDefault();
        }
        const height = e.touches[0].clientY - touchStartY;
        if (height <= 0 || isNaN(height)) {
          return;
        }
        const poweredHeight = Math.pow(height, tension);
        showSpinner(poweredHeight);
      }
    },
    [showSpinner, tension, isBounceSupported, originTop, targetRef],
  );

  const setTouchStart = useCallback((e: TouchEvent) => {
    touchStartY = e.touches[0].clientY;
  }, []);

  useEffect(() => {
    if (!isBounceSupported) {
      touchStartFunc = (e) => {
        requestAnimationFrame(() => {
          checkConditionAndRun(() => setTouchStart(e), true);
        });
      };
    }
    touchMoveFunc = (e) => {
      requestAnimationFrame(() => {
        checkConditionAndRun(() => handleOnTouchMove(e));
      });
    };
    touchEndFunc = () => {
      if (shouldRefresh && !isRefreshingInternally) {
        onRelease?.();
        onPull?.(0);
        requestAnimationFrame(refresh);
      } else if (!isRefreshing) {
        onRelease?.();
        onPull?.(0);
        requestAnimationFrame(resetHeightToDOM);
      }
    };
    const $target = targetRef.current;
    if ($target && !isDisabled) {
      !isBounceSupported && $target.addEventListener("touchstart", touchStartFunc);
      $target.addEventListener("touchmove", touchMoveFunc);
      $target.addEventListener("touchend", touchEndFunc);
      return () => {
        !isBounceSupported && $target.removeEventListener("touchstart", touchStartFunc);
        $target.removeEventListener("touchmove", touchMoveFunc);
        $target.removeEventListener("touchend", touchEndFunc);
      };
    } else {
      !isRefreshing && resetHeightToDOM();
    }
  }, [
    checkConditionAndRun,
    resetHeightToDOM,
    showSpinner,
    handleOnTouchMove,
    shouldRefresh,
    refresh,
    isRefreshing,
    targetRef,
    onRelease,
    onPull,
    setTouchStart,
    isBounceSupported,
    isDisabled,
  ]);

  useEffect(() => {
    isRefreshingInternally = isRefreshing;
    if (!isRefreshing || (isRefreshing && isSpinnerHiddenDuringRefreshing)) {
      if (hideDelay) {
        setTimeout(resetHeightToDOM, hideDelay);
      } else {
        resetHeightToDOM();
      }
    }
  }, [isRefreshing, resetHeightToDOM, isSpinnerHiddenDuringRefreshing, hideDelay]);

  useEffect(() => {
    if (!isBounceSupported) {
      if (!initialized) {
        if (isRefreshing && !isSpinnerHiddenDuringRefreshing) {
          showSpinner(triggerHeight);
          if ($pullToRefresh) {
            $pullToRefresh.style.height = `${triggerHeight}px`;
          }
        }
        setInitialized(true);
      }
    }
  }, [
    initialized,
    isRefreshing,
    triggerHeight,
    showSpinner,
    isBounceSupported,
    isSpinnerHiddenDuringRefreshing,
  ]);

  useEffect(() => {
    if (isBounceSupported) {
      const $target = targetRef.current;
      if ($target) {
        $target.style.transition = DEFAULT_TARGET_MARGIN_TRANSITION;
      }
    }
  }, [targetRef, isBounceSupported, DEFAULT_TARGET_MARGIN_TRANSITION]);

  useEffect(() => {
    return () => {
      pullToRefreshTimer && clearTimeout(pullToRefreshTimer);
      targetTimer && clearTimeout(targetTimer);
    };
  }, [resetHeightToDOM]);

  return (
    <div
      data-testid="spinner-container"
      className={classNames(
        "react-awesome-ptr",
        isBounceSupported ? "for-bounce" : "for-no-bounce",
        className,
      )}
      ref={wrapperRef}
      {...restProps}
      style={{ top: originTop, zIndex: spinnerZIndex, ...style }}
    >
      {customSpinner || (
        <DefaultSpinner
          className={classNames({
            spin: isSpinnerSpinning,
          })}
          ref={spinnerRef}
          style={{
            marginTop: (progressHeight - spinnerSize) / 2,
            width: spinnerSize,
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default CommonPullToRefresh;
