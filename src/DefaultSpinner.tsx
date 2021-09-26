import { forwardRef } from "react";
import spinnerImage from "./spinner.svg";
import "./DefaultSpinner.scss";

export type DefaultSpinnerProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const DefaultSpinner = forwardRef<HTMLImageElement, DefaultSpinnerProps>(
  ({ style, className }: DefaultSpinnerProps, ref) => {
    return (
      <div className="react-awesome-ptr-spinner" style={style}>
        <img alt="" className={className} ref={ref} src={spinnerImage} />
      </div>
    );
  },
);

export default DefaultSpinner;
