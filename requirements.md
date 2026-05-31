# RenderPage: Jupyter Notebook to PDF VS Code Extension
## Requirements & Feature Definition

Welcome! We are starting the creation of the VS Code extension to convert Jupyter Notebook (`.ipynb`) files directly to PDFs from scratch. 

To ensure the extension is **minimal, efficient, DRY, KISS, and SOLID**, we need to define the exact scope, requirements, and architectural approach. 

Please review the questionnaire and options below. You can modify this file directly, write your features and preferences below, or reply to me with your choices!

---

### 1. Key Architectural Decisions (How should we convert?)

We need a lightweight and robust way to compile `.ipynb` (JSON) to PDF. Here are the three primary options:

| Option | Approach | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **A: Native JS Parsing & Chromium (Headless)** | Parse notebook cells, render them to a clean HTML layout, and use a lightweight headless browser/printer (like `puppeteer-core` pointing to the user's local Chrome, or `chrome-launcher`) to print to PDF. | Perfect rendering of CSS, charts, tables, LaTeX, and code syntax highlighting. Highly customizable layouts. | Requires a local browser (Chrome/Edge/Chromium) installed on the system (which almost all VS Code users have). |
| **B: Local Python `nbconvert` Wrapper** | Spawn a terminal/child process running `jupyter nbconvert --to pdf` or `--to webpdf`. | Leverages the official Jupyter ecosystem; handles complex widgets and rendering natively. | Requires Python, Jupyter, `nbconvert`, and a LaTeX/Chromium engine installed in the user's system path. Highly fragile across different OS/environments. |
| **C: Direct Node.js PDF Generator (No Browser)** | Parse `.ipynb` JSON and construct the PDF canvas manually using `pdfkit` or `jsPDF` along with syntax-highlighting/markdown parsers. | 100% self-contained. No external dependencies, Python, or browsers required. Extremely fast. | Extremely difficult to render complex cell outputs (like interactive JavaScript charts, tables, plotly, images, mathematical LaTeX formulas). |

**👉 Please specify your preferred approach (Option A, B, or C) or ask for my recommendation!**

---

### 2. Feature Requirements

Please mark the features you want or add your own:

- [x] **One-Click Convert**: Right-click a `.ipynb` file in the Explorer sidebar and select "Convert to PDF".
- [x] **Editor Title Button**: A PDF icon in the active notebook editor toolbar to trigger conversion.
- [ ] **Output Path Selection**: 
  - [x] Same folder as `.ipynb` (default)
  - [ ] Prompt user for location each time
  - [ ] Configurable target folder in VS Code Settings
- [x] **Customizable Styling**:
  - [x] Support VS Code's active theme (Light/Dark matching)
  - [x] Add custom CSS rules for page breaks, margins, or headers/footers
- [x] **Syntax Highlighting**: Highlight Python, R, Julia, etc., inside the code blocks in the generated PDF.
- [x] **Markdown Rendering**: Support standard Markdown, lists, bold text, images, and math equations (LaTeX).
- [x] **Execution Outputs**: Include output images, tables, graphs, and print outputs from the notebook execution.

---

### 3. Technical Preferences

- **Language**: TypeScript (standard for robust VS Code extensions)
- **Package Manager**: `npm`
- **Minimum VS Code Version**: `1.80.0`

---

### ✍️ Your Custom Requirements & Notes
*Please add any specific instructions, style guidelines, or behavior you want here:*

- [x] Markdown Rendering:
Headings, lists, tables, links.
Without this, the notebook structure is lost.
- [x] Python Code Rendering:
Preserve formatting and indentation.
Syntax highlighting.
- [x] Output Rendering:
print(),
Text outputs,
Execution results
- [x] Matplotlib Figure Export:
Most data science notebooks rely on plots.
- [x] Embedded Image Support:
PNG/JPG/SVG outputs from cells.
- [x] LaTeX / MathJax Support:
Essential for ML, statistics, optimization, research.
- [x] Smart Page Breaks:
Don't split code blocks or figures across pages.
- [x] Page Numbers:
Basic document usability.
- [x] Notebook Title & Metadata:
Notebook name,
Export date
- [x] Code Wrapping:
Prevent long lines from being cut off.

---
*Once you fill this or let me know your thoughts, we will initialize the extension structure and implement it step-by-step using DRY, KISS, and SOLID principles!*
