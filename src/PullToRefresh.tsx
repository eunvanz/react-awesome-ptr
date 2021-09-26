import { useEffect, useMemo } from "react";
import type { CommonPullToRefreshProps } from "./CommonPullToRefresh";
import CommonPullToRefresh from "./CommonPullToRefresh";

export interface PullToRefreshProps extends CommonPullToRefreshProps {
  isBounceSupported?: boolean;
  isBounceNotSupported?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  isBounceSupported,
  isBounceNotSupported,
  ...props
}: PullToRefreshProps) => {
  const isIos = useMemo(() => {
    return (
      typeof window !== "undefined" && /iPhone|iPad|iPod|Io\//i.test(navigator.userAgent)
    );
  }, []);

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
    return isBounceSupported || (isIos && !isBounceNotSupported);
  }, []);

  return <CommonPullToRefresh {...props} isBounceSupported={isBounceSupportedProp} />;
};

export default PullToRefresh;
