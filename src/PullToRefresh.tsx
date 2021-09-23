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
  typeof window === "undefined" && /iPhone|iPad|iPod|Io\//i.test(navigator.userAgent);

const PullToRefresh = ({
  isBounceSupported,
  isBounceNotSupported,
  ...props
}: PullToRefreshProps) => {
  return isBounceSupported || (isIos && !isBounceNotSupported) ? (
    <PullToRefreshForBounce {...props} />
  ) : (
    <PullToRefreshForNoBounce {...props} />
  );
};

export default PullToRefresh;
