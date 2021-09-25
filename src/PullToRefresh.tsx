import { useEffect } from "react";
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

const isIos =
  typeof window !== "undefined" && /iPhone|iPad|iPod|Io\//i.test(navigator.userAgent);

const PullToRefresh = ({
  isBounceSupported,
  isBounceNotSupported,
  ...props
}: PullToRefreshProps) => {
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
