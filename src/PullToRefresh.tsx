import { useEffect, useMemo } from "react";
import PullToRefreshForBounce, {
  PullToRefreshForBounceProps,
} from "./PullToRefreshForBounce";
import PullToRefreshForNoBounce, {
  PullToRefreshForNoBounceProps,
} from "./PullToRefreshForNoBounce";

export interface PullToRefreshProps
  extends PullToRefreshForNoBounceProps,
    PullToRefreshForBounceProps {
  isBounceSupported?: boolean;
  isBounceNotSupported?: boolean;
}

const PullToRefresh = ({
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

  return isBounceSupported || (isIos && !isBounceNotSupported) ? (
    <PullToRefreshForBounce {...props} />
  ) : (
    <PullToRefreshForNoBounce {...props} />
  );
};

export default PullToRefresh;
