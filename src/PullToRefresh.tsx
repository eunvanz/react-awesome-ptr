import { useEffect, useMemo } from "react";
import type { CommonPullToRefreshProps } from "./CommonPullToRefresh";
import CommonPullToRefresh from "./CommonPullToRefresh";

export interface PullToRefreshProps extends CommonPullToRefreshProps {
  isBounceSupported?: boolean;
  isBounceNotSupported?: boolean;
  hasDefaultPullToRefreshPossibly?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  isBounceSupported,
  isBounceNotSupported,
  hasDefaultPullToRefreshPossibly,
  ...props
}: PullToRefreshProps) => {
  const isIos = useMemo(() => {
    return (
      typeof window !== "undefined" && /iPhone|iPad|iPod|Io\//i.test(navigator.userAgent)
    );
  }, []);

  const hasDefaultPullToRefresh = useMemo(() => {
    return (
      isIos &&
      hasDefaultPullToRefreshPossibly &&
      /OS 15/.test(navigator.userAgent) &&
      /Safari/.test(navigator.userAgent)
    );
  }, [isIos, hasDefaultPullToRefreshPossibly]);

  useEffect(() => {
    // for disable browser's default pull to refresh
    if (typeof document !== "undefined") {
      const originValue = document.body.style.overscrollBehaviorY;
      document.body.style.overscrollBehaviorY = "contain";

      return () => {
        document.body.style.overscrollBehaviorY = originValue;
      };
    }
  }, []);

  const isBounceSupportedProp = useMemo(() => {
    return (
      (isBounceSupported || (isIos && !isBounceNotSupported)) &&
      (hasDefaultPullToRefreshPossibly !== undefined ? !hasDefaultPullToRefresh : true)
    );
  }, [isBounceSupported, isIos, isBounceNotSupported, hasDefaultPullToRefreshPossibly]);

  return <CommonPullToRefresh {...props} isBounceSupported={isBounceSupportedProp} />;
};

export default PullToRefresh;
