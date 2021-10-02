import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import DefaultSpinner from "./DefaultSpinner";
import "./CommonPullToRefresh.scss";

const DEFAULT_TARGET_MARGIN_TRANSITION_FOR_NO_BOUNCE =
  "transform 0.25s cubic-bezier(0, 0, 0, 1)";
const DEFAULT_TARGET_MARGIN_TRANSITION_FOR_BOUNCE =
  "margin 0.7s cubic-bezier(0, 0, 0, 1)";

const SPINNER_SIZE = 32;
const TRANSITION_DURATION = 250;
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
  isDarkMode?: boolean;
  spinnerZIndex?: number;
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
  tension = 0.82,
  className,
  spinnerSize = SPINNER_SIZE,
  customSpinner,
  onPull,
  onRelease,
  onChangeState,
  completeDelay = 0,
  isBounceSupported,
  isSpinnerHiddenDuringRefreshing,
  isDarkMode,
  spinnerZIndex,
  ...restProps
}: CommonPullToRefreshProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const spinnerRef = useRef<HTMLImageElement | null>(null);
  const touchStartRef = useRef<number>(0);
  const isDisabledRef = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);
  const touchStartFuncRef = useRef<(e: TouchEvent) => void>(() => undefined);
  const touchMoveFuncRef = useRef<(e: TouchEvent) => void>(() => undefined);
  const touchEndFuncRef = useRef<(e: TouchEvent) => void>(() => undefined);
  const stateRef = useRef<PullToRefreshState>("idle");
  const [isSpinnerSpinning, setIsSpinnerSpinning] = useState(isRefreshing);

  const DEFAULT_TARGET_MARGIN_TRANSITION = useMemo(() => {
    return isBounceSupported
      ? DEFAULT_TARGET_MARGIN_TRANSITION_FOR_BOUNCE
      : DEFAULT_TARGET_MARGIN_TRANSITION_FOR_NO_BOUNCE;
  }, [isBounceSupported]);

  const [initialized, setInitialized] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const resetHeightToDOM = useCallback(async () => {
    const nextState = stateRef.current === "refreshing" ? "complete" : "idle";
    onChangeState?.(nextState);
    stateRef.current = nextState;
    const targetDOM = targetRef.current;
    const pullToRefreshDOM = wrapperRef.current;
    if (pullToRefreshDOM) {
      nextState === "complete" &&
        (await new Promise((resolve) => setTimeout(resolve, completeDelay)));
      pullToRefreshDOM.classList.add("transition-enabled");
      pullToRefreshDOM.style.opacity = "0";
      setTimeout(() => {
        pullToRefreshDOM.classList.remove("transition-enabled");
        isRefreshingRef.current = isRefreshing;
        if (stateRef.current !== "idle") {
          onChangeState?.("idle");
          stateRef.current = "idle";
          setIsSpinnerSpinning(false);
        }
      }, TRANSITION_DURATION);
    }
    if (targetDOM) {
      if (isBounceSupported) {
        targetDOM.style.marginTop = `${originMarginTop}px`;
        targetDOM.style.transition = "margin 0.2s cubic-bezier(0, 0, 0, 1)";
      } else {
        targetDOM.style.transform = "translateY(0px)";
        targetDOM.style.transition = DEFAULT_TARGET_MARGIN_TRANSITION;
      }
      setTimeout(() => {
        targetDOM.style.transition = isBounceSupported
          ? DEFAULT_TARGET_MARGIN_TRANSITION
          : "none";
      }, TRANSITION_DURATION);
    }
  }, [isRefreshing, originMarginTop, targetRef, onChangeState, completeDelay]);

  const refresh = useCallback(() => {
    const targetDOM = targetRef.current;
    if (targetDOM) {
      if (!isBounceSupported) {
        targetDOM.style.transition = DEFAULT_TARGET_MARGIN_TRANSITION;
        targetDOM.style.transform = `translateY(${progressHeight}px)`;
      } else {
        targetDOM.style.marginTop = `${progressHeight + originMarginTop}px`;
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
    progressHeight,
    originMarginTop,
    onRefresh,
    refreshDelay,
    onChangeState,
    isBounceSupported,
  ]);

  const checkOffsetPosition = useCallback(() => {
    if (isBounceSupported) {
      const targetDOM = targetRef.current;
      if (targetDOM) {
        isDisabledRef.current = targetDOM.getClientRects()[0].top < originTop;
      }
    } else {
      // -1 is for some android mobile browser like firefox.
      // It sometimes calculate scrollY on the top as like 0.788968612
      if (stateRef.current === "idle") {
        isDisabledRef.current = window.scrollY - 1 > originTop;
      }
    }
    return isDisabledRef.current;
  }, [originTop, isBounceSupported]);

  const checkConditionAndRun = useCallback(
    (conditionFn, fn, hasToCheckOffsetPosition?: boolean) => {
      hasToCheckOffsetPosition && checkOffsetPosition();
      if (!conditionFn()) {
        fn();
      }
    },
    [checkOffsetPosition],
  );

  const showSpinner = useCallback(
    (height: number) => {
      const pullToRefreshDOM = wrapperRef.current;
      const targetDOM = targetRef.current;
      const spinnerDOM = spinnerRef.current;

      if (pullToRefreshDOM) {
        if (targetDOM && !isBounceSupported) {
          targetDOM.style.transform = `translateY(${height}px)`;
        }
        if (height < triggerHeight) {
          setShouldRefresh(false);
          const progress = height / triggerHeight;
          onPull?.(progress);
          if (stateRef.current !== "pulling") {
            onChangeState?.("pulling");
            stateRef.current = "pulling";
          }
          pullToRefreshDOM.style.opacity = `${height / triggerHeight}`;
          if (spinnerDOM) {
            const rotate = `rotate(${(height / triggerHeight) * SPINNER_SPIN_DEGREE}deg)`;
            spinnerDOM.style.webkitTransform = rotate;
            spinnerDOM.style.transform = rotate;
            spinnerDOM.classList.remove("bump");
          }
        } else {
          onPull?.(1);
          pullToRefreshDOM.style.opacity = "1";
          if (stateRef.current !== "triggerReady") {
            onChangeState?.("triggerReady");
            stateRef.current = "triggerReady";
          }
          setShouldRefresh(true);
          if (spinnerDOM) {
            const rotate = `rotate(${SPINNER_SPIN_DEGREE}deg)`;
            spinnerDOM.style.webkitTransform = rotate;
            spinnerDOM.style.transform = rotate;
            spinnerDOM.classList.add("bump");
          }
        }
      }
    },
    [originMarginTop, targetRef, triggerHeight, onChangeState, onPull, isBounceSupported],
  );

  const handleOnTouchMove = useCallback(
    (e) => {
      if (isBounceSupported) {
        const targetDOM = targetRef.current;
        if (targetDOM) {
          const height = targetDOM.getClientRects()[0].top - originTop;
          if (height <= 0 || isNaN(height)) {
            return;
          }
          showSpinner(height);
        }
      } else {
        if (stateRef.current !== "idle") {
          e.preventDefault();
        }
        const height = e.touches[0].clientY - touchStartRef.current;
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
    touchStartRef.current = e.touches[0].clientY;
  }, []);

  useEffect(() => {
    if (!isBounceSupported) {
      touchStartFuncRef.current = (e) => {
        checkConditionAndRun(
          () => isRefreshingRef.current || isDisabledRef.current || isRefreshing,
          () => setTouchStart(e),
          true,
        );
      };
    }
    touchMoveFuncRef.current = (e) => {
      checkConditionAndRun(
        () => isDisabledRef.current || isRefreshing || isRefreshingRef.current,
        () => handleOnTouchMove(e),
      );
    };
    touchEndFuncRef.current = () => {
      if (shouldRefresh && !isRefreshingRef.current) {
        onRelease?.();
        onPull?.(0);
        refresh();
      } else if (!isRefreshing) {
        onRelease?.();
        onPull?.(0);
        resetHeightToDOM();
      }
    };
    const targetDOM = targetRef.current;
    if (targetDOM) {
      !isBounceSupported &&
        targetDOM.addEventListener("touchstart", touchStartFuncRef.current);

      targetDOM.addEventListener("touchmove", touchMoveFuncRef.current);
      targetDOM.addEventListener("touchend", touchEndFuncRef.current);
      return () => {
        !isBounceSupported &&
          targetDOM.removeEventListener("touchstart", touchStartFuncRef.current);
        targetDOM.removeEventListener("touchmove", touchMoveFuncRef.current);
        targetDOM.removeEventListener("touchend", touchEndFuncRef.current);
      };
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
  ]);

  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
    if (!isRefreshing || (isRefreshing && isSpinnerHiddenDuringRefreshing)) {
      resetHeightToDOM();
    }
  }, [isRefreshing, resetHeightToDOM, isSpinnerHiddenDuringRefreshing]);

  useEffect(() => {
    if (!isBounceSupported) {
      const pullToRefreshDOM = wrapperRef.current;
      if (!initialized) {
        if (isRefreshing && !isSpinnerHiddenDuringRefreshing) {
          showSpinner(triggerHeight);
          if (pullToRefreshDOM) {
            pullToRefreshDOM.style.height = `${triggerHeight}px`;
          }
        }
        setInitialized(true);
      }
    }
  }, [initialized, isRefreshing, triggerHeight, showSpinner, isBounceSupported]);

  useEffect(() => {
    if (isBounceSupported) {
      const targetDOM = targetRef.current;
      if (targetDOM) {
        targetDOM.style.transition = DEFAULT_TARGET_MARGIN_TRANSITION;
      }
    }
  }, [targetRef, isBounceSupported]);

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
      style={{ ...style, top: originTop }}
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
            zIndex: spinnerZIndex,
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default CommonPullToRefresh;
