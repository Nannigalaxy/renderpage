<p align="center">
  <img src="resources/readme_banner_blueprint.png" width="100%" alt="RenderPage Blueprint Banner" />
</p>

# RenderPage

A minimal, high-fidelity, and extremely efficient VS Code extension to convert `.ipynb` Jupyter Notebooks to beautifully styled PDFs **100% locally and offline**. No external APIs, no Python/Jupyter installations required, and no heavy packages.

---

## _01 // VS CODE USAGE

Once installed, you can generate beautifully styled PDFs from your Jupyter Notebooks in seconds:

1. **Active Editor**: Open any `.ipynb` file in VS Code and click the **PDF icon** in the top-right editor toolbar.
2. **File Explorer**: Right-click any `.ipynb` file in the Explorer sidebar and select **Convert Jupyter Notebook to PDF**.
3. **Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS), type `Convert Jupyter Notebook to PDF`, and press `Enter`.

The extension automatically compiles your notebook, renders interactive formulas and plots, and prompts you to save the generated high-fidelity PDF document.

---

## _02 // FEATURES

* **Offline Engine**: 100% local compilation. Zero telemetry, absolute privacy, and instant PDF rendering.
* **Rich Content Support**: High-fidelity math ($LaTeX$) via KaTeX, code syntax highlighting via Prism.js, and styled Pandas tables & base64 plots.
* **Interactive Export Settings**: Premium export configuration panel to customize document metadata (Title, Author, Abstract), page margins, paper size, and running headers/footers.
* **Smart Print Layouts**: Automated CSS print media layouts to wrap long code lines and prevent graphs or code blocks from slicing across pages.

---

## _03 // PREVIEWS

<p align="center">
  <img src="resources/sample_preview_1.png" width="280" style="margin: 10px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e0ded9;" alt="Signal Processing: Spectral Estimation and Digital Signal Analysis PDF Export Preview" />
  <img src="resources/sample_preview_2.png" width="280" style="margin: 10px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e0ded9;" alt="Computer Vision: Analytical Spatial Image Processing and Edge Detection PDF Export Preview" />
  <img src="resources/sample_preview_3.png" width="280" style="margin: 10px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e0ded9;" alt="Statistics: Bayesian Inference and Beta-Binomial Conjugate Models PDF Export Preview" />
</p>

---

## _04 // PIPELINE

<p align="center">
  <img src="resources/readme_architecture_blueprint.png" width="100%" alt="RenderPage Architecture Blueprint Schematic" />
</p>

---

## _05 // CONFIGURATION

Customize the PDF output in your VS Code User/Workspace Settings or standard `settings.json`:

| Setting Reference | Data Type | Default Value | Technical Description |
| :--- | :--- | :--- | :--- |
| `renderpage.paperSize` | `enum` | `"A4"` | Standard paper sizes (`"A4"`, `"Letter"`, `"Legal"`, `"A3"`). |
| `renderpage.margin` | `string` | `"15mm"` | CSS-compliant page margins (e.g., `'10mm'`, `'0.5in'`, `'20px'`). |
| `renderpage.chromePath` | `string` | `""` | Custom path to the local Chrome/Chromium/Edge executable. |

---

## _06 // DEVELOPMENT

### 1. System Requirements
Prints documents using your local browser. It auto-detects standard paths for Google Chrome, Microsoft Edge, Brave, and Chromium on **Windows, macOS, and Linux**. If your browser is installed in a non-standard location, configure the `renderpage.chromePath` setting.

### 2. Compilation and Run
To compile and test the extension locally:
```bash
# 1. Install dependencies
npm install

# 2. Compile bundle
npm run compile
```
* **To Debug**: Press `F5` to open the Extension Development Host window.
