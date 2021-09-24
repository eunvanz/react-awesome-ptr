import { useRef, useEffect, useCallback, useState } from "react";
import classNames from "classnames";
import "./PullToRefreshForBounce.scss";
import CONST from "./constants";
import { CommonPullToRefreshProps } from "./PullToRefreshForNoBounce";

const DEFAULT_TARGET_MARGIN_TRANSITION = "margin 0.7s cubic-bezier(0, 0, 0, 1)";

export interface PullToRefreshForBounceProps extends CommonPullToRefreshProps {}

const PullToRefreshForBounce = ({
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
  onChangeTriggerReady,
  ...restProps
}: PullToRefreshForBounceProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLImageElement>(null);
  const isDisabledRef = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);
  const touchMoveFuncRef = useRef<(e: TouchEvent) => void>(() => {});
  const touchEndFuncRef = useRef<(e: TouchEvent) => void>(() => {});
  const triggerReadyRef = useRef<boolean>(false);

  const [shouldRefresh, setShouldRefresh] = useState(false);

  const resetHeightToDOM = useCallback(() => {
    const targetDOM = targetRef.current;
    const pullToRefreshDOM = wrapperRef.current;
    if (pullToRefreshDOM) {
      pullToRefreshDOM.classList.add("transition-enabled");
      pullToRefreshDOM.style.opacity = "0";
      setTimeout(() => {
        pullToRefreshDOM.classList.remove("transition-enabled");
        isRefreshingRef.current = isRefreshing;
        if (triggerReadyRef.current) {
          onChangeTriggerReady?.(false);
          triggerReadyRef.current = false;
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
  }, [isRefreshing, originMarginTop, targetRef, onChangeTriggerReady]);

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
        if (height <= triggerHeight) {
          setShouldRefresh(false);
          const progress = height / triggerHeight;
          onPull?.(progress);
          if (triggerReadyRef.current) {
            onChangeTriggerReady?.(false);
            triggerReadyRef.current = false;
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
          if (!triggerReadyRef.current) {
            onChangeTriggerReady?.(true);
            triggerReadyRef.current = true;
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
    [triggerHeight, onPull, onChangeTriggerReady],
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
    setShouldRefresh(false);
    setTimeout(() => {
      onRefresh();
      if (triggerReadyRef.current) {
        onChangeTriggerReady?.(false);
        triggerReadyRef.current = false;
      }
    }, refreshDelay);
  }, [
    targetRef,
    onRefresh,
    refreshDelay,
    progressHeight,
    originMarginTop,
    onChangeTriggerReady,
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
        <div
          className="spinner"
          style={{
            marginTop: (progressHeight - spinnerSize) / 2,
            width: spinnerSize,
          }}
        >
          <img
            alt="spinner"
            className={classNames({ spin: isRefreshing })}
            ref={spinnerRef}
            src={CONST.SPINNER_IMG_URL}
          />
        </div>
      )}
    </div>
  );
};

export default PullToRefreshForBounce;
