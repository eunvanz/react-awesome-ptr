# react-awesome-ptr

A pull-to-refresh react component that behave like almost native app.

- in iOS: It utilizes natively supported scroll bounce.
- in Others: It makes natural scroll bounce artificially.
- Support Typescript
- Light weight (2.86kb gzipped)

> Be sure it's a mobile-only component that works by touch events.

![KakaoTalk_Video_2021-09-24-01-58-31 mp4](https://user-images.githubusercontent.com/17351661/134551289-7d2aef8f-ca6c-4b21-b6c7-74a7a2654e8d.gif)

# Examples

See examples in a mobile browser, or turn on the browser debugger and toggle device toolbar.

- [On the top](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--on-the-top&args=&viewMode=story)

```typescript
import PullToRefresh from "react-awesome-ptr";
import "react-awesome-ptr/dist/index.css";

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
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        Pull in a mobile browser
      </div>
    </>
  );
};
```

- [With header](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--with-header&args=&viewMode=story)

```typescript
import PullToRefresh from "react-awesome-ptr";
import "react-awesome-ptr/dist/index.css";

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
```

- [Artificial bounce](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--artificial-bounce&args=&viewMode=story)

```typescript
import PullToRefresh from "react-awesome-ptr";
import "react-awesome-ptr/dist/index.css";

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
```

- [Custom spinner](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--custom-spinner&args=&viewMode=story)

```typescript
import PullToRefresh from "react-awesome-ptr";
import "react-awesome-ptr/dist/index.css";

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
```

# Props

| name                 |                type                 | required | default | description                                                                                                                                    |
| :------------------- | :---------------------------------: | :------: | :-----: | :--------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| targetRef            |   `React.RefObject<HTMLElement>`    |    O     |         | target element to pull                                                                                                                         |
| originTop            |              `number`               |          |   `0`   | top of the target where pull-to-refresh starts based on [clientRects](https://developer.mozilla.org/en-US/docs/Web/API/Element/getClientRects) |
| originMarginTop      |              `number`               |          |   `0`   | original margin of the target                                                                                                                  |
| triggerHeight        |              `number`               |          |  `80`   | the height(distance) at which pull-to-refresh is triggered                                                                                     |
| progressHeight       |              `number`               |          |  `50`   | height to keep during refresh                                                                                                                  |
| onRefresh            |           `VoidFunction`            |    O     |         | callback to refresh                                                                                                                            |
| refreshDelay         |              `number`               |          |   `0`   | If refresh time is too short to show indicator, use this prop to delay.                                                                        |
| isRefreshing         |              `boolean`              |    O     |         | Pass `true` during refresh.                                                                                                                    |
| spinnerSize          |              `number`               |          |  `32`   | size of spinner in pixel                                                                                                                       |
| tension              |              `number`               |          |  `0.8`  | value of artificial tension. set under 1, 0 is the most powerful tension. (0.85 ~ 0.75 is appropriate)                                         |
| isBounceSupported    |              `boolean`              |          |         | Set if native scroll bounce is supported not in iOS                                                                                            |
| isBounceNotSupported |              `boolean`              |          |         | Set if native scroll bounce is not supported in iOS                                                                                            |
| customSpinner        |          `React.ReactNode`          |          |         | custom spinner component                                                                                                                       |
| onPull               |    `(progress: number) => void`     |          |         | callback passing progress 0 to 1 as a param that is called when user is pulling                                                                |
| onRelease            |           `VoidFunction`            |          |         |                                                                                                                                                | callback that is called when user releases target |
| onChangeTriggerReady | `(isTriggerReady: boolean) => void` |          |         | callback passing whether trigger is ready as a param when the state changed                                                                    |

# License

react-awesome-pull-to-refresh is released under the MIT license.
