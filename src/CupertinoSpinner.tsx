import { forwardRef, useMemo } from "react";
import cx from "classnames";
import "./CupertinoSpinner.scss";

export interface CupertinoSpinnerProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  isDarkMode?: boolean;
  progress: number;
  isRefreshing: boolean;
  isTriggerReady: boolean;
}

const STEP_COUNT = 8;
const STROKE_WIDTH = 12;

const CupertinoSpinner = forwardRef<HTMLImageElement, CupertinoSpinnerProps>(
  (
    {
      style,
      className,
      isDarkMode,
      progress,
      isRefreshing,
      isTriggerReady,
    }: CupertinoSpinnerProps,
    ref,
  ) => {
    const stepUnit = useMemo(() => {
      return 360 / STEP_COUNT;
    }, []);

    const progressAngle = useMemo(() => {
      return progress * 360;
    }, [progress]);

    return (
      <div className="rap-cupertino-spinner" style={style}>
        <div
          className={cx(className, {
            spin: isRefreshing,
            bump: isTriggerReady,
          })}
          ref={ref}
        >
          <svg
            version="1.1"
            viewBox="-54 -54 108 108"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <g strokeLinecap="round" strokeWidth={STROKE_WIDTH} opacity="0.8">
              <path id="a" d="m0 20 0,18" />
              {Array.from({ length: STEP_COUNT }).map((_, index) => {
                let opacity = 100;
                if (!isRefreshing) {
                  let revisedStepUnit = 0;
                  let initAngle = 0;
                  let exitAngle = 0;
                  if (index === 0) {
                    revisedStepUnit = 180;
                    initAngle = 0;
                    exitAngle = revisedStepUnit;
                  } else {
                    revisedStepUnit = (360 - 180) / (STEP_COUNT - 1);
                    initAngle = 180 + (index - 2) * revisedStepUnit;
                    exitAngle = 180 + index * revisedStepUnit;
                  }
                  opacity =
                    initAngle >= progressAngle
                      ? 0
                      : Math.min(
                          ((progressAngle - initAngle) * 100) / (exitAngle - initAngle),
                          100,
                        );
                }
                return (
                  <use
                    transform={`rotate(${
                      STEP_COUNT / 2 > index
                        ? index * stepUnit + 180
                        : (index - STEP_COUNT / 2) * stepUnit
                    })`}
                    stroke={isDarkMode ? "#8d8d8d" : "#757575"}
                    opacity={`${opacity}%`}
                    key={index}
                    xlinkHref="#a"
                  />
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    );
  },
);

export default CupertinoSpinner;
