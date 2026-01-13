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

export type JustifyContent = "start" | "center" | "end";
export type AlignItems = "start" | "center" | "end";

export type TdAlign = "center" | "left" | "right";
export type TdValign = "top" | "middle" | "bottom";