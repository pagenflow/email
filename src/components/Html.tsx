import React, { ReactNode } from "react";

export interface HtmlProps {
  children: ReactNode;
  // Allows the global email background color to be set easily
  backgroundColor?: string;
}

export default function Html({
  children,
  backgroundColor = "#ffffff",
}: HtmlProps) {
  const htmlAttributes = {
    // Standard xmlns attribute
    xmlns: "http://www.w3.org/1999/xhtml",
    
    // Namespaced attributes (with colons) are safe in the JS object
    "xmlns:v": "urn:schemas-microsoft-com:vml",
    "xmlns:o": "urn:schemas-microsoft-com:office:office",

    lang: "en",
    xmlLang: "en",
    
    // bgcolor attribute
    bgcolor: backgroundColor,
    
    // Note: The 'children' prop is passed as the third argument to createElement, not here.
  };

  // React.createElement avoids the JSX transpiler error by passing attributes as a JS object.
  return React.createElement(
    'html', // The element tag name
    htmlAttributes, // The attributes/props object
    children // The content to be rendered inside the <html> tag
  );
}
