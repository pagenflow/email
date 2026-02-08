export type InnerLinkType =
    | "none"
    | "anchor"
    | "url"
    | "email"
    | "phone"
    | "page_top"
    | "page_bottom";

export default interface IInnerLink {
    type: InnerLinkType;
    email?: string;
    phone?: string;
    url?: string;
    anchor?: string;
    target?: "_blank" | "_self" | "_parent" | "_top";
}
