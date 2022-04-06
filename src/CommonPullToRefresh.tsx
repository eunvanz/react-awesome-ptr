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
  isOpacityChangeOnPullDisabled?: boolean;
  isRotationSpinnerOnPullDisabled?: boolean;
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
  isOpacityChangeOnPullDisabled,
  isRotationSpinnerOnPullDisabled,
  ...restProps
}: CommonPullToRefreshProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const spinnerRef = useRef<HTMLImageElement | null>(null);
  const touchStartRef = useRef<number | null>(null);
  const isDisabledRef = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);
  const touchStartFuncRef = useRef<(e: TouchEvent) => void>(() => undefined);
  const touchMoveFuncRef = useRef<(e: TouchEvent) => void>(() => undefined);
  const touchEndFuncRef = useRef<(e: TouchEvent) => void>(() => undefined);
  const stateRef = useRef<PullToRefreshState>("idle");
  const pullToRefreshTimerRef = useRef<number | null>(null);
  const targetTimerRef = useRef<number | null>(null);
  const [isSpinnerSpinning, setIsSpinnerSpinning] = useState(isRefreshing);

  const DEFAULT_TARGET_MARGIN_TRANSITION = useMemo(() => {
    return isBounceSupported
      ? DEFAULT_TARGET_MARGIN_TRANSITION_FOR_BOUNCE
      : DEFAULT_TARGET_MARGIN_TRANSITION_FOR_NO_BOUNCE;
  }, [isBounceSupported]);

  const [initialized, setInitialized] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const resetHeight = useCallback(async () => {
    const nextState = stateRef.current === "refreshing" ? "complete" : "idle";
    onChangeState?.(nextState);
    stateRef.current = nextState;
    const $target = targetRef.current;
    const $wrapper = wrapperRef.current;
    if ($wrapper) {
      nextState === "complete" &&
        (await new Promise((resolve) => setTimeout(resolve, completeDelay)));
      $wrapper.classList.add("transition-enabled");
      if (!isOpacityChangeOnPullDisabled) {
        $wrapper.style.opacity = "0";
      }
      pullToRefreshTimerRef.current = window.setTimeout(() => {
        $wrapper.classList.remove("transition-enabled");
        isRefreshingRef.current = isRefreshing;
        if (stateRef.current !== "idle") {
          onChangeState?.("idle");
          stateRef.current = "idle";
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
        touchStartRef.current = null;
      }
      targetTimerRef.current = window.setTimeout(() => {
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
    isOpacityChangeOnPullDisabled,
  ]);

  const refresh = useCallback(() => {
    const $target = targetRef.current;
    if ($target) {
      if (!isBounceSupported) {
        $target.style.transition = DEFAULT_TARGET_MARGIN_TRANSITION;
        $target.style.transform = `translateY(${progressHeight}px)`;
      } else {
        $target.style.marginTop = `${progressHeight + originMarginTop}px`;
      }
    }
    isRefreshingRef.current = true;
    if (stateRef.current !== "refreshing") {
      onChangeState?.("refreshing");
      stateRef.current = "refreshing";
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
      const $target = targetRef.current;
      if ($target) {
        isDisabledRef.current = $target.getClientRects()[0].top < originTop;
      }
    } else {
      // -1 is for some android mobile browser like firefox.
      // It sometimes calculate scrollY on the top as like 0.788968612
      if (stateRef.current === "idle") {
        isDisabledRef.current = window.scrollY - 1 > originTop;
      }
    }
    return isDisabledRef.current;
  }, [isBounceSupported, targetRef, originTop]);

  const checkConditionAndRun = useCallback(
    (fn, hasToCheckOffsetPosition?: boolean) => {
      hasToCheckOffsetPosition && checkOffsetPosition();
      if (!(isRefreshingRef.current || isDisabledRef.current || isRefreshing)) {
        fn();
      }
    },
    [checkOffsetPosition, isRefreshing],
  );

  const showSpinner = useCallback(
    (height: number) => {
      const $wrapper = wrapperRef.current;
      const $target = targetRef.current;
      const $spinner = spinnerRef.current;

      if ($wrapper) {
        if ($target && !isBounceSupported && !isRefreshingRef.current) {
          $target.style.transform = `translateY(${height}px)`;
        }
        if (height < triggerHeight) {
          setShouldRefresh(false);
          const progress = height / triggerHeight;
          onPull?.(progress);
          if (stateRef.current !== "pulling") {
            onChangeState?.("pulling");
            stateRef.current = "pulling";
          }
          if (!isOpacityChangeOnPullDisabled) {
            $wrapper.style.opacity = `${height / triggerHeight}`;
          }
          if ($spinner) {
            if (!isRotationSpinnerOnPullDisabled) {
              const rotate = `rotate(${
                (height / triggerHeight) * SPINNER_SPIN_DEGREE
              }deg)`;
              $spinner.style.webkitTransform = rotate;
              $spinner.style.transform = rotate;
            }
            if ($spinner.classList.contains("bump")) {
              $spinner.classList.remove("bump");
            }
          }
        } else {
          onPull?.(1);
          if (!isOpacityChangeOnPullDisabled) {
            $wrapper.style.opacity = "1";
          }
          setShouldRefresh(true);
          if (stateRef.current !== "triggerReady") {
            onChangeState?.("triggerReady");
            stateRef.current = "triggerReady";
          }
          if ($spinner) {
            if (!isRotationSpinnerOnPullDisabled) {
              const rotate = `rotate(${SPINNER_SPIN_DEGREE}deg)`;
              $spinner.style.webkitTransform = rotate;
              $spinner.style.transform = rotate;
            }
            $spinner.classList.add("bump");
          }
        }
      }
    },
    [
      targetRef,
      triggerHeight,
      onChangeState,
      onPull,
      isBounceSupported,
      isOpacityChangeOnPullDisabled,
      isRotationSpinnerOnPullDisabled,
    ],
  );

  const handleOnTouchMove = useCallback(
    (e) => {
      const $target = targetRef.current;
      if (isBounceSupported) {
        if ($target) {
          const height = $target.getClientRects()[0].top - originTop;
          if (height <= 0 || isNaN(height)) {
            return;
          }
          showSpinner(height);
        }
      } else if ($target) {
        if (touchStartRef.current !== null) {
          const height = e.touches[0].clientY - touchStartRef.current;
          if (height <= 0 || isNaN(height)) {
            return;
          }
          const poweredHeight = Math.pow(height, tension);
          showSpinner(poweredHeight);
        }
      }
    },
    [showSpinner, tension, isBounceSupported, originTop, targetRef],
  );

  const setTouchStart = useCallback(
    (e: TouchEvent) => {
      const $target = targetRef.current;
      if ($target && $target.getClientRects()[0].top >= originTop) {
        touchStartRef.current = e.touches[0].clientY;
      }
    },
    [originTop, targetRef],
  );

  useEffect(() => {
    if (!isBounceSupported) {
      touchStartFuncRef.current = (e) => {
        requestAnimationFrame(() => {
          checkConditionAndRun(() => setTouchStart(e), true);
        });
      };
    }
    touchMoveFuncRef.current = (e) => {
      if (!isBounceSupported && stateRef.current !== "idle") {
        e.cancelable && e.preventDefault();
      }
      requestAnimationFrame(() => {
        checkConditionAndRun(() => handleOnTouchMove(e));
      });
    };
    touchEndFuncRef.current = () => {
      if (shouldRefresh && !isRefreshingRef.current) {
        onRelease?.();
        onPull?.(0);
        requestAnimationFrame(refresh);
      } else if (!isRefreshing) {
        onRelease?.();
        onPull?.(0);
        requestAnimationFrame(resetHeight);
      }
    };
    const $target = targetRef.current;
    if ($target && !isDisabled) {
      !isBounceSupported &&
        $target.addEventListener("touchstart", touchStartFuncRef.current);
      $target.addEventListener("touchmove", touchMoveFuncRef.current);
      $target.addEventListener("touchend", touchEndFuncRef.current);
      return () => {
        !isBounceSupported &&
          $target.removeEventListener("touchstart", touchStartFuncRef.current);
        $target.removeEventListener("touchmove", touchMoveFuncRef.current);
        $target.removeEventListener("touchend", touchEndFuncRef.current);
      };
    } else {
      !isRefreshing && resetHeight();
    }
  }, [
    checkConditionAndRun,
    resetHeight,
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
    isRefreshingRef.current = isRefreshing;
    if (!isRefreshing || (isRefreshing && isSpinnerHiddenDuringRefreshing)) {
      if (hideDelay) {
        setTimeout(resetHeight, hideDelay);
      } else {
        resetHeight();
      }
    }
  }, [isRefreshing, resetHeight, isSpinnerHiddenDuringRefreshing, hideDelay]);

  useEffect(() => {
    if (!isBounceSupported) {
      const $wrapper = wrapperRef.current;
      if (!initialized) {
        if (isRefreshing && !isSpinnerHiddenDuringRefreshing) {
          showSpinner(triggerHeight);
          if ($wrapper) {
            $wrapper.style.height = `${triggerHeight}px`;
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
      pullToRefreshTimerRef.current && clearTimeout(pullToRefreshTimerRef.current);
      targetTimerRef.current && clearTimeout(targetTimerRef.current);
    };
  }, [resetHeight]);

  return (
    <div
      data-testid="spinner-container"
      className={classNames(
        "react-awesome-ptr",
        isBounceSupported ? "for-bounce" : "for-no-bounce",
        isOpacityChangeOnPullDisabled ? "fixed-opacity" : undefined,
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
