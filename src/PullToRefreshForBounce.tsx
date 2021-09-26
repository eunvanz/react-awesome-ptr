import { useRef, useEffect, useCallback, useState } from "react";
import classNames from "classnames";
import "./PullToRefreshForBounce.scss";
import CONST from "./constants";
import { CommonPullToRefreshProps, PullToRefreshState } from "./CommonPullToRefresh";
import DefaultSpinner from "./DefaultSpinner";

const DEFAULT_TARGET_MARGIN_TRANSITION = "margin 0.7s cubic-bezier(0, 0, 0, 1)";

const PullToRefreshForBounce: React.FC<CommonPullToRefreshProps> = ({
  targetRef,
  originTop = 0,
  originMarginTop = 0,
  triggerHeight = 80,
  progressHeight = 50,
  onRefresh,
  refreshDelay = 0,
  isRefreshing,
  style,
  className,
  spinnerSize = CONST.SPINNER_SIZE,
  customSpinner,
  onPull,
  onRelease,
  onChangeState,
  completeDelay = 0,
  ...restProps
}: CommonPullToRefreshProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLImageElement>(null);
  const isDisabledRef = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);
  const touchMoveFuncRef = useRef<(e: TouchEvent) => void>(() => undefined);
  const touchEndFuncRef = useRef<(e: TouchEvent) => void>(() => undefined);
  const stateRef = useRef<PullToRefreshState>("idle");

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
        }
      }, CONST.TRANSITION_DURATION);
    }
    if (targetDOM) {
      targetDOM.style.marginTop = `${originMarginTop}px`;
      targetDOM.style.transition = "margin 0.2s cubic-bezier(0, 0, 0, 1)";
      setTimeout(() => {
        targetDOM.style.transition = DEFAULT_TARGET_MARGIN_TRANSITION;
      }, CONST.TRANSITION_DURATION);
    }
  }, [isRefreshing, originMarginTop, targetRef, onChangeState, completeDelay]);

  const checkOffsetPosition = useCallback(() => {
    const targetDOM = targetRef.current;
    if (targetDOM) {
      isDisabledRef.current = targetDOM.getClientRects()[0].top < originTop;
    }
  }, [originTop, targetRef]);

  const checkConditionAndRun = useCallback(
    (conditionFn, fn) => {
      checkOffsetPosition();
      if (!conditionFn()) {
        fn();
      }
    },
    [checkOffsetPosition],
  );

  const showSpinner = useCallback(
    (height: number) => {
      const pullToRefreshDOM = wrapperRef.current;
      const spinnerDOM = spinnerRef.current;

      if (pullToRefreshDOM) {
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
            const rotate = `rotate(${
              (height / triggerHeight) * CONST.SPINNER_SPIN_DEGREE
            }deg)`;
            spinnerDOM.style.webkitTransform = rotate;
            spinnerDOM.style.transform = rotate;
            spinnerDOM.classList.remove("bump");
          }
        } else {
          onPull?.(1);
          if (stateRef.current !== "triggerReady") {
            onChangeState?.("triggerReady");
            stateRef.current = "triggerReady";
          }
          setShouldRefresh(true);
          if (spinnerDOM) {
            const rotate = `rotate(${CONST.SPINNER_SPIN_DEGREE}deg)`;
            spinnerDOM.style.webkitTransform = rotate;
            spinnerDOM.style.transform = rotate;
            spinnerDOM.classList.add("bump");
          }
        }
      }
    },
    [triggerHeight, onPull, onChangeState],
  );

  const handleOnTouchMove = useCallback(() => {
    const targetDOM = targetRef.current;
    if (targetDOM) {
      const pulledHeight = targetDOM.getClientRects()[0].top - originTop;
      if (pulledHeight <= 0 || isNaN(pulledHeight)) {
        return;
      }
      showSpinner(pulledHeight);
    }
  }, [originTop, showSpinner, targetRef]);

  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
    if (!isRefreshing) {
      resetHeightToDOM();
    }
  }, [isRefreshing, resetHeightToDOM]);

  const refresh = useCallback(() => {
    const targetDOM = targetRef.current;
    if (targetDOM) {
      targetDOM.style.marginTop = `${progressHeight + originMarginTop}px`;
    }
    isRefreshingRef.current = true;
    if (stateRef.current !== "refreshing") {
      onChangeState?.("refreshing");
      stateRef.current = "refreshing";
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
    onRefresh,
    refreshDelay,
    progressHeight,
    originMarginTop,
    onChangeState,
  ]);

  useEffect(() => {
    touchMoveFuncRef.current = () => {
      checkConditionAndRun(
        () => isDisabledRef.current || isRefreshing || isRefreshingRef.current,
        () => handleOnTouchMove(),
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
      targetDOM.addEventListener("touchmove", touchMoveFuncRef.current);
      targetDOM.addEventListener("touchend", touchEndFuncRef.current);
      return () => {
        targetDOM.removeEventListener("touchmove", touchMoveFuncRef.current);
        targetDOM.removeEventListener("touchend", touchEndFuncRef.current);
      };
    }
  }, [
    checkConditionAndRun,
    showSpinner,
    handleOnTouchMove,
    shouldRefresh,
    refresh,
    isRefreshing,
    resetHeightToDOM,
    targetRef,
    onRelease,
    onPull,
  ]);

  useEffect(() => {
    const targetDOM = targetRef.current;
    if (targetDOM) {
      targetDOM.style.transition = DEFAULT_TARGET_MARGIN_TRANSITION;
    }
  }, [targetRef]);

  return (
    <div
      className={classNames("react-awesome-ptr", "for-bounce", className)}
      ref={wrapperRef}
      {...restProps}
      style={{ ...style, top: originTop }}
    >
      {customSpinner || (
        <DefaultSpinner
          className={classNames({ spin: isRefreshing })}
          ref={spinnerRef}
          style={{
            marginTop: (progressHeight - spinnerSize) / 2,
            width: spinnerSize,
          }}
        />
      )}
    </div>
  );
};

export default PullToRefreshForBounce;
