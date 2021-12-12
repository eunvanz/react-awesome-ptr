# react-awesome-ptr

[![npm version](https://img.shields.io/npm/v/react-awesome-ptr)](https://www.npmjs.com/package/react-awesome-ptr) [![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-awesome-ptr)](https://www.npmjs.com/package/react-awesome-ptr) [![npm type definitions](https://img.shields.io/npm/types/react-awesome-ptr)](https://www.npmjs.com/package/react-awesome-ptr) [![npm](https://img.shields.io/npm/dm/react-awesome-ptr)](https://www.npmjs.com/package/react-awesome-ptr) [![GitHub](https://img.shields.io/github/license/eunvanz/react-awesome-ptr)](https://github.com/eunvanz/react-awesome-ptr/blob/master/LICENSE)

#### A pull-to-refresh react component that behave like almost native app.

- in iOS:
  - It utilizes natively supported scroll bounce.
- in the others:
  - It makes natural scroll bounce artificially.
- Suitable for all of mobile browsers and web views (inactivated in desktop).
- Automatically disable mobile browser's default pull-to-refresh (only in Android).
- Customizable spinner.
- Support Typescript.

> Make sure it's a mobile-only component that works by touch events.

> In **default pull to refresh** supported browsers like Safari in iOS 15, it works **only when the browser is not scrolled**. If browser is scrolled, browser's default pull to refresh will be triggered.

> For the webviews in hybrid apps, it works with no worries.

![KakaoTalk_Video_2021-09-27-10-46-08 mp4](https://user-images.githubusercontent.com/17351661/134833837-ad712f07-0a97-43ef-9117-90e214f65032.gif)

# Usage

## Install

```
npm i --save react-awesome-ptr
```

## import

```typescript
import PullToRefresh from "react-awesome-ptr";
import "react-awesome-ptr/dist/index.css";

// put the PullToRefresh component where the spinner should be shown
```

# Examples

See examples in a mobile browser, or turn on the browser debugger and toggle device toolbar. You can conveniently open example pages on your mobile by scanning QR codes.

> If you see examples in desktop browser, make sure to set the device as any android device.

## [On the top](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--on-the-top&args=&viewMode=story)

[<img src="https://user-images.githubusercontent.com/17351661/134727991-29d51d18-a928-4236-9aac-97724de3dd6c.png" width="200" />](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--on-the-top&args=&viewMode=story)

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
    }, 3000);
  }, []);

  return (
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        hasDefaultPullToRefreshPossibly
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        Pull in a mobile browser
      </div>
    </>
  );
};
```

## [With header](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--with-header&args=&viewMode=story)

[<img src="https://user-images.githubusercontent.com/17351661/134729401-e3e25cb3-ccf7-4ba4-ba39-1f61c0c59629.png" width="200" />](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--with-header&args=&viewMode=story)

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
    }, 3000);
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
          zIndex: 1,
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
        hasDefaultPullToRefreshPossibly
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

## [Artificial bounce](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--artificial-bounce&args=&viewMode=story)

[<img src="https://user-images.githubusercontent.com/17351661/134729633-13f4f2b6-9727-4a88-876a-79b2327609e1.png" width="200" />](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--artificial-bounce&args=&viewMode=story)

```typescript
import PullToRefresh from "react-awesome-ptr";
import "react-awesome-ptr/dist/index.css";

export const ArtificialBounce = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 3000);
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

## [CupertinoSpinner as Custom spinner](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--cupertino-spinner-as-custom-spinner&args=&viewMode=story)

[<img src="https://user-images.githubusercontent.com/17351661/145702945-508c1434-6c3c-4406-9b80-138f7c55d3be.png" width="200" />](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--cupertino-spinner-as-custom-spinner&args=&viewMode=story)

