import { ReactNode } from "react";

export interface HeadProps {
  /** Additional elements like custom <style> blocks, <title>, etc. */
  children?: ReactNode;
  /** Global background color (used in CSS reset). */
  backgroundColor?: string;
  /** Subject line for the email title. */
  title?: string;
}

export default function Head({
  children,
  backgroundColor = "#ffffff",
  title = "Email Preview",
}: HeadProps) {
  // Outlook (MSO) Styles and Reset
  const msoResetStyles = `
        /* Forces Outlook to render 100% width and prevents line-height issues */
        .ExternalClass { width: 100%; line-height: 100%; } 
        .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
        
        /* Reset tables for MSO and border issues */
        table { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0; }
        td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        
        /* Reset images */
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        
        /* Fix for Gmail image wrapping and blue links */
        #MessageViewBody img { min-width: 100%; }
        
        /* --- APPLE BLUE LINK FIX --- */
        a[x-apple-data-detectors] { 
            color: inherit !important; 
            text-decoration: none !important; 
            font-size: inherit !important; 
            font-family: inherit !important; 
            font-weight: inherit !important; 
            line-height: inherit !important; 
        }

        /* 🔒 NEW: Set global background color via CSS for clients that respect it */
        body { background-color: ${backgroundColor} !important; }

        /* Disable browser default margin */
        p {
            margin: 0;
        }
    `;

  const globalStyles = `
        @media screen and (max-width: 768px) {
            .container-fixed-width {
                width: 100% !important;
                max-width: 100% !important;
            }
        }

        @media screen and (max-width: 768px) {
            .stack-td {
                width: 100% !important;
                display: block !important;
                float: left;
                clear: both;
                padding-left: 0 !important;
                padding-right: 0 !important;
            }

            .desktop-gap-column {
                width: 0 !important;
                display: none !important;
            }

            .mobile-gap-spacer {
                display: block !important;
                width: 100% !important;
                font-size: 1px !important;
                line-height: 1px !important;
                mso-line-height-rule: exactly;
            }
        }

        @media only screen and (max-width: 768px) {
          /* 1. Handling Mobile Alignment (Justify) - Works for both wrapped and non-wrapped */
          /* We target the inner table alignment */
          .responsive-row[data-mobile-justify="center"] .content-table {
            margin: 0 auto !important;
            float: none !important;
          }
          .responsive-row[data-mobile-justify="start"] .content-table {
            margin: 0 !important;
            float: left !important;
          }
          .responsive-row[data-mobile-justify="end"] .content-table {
            margin: 0 0 0 auto !important;
            float: right !important;
          }

          /* Mobile justify for wrapped children - we need to target the outer wrapper td */
          .responsive-row[data-mobile-wrap="true"][data-mobile-justify="center"] td[align] {
            text-align: center !important;
          }
          .responsive-row[data-mobile-wrap="true"][data-mobile-justify="start"] td[align] {
            text-align: left !important;
          }
          .responsive-row[data-mobile-wrap="true"][data-mobile-justify="end"] td[align] {
            text-align: right !important;
          }

          /* Also apply to child content tables for better support */
          .responsive-row[data-mobile-wrap="true"][data-mobile-justify="center"] .child-cell table {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .responsive-row[data-mobile-wrap="true"][data-mobile-justify="start"] .child-cell table {
            margin-left: 0 !important;
            margin-right: auto !important;
          }
          .responsive-row[data-mobile-wrap="true"][data-mobile-justify="end"] .child-cell table {
            margin-left: auto !important;
            margin-right: 0 !important;
          }

          /* 2. Handling Mobile Vertical Alignment (Align Items) */
          /* For non-wrapped rows - controls vertical alignment when cells are side-by-side */
          .responsive-row[data-mobile-align="center"]:not([data-mobile-wrap="true"]) .child-cell {
            vertical-align: middle !important;
          }
          .responsive-row[data-mobile-align="start"]:not([data-mobile-wrap="true"]) .child-cell {
            vertical-align: top !important;
          }
          .responsive-row[data-mobile-align="end"]:not([data-mobile-wrap="true"]) .child-cell {
            vertical-align: bottom !important;
          }

          /* For wrapped rows - alignItems controls vertical alignment of content within each child cell */
          .responsive-row[data-mobile-wrap="true"][data-mobile-align="center"] .child-cell {
            vertical-align: middle !important;
          }
          .responsive-row[data-mobile-wrap="true"][data-mobile-align="start"] .child-cell {
            vertical-align: top !important;
          }
          .responsive-row[data-mobile-wrap="true"][data-mobile-align="end"] .child-cell {
            vertical-align: bottom !important;
          }

          /* 3. Handling Mobile Wrap - Pure CSS Solution */
          /* Target only the direct row-content-table, not nested ones */
          
          /* Force table to act like block container */
          .responsive-row[data-mobile-wrap="true"] > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > .row-content-table {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Force table row to stack cells */
          .responsive-row[data-mobile-wrap="true"] > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > .row-content-table > tbody > .content-tr {
            display: block !important;
          }
          
          /* Force each child cell to be full width block */
          .responsive-row[data-mobile-wrap="true"] > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > .row-content-table > tbody > .content-tr > .child-cell {
            display: block !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          
          /* Hide horizontal gap cells and create vertical spacing with padding */
          .responsive-row[data-mobile-wrap="true"] > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > .row-content-table > tbody > .content-tr > .row-gap-td {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          
          /* Add vertical spacing between stacked cells using margin */
          .responsive-row[data-mobile-wrap="true"] > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > .row-content-table > tbody > .content-tr > .child-cell:not(:last-child) {
            margin-bottom: 20px !important;
          }
          
          /* Dynamic gap support - common values */
          .responsive-row[data-mobile-wrap="true"][data-gap="10px"] > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > .row-content-table > tbody > .content-tr > .child-cell:not(:last-child) {
            margin-bottom: 10px !important;
          }
          .responsive-row[data-mobile-wrap="true"][data-gap="15px"] > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > .row-content-table > tbody > .content-tr > .child-cell:not(:last-child) {
            margin-bottom: 15px !important;
          }
          .responsive-row[data-mobile-wrap="true"][data-gap="20px"] > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > .row-content-table > tbody > .content-tr > .child-cell:not(:last-child) {
            margin-bottom: 20px !important;
          }
          .responsive-row[data-mobile-wrap="true"][data-gap="24px"] > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > .row-content-table > tbody > .content-tr > .child-cell:not(:last-child) {
            margin-bottom: 24px !important;
          }
          .responsive-row[data-mobile-wrap="true"][data-gap="30px"] > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > .row-content-table > tbody > .content-tr > .child-cell:not(:last-child) {
            margin-bottom: 30px !important;
          }
          .responsive-row[data-mobile-wrap="true"][data-gap="40px"] > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > .row-content-table > tbody > .content-tr > .child-cell:not(:last-child) {
            margin-bottom: 40px !important;
          }
        }
        
        /* ================================================= */
        /* 🔒 UNIVERSAL LINK RESET */
        a {
            color: inherit;
            text-decoration: none;
        }
        /* ================================================= */

        /* ================================================= */
        /* 🔒 LIST STYLE ENFORCEMENT */
        
        /* Reset all lists and list items */
        ol, ul {
          margin: 0px;
          padding: 0px;
          list-style: none;
        }
        
        li {
          list-style-type: none !important;
          list-style: none !important;
          position: relative;
          padding-left: 0px;
          margin: 0px;
          display: block !important;
        }

        /* 🔒 FORCE HIDE ::marker pseudo-element for non-list items */
        li::marker {
          content: "" !important;
          font-size: 0px !important;
          line-height: 0px !important;
          color: transparent !important;
          width: 0px !important;
        }

        /* Apply bullet styles only to items with data-list="bullet" */
        li[data-list="bullet"] {
          list-style-type: disc !important;
          list-style-position: inside !important;
          padding-left: 1.5em;
          display: list-item !important;
        }

        /* Apply ordered styles only to items with data-list="ordered" */
        li[data-list="ordered"] {
          list-style-type: decimal !important;
          list-style-position: inside !important;
          padding-left: 1.5em;
          display: list-item !important;
        }

        /* Ensure marker only takes its natural size with no extra spacing */
        li[data-list="bullet"]::marker,
        li[data-list="ordered"]::marker {
          content: normal !important;
          font-size: inherit !important;
          color: inherit !important;
          width: auto !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        /* ================================================= */

        /* ================================================= */
        /* 🔒 HEADING STYLE RESET */
        h1, h2, h3, h4, h5, h6 {
          margin: 0;
          padding: 0;
          font-weight: inherit; /* Disables browser defaults */
        }
        /* ================================================= */
    `;

  return (
    <head>
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <title>{title}</title>
      <style
        type="text/css"
        dangerouslySetInnerHTML={{ __html: msoResetStyles }}
      />
      <style
        type="text/css"
        dangerouslySetInnerHTML={{ __html: globalStyles }}
      />
      {children}
    </head>
  );
}
