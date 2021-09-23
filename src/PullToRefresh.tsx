import PullToRefreshForBounce, {
  PullToRefreshForBounceProps,
} from "./PullToRefreshForBounce";
import PullToRefreshForNoBounce, {
  PullToRefreshForNoBounceProps,
} from "./PullToRefreshForNoBounce";

export type PullToRefreshProps = PullToRefreshForNoBounceProps &
  PullToRefreshForBounceProps;

const isIos =
  typeof window === "undefined" && /iPhone|iPad|iPod|Io\//i.test(navigator.userAgent);

const PullToRefresh = (props: PullToRefreshProps) => {
  return isIos ? (
    <PullToRefreshForBounce {...props} />
  ) : (
    <PullToRefreshForNoBounce {...props} />
  );
};

export default PullToRefresh;
