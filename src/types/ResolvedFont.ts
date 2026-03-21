import { FontProps } from "../components/Font";

export default interface ResolvedFont {
    /** Props ready to spread onto a <Font> component */
    fontProps: FontProps[];
    family: string;
    fallbacks: string[];
}