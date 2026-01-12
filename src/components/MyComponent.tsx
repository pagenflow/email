import React from "react";
import { MyComponentProps } from "../types";

export const MyComponent: React.FC<MyComponentProps> = ({
  text,
  variant = "primary",
  onClick,
}) => {
  return (
    <div className={`my-component my-component--${variant}`} onClick={onClick}>
      {text}
    </div>
  );
};
