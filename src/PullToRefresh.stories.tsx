import { ComponentMeta } from "@storybook/react";
import { useCallback, useRef, useState } from "react";

import PullToRefresh from "./PullToRefresh";

export default {
  title: "PullToRefresh",
  component: PullToRefresh,
} as ComponentMeta<typeof PullToRefresh>;

export const OnTheTop = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 5000);
  }, []);

  return (
    <div>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        Pull in a mobile browser
      </div>
    </div>
  );
};

export const WithHeader = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 5000);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          height: 60,
          background: "cyan",
          padding: 20,
          position: "sticky",
          top: 0,
          right: 0,
        }}
      >
        Header
      </div>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        originTop={100}
      />
      <div
        style={{ height: "100vh", background: "pink", padding: 20, marginTop: 100 }}
        ref={targetRef}
      >
        Pull in a mobile browser
      </div>
    </div>
  );
};
