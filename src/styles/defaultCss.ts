export interface StyleOptions {
  margin: string;
  paperSize: string;
  notebookName?: string;
  dateStr?: string;

  // Metadata & header/footer fields
  title?: string;
  author?: string;
  description?: string;
  enableDate?: boolean;
  enableHeader?: boolean;
  headerText?: string;
  enableFooter?: boolean;
  footerText?: string;
  enableHeaderBlock?: boolean;
}

export function getBaseStyles(options: StyleOptions): string {
  const notebookName = options.notebookName || 'Jupyter Notebook';
  const dateStr = options.dateStr || '';

  // Escape function to prevent CSS injection via double quotes
  const escapeCssString = (str: string) => str.replace(/"/g, '\\"');

  // Custom margin if specified, otherwise fallback to standard 15mm margins
  const marginVal = (options.margin || '15mm').trim();
  const marginParts = marginVal.split(/\s+/);
  const finalMargin = marginParts.length === 1 ? `20mm ${marginVal} 20mm ${marginVal}` : marginVal;
  const pageMarginStyle = `margin: ${finalMargin};`;

  let headerRule = '';
  if (options.enableHeader !== false) {
    const headerVal = escapeCssString(options.headerText || notebookName);
    headerRule = `
        @top-left {
          content: "${headerVal}";
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: 8pt;
          color: #64748b;
          font-weight: 600;
        }
    `;
  }

  let footerRule = '';
  if (options.enableFooter !== false) {
    const footerVal = escapeCssString(options.footerText || 'Jupyter Notebook Export');
    footerRule = `
        @bottom-left {
          content: "${footerVal}";
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: 8pt;
          color: #64748b;
          font-weight: 500;
        }
    `;
  }

  const pageNumberRule = `
        @bottom-right {
          content: "Page " counter(page) " of " counter(pages);
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: 8pt;
          color: #64748b;
          font-weight: 600;
        }
  `;
  
  // High-fidelity curated harmonious color palette (blueprint warm paper theme)
  const colors = {
    bodyBg: '#faf9f5',      // Warm off-white technical paper background
    bg: '#ffffff',          // Pure white for the notebook container
    text: '#2d2c29',        // Rich technical dark charcoal for premium readability
    headings: '#111111',    // Strong bold titles
    cellBg: '#faf9f5',      // Cells match the technical paper background
    cellBorder: '#e0ded9',  // Sheet frame border color
    cellHeaderBg: '#f4f3ee', // Slightly deeper technical tab/header tone
    cellHeaderColor: '#9e9b95', // Monospace schematic gold-gray
    cellBadgeBg: '#e0ded9',
    stdoutBg: '#1e1d1b',    // Rich dark warm charcoal console matching the paper
    stdoutText: '#faf9f5',  // Clean light text on dark console
    errorBg: '#fff5f5',     // Pastel red/pink 50
    errorBorder: '#fed7d7', // Red 100
    errorText: '#c53030',   // Red 700
    errorTextHeader: '#9b2c2c',
    link: '#007acc',        // Blueprint signature primary blue
    accent: '#007acc',      // Blueprint signature primary blue
    blockquoteBg: '#f4f3ee', // Technical sidebar background
    hr: '#e0ded9'           // Technical divider color
  };

  return `
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    :root {
      --body-bg: ${colors.bodyBg};
      --bg-color: ${colors.bg};
      --text-color: ${colors.text};
      --headings-color: ${colors.headings};
      --cell-bg: ${colors.cellBg};
      --cell-border: ${colors.cellBorder};
      --cell-header-bg: ${colors.cellHeaderBg};
      --cell-header-color: ${colors.cellHeaderColor};
      --cell-badge-bg: ${colors.cellBadgeBg};
      --stdout-bg: ${colors.stdoutBg};
      --stdout-text: ${colors.stdoutText};
      --error-bg: ${colors.errorBg};
      --error-border: ${colors.errorBorder};
      --error-text: ${colors.errorText};
      --error-text-header: ${colors.errorTextHeader};
      --link-color: ${colors.link};
      --accent-color: ${colors.accent};
      --blockquote-bg: ${colors.blockquoteBg};
      --hr-color: ${colors.hr};
    }

    /* Base Document Styling with Technical Dotted Grid Overlay */
    body {
      font-family: 'Inter', -apple-system, "Segoe UI", Roboto, sans-serif;
      background-color: var(--body-bg);
      background-image: radial-gradient(#e2dfd9 1.1px, transparent 1.1px);
      background-size: 20px 20px;
      color: var(--text-color);
      line-height: 1.6;
      font-size: 10.5pt;
      margin: 0;
      padding: 40px 20px;
    }

    /* Notebook Drafting Board Layout without Blueprint Frame Borders */
    .notebook-container {
      max-width: 900px;
      margin: 0 auto;
      background-color: var(--bg-color);
      border-radius: 12px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02);
      border: none;
      padding: 48px;
      position: relative;
    }

    /* Title and Metadata Header */
    .notebook-header-block {
      margin-bottom: 40px;
      border-bottom: 2px solid var(--cell-border);
      padding-bottom: 24px;
      position: relative;
      z-index: 2;
    }

    .notebook-title {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 28pt;
      font-weight: 900;
      color: var(--headings-color);
      margin-top: 0;
      margin-bottom: 12px;
      letter-spacing: -0.03em;
      line-height: 1.15;
      overflow-wrap: break-word;
      word-wrap: break-word;
    }

    .notebook-meta-row {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 9pt;
      font-weight: 700;
      color: var(--cell-header-color);
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .meta-author b, .meta-date b {
      color: var(--accent-color);
      font-weight: 700;
    }

    .notebook-description {
      font-size: 10.5pt;
      line-height: 1.6;
      color: var(--text-color);
      background-color: var(--cell-bg);
      border-left: 3px solid var(--accent-color);
      padding: 16px 20px;
      border-radius: 0 6px 6px 0;
      margin-top: 18px;
      margin-bottom: 10px;
    }

    /* Headings & Typography */
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Inter', -apple-system, sans-serif;
      color: var(--headings-color);
      font-weight: 800;
      margin-top: 36px;
      margin-bottom: 16px;
      line-height: 1.25;
      letter-spacing: -0.02em;
      overflow-wrap: break-word;
      word-wrap: break-word;
    }
    
    h1 { 
      font-size: 20pt; 
      border-bottom: 2px solid var(--cell-border); 
      padding-bottom: 8px; 
    }
    h2 { font-size: 16pt; }
    h3 { font-size: 13.5pt; }
    h4 { font-size: 11.5pt; }
    
    a {
      color: var(--link-color);
      text-decoration: none;
      font-weight: 600;
    }
    a:hover {
      text-decoration: underline;
    }

    p, ul, ol, blockquote {
      margin-top: 0;
      margin-bottom: 18px;
    }

    blockquote {
      border-left: 4px solid var(--accent-color);
      background-color: var(--blockquote-bg);
      padding: 14px 24px;
      border-radius: 0 8px 8px 0;
      color: var(--text-color);
      font-style: italic;
      margin: 24px 0;
      line-height: 1.65;
    }

    blockquote p:last-child {
      margin-bottom: 0;
    }

    /* Inline elements */
    code:not(pre code) {
      font-family: 'Fira Code', 'SFMono-Regular', Consolas, monospace;
      font-size: 8.5pt;
      padding: 3px 6px;
      margin: 0 2px;
      background-color: var(--cell-bg);
      border: 1px solid var(--cell-border);
      border-radius: 4px;
      color: var(--accent-color);
      word-break: break-word;
    }

    /* Lists styling */
    ul, ol {
      padding-left: 24px;
    }
    li {
      margin-bottom: 6px;
    }

    /* Horizontal lines styling (Technical blueprint dashed segment) */
    hr {
      height: 1px;
      border: none;
      border-top: 1px dashed var(--cell-border);
      margin: 32px 0;
    }

    /* Standard Markdown Tables */
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 24px 0;
      font-size: 9.5pt;
    }
    th, td {
      border: 1px solid var(--cell-border);
      padding: 10px 14px;
      text-align: left;
    }
    th {
      background-color: var(--cell-header-bg);
      font-weight: 700;
      color: var(--headings-color);
    }
    tr:nth-child(even) {
      background-color: rgba(128, 128, 128, 0.02);
    }

    /* Cell layout and separation */
    .cell {
      margin-bottom: 32px;
      display: flex;
      flex-direction: column;
      page-break-inside: avoid;
      break-inside: avoid;
      position: relative;
      z-index: 2;
    }

    /* Code Input Layout */
    .cell-input {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--cell-border);
      border-radius: 6px;
      background-color: var(--cell-bg);
      overflow: hidden;
      margin-top: 4px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .cell-input:hover {
      border-color: var(--accent-color);
      box-shadow: 0 4px 12px rgba(0, 122, 204, 0.04);
    }

    .cell-info {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 7.5pt;
      font-weight: 700;
      color: var(--accent-color);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 6px;
      margin-left: 4px;
      opacity: 0.95;
    }

    .cell-source {
      flex: 1;
      padding: 14px 18px;
      margin: 0;
      overflow-x: auto;
      font-family: 'Fira Code', 'SFMono-Regular', Consolas, monospace;
      font-size: 9.5pt;
      line-height: 1.5;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      word-wrap: break-word;
    }

    /* Outputs Container */
    .cell-outputs {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .output-container {
      display: flex;
      flex-direction: column;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* 1. Stream stdout / stderr output (terminal styling) */
    .output-stream {
      display: flex;
      flex-direction: column;
      background-color: var(--stdout-bg);
      border: 1px solid var(--cell-border);
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    }

    .output-stream .output-info {
      align-self: flex-start;
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 6.5pt;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 4px 10px;
      color: var(--cell-header-color);
      background-color: rgba(255, 255, 255, 0.04);
      border-bottom-right-radius: 4px;
      border-right: 1px solid rgba(255, 255, 255, 0.06);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .output-stream .output-text {
      font-family: 'Fira Code', monospace;
      font-size: 9pt;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      word-wrap: break-word;
      color: var(--stdout-text);
      padding: 10px 18px 14px 18px;
      margin: 0;
      line-height: 1.45;
    }

    /* 2. Figure / Plot Image Outputs (seamless layout) */
    .output-image {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #ffffff; /* pure white canvas background for transparency */
      border: 1px solid var(--cell-border);
      border-radius: 6px;
      padding: 16px;
      margin: 4px 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    }

    .output-image-element {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      display: block;
    }

    .output-svg {
      width: 100%;
      box-sizing: border-box;
    }

    .output-svg svg {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }

    /* 3. HTML / Pandas DataFrames (sleek minimalism) */
    .output-html {
      border: 1px solid var(--cell-border);
      border-radius: 6px;
      background-color: var(--bg-color);
      padding: 12px 16px;
      overflow-x: auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
      position: relative;
    }

    .output-html-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 0;
      font-size: 9pt;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .output-html-content th, .output-html-content td {
      border: 1px solid var(--cell-border);
      padding: 8px 12px;
      text-align: right;
    }

    .output-html-content th {
      background-color: var(--cell-header-bg);
      font-weight: 700;
      color: var(--headings-color);
      text-align: center;
    }

    .output-html-content tr:nth-child(even) {
      background-color: rgba(128, 128, 128, 0.02);
    }

    .output-html-content tr:hover {
      background-color: rgba(128, 128, 128, 0.04);
    }

    /* 4. Execution Result Output (standard text result) */
    .output-result {
      display: flex;
      flex-direction: column;
      background-color: var(--stdout-bg);
      border: 1px solid var(--cell-border);
      border-radius: 6px;
      overflow: hidden;
    }

    .output-result .output-info {
      align-self: flex-start;
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 6.5pt;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 4px 10px;
      color: var(--cell-header-color);
      background-color: rgba(255, 255, 255, 0.04);
      border-bottom-right-radius: 4px;
      border-right: 1px solid rgba(255, 255, 255, 0.06);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .output-result .output-text {
      font-family: 'Fira Code', monospace;
      font-size: 9pt;
      color: var(--stdout-text);
      padding: 10px 18px 14px 18px;
      margin: 0;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      word-wrap: break-word;
    }

    /* 5. Error stack trace / tracebacks (danger alert banner layout) */
    .output-error {
      display: flex;
      flex-direction: column;
      background-color: var(--error-bg);
      border: 1px solid var(--error-border);
      border-left: 4px solid #ef4444;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.04);
    }

    .output-error .output-info {
      align-self: flex-start;
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 6.5pt;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 4px 10px;
      color: var(--error-text-header);
      background-color: rgba(239, 68, 68, 0.05);
      border-bottom-right-radius: 4px;
      border-right: 1px solid rgba(239, 68, 68, 0.08);
      border-bottom: 1px solid rgba(239, 68, 68, 0.08);
    }

    .output-error-text {
      font-family: 'Fira Code', monospace;
      font-size: 9pt;
      color: var(--error-text);
      padding: 10px 18px 14px 18px;
      margin: 0;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      word-wrap: break-word;
      line-height: 1.45;
    }

    /* KaTeX centered math display scroll protection */
    .katex-display {
      margin: 20px 0 !important;
      overflow-x: auto;
      overflow-y: hidden;
    }

    /* ----------------------------------------------------
       CODE SYNTAX HIGHLIGHTING (Prism JS Cohesive Theme)
       Curated colors matching high-end dev environments
    ---------------------------------------------------- */
    .token.comment, .token.prolog, .token.doctype, .token.cdata { 
      color: #9e9b95; 
      font-style: italic; 
    }
    .token.punctuation { 
      color: #5c5a54; 
    }
    .token.boolean, .token.number, .token.constant { 
      color: #d97706; /* warm amber/orange */
      font-weight: 600;
    }
    .token.string, .token.char, .token.symbol, .token.inserted { 
      color: #16a34a; /* vibrant emerald forest green */
    } 
    .token.builtin {
      color: var(--accent-color); /* Blueprint signature primary blue */
      font-weight: 600;
    }
    .token.operator, .token.entity, .token.url { 
      color: #0284c7; /* sky blue */
      font-weight: 500;
    } 
    .token.atrule, .token.attr-value, .token.keyword { 
      color: #7c3aed; /* vibrant deep violet */
      font-weight: 600; 
    } 
    .token.function { 
      color: var(--accent-color); /* Blueprint signature primary blue */
      font-weight: 600;
    }
    .token.class-name {
      color: #0d9488; /* rich dark teal */
      font-weight: 600;
    }
    .token.property, .token.tag, .token.attr-name, .token.deleted {
      color: #e11d48; /* rose red */
    }
    .token.regex, .token.important { 
      color: #ea580c; /* vibrant orange */
    }
    .token.variable {
      color: var(--headings-color);
    }

    /* ----------------------------------------------------
       PRINT MEDIA CONFIGURATIONS
       Handles margins, page numbers, headers and footers.
       Note: @page must be top-level (not nested in @media print) for some Chromium print engines.
    ---------------------------------------------------- */
    @page {
      size: ${options.paperSize};
      ${pageMarginStyle}
      ${headerRule}
      ${footerRule}
      ${pageNumberRule}
    }

    @media print {
      body {
        background-color: var(--body-bg) !important;
        background-image: radial-gradient(#e2dfd9 1.1px, transparent 1.1px) !important;
        background-size: 20px 20px !important;
        color: var(--text-color) !important;
        margin: 0;
        padding: 0;
        font-size: 10pt;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .notebook-container {
        max-width: 100%;
        background-color: var(--bg-color) !important;
        box-shadow: none !important;
        border: none !important;
        padding: 24px !important;
        border-radius: 12px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .notebook-header-block {
        margin-bottom: 16px !important;
        padding-bottom: 12px !important;
      }
      .notebook-title {
        font-size: 20pt !important;
        margin-bottom: 8px !important;
      }
      .notebook-description {
        font-size: 9.5pt !important;
        margin-top: 10px !important;
        margin-bottom: 4px !important;
        padding: 10px 14px !important;
      }
      .cell {
        margin-bottom: 14px !important;
      }
      .cell-outputs {
        margin-top: 4px !important;
        gap: 6px !important;
      }
      .output-image {
        padding: 6px !important;
        margin: 2px 0 !important;
      }
      .katex-display {
        margin: 8px 0 !important;
      }
      h1 {
        font-size: 14pt !important;
        margin-top: 14px !important;
        margin-bottom: 6px !important;
        padding-bottom: 4px !important;
      }
      p {
        margin-bottom: 6px !important;
      }


      /* Force background colors on specific console & error blocks */
      .cell-input, .output-stream, .output-result, .output-error, .output-html {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* Prevent page splits inside outputs and other smaller block elements */
      .output-container, blockquote, tr, img {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      /* Allow page splits inside large cells and code input blocks by switching to standard block layout */
      .cell, .cell-input, .cell-source, pre, code, .notebook-container, .notebook-cells {
        display: block !important;
        float: none !important;
        position: static !important;
        overflow: visible !important;
        height: auto !important;
        max-height: none !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
      }

      /* Style .cell-input to be completely borderless, backgroundless, and paddingless for print testing */
      .cell-input {
        background-color: transparent !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      /* Style .cell-source & pre (excluding output text) to ensure monospace font, wrapping, and a beautiful split-friendly left border rule */
      .cell-source, pre:not(.output-text):not(.output-error-text) {
        background-color: transparent !important;
        border-top: none !important;
        border-right: none !important;
        border-bottom: none !important;
        border-left: 3px solid var(--accent-color) !important;
        border-radius: 0 !important;
        padding-top: 2px !important;
        padding-bottom: 2px !important;
        padding-left: 16px !important;
        padding-right: 0 !important;
        margin-top: 8px !important;
        margin-bottom: 8px !important;
        white-space: pre-wrap !important;
        overflow-wrap: break-word !important;
        word-wrap: break-word !important;
        font-family: 'Fira Code', 'SFMono-Regular', Consolas, monospace !important;
        font-size: 9pt !important;
        line-height: 1.5 !important;
      }

      /* Ensure output text and errors wrap properly in print without stripping their beautiful container padding */
      .output-text, .output-error-text {
        background-color: transparent !important;
        border: none !important;
        border-radius: 0 !important;
        white-space: pre-wrap !important;
        overflow-wrap: break-word !important;
        word-wrap: break-word !important;
      }
    }
  `;
}
