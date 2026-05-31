import * as vscode from 'vscode';

export interface ExportOptions {
  title: string;
  author: string;
  description: string;
  enableDate: boolean;
  enableHeader: boolean;
  headerText: string;
  enableFooter: boolean;
  footerText: string;
  margin: string;
  paperSize: string;
}

export function showExportDialog(
  notebookName: string,
  defaultConfig: { margin: string; paperSize: string }
): Promise<ExportOptions | undefined> {
  return new Promise((resolve) => {
    const panel = vscode.window.createWebviewPanel(
      'renderpageExport',
      `Export Settings: ${notebookName}`,
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    let resolved = false;

    panel.webview.html = getWebviewHtml(notebookName, defaultConfig);

    panel.webview.onDidReceiveMessage((message) => {
      if (message.command === 'export') {
        resolved = true;
        resolve(message.data);
        panel.dispose();
      } else if (message.command === 'cancel') {
        resolved = true;
        resolve(undefined);
        panel.dispose();
      }
    });

    panel.onDidDispose(() => {
      if (!resolved) {
        resolve(undefined);
      }
    });
  });
}

function getWebviewHtml(
  notebookName: string,
  defaultConfig: { margin: string; paperSize: string }
): string {
  // Pre-fill header and footer texts with the notebook name for convenience
  const defaultHeader = notebookName;
  const defaultFooter = "Jupyter Notebook Export";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Export PDF Settings</title>
      <style>
        :root {
          --accent-blue: #3b82f6;
          --accent-blue-glow: rgba(59, 130, 246, 0.15);
          --accent-blue-hover: #2563eb;
          --glass-border: rgba(255, 255, 255, 0.08);
          --bg-gradient-start: #0f172a;
          --bg-gradient-end: #090d16;
        }

        body {
          font-family: var(--vscode-font-family, 'Inter', -apple-system, sans-serif);
          font-size: 13px;
          color: var(--vscode-foreground, #cccccc);
          background-color: var(--vscode-editor-background, #1e1e1e);
          margin: 0;
          padding: 24px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* Beautiful glowing glassmorphic dialog card */
        .dialog-container {
          width: 100%;
          max-width: 600px;
          background: rgba(30, 30, 30, 0.6);
          backdrop-filter: blur(16px) saturate(120%);
          -webkit-backdrop-filter: blur(16px) saturate(120%);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 
                      0 0 50px rgba(59, 130, 246, 0.08);
          overflow: hidden;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Top Header area with a subtle blue gradient */
        .dialog-header {
          padding: 24px 28px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.04));
          border-bottom: 1px solid var(--glass-border);
          position: relative;
        }

        .dialog-header::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent-blue), var(--accent-blue), transparent);
          opacity: 0.7;
        }

        .dialog-title {
          font-family: 'Plus Jakarta Sans', var(--vscode-font-family), sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 6px 0;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dialog-subtitle {
          color: var(--vscode-descriptionForeground, #888888);
          font-size: 12px;
          margin: 0;
        }

        /* Structured content form body */
        .dialog-body {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .section-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
          color: var(--accent-blue);
          margin: 0 0 14px 0;
          display: flex;
          align-items: center;
          gap: 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 6px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 480px) {
          .form-grid-2col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
        }

        /* Stylish custom inputs and labels */
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label {
          font-weight: 600;
          color: var(--vscode-editor-foreground, #eeeeee);
          font-size: 12px;
        }

        .label-desc {
          font-size: 11px;
          color: var(--vscode-descriptionForeground, #888888);
          font-weight: normal;
          margin-top: 1px;
        }

        input[type="text"], select, textarea {
          background-color: var(--vscode-input-background, rgba(0,0,0,0.2));
          color: var(--vscode-input-foreground, #eeeeee);
          border: 1px solid var(--vscode-input-border, rgba(255, 255, 255, 0.15));
          border-radius: 8px;
          padding: 10px 12px;
          font-family: inherit;
          font-size: 13px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          box-sizing: border-box;
          width: 100%;
        }

        input[type="text"]:focus, select:focus, textarea:focus {
          border-color: var(--vscode-focusBorder, var(--accent-blue));
          box-shadow: 0 0 0 3px var(--accent-blue-glow);
          background-color: rgba(0, 0, 0, 0.3);
        }

        input[type="text"]:disabled, textarea:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background-color: rgba(0, 0, 0, 0.1);
        }

        textarea {
          resize: vertical;
          min-height: 80px;
        }

        /* Premium switch / checkbox design */
        .switch-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          margin-bottom: 4px;
          transition: all 0.2s ease;
        }

        .switch-container:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .switch-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .switch-title {
          font-weight: 600;
          color: #ffffff;
        }

        /* Toggle switch styling */
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 22px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.12);
          transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 34px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: #ffffff;
          transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        input:checked + .slider {
          background-color: var(--accent-blue);
        }

        input:focus + .slider {
          box-shadow: 0 0 8px var(--accent-blue-glow);
        }

        input:checked + .slider:before {
          transform: translateX(22px);
        }

        /* Sub-field toggle block */
        .nested-field {
          margin-top: -6px;
          padding-left: 14px;
          border-left: 2px solid rgba(59, 130, 246, 0.2);
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: slideDown 0.25s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Actions Footer area */
        .dialog-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 28px 28px 28px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          background: rgba(0, 0, 0, 0.1);
        }

        button {
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          padding: 10px 20px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--accent-blue), var(--accent-blue-hover));
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #60a5fa, var(--accent-blue-hover));
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.06);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        /* SVG Icon Helpers */
        .icon {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }
      </style>
    </head>
    <body>
      <div class="dialog-container">
        <!-- Dialog Header -->
        <div class="dialog-header">
          <h2 class="dialog-title">
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
            </svg>
            Export PDF Document
          </h2>
          <p class="dialog-subtitle">Configure metadata, page settings, headers, and footers for high-fidelity rendering.</p>
        </div>

        <!-- Form Body -->
        <div class="dialog-body">
          <!-- SECTION 1: DOCUMENT METADATA -->
          <div>
            <h3 class="section-title">
              <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
              Document Info
            </h3>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="title">Document Title</label>
                <input type="text" id="title" value="${notebookName}" placeholder="Enter document title...">
              </div>

              <div class="form-grid-2col">
                <div class="form-group">
                  <label for="author">Author Name <span class="label-desc">(Optional)</span></label>
                  <input type="text" id="author" placeholder="e.g. John Doe">
                </div>
                
                <div class="form-group" style="justify-content: flex-end;">
                  <div class="switch-container" style="padding: 9px 12px; margin-bottom: 0;">
                    <div class="switch-info">
                      <span class="switch-title" style="font-size: 12px;">Include Date</span>
                    </div>
                    <label class="switch">
                      <input type="checkbox" id="enableDate" checked>
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <label for="description">Description / Abstract <span class="label-desc">(Optional)</span></label>
                  <span id="wordCountLabel" style="font-size: 11px; color: var(--vscode-descriptionForeground, #888888); font-weight: 500;">0 / 200 words</span>
                </div>
                <textarea id="description" placeholder="A brief description of this notebook's content..."></textarea>
                <span id="wordCountError" style="font-size: 11px; color: #ef4444; display: none; margin-top: 4px; font-weight: 500;">⚠️ Description exceeds the 200 words limit.</span>
              </div>
            </div>
          </div>

          <!-- SECTION 2: PAGE LAYOUT & STYLE -->
          <div>
            <h3 class="section-title">
              <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
              </svg>
              Page Layout
            </h3>
            
            <div class="form-grid-2col">

              <div class="form-group">
                <label for="paperSize">Paper Size</label>
                <select id="paperSize">
                  <option value="A4" ${defaultConfig.paperSize === 'A4' ? 'selected' : ''}>A4</option>
                  <option value="Letter" ${defaultConfig.paperSize === 'Letter' ? 'selected' : ''}>Letter</option>
                  <option value="Legal" ${defaultConfig.paperSize === 'Legal' ? 'selected' : ''}>Legal</option>
                  <option value="A3" ${defaultConfig.paperSize === 'A3' ? 'selected' : ''}>A3</option>
                </select>
              </div>

              <div class="form-group">
                <label for="margin">Page Margins</label>
                <input type="text" id="margin" value="${defaultConfig.margin}" placeholder="e.g. 15mm, 20mm 15mm">
                <span class="label-desc" style="margin-top: 2px; line-height: 1.4;">
                  Enter side margins or custom CSS margin values:
                  <ul style="margin: 4px 0 0 16px; padding: 0; list-style: disc; display: flex; flex-direction: column; gap: 2px;">
                    <li>Single value (e.g., <b>15mm</b>) adjusts side margins (keeps safe 20mm top/bottom).</li>
                    <li>Multi values (e.g., <b>25mm 15mm</b>) overrides full Top/Bottom Left/Right.</li>
                  </ul>
                  Supported units: <b>mm</b>, <b>cm</b>, <b>in</b>, <b>px</b>.
                </span>
                <span id="marginValidationError" style="font-size: 11px; color: #ef4444; display: none; margin-top: 4px; font-weight: 500;">⚠️ Invalid margin format. Use units like mm, cm, in, px (e.g. '15mm' or '25mm 15mm').</span>
              </div>
            </div>
          </div>

          <!-- SECTION 3: HEADERS & FOOTERS -->
          <div>
            <h3 class="section-title">
              <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2zm0 8H7v-2h10v2z"/>
              </svg>
              Page Headers & Footers
            </h3>

            <div class="form-grid" style="gap: 12px;">
              <!-- Header Toggle -->
              <div class="switch-container">
                <div class="switch-info">
                  <span class="switch-title">Enable Page Header</span>
                  <span class="label-desc">Display custom title on top-left of each page</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="enableHeader" checked>
                  <span class="slider"></span>
                </label>
              </div>

              <!-- Header Text (Nested) -->
              <div class="nested-field" id="headerTextContainer">
                <div class="form-group">
                  <label for="headerText">Header Text</label>
                  <input type="text" id="headerText" value="${defaultHeader}" placeholder="Enter header text...">
                </div>
              </div>

              <!-- Footer Toggle -->
              <div class="switch-container" style="margin-top: 6px;">
                <div class="switch-info">
                  <span class="switch-title">Enable Page Footer</span>
                  <span class="label-desc">Display custom label on bottom-left of each page</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="enableFooter" checked>
                  <span class="slider"></span>
                </label>
              </div>

              <!-- Footer Text (Nested) -->
              <div class="nested-field" id="footerTextContainer">
                <div class="form-group">
                  <label for="footerText">Footer Text</label>
                  <input type="text" id="footerText" value="${defaultFooter}" placeholder="Enter footer text...">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="dialog-actions">
          <button class="btn-secondary" id="btnCancel">Cancel</button>
          <button class="btn-primary" id="btnExport">
            <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>
            </svg>
            Generate PDF
          </button>
        </div>
      </div>

      <script>
        const vscode = acquireVsCodeApi();

        const enableHeaderCheckbox = document.getElementById('enableHeader');
        const headerTextContainer = document.getElementById('headerTextContainer');
        const headerTextInput = document.getElementById('headerText');

        const enableFooterCheckbox = document.getElementById('enableFooter');
        const footerTextContainer = document.getElementById('footerTextContainer');
        const footerTextInput = document.getElementById('footerText');

        const descriptionInput = document.getElementById('description');
        const wordCountLabel = document.getElementById('wordCountLabel');
        const wordCountError = document.getElementById('wordCountError');
        const btnExport = document.getElementById('btnExport');

        const marginInput = document.getElementById('margin');
        const marginValidationError = document.getElementById('marginValidationError');

        const marginRegex = /^\\s*(?:(?:\\d+(?:\\.\\d+)?(?:mm|cm|in|px|pt|em|rem)|0)\\s*){1,4}$/i;

        // Dynamic visual visibility toggles
        function updateHeaderState() {
          if (enableHeaderCheckbox.checked) {
            headerTextContainer.style.display = 'flex';
            headerTextInput.disabled = false;
          } else {
            headerTextContainer.style.display = 'none';
            headerTextInput.disabled = true;
          }
        }

        function updateFooterState() {
          if (enableFooterCheckbox.checked) {
            footerTextContainer.style.display = 'flex';
            footerTextInput.disabled = false;
          } else {
            footerTextContainer.style.display = 'none';
            footerTextInput.disabled = true;
          }
        }

        // Integrated multi-field validation
        function validateForm() {
          const descriptionText = descriptionInput.value.trim();
          const descriptionWords = descriptionText ? descriptionText.split(/\\s+/).filter(Boolean) : [];
          const isDescriptionValid = descriptionWords.length <= 200;

          const marginValue = marginInput.value.trim();
          const isMarginValid = marginRegex.test(marginValue);

          if (!isMarginValid) {
            marginValidationError.style.display = 'block';
            marginInput.style.borderColor = '#ef4444';
          } else {
            marginValidationError.style.display = 'none';
            marginInput.style.borderColor = 'var(--vscode-input-border, rgba(255, 255, 255, 0.15))';
          }

          if (isDescriptionValid && isMarginValid) {
            btnExport.disabled = false;
            btnExport.style.opacity = '1';
            btnExport.style.cursor = 'pointer';
          } else {
            btnExport.disabled = true;
            btnExport.style.opacity = '0.5';
            btnExport.style.cursor = 'not-allowed';
          }
        }

        enableHeaderCheckbox.addEventListener('change', updateHeaderState);
        enableFooterCheckbox.addEventListener('change', updateFooterState);

        descriptionInput.addEventListener('input', () => {
          let text = descriptionInput.value;
          const words = text.trim() ? text.trim().split(/\\s+/).filter(Boolean) : [];
          
          if (words.length > 200) {
            const wordsList = text.split(/(\\s+)/);
            let wordCount = 0;
            let cutIndex = 0;
            for (let i = 0; i < wordsList.length; i++) {
              const token = wordsList[i];
              if (token.trim()) {
                wordCount++;
              }
              if (wordCount > 200) {
                break;
              }
              cutIndex += token.length;
            }
            text = text.substring(0, cutIndex);
            descriptionInput.value = text;
          }

          const finalWords = text.trim() ? text.trim().split(/\\s+/).filter(Boolean) : [];
          const count = finalWords.length;
          wordCountLabel.textContent = \`\${count} / 200 words\`;

          wordCountLabel.style.color = 'var(--vscode-descriptionForeground, #888888)';
          wordCountError.style.display = 'none';
          descriptionInput.style.borderColor = 'var(--vscode-input-border, rgba(255, 255, 255, 0.15))';
          
          validateForm();
        });

        marginInput.addEventListener('input', validateForm);

        // Initial states
        updateHeaderState();
        updateFooterState();
        
        // Initial word count state
        const initialText = descriptionInput.value.trim();
        const initialWords = initialText ? initialText.split(/\\s+/).filter(Boolean) : [];
        wordCountLabel.textContent = \`\${initialWords.length} / 200 words\`;
        
        validateForm();

        // Submit action
        btnExport.addEventListener('click', () => {
          if (btnExport.disabled) return;

          const title = document.getElementById('title').value.trim() || "\${notebookName}";
          const author = document.getElementById('author').value.trim();
          const description = descriptionInput.value.trim();
          const enableDate = document.getElementById('enableDate').checked;
          const enableHeader = enableHeaderCheckbox.checked;
          const headerText = headerTextInput.value.trim();
          const enableFooter = enableFooterCheckbox.checked;
          const footerText = footerTextInput.value.trim();
          const paperSize = document.getElementById('paperSize').value;
          const margin = marginInput.value.trim() || '15mm';

          vscode.postMessage({
            command: 'export',
            data: {
              title,
              author,
              description,
              enableDate,
              enableHeader,
              headerText,
              enableFooter,
              footerText,
              paperSize,
              margin
            }
          });
        });

        // Cancel action
        document.getElementById('btnCancel').addEventListener('click', () => {
          vscode.postMessage({
            command: 'cancel'
          });
        });
      </script>
    </body>
    </html>
  `;
}