```typescript
import PullToRefresh from "react-awesome-ptr";
import "react-awesome-ptr/dist/index.css";

export const CupertinoSpinnerAsCustomSpinner = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [progress, setProgress] = useState(0);
  const [pullToRefreshState, setPullToRefreshState] = useState<PullToRefreshState>(
    "idle",
  );

  const isTriggerReady = useMemo(() => {
    return pullToRefreshState === "triggerReady";
  }, [pullToRefreshState]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 3000);
  }, []);

  const onPull = useCallback((progress: number) => {
    setProgress(progress);
  }, []);

  const onChangeState = useCallback((state: PullToRefreshState) => {
    setPullToRefreshState(state);
  }, []);

  const customSpinner = useMemo(() => {
    return (
      <CupertinoSpinner
        progress={progress}
        isRefreshing={isRefreshing}
        isTriggerReady={isTriggerReady}
      />
    );
  }, [pullToRefreshState, progress, isRefreshing, isTriggerReady]);

  return (
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        onPull={onPull}
        onChangeState={onChangeState}
        customSpinner={customSpinner}
        hasDefaultPullToRefreshPossibly
        isOpacityChangeOnPullDisabled
        isRotationSpinnerOnPullDisabled
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        <p>Pull in a mobile browser (CupertinoSpinner as custom spinner)</p>
      </div>
    </>
  );
};
```

## [Custom spinner](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--custom-spinner&args=&viewMode=story)

[<img src="https://user-images.githubusercontent.com/17351661/134729756-1b8a1d5d-66e1-414e-b14c-0283a5bd027a.png" width="200" />](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--custom-spinner&args=&viewMode=story)

```typescript
import PullToRefresh from "react-awesome-ptr";
import "react-awesome-ptr/dist/index.css";

export const CustomSpinner = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [progress, setProgress] = useState(0);
  const [pullToRefreshState, setPullToRefreshState] = useState("idle");

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 3000);
  }, []);

  const onPull = useCallback((progress: number) => {
    setProgress(progress);
  }, []);

  const onChangeState = useCallback((state: PullToRefreshState) => {
    setPullToRefreshState(state);
  }, []);

  const customSpinner = useMemo(() => {
    return (
      <div style={{ textAlign: "center", marginTop: 15 }}>
        {pullToRefreshState === "triggerReady"
          ? "⬆️ Release"
          : pullToRefreshState === "refreshing"
          ? "Refreshing..."
          : pullToRefreshState === "complete"
          ? "Complete"
          : `⬇️ Pull to refresh (${(progress * 100).toFixed()}%)`}
      </div>
    );
  }, [pullToRefreshState, isRefreshing, progress]);

  return (
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        onPull={onPull}
        onChangeState={onChangeState}
        customSpinner={customSpinner}
        completeDelay={500}
        hasDefaultPullToRefreshPossibly
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        <p>Pull in a mobile browser (custom spinner)</p>
      </div>
    </>
  );
};
```

## [Hidden spinner during refreshing](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--hidden-spinner-during-refreshing&args=&viewMode=story)

[<img src="https://user-images.githubusercontent.com/17351661/134832132-ea454603-d0c2-461c-b408-83324beab2d2.png" width="200" />](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--hidden-spinner-during-refreshing&args=&viewMode=story)

```typescript
import PullToRefresh from "react-awesome-ptr";
import "react-awesome-ptr/dist/index.css";

export const HiddenSpinnerDuringRefreshing = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 3000);
  }, []);

  return (
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        isSpinnerHiddenDuringRefreshing
        hasDefaultPullToRefreshPossibly
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        <p>Pull in a mobile browser (hidden spinner during refreshing)</p>
        <p>{isRefreshing ? "Refreshing..." : ""}</p>
      </div>
    </>
  );
};
```

## [Dark mode](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--dark-mode&args=&viewMode=story)

