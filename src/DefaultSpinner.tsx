import { forwardRef } from "react";
import spinnerImage from "./spinner.svg";
import spinnerDarkImage from "./spinner-dark.svg";
import "./DefaultSpinner.scss";

export interface DefaultSpinnerProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  isDarkMode?: boolean;
}

const DefaultSpinner = forwardRef<HTMLImageElement, DefaultSpinnerProps>(
  ({ style, className, isDarkMode }: DefaultSpinnerProps, ref) => {
    return (
      <div className="react-awesome-ptr-spinner" style={style}>
        <img
          data-testid="spinner"
          alt=""
          className={className}
          ref={ref}
          src={isDarkMode ? spinnerDarkImage : spinnerImage}
        />
      </div>
    );
  },
);

export default DefaultSpinner;
