import { ComponentMeta } from "@storybook/react";
import { useCallback, useMemo, useRef, useState } from "react";

import PullToRefresh from "./PullToRefresh";

export default {
  title: "PullToRefresh",
  component: PullToRefresh,
} as ComponentMeta<typeof PullToRefresh>;

export const OnTheTop = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [progress, setProgress] = useState(0);
  const [releaseCnt, setReleaseCnt] = useState(0);
  const [refreshCnt, setRefreshCnt] = useState(0);
  const [isTriggerReady, setIsTriggerReady] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshCnt((cnt) => ++cnt);
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 5000);
  }, []);

  const onPull = useCallback((progress: number) => {
    setProgress(progress);
  }, []);

  const onRelease = useCallback(() => {
    setReleaseCnt((cnt) => ++cnt);
  }, []);

  const onChangeTriggerReady = useCallback((isTriggerReady: boolean) => {
    setIsTriggerReady(isTriggerReady);
  }, []);

  return (
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        onPull={onPull}
        onRelease={onRelease}
        onChangeTriggerReady={onChangeTriggerReady}
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        <p>Pull in a mobile browser</p>
        <p>onPull: passed progress is {progress}</p>
        <p>onRelease: called {releaseCnt} times</p>
        <p>onRefresh: called {refreshCnt} times</p>
        <p>isTriggerReady: {String(isTriggerReady)}</p>
      </div>
    </>
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
    <>
      <div
        style={{
          height: 60,
          background: "cyan",
          padding: 20,
          position: "fixed",
          top: 0,
          width: "100%",
        }}
      >
        Header
      </div>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        originTop={100}
        originMarginTop={100}
      />
      <div
        style={{ height: "100vh", background: "pink", padding: 20, marginTop: 100 }}
        ref={targetRef}
      >
        Pull in a mobile browser
      </div>
    </>
  );
};

export const ArtificialBounce = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 5000);
  }, []);

  return (
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        isBounceNotSupported
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        Pull in a mobile browser (forced artificial bounce)
      </div>
    </>
  );
};

export const CustomSpinner = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [progress, setProgress] = useState(0);
  const [isTriggerReady, setIsTriggerReady] = useState(false);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 5000);
  }, []);

  const onPull = useCallback((progress: number) => {
    setProgress(progress);
  }, []);

  const onChangeTriggerReady = useCallback((isTriggerReady: boolean) => {
    setIsTriggerReady(isTriggerReady);
  }, []);

  const customSpinner = useMemo(() => {
    return (
      <div style={{ textAlign: "center", marginTop: 15 }}>
        {isTriggerReady
          ? "⬆️ Release"
          : isRefreshing
          ? "Refreshing..."
          : `⬇️ Pull to refresh (${(progress * 100).toFixed()}%)`}
      </div>
    );
  }, [isTriggerReady, isRefreshing, progress]);

  return (
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        onPull={onPull}
        onChangeTriggerReady={onChangeTriggerReady}
        customSpinner={customSpinner}
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        <p>Pull in a mobile browser</p>
      </div>
    </>
  );
};