[<img src="https://user-images.githubusercontent.com/17351661/135284175-fa089796-e8ab-4e30-9115-7b505d234015.png" width="200" />](https://eunvanz.github.io/react-awesome-ptr/iframe.html?id=pulltorefresh--dark-mode&args=&viewMode=story)

```typescript
import PullToRefresh from "react-awesome-ptr";
import "react-awesome-ptr/dist/index.css";

export const HiddenSpinnerDuringRefreshing = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 3000);
  }, []);

  useEffect(() => {
    const originBackgroundColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#000";
    return () => {
      document.body.style.backgroundColor = originBackgroundColor;
    };
  }, []);

  return (
    <>
      <PullToRefresh
        targetRef={targetRef}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        isDarkMode
        hasDefaultPullToRefreshPossibly
      />
      <div style={{ height: "100vh", background: "pink", padding: 20 }} ref={targetRef}>
        Pull in a mobile browser (dark mode)
      </div>
    </>
  );
};
```

# Props

| name                            |                 type                  | required | default | description                                                                                                                                    |
| ------------------------------- | :-----------------------------------: | :------: | :-----: | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| targetRef                       |    `React.RefObject<HTMLElement>`     |    O     |         | Target element to pull                                                                                                                         |
| originTop                       |               `number`                |          |   `0`   | Top of the target where pull-to-refresh starts based on [clientRects](https://developer.mozilla.org/en-US/docs/Web/API/Element/getClientRects) |
| originMarginTop                 |               `number`                |          |   `0`   | Original margin of the target                                                                                                                  |
| triggerHeight                   |               `number`                |          |  `80`   | The height(distance) at which pull-to-refresh is triggered                                                                                     |
| progressHeight                  |               `number`                |          |  `50`   | Height to keep during refresh                                                                                                                  |
| onRefresh                       |            `VoidFunction`             |    O     |         | Callback to refresh                                                                                                                            |
| refreshDelay                    |               `number`                |          |   `0`   | If refresh time is too short to show spinner, use this prop to delay.                                                                          |
| isRefreshing                    |               `boolean`               |    O     |         | Set `true` during refresh.                                                                                                                     |
| spinnerSize                     |               `number`                |          |  `32`   | Size of spinner in pixel                                                                                                                       |
| tension                         |               `number`                |          |  `0.8`  | Value of artificial tension. Set under 1, 0 is the most powerful tension. (0.85 ~ 0.75 is appropriate)                                         |
| isBounceSupported               |               `boolean`               |          |         | Set `true` if native scroll bounce is supported not in iOS.                                                                                    |
| isBounceNotSupported            |               `boolean`               |          |         | Set `true` if native scroll bounce is not supported in iOS.                                                                                    |
| customSpinner                   |           `React.ReactNode`           |          |         | Custom spinner                                                                                                                                 |
| onPull                          |     `(progress: number) => void`      |          |         | Callback passing progress 0 to 1 as a param that is called when user is pulling                                                                |
| onRelease                       |            `VoidFunction`             |          |         | Callback that is called when user releases target                                                                                              |
| onChangeState                   | `(state: PullToRefreshState) => void` |          |         | Callback passing state `idle`, `pulling`, `triggerReady`, `refreshing`, `complete` when state changes                                          |
| completeDelay                   |               `number`                |          |   `0`   | Set milliseconds if you want to show complete message during `complete`                                                                        |
| isHiddenSpinnerDuringRefreshing |               `boolean`               |          |         | Set `true` if you have to hide spinner during refreshing                                                                                       |
| hideDelay                       |               `number`                |          |         | Set milliseconds with the prop `isHiddenSpinnerDuringRefreshing` as `true` if you want to delay hiding spinner instead of hiding directly.     |
| hasDefaultPullToRefreshPossibly |               `boolean`               |          |         | Set `true` if your service is possibly served in browsers that has default pull-to-refresh.                                                    |
| isDarkMode                      |               `boolean`               |          |         | Set `true` if default spinner needs to be shown above dark background                                                                          |
| spinnerZIndex                   |               `number`                |          |  `-1`   |                                                                                                                                                |
| isDisabled                      |               `boolean`               |          |         | Set `true` to disable pull to refresh                                                                                                          |
| isOpacityChangeOnPullDisabled   |               `boolean`               |          |         | Set `true` if you don't want to change spinner's opacity on pull                                                                               |
| isRotationSpinnerOnPullDisabled |               `boolean`               |          |         | Set `true` if you don't want to rotate spinner on pull                                                                                         |

# Contributions

Contributions will be welcomed! Just make PRs to https://github.com/eunvanz/react-awesome-ptr.

# Have some Github contributions?

You probably like my side project 👉 https://gitkemon.com/link/sl_68A

# License

react-awesome-pull-to-refresh is released under the MIT license.
