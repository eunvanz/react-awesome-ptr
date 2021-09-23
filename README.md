# react-awesome-ptr

A pull-to-refresh react component that behave like almost native app.

- in iOS: It utilizes natively supported scroll bounce.
- in Others: it makes natural scroll bounce artificially.

> Be sure it's a mobile-only component that works by touch events.

# Examples

See examples in a mobile browser.

- [On the top](https://eunvanz.github.io/react-awesome-ptr/?path=/story/pulltorefresh--on-the-top)

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
```

- [With header](https://eunvanz.github.io/react-awesome-ptr/?path=/story/pulltorefresh--with-header)

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
```

# Props

| name                 |              type              | required | default | description                                                                                                                                    |
| :------------------- | :----------------------------: | :------: | :-----: | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| targetRef            | `React.RefObject<HTMLElement>` |    O     |         | target element to pull                                                                                                                         |
| originTop            |            `number`            |          |   `0`   | top of the target where pull-to-refresh starts based on [clientRects](https://developer.mozilla.org/en-US/docs/Web/API/Element/getClientRects) |
| originMarginTop      |            `number`            |          |   `0`   | original margin of the target                                                                                                                  |
| triggerHeight        |            `number`            |          |  `80`   | the height(distance) at which pull-to-refresh is triggered                                                                                     |
| progressHeight       |            `number`            |          |  `50`   | height to keep during refresh                                                                                                                  |
| onRefresh            |         `VoidFunction`         |    O     |         | callback to refresh                                                                                                                            |
| refreshDelay         |            `number`            |          |   `0`   | If refresh time is too short to show indicator, use this prop to delay.                                                                        |
| isRefreshing         |           `boolean`            |    O     |         | Pass `true` during refresh.                                                                                                                    |
| spinnerSize          |            `number`            |          |  `32`   | size of spinner in pixel                                                                                                                       |
| tension              |            `number`            |          |  `0.8`  | value of artificial tension. set under 1, 0 is the most powerful tension. (0.85 ~ 0.75 is appropriate)                                         |
| isBounceSupported    |           `boolean`            |          |         | Set if native scroll bounce is supported not in iOS                                                                                            |
| isBounceNotSupported |           `boolean`            |          |         | Set if native scroll bounce is not supported in iOS                                                                                            |

# License

react-awesome-pull-to-refresh is released under the MIT license.
