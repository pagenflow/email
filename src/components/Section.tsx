import React, { memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";

// Border configuration
export interface BorderConfig {
  width?: string;
  style?: "solid" | "dashed" | "dotted" | "double";
  color?: string;
  top?: { width: string; style: string; color: string };
  right?: { width: string; style: string; color: string };
  bottom?: { width: string; style: string; color: string };
  left?: { width: string; style: string; color: string };
}

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
  children: ReactNode;
  devNode?: ReactNode;
}

function getBorderStyle(border?: BorderConfig): React.CSSProperties {
  if (!border) return {};

  const style: React.CSSProperties = {};

  if (border.width && border.style && border.color) {
    style.border = `${border.width} ${border.style} ${border.color}`;
  }

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
