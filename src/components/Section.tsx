import React, { CSSProperties, memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";
import { BorderConfig } from "../types";

export type SectionConfig = {
  sectionType: "header" | "footer" | "content";
  gap?: string;
  backgroundColor?: string;
  padding?: string;
  border?: BorderConfig;
  backgroundImage?: {
    src: string;
    repeat?: string;
    size?: string;
    position?: string;
  };
};

export interface SectionProps {
  config: SectionConfig;
  children?: ReactNode;
  devNode?: ReactNode;
}

function getBorderStyle(border?: BorderConfig): CSSProperties {
  if (!border) return {};

  const style: CSSProperties = {};

  // If a full border is specified, apply it
  if (border.width && border.style && border.color) {
    style.border = `${border.width} ${border.style} ${border.color}`;
  } else {
    // If only individual borders are specified, explicitly set others to 'none'
    // to prevent Outlook Classic from showing black borders
    const hasIndividualBorders =
      border.top || border.right || border.bottom || border.left;

    if (hasIndividualBorders) {
      // Default all borders to none
      style.borderTop = "none";
      style.borderRight = "none";
      style.borderBottom = "none";
      style.borderLeft = "none";
    }
  }

  // Override with specific borders if provided
  if (border.top) {
    style.borderTop = `${border.top.width} ${border.top.style} ${border.top.color}`;
  }
  if (border.right) {
    style.borderRight = `${border.right.width} ${border.right.style} ${border.right.color}`;
  }
  if (border.bottom) {
    style.borderBottom = `${border.bottom.width} ${border.bottom.style} ${border.bottom.color}`;
  }
  if (border.left) {
    style.borderLeft = `${border.left.width} ${border.left.style} ${border.left.color}`;
  }

  return style;
}

const Section: React.FC<SectionProps> = ({
  config,
  children,
  devNode,
}: SectionProps) => {
  const { sectionType, padding } = config;
  return (
    <table
      aria-label={`Section |Table | ${sectionType}`}
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{
        position: "relative",
        width: "100%",
        backgroundColor: config.backgroundColor,
        ...getBorderStyle(config.border),
        backgroundImage: config.backgroundImage
          ? `url(${config.backgroundImage.src})`
          : undefined,
        backgroundRepeat: config.backgroundImage?.repeat,
        backgroundSize: config.backgroundImage?.size,
        backgroundPosition: config.backgroundImage?.position,
      }}
    >
      <tbody>
        <tr>
          <td
            style={{
              padding: padding,
            }}
          >
            {children}
          </td>
        </tr>
      </tbody>
      {devNode && (
        <tfoot>
          <tr>
            <td>
              <span
                style={{
                  backgroundColor: "black",
                  color: "white",
                  padding: "4px",
                  fontSize: "14px",
                  position: "absolute",
                  left: 0,
                  top: 0,
                }}
              >
                Section | {sectionType}
              </span>
              {children}
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
};

export default memo(Section, arePropsEqual);
