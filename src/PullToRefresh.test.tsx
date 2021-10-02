import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import PullToRefresh, { PullToRefreshProps } from "./PullToRefresh";
import { mockUserAgent } from "jest-useragent-mock";

const onRefresh = jest.fn();
const onChangeState = jest.fn();
const onRelease = jest.fn();
const onPull = jest.fn();
const targetRef = {
  current: document.createElement("div"),
};

const userAgentIos =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";

const userAgentIos15 = userAgentIos.replace("OS 13", "OS 15");

const userAgentAos =
  "'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36'";

const touchStart = (clientY: number) => {
  fireEvent.touchStart(targetRef.current, {
    touches: [
      {
        clientY,
      },
    ],
  });
};

const touchMove = (startY: number, currentY: number) => {
  // @ts-ignore
  targetRef.current.getClientRects = jest.fn(() => [{ top: currentY - startY }]);

  fireEvent.touchMove(targetRef.current, {
    touches: [
      {
        clientY: currentY,
      },
    ],
  });
};

const touchEnd = () => {
  fireEvent.touchEnd(targetRef.current);
};

const getTestComponent = (props?: Partial<PullToRefreshProps>) => (
  <PullToRefresh
    isRefreshing={false}
    onRefresh={onRefresh}
    onChangeState={onChangeState}
    onRelease={onRelease}
    onPull={onPull}
    targetRef={targetRef}
    tension={1}
    {...props}
  />
);

describe("PullToRefresh", () => {
  const setup = (props?: Partial<PullToRefreshProps>) => {
    return render(getTestComponent(props));
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("in iOS", () => {
    beforeEach(() => {
      mockUserAgent(userAgentIos);
    });

    it("should render PullToRefreshForBounce", () => {
      setup();

      expect(document.querySelector(".for-bounce")).toBeInTheDocument();
    });

    describe("isBounceNotSupported is true", () => {
      it("should render PullToRefreshForNoBounce", () => {
        setup({ isBounceNotSupported: true });

        expect(document.querySelector(".for-no-bounce")).toBeInTheDocument();
      });
    });

    describe("hasDefaultPullToRefreshPossibly is true", () => {
      describe("in iOS under 15", () => {
        it("should render PullToRefreshForBounce", () => {
          setup({ hasDefaultPullToRefreshPossibly: true });

          expect(document.querySelector(".for-bounce")).toBeInTheDocument();
        });
      });

      describe("in iOS 15", () => {
        it("should render PullToRefreshForNoBounce", () => {
          mockUserAgent(userAgentIos15);
          setup({ hasDefaultPullToRefreshPossibly: true });

          expect(document.querySelector(".for-no-bounce")).toBeInTheDocument();
        });
      });
    });

    describe("by behavior", () => {
      describe("initially", () => {
        it("works properly", () => {
          setup();

          expect(onChangeState).toBeCalledTimes(1);
          expect(onChangeState).toBeCalledWith("idle");
          expect(screen.getByTestId("spinner-container").style.opacity).toBe("0");
          expect(screen.getByTestId("spinner").style.transform).toBe("");
        });
      });

      describe("when pulling down", () => {
        it("works properly", () => {
          setup({
            triggerHeight: 80,
            originMarginTop: 100,
          });

          touchStart(100);
          touchMove(100, 179);

          expect(onChangeState).toBeCalledWith("pulling");
          expect(onPull).toBeCalledWith(79 / 80);
          expect(screen.getByTestId("spinner-container").style.opacity).toBe(
            `${79 / 80}`,
          );
          expect(screen.getByTestId("spinner").style.transform).toBe(
            `rotate(${(79 * 360) / 80}deg)`,
          );
        });
      });

      describe("when reached trigger height", () => {
        it("works properly", () => {
          setup({
            triggerHeight: 80,
            originMarginTop: 100,
          });

          touchStart(100);
          touchMove(100, 150);

          expect(onChangeState).toBeCalledWith("pulling");
          expect(onPull).toBeCalledWith(50 / 80);

          touchMove(100, 181);

          expect(onChangeState).toBeCalledWith("triggerReady");
          expect(onPull).toBeCalledWith(1);
          expect(screen.getByTestId("spinner-container").style.opacity).toBe("1");
          expect(screen.getByTestId("spinner").style.transform).toBe(`rotate(360deg)`);
        });
      });

      describe("when release at trigger height", () => {
        it("works properly", () => {
          const { rerender } = setup({
            triggerHeight: 80,
            originMarginTop: 100,
          });

          touchStart(100);
          touchMove(100, 181);
          touchEnd();

          expect(onRelease).toBeCalledTimes(1);

          rerender(
            getTestComponent({
              triggerHeight: 80,
              originMarginTop: 100,
              isRefreshing: true,
            }),
          );

          expect(onRefresh).toBeCalledTimes(1);
          expect(onChangeState).toBeCalledWith("refreshing");
        });
      });

      describe("when release at under trigger height", () => {
        it("works properly", () => {
          setup({
            triggerHeight: 80,
            originMarginTop: 100,
          });

          touchStart(100);
          jest.clearAllMocks();

          touchMove(100, 179);
          touchEnd();

          expect(onChangeState).toBeCalledWith("idle");
          expect(onRelease).toBeCalledTimes(1);
        });
      });

      describe("when refresh finished", () => {
        it("should be called with param [complete]", async () => {
          const { rerender } = setup({
            triggerHeight: 80,
            originMarginTop: 100,
          });

          touchStart(100);
          touchMove(100, 181);
          touchEnd();

          rerender(
            getTestComponent({
              triggerHeight: 80,
              originMarginTop: 100,
              isRefreshing: true,
            }),
          );

          jest.clearAllMocks();
          rerender(
            getTestComponent({
              triggerHeight: 80,
              originMarginTop: 100,
              isRefreshing: false,
            }),
          );

          await waitFor(() => {
            expect(onChangeState).toBeCalledWith("complete");
          });

          await waitFor(() => {
            expect(screen.getByTestId("spinner-container").style.opacity).toBe("0");
          });
        });
      });
    });

    describe("when initially refreshing with hidden spinner option", () => {
      it("should hide spinner", () => {
        setup({
          isRefreshing: true,
          isSpinnerHiddenDuringRefreshing: true,
        });

        expect(screen.getByTestId("spinner-container").style.opacity).toBe("0");
        expect(targetRef.current.style.marginTop).toBe("0px");
      });
    });
  });

  describe("in the others", () => {
    beforeAll(() => {
      mockUserAgent(userAgentAos);
    });

    it("should render PullToRefreshForNoBounce", () => {
      setup();

      expect(document.querySelector(".for-no-bounce")).toBeInTheDocument();
    });

    describe("isBounceSupported is true", () => {
      it("should render PullToRefreshForBounce", () => {
        setup({ isBounceSupported: true });

        expect(document.querySelector(".for-bounce")).toBeInTheDocument();
      });
    });

    describe("by behavior", () => {
      describe("initially", () => {
        it("works properly", () => {
          setup();

          expect(onChangeState).toBeCalledTimes(1);
          expect(onChangeState).toBeCalledWith("idle");
          expect(screen.getByTestId("spinner-container").style.opacity).toBe("0");
          expect(screen.getByTestId("spinner").style.transform).toBe("");
        });
      });

      describe("when pulling down", () => {
        it("works properly", () => {
          setup({
            triggerHeight: 80,
            originMarginTop: 100,
          });

          touchStart(100);
          touchMove(100, 179);

          expect(onChangeState).toBeCalledWith("pulling");
          expect(onPull).toBeCalledWith(79 / 80);
          expect(screen.getByTestId("spinner-container").style.opacity).toBe(
            `${79 / 80}`,
          );
          expect(screen.getByTestId("spinner").style.transform).toBe(
            `rotate(${(79 * 360) / 80}deg)`,
          );
        });
      });

      describe("when reached trigger height", () => {
        it("works properly", () => {
          setup({
            triggerHeight: 80,
            originMarginTop: 100,
          });

          touchStart(100);
          touchMove(100, 150);

          expect(onChangeState).toBeCalledWith("pulling");
          expect(onPull).toBeCalledWith(50 / 80);

          touchMove(100, 181);

          expect(onChangeState).toBeCalledWith("triggerReady");
          expect(onPull).toBeCalledWith(1);
          expect(screen.getByTestId("spinner-container").style.opacity).toBe("1");
          expect(screen.getByTestId("spinner").style.transform).toBe(`rotate(360deg)`);
        });
      });

      describe("when release at trigger height", () => {
        it("works properly", () => {
          const { rerender } = setup({
            triggerHeight: 80,
            originMarginTop: 100,
          });

          touchStart(100);
          touchMove(100, 181);
          touchEnd();

          expect(onRelease).toBeCalledTimes(1);

          rerender(
            getTestComponent({
              triggerHeight: 80,
              originMarginTop: 100,
              isRefreshing: true,
            }),
          );

          expect(onRefresh).toBeCalledTimes(1);
          expect(onChangeState).toBeCalledWith("refreshing");
        });
      });

      describe("when release at under trigger height", () => {
        it("works properly", () => {
          setup({
            triggerHeight: 80,
            originMarginTop: 100,
          });

          touchStart(100);
          jest.clearAllMocks();

          touchMove(100, 179);
          touchEnd();

          expect(onChangeState).toBeCalledWith("idle");
          expect(onRelease).toBeCalledTimes(1);
        });
      });

      describe("when refresh finished", () => {
        it("should be called with param [complete]", async () => {
          const { rerender } = setup({
            triggerHeight: 80,
            originMarginTop: 100,
          });

          touchStart(100);
          touchMove(100, 181);
          touchEnd();

          rerender(
            getTestComponent({
              triggerHeight: 80,
              originMarginTop: 100,
              isRefreshing: true,
            }),
          );

          jest.clearAllMocks();
          rerender(
            getTestComponent({
              triggerHeight: 80,
              originMarginTop: 100,
              isRefreshing: false,
            }),
          );

          await waitFor(() => {
            expect(onChangeState).toBeCalledWith("idle");
          });
          expect(screen.getByTestId("spinner-container").style.opacity).toBe("0");
        });
      });
    });
    describe("when initially refreshing with hidden spinner option", () => {
      it("should hide spinner", () => {
        setup({
          isRefreshing: true,
          isSpinnerHiddenDuringRefreshing: true,
        });

        expect(screen.getByTestId("spinner-container").style.opacity).toBe("0");
        expect(targetRef.current.style.marginTop).toBe("0px");
      });
    });
  });
});
